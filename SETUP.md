# Setup Guide - MedStock Pro

Deze handleiding helpt je bij het opzetten van MedStock Pro in je ontwikkelomgeving en productie.

## Overzicht

MedStock Pro is een professioneel voorraadbeheersysteem voor medische klinieken, gebouwd met Vue 3,
Quasar Framework, en Supabase. Het systeem is ontworpen als white-label SaaS oplossing.

## Vereisten

### Development

- **Node.js**: versie 16 of hoger
- **npm** of **yarn**: voor package management
- **Git**: voor version control

### Production

- **Supabase account**: voor backend services
- **Web hosting**: voor frontend deployment
- **Custom domain**: (optioneel) voor white-label deployment

## Database Setup

### 1. Supabase Project Aanmaken

1. Ga naar [supabase.com](https://supabase.com)
2. Maak een nieuw project aan
3. Noteer je Project URL en anon key

### 2. Database Schema

Voer de volgende SQL commands uit in de Supabase SQL editor:

```sql
-- Enable RLS
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- Create clinics table
CREATE TABLE public.clinics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinic_products table
CREATE TABLE public.clinic_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    product_description TEXT,
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER DEFAULT 100,
    reorder_enabled BOOLEAN DEFAULT true,
    low_stock_alert_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clinics
CREATE POLICY "Users can view their own clinic" ON public.clinics
    FOR SELECT USING (id IN (
        SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their own clinic" ON public.clinics
    FOR UPDATE USING (id IN (
        SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
    ));

-- RLS Policies for user_profiles
CREATE POLICY "Users can view profiles from their clinic" ON public.user_profiles
    FOR SELECT USING (clinic_id IN (
        SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (id = auth.uid());

-- RLS Policies for clinic_products
CREATE POLICY "Users can view products from their clinic" ON public.clinic_products
    FOR SELECT USING (clinic_id IN (
        SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can manage products from their clinic" ON public.clinic_products
    FOR ALL USING (clinic_id IN (
        SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
    ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON public.clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_products_updated_at BEFORE UPDATE ON public.clinic_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Test Data (Optioneel)

Voor development kun je test data toevoegen:

```sql
-- Insert test clinic
INSERT INTO public.clinics (id, name, address, contact_email, contact_phone)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'Test Medisch Centrum',
    'Teststraat 123, 1234 AB Amsterdam',
    'info@testclinic.nl',
    '+31 20 123 4567'
);

-- Note: User profiles worden automatisch aangemaakt na registratie
-- Insert test products
INSERT INTO public.clinic_products (clinic_id, product_name, product_sku, current_stock, minimum_stock, maximum_stock)
VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'Wegwerpspuiten 5ml', 'SPR-5ML-001', 45, 50, 200),
    ('123e4567-e89b-12d3-a456-426614174000', 'Steriele handschoenen M', 'GLV-M-001', 120, 100, 500),
    ('123e4567-e89b-12d3-a456-426614174000', 'Bloeddrukmeter', 'BPM-DIG-001', 2, 5, 10);
```

## Development Setup

### 1. Project Clonen

```bash
git clone <repository-url>
cd medstock-pro
```

### 2. Dependencies Installeren

```bash
npm install
```

### 3. Environment Configureren

```bash
cp .env.example .env
```

Vul `.env` in met je Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Development Server Starten

```bash
npm run dev
```

### 5. Eerste Gebruiker Aanmaken

1. Ga naar `http://localhost:9000`
2. Klik op registreren (of voeg handmatig toe via Supabase dashboard)
3. Maak een user_profile record aan die linkt naar je test clinic

## Production Deployment

### 1. Build voor Productie

```bash
npm run build
```

### 2. Deploy naar Hosting Platform

#### Netlify

```bash
# Connect to git and auto-deploy
npm run build
# Upload dist/ folder
```

#### Vercel

```bash
npm i -g vercel
vercel --prod
```

### 3. Environment Variables Instellen

Zorg ervoor dat je production environment variables hebt ingesteld:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## White-label Configuratie

Voor white-label deployment:

### 1. Branding Aanpassen

- Update `src/layouts/MainLayout.vue` - app titel
- Update `src/layouts/AuthLayout.vue` - login scherm branding
- Vervang logo's in `public/icons/`
- Pas kleuren aan in `src/css/app.scss`

### 2. Domain & DNS

- Stel custom domain in bij je hosting provider
- Configureer DNS records
- Zet SSL certificaat op

### 3. Client Specifieke Features

- Pas features aan in store/router configuratie
- Voeg client-specifieke styling toe
- Configureer integraties (indien nodig)

## Troubleshooting

### Veelvoorkomende Problemen

1. **Database connectie issues**

   - Controleer SUPABASE_URL en SUPABASE_ANON_KEY
   - Zorg dat RLS policies correct zijn ingesteld

2. **Authenticatie problemen**

   - Verificeer email confirmatie instellingen in Supabase
   - Check redirect URLs in Supabase Auth settings

3. **Build errors**

   - Run `npm run lint` voor code issues
   - Controleer TypeScript errors

4. **Performance issues**
   - Implementeer database indexes voor grote datasets
   - Optimaliseer queries in stores

## Support

Voor technische ondersteuning of vragen over de implementatie, neem contact op met het development
team.

## Security Checklist

Voor production deployment:

- [ ] RLS policies geïmplementeerd en getest
- [ ] Environment variables beveiligd
- [ ] HTTPS geconfigureerd
- [ ] Database backups ingesteld
- [ ] Error monitoring geïmplementeerd (optioneel)
- [ ] Rate limiting ingesteld (optioneel)
