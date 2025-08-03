# Remcura - Deployment Guide

This guide covers deploying Remcura to production environments.

## 📋 Pre-Deployment Checklist

### 1. Environment Setup

- [ ] Create `.env` file with production values (see `.env.example`)
- [ ] Ensure all environment variables are set correctly
- [ ] Update `robots.txt` and `sitemap.xml` with your domain
- [ ] Configure monitoring service (Sentry, LogRocket, etc.)

### 2. Build Preparation

```bash
# Install dependencies
npm install

# Run linting and type checks
npm run lint

# Run tests (if available)
npm run test:unit

# Build for production
npm run build
```

### 3. Production Build Verification

```bash
# Test production build locally
npx quasar serve dist/spa --port 8080 --history

# Or using Node.js static server
npx serve dist/spa -p 8080
```

## 🚀 Deployment Platforms

### Vercel (Recommended for SPA)

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Configure `vercel.json`:**

   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist/spa",
     "devCommand": "npm run dev",
     "framework": "quasar",
     "installCommand": "npm install"
   }
   ```

3. **Deploy:**

   ```bash
   vercel --prod
   ```

4. **Environment Variables:**
   - Set in Vercel Dashboard under Project Settings
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Netlify

1. **Build Settings:**

   - Build command: `npm run build`
   - Publish directory: `dist/spa`
   - Node version: 18.x

2. **Create `netlify.toml`:**

   ```toml
   [build]
   command = "npm run build"
   publish = "dist/spa"

   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

3. **Environment Variables:**
   - Set in Netlify Dashboard under Site Settings > Environment Variables

### Traditional Server (Apache/Nginx)

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Upload `dist/spa` contents to web root**

3. **Configure server for SPA routing:**

   **Apache (`.htaccess`):**

   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]

   # Security headers
   Header always set X-Frame-Options DENY
   Header always set X-Content-Type-Options nosniff
   Header always set Referrer-Policy "strict-origin-when-cross-origin"
   ```

   **Nginx:**

   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     root /var/www/remcura;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }

     # Security headers
     add_header X-Frame-Options DENY;
     add_header X-Content-Type-Options nosniff;
     add_header Referrer-Policy "strict-origin-when-cross-origin";

     # Cache static assets
     location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
   }
   ```

## 🔧 Production Configuration

### Environment Variables

Create `.env` file with these required variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Error Tracking
VITE_SENTRY_DSN=https://your-sentry-dsn

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

### SEO Configuration

1. **Update `public/robots.txt`:**
   - Replace `remcura.com` with your domain
2. **Update `public/sitemap.xml`:**

   - Replace URLs with your domain
   - Add additional pages if you have public marketing pages

3. **Update PWA manifest:**
   - Ensure `public/manifest.json` has correct URLs and metadata

## 🛡️ Security Configuration

### Content Security Policy (CSP)

Add to your server configuration:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;
```

### Additional Security Headers

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 📊 Monitoring Setup

### Error Tracking (Sentry)

1. **Install Sentry:**

   ```bash
   npm install @sentry/vue @sentry/tracing
   ```

2. **Configure in `src/main.ts`:**

   ```typescript
   import { initializeMonitoring } from 'src/services/monitoring';

   // Initialize monitoring
   await initializeMonitoring();
   ```

3. **Add environment variable:**
   ```bash
   VITE_SENTRY_DSN=https://your-sentry-dsn
   ```

### Performance Monitoring

- Use Lighthouse CI for performance monitoring
- Set up Vercel Analytics or Google Analytics
- Monitor Core Web Vitals

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm run test:unit:ci

      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

## 🐛 Troubleshooting

### Common Issues

1. **White screen after deployment:**

   - Check browser console for errors
   - Verify environment variables are set
   - Ensure server is configured for SPA routing

2. **API calls failing:**

   - Verify Supabase URL and keys
   - Check CORS settings in Supabase dashboard
   - Ensure network requests aren't blocked

3. **PWA not working:**
   - Verify HTTPS is enabled
   - Check service worker registration
   - Validate manifest.json

### Performance Optimization

- Enable gzip compression on server
- Use CDN for static assets
- Implement proper caching headers
- Monitor bundle size and optimize imports

## 📞 Support

For deployment issues:

1. Check the troubleshooting section above
2. Review server logs for specific errors
3. Ensure all environment variables are correctly set
4. Verify Supabase connection and permissions

---

**Last Updated:** December 2024 **Version:** 1.0.0
