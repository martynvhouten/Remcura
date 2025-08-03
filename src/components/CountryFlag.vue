<template>
  <span class="country-flag" :class="flagClasses">
    <span class="flag-emoji">{{ flagEmoji }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  country: string
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

// Country code to flag emoji mapping (basic implementation)
const countryToFlag = (countryCode: string): string => {
      if (!countryCode || countryCode.length !== 2) { return '🏳️'; }
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  
  return String.fromCodePoint(...codePoints)
}

// Computed
const flagEmoji = computed(() => {
      if (!props.country) { return '🏳️'; }
  
  // Handle common country name to code conversions
  const countryNameToCode: Record<string, string> = {
    'netherlands': 'NL',
    'germany': 'DE',
    'france': 'FR',
    'belgium': 'BE',
    'united kingdom': 'GB',
    'united states': 'US',
    'spain': 'ES',
    'italy': 'IT',
    'portugal': 'PT',
    'poland': 'PL',
    'czech republic': 'CZ',
    'austria': 'AT',
    'switzerland': 'CH',
    'denmark': 'DK',
    'sweden': 'SE',
    'norway': 'NO',
    'finland': 'FI',
  }
  
  let code = props.country
  
  // If it's a country name, convert to code
  if (code.length > 2) {
    const lowerName = code.toLowerCase()
    code = countryNameToCode[lowerName] || code.substring(0, 2).toUpperCase()
  }
  
  return countryToFlag(code)
})

const flagClasses = computed(() => {
  return [
    `country-flag--${props.size}`
  ]
})
</script>

<style lang="scss" scoped>
.country-flag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  .flag-emoji {
    line-height: 1;
  }
  
  &.country-flag--small {
    font-size: 14px;
  }
  
  &.country-flag--medium {
    font-size: 16px;
  }
  
  &.country-flag--large {
    font-size: 20px;
  }
}
</style> 