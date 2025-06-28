import { ref, computed } from 'vue'
import { Dark, setCssVar } from 'quasar'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  dark: string
  light: string
  positive?: string
  negative?: string
  info?: string
  warning?: string
}

export interface Theme {
  name: string
  label: string
  colors: ThemeColors
}

// Define available themes
const themes: Record<string, Theme> = {
  default: {
    name: 'default',
    label: 'Standaard',
    colors: {
      primary: '#4f46e5',
      secondary: '#0891b2', 
      accent: '#f59e0b',
      dark: '#1c1917',
      light: '#f8fafc',
      positive: '#059669',
      negative: '#dc2626',
      info: '#0369a1',
      warning: '#d97706'
    }
  },
  remka: {
    name: 'remka',
    label: 'Remka',
    colors: {
      primary: '#9E0059',
      secondary: '#F77F00',
      accent: '#00A99D',
      dark: '#333333',
      light: '#E6E6E6',
      positive: '#059669',
      negative: '#dc2626',
      info: '#0369a1',
      warning: '#d97706'
    }
  }
}

// Current active theme
const currentTheme = ref<string>('default')

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  // Remove # if present
  const color = hex.replace('#', '')
  
  // Parse RGB values
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  
  // Adjust brightness
  const adjustValue = (value: number) => {
    const adjusted = Math.round(value + (value * percent / 100))
    return Math.max(0, Math.min(255, adjusted))
  }
  
  const newR = adjustValue(r)
  const newG = adjustValue(g)
  const newB = adjustValue(b)
  
  // Convert back to hex
  const toHex = (value: number) => value.toString(16).padStart(2, '0')
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
}

// Helper function to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const color = hex.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Get theme options for UI selectors
export const themeOptions = computed(() => 
  Object.values(themes).map(theme => ({
    label: theme.label,
    value: theme.name
  }))
)

// Get current theme object
export const getCurrentTheme = computed(() => themes[currentTheme.value])

// Apply a theme to Quasar
export function applyTheme(themeName: string) {
  const theme = themes[themeName]
  if (!theme) {
    console.warn(`Theme "${themeName}" not found, falling back to default`)
    themeName = 'default'
  }

  const selectedTheme = themes[themeName]
  if (!selectedTheme) {
    console.error(`Failed to load theme: ${themeName}`)
    return
  }

  currentTheme.value = themeName

  // Apply colors to both Quasar CSS variables and custom CSS variables
  const root = document.documentElement
  
  // Set Quasar's CSS variables
  setCssVar('primary', selectedTheme.colors.primary)
  setCssVar('secondary', selectedTheme.colors.secondary)
  setCssVar('accent', selectedTheme.colors.accent)
  setCssVar('dark', selectedTheme.colors.dark)
  
  // Set custom CSS variables that the app actually uses
  root.style.setProperty('--brand-primary', selectedTheme.colors.primary)
  root.style.setProperty('--brand-secondary', selectedTheme.colors.secondary)
  root.style.setProperty('--brand-accent', selectedTheme.colors.accent)
  root.style.setProperty('--neutral-900', selectedTheme.colors.dark)
  root.style.setProperty('--neutral-50', selectedTheme.colors.light)
  
  // Also set some derived colors for better integration
  root.style.setProperty('--brand-primary-dark', adjustColorBrightness(selectedTheme.colors.primary, -20))
  root.style.setProperty('--brand-primary-light', adjustColorBrightness(selectedTheme.colors.primary, 20))
  
  // Set interactive state colors based on primary
  root.style.setProperty('--hover-bg', hexToRgba(selectedTheme.colors.primary, 0.08))
  root.style.setProperty('--hover-border', hexToRgba(selectedTheme.colors.primary, 0.2))
  root.style.setProperty('--focus-ring', `0 0 0 3px ${hexToRgba(selectedTheme.colors.primary, 0.12)}`)
  
  // Set other semantic colors if provided
  if (selectedTheme.colors.positive) {
    setCssVar('positive', selectedTheme.colors.positive)
    root.style.setProperty('--brand-success', selectedTheme.colors.positive)
  }
  if (selectedTheme.colors.negative) {
    setCssVar('negative', selectedTheme.colors.negative)
    root.style.setProperty('--brand-danger', selectedTheme.colors.negative)
  }
  if (selectedTheme.colors.info) {
    setCssVar('info', selectedTheme.colors.info)
    root.style.setProperty('--brand-info', selectedTheme.colors.info)
  }
  if (selectedTheme.colors.warning) {
    setCssVar('warning', selectedTheme.colors.warning)
    root.style.setProperty('--brand-warning', selectedTheme.colors.warning)
  }

  // Save to localStorage
  localStorage.setItem('theme', themeName)

  console.log(`Applied theme: ${selectedTheme.label}`)
}

// Load theme from localStorage
export function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && themes[savedTheme]) {
    applyTheme(savedTheme)
  } else {
    applyTheme('default')
  }
}

// Get current theme name
export function getCurrentThemeName() {
  return currentTheme.value
}

// Check if a theme exists
export function hasTheme(themeName: string): boolean {
  return !!themes[themeName]
}

// Export the composable
export function useThemeManager() {
  return {
    currentTheme: computed(() => currentTheme.value),
    getCurrentTheme,
    themeOptions,
    applyTheme,
    loadSavedTheme,
    getCurrentThemeName,
    hasTheme
  }
} 