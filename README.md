# MedStock Pro

Een moderne, professionele voorraadbeheersysteem voor medische klinieken en zorginstellingen. Beheer eenvoudig je medische voorraad, ontvang automatische herbestelmeldingen en optimaliseer je inventarisprocessen.

## Features

### Current Features
- 🔐 **Authentication** - Secure email-based login with Supabase Auth
- 🏥 **Multi-tenant Architecture** - Each user is linked to a clinic with data isolation
- 📦 **Inventory Management** - Track current, minimum, and maximum stock levels
- 🚨 **Stock Alerts** - Automatic low stock notifications and reorder suggestions
- 🌙 **Dark Mode** - Built-in dark mode support
- 🌐 **Internationalization** - Dutch by default, ready for multi-language support
- 📱 **Responsive Design** - Mobile and tablet optimized
- 🎨 **White-label Ready** - Easy to customize branding and appearance

### Future Features (Roadmap)
- 📊 **Order History** - Integration with e-commerce platforms
- 📄 **Invoice Overview** - Financial tracking and reporting
- 👑 **Admin Panel** - Advanced management features
- 🔗 **API Integrations** - Connect with existing ERP/inventory systems

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Quasar Framework
- **Backend**: Supabase (Auth + Database + Realtime)
- **State Management**: Pinia
- **Internationalization**: Vue I18n
- **Build Tool**: Vite
- **Future Integration**: Magento API & other e-commerce platforms

## Project Structure

```
src/
├── boot/           # Quasar boot files (Supabase, i18n, Pinia)
├── components/     # Reusable Vue components
├── layouts/        # Application layouts
├── pages/          # Route components
├── stores/         # Pinia stores for state management
├── services/       # API services and business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── i18n/           # Internationalization files
└── css/            # Global styles and SCSS
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd medstock-pro
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Configure your Supabase credentials in `.env`:
```env
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

5. Start the development server
```bash
npm run dev
```

## Database Schema

### Tables

#### clinics
- `id` (uuid, primary key)
- `name` (text)
- `address` (text)
- `contact_email` (text)
- `contact_phone` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### user_profiles
- `id` (uuid, primary key, references auth.users)
- `clinic_id` (uuid, references clinics)
- `email` (text)
- `full_name` (text)
- `role` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### clinic_products
- `id` (uuid, primary key)
- `clinic_id` (uuid, references clinics)
- `product_name` (text)
- `product_sku` (text)
- `product_description` (text)
- `current_stock` (integer)
- `minimum_stock` (integer)
- `maximum_stock` (integer)
- `reorder_enabled` (boolean)
- `low_stock_alert_enabled` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Row Level Security (RLS)
All tables implement RLS policies to ensure data isolation between clinics.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test:unit` - Run unit tests

## White-label Customization

MedStock Pro is designed to be easily white-labeled for different clients:

1. **Branding**: Update logos, colors, and app names in the configuration
2. **Language**: Add new language files in `src/i18n/`
3. **Themes**: Customize colors and styling in `src/css/app.scss`
4. **Features**: Enable/disable modules based on client needs

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use Quasar components when possible
- Implement proper error handling
- Write unit tests for business logic

### Commit Convention
Follow conventional commits:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the development guidelines
3. Write tests for new functionality
4. Submit a pull request with a clear description

## License

Private - Professional Medical Software Solution

## Support

For questions or support, contact the development team.

## 🎨 Design System & Layout

### Consistent Layout Components

Het project gebruikt een gestandaardiseerd layout systeem met:

#### `PageLayout.vue`
- **Centraal layout wrapper** voor alle pagina's
- **Consistent max-width** (1400px standaard, aanpasbaar)
- **Responsive padding en spacing**
- **Flexibele content sections** (header, content, footer)
- **Dark/light mode ondersteuning**

**Gebruik:**
```vue
<template>
  <PageLayout max-width="1400px" padding="md">
    <template #header>
      <!-- Page header content -->
    </template>
    
    <!-- Main page content -->
    <div>Your content here</div>
    
    <template #footer>
      <!-- Optional footer content -->
    </template>
  </PageLayout>
</template>
```

#### `PageTitle.vue`
- **Gestandaardiseerde page titles** gebaseerd op Products page design
- **Consistent typography en spacing**
- **Flexibele meta informatie** (iconen + tekst)
- **Action buttons** via slots
- **Responsive ontwerp**
- **Dark/light mode compatibiliteit**

**Gebruik:**
```vue
<template>
  <PageTitle
    title="Page Title"
    subtitle="Optional page description"
    icon="dashboard"
    badge="New"
    badge-color="primary"
    :meta="[
      { icon: 'info', text: 'Meta info' },
      { icon: 'schedule', text: 'Time info' }
    ]"
  >
    <template #actions>
      <q-btn color="primary" label="Action" />
    </template>
  </PageTitle>
</template>
```

### Refactored Pages

De volgende pagina's zijn gerefactored om het nieuwe layout systeem te gebruiken:

- ✅ **ProductsPage.vue** - Referentie design behouden
- ✅ **DashboardPage.vue** - Consistent header en layout
- ✅ **OrdersPage.vue** - Consistent header met badge
- ✅ **SettingsPage.vue** - Consistent header en layout

### Voordelen

1. **Consistent Design**: Alle pagina's hebben dezelfde look and feel
2. **Maintainability**: Centraal beheer van layout logica
3. **Responsive**: Werkt perfect op alle schermformaten
4. **Dark Mode**: Volledige ondersteuning voor beide themes
5. **Developer Experience**: Eenvoudig te gebruiken components
6. **Scalability**: Makkelijk nieuwe pagina's toevoegen

### CSS Custom Properties

Het project gebruikt een uitgebreid design token systeem in `src/css/app.scss`:

- **Colors**: Semantic en brand colors
- **Typography**: Fluid typography scale
- **Spacing**: 8pt grid systeem
- **Shadows**: Consistent depth system
- **Transitions**: Smooth animations

## 🚀 Quick Start

// ... existing code ... 