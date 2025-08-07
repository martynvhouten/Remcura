# Setup Guide - Remcura

This guide helps you set up Remcura in your development environment and production.

## Overview

Remcura is a professional inventory management system for medical clinics, built with Vue 3, Quasar
Framework, and Supabase. The system is designed as a comprehensive standalone application.

## Requirements

### Development

- **Node.js**: version 16 or higher
- **npm** or **yarn**: for package management
- **Git**: for version control

### Production

- **Supabase account**: for backend services
- **Web hosting**: for frontend deployment
- **Custom domain**: (optional) for professional deployment

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your Project URL and anon key

### 2. Database Schema

Execute the following SQL commands in the Supabase SQL editor:

```sql
-- Enable RLS
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- Create practices table
CREATE TABLE practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

-- Create practice members table
CREATE TABLE practice_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(practice_id, user_id)
);

-- Enable RLS
ALTER TABLE practice_members ENABLE ROW LEVEL SECURITY;

-- Create locations table
CREATE TABLE practice_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE practice_locations ENABLE ROW LEVEL SECURITY;

-- Products table with GS1 compliance
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,

  -- Basic Information
  name VARCHAR(200) NOT NULL,
  description TEXT,
  brand VARCHAR(100),
  category VARCHAR(100),

  -- GS1 Compliance Fields
  gtin VARCHAR(14) UNIQUE, -- Global Trade Item Number
  gpc_brick_code VARCHAR(20), -- GS1 Global Product Classification
  gln_manufacturer VARCHAR(13), -- Global Location Number

  -- Pricing
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),

  -- Packaging & Measurements
  net_content_value DECIMAL(10,3),
  net_content_uom VARCHAR(10), -- Unit of measure
  gross_weight DECIMAL(10,3),
  net_weight DECIMAL(10,3),

  -- GS1 Indicators
  base_unit_indicator BOOLEAN DEFAULT false,
  orderable_unit_indicator BOOLEAN DEFAULT true,
  despatch_unit_indicator BOOLEAN DEFAULT false,

  -- Regulatory
  country_of_origin VARCHAR(3), -- ISO 3166-1 alpha-3
  effective_from_date DATE,
  effective_to_date DATE,
  product_lifecycle_status VARCHAR(20) DEFAULT 'Active',

  -- System Fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),

  -- Integration settings
  integration_type VARCHAR(50) DEFAULT 'manual', -- manual, magento, api
  api_endpoint VARCHAR(500),
  api_key VARCHAR(255),

  is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Stock levels table
CREATE TABLE stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES practice_locations(id) ON DELETE CASCADE,

  current_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_quantity INTEGER DEFAULT 0,
  maximum_quantity INTEGER DEFAULT 100,

  -- Batch tracking
  batch_number VARCHAR(100),
  expiry_date DATE,

  last_counted_at TIMESTAMP WITH TIME ZONE,
  last_counted_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(product_id, location_id, batch_number)
);

ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
```

### 3. Row Level Security (RLS) Policies

Create security policies for data isolation:

```sql
-- Practice isolation policy for products
CREATE POLICY "products_tenant_isolation" ON products
  FOR ALL USING (
    practice_id IN (
      SELECT practice_id FROM practice_members
      WHERE user_id = auth.uid()
    )
  );

-- Apply similar policies to all tables
CREATE POLICY "suppliers_tenant_isolation" ON suppliers
  FOR ALL USING (
    practice_id IN (
      SELECT practice_id FROM practice_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "stock_levels_tenant_isolation" ON stock_levels
  FOR ALL USING (
    practice_id IN (
      SELECT practice_id FROM practice_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "practice_locations_tenant_isolation" ON practice_locations
  FOR ALL USING (
    practice_id IN (
      SELECT practice_id FROM practice_members
      WHERE user_id = auth.uid()
    )
  );
```

## Environment Configuration

### 1. Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Settings
VITE_APP_NAME=Remcura
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Optional: Analytics and Monitoring
VITE_SENTRY_DSN=your-sentry-dsn
VITE_GA_TRACKING_ID=your-google-analytics-id
```

### 2. Supabase Configuration

Update your Supabase project settings:

1. **Authentication**: Enable email/password authentication
2. **CORS**: Add your domain to allowed origins
3. **RLS**: Ensure Row Level Security is enabled on all tables
4. **API**: Configure API rate limiting

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-org/remcura.git
cd remcura
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9000`

## Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:coverage

# Build for production
npm run build

# Preview production build
npm run preview
```

## Production Deployment

### 1. Build Application

```bash
npm run build
```

### 2. Deploy to Hosting Platform

#### Netlify Deployment

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist/spa`
4. Add environment variables in Netlify dashboard

#### Vercel Deployment

1. Connect repository to Vercel
2. Framework preset: Vue.js
3. Build command: `npm run build`
4. Output directory: `dist/spa`

#### Self-hosted Deployment

```bash
# Serve static files with any web server
npx serve dist/spa -p 3000

# Or use nginx/apache configuration
```

### 3. Configure Domain

1. Add custom domain in hosting platform
2. Update CORS settings in Supabase
3. Update redirect URLs for authentication

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Issues

- Check environment variables
- Verify project URL and API keys
- Check CORS configuration

#### 2. Authentication Problems

- Ensure RLS policies are correctly configured
- Check redirect URLs
- Verify email settings in Supabase

#### 3. Build Errors

- Clear node_modules and reinstall
- Check TypeScript errors
- Verify environment variables

#### 4. Performance Issues

- Enable compression in hosting platform
- Optimize images and assets
- Check network requests

### Support

For technical support:

- Check documentation in `docs/` directory
- Review error logs in Supabase dashboard
- Contact development team

## Next Steps

1. **Configure Demo Data**: Run demo data scripts
2. **Set Up Monitoring**: Configure error tracking
3. **User Training**: Create user accounts and train staff
4. **Backup Strategy**: Set up automated backups
5. **Security Review**: Perform security audit

---

**🚀 Your Remcura installation is now ready for use!**

For additional configuration options, see:

- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)
- [Production Readiness Audit](../reports/PRODUCTION_READINESS_AUDIT.md)
