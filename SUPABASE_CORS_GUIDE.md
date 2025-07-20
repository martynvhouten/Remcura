# Supabase CORS Configuration Guide

This guide explains how to inspect and configure CORS settings for your Supabase project to ensure
secure frontend access.

## 🔍 **Current CORS Status Check**

### 1. Browser Developer Tools Method

1. Open your deployed application in a browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Perform an API request (login, fetch data, etc.)
5. Look for CORS errors in the console or failed requests

### 2. Manual CORS Test

```bash
# Test preflight request
curl -H "Origin: https://your-domain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-project.supabase.co/rest/v1/

# Expected response should include:
# Access-Control-Allow-Origin: https://your-domain.com
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization, ...
```

### 3. Check Current Configuration

```bash
# Test actual API request
curl -H "Origin: https://your-domain.com" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://your-project.supabase.co/rest/v1/your-table
```

## ⚙️ **Supabase CORS Configuration**

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**

### Step 2: Configure CORS Origins

1. Scroll to **CORS origins** section
2. Add your production domain(s):
   ```
   https://your-production-domain.com
   https://www.your-production-domain.com
   ```

### Step 3: Development vs Production

- **Development**: `http://localhost:8080`, `http://localhost:3000`
- **Staging**: `https://staging.your-domain.com`
- **Production**: `https://your-domain.com`, `https://www.your-domain.com`

### Step 4: Wildcard Considerations

⚠️ **Avoid using `*` in production** - it's insecure

```bash
# BAD - Don't use in production
*

# GOOD - Specific domains
https://medstock-pro.com
https://www.medstock-pro.com
https://app.medstock-pro.com
```

## 🛡️ **Security Best Practices**

### 1. Domain Validation

- Only add domains you control
- Use HTTPS in production
- Include subdomain variations if needed

### 2. Environment-Specific Configuration

```typescript
// In your application
const allowedOrigins = {
  development: ['http://localhost:8080', 'http://localhost:3000'],
  staging: ['https://staging.medstock-pro.com'],
  production: ['https://medstock-pro.com', 'https://www.medstock-pro.com'],
};
```

### 3. Regular Audits

- Review CORS settings monthly
- Remove unused domains
- Update when changing hosting providers

## 🧪 **Testing CORS Configuration**

### Test Script

Create `test-cors.js`:

```javascript
// Test CORS from browser console
async function testCORS() {
  try {
    const response = await fetch('https://your-project.supabase.co/rest/v1/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('CORS test successful:', response.status);
  } catch (error) {
    console.error('CORS test failed:', error);
  }
}

testCORS();
```

### Automated Testing

```bash
# Add to package.json scripts
"test:cors": "node scripts/test-cors.js"
```

## 🚨 **Common CORS Issues & Solutions**

### Issue 1: "CORS policy blocked"

**Cause**: Origin not in allowed list **Solution**: Add your domain to Supabase CORS settings

### Issue 2: "Preflight request failed"

**Cause**: Missing OPTIONS method support **Solution**: Ensure Supabase API configuration allows
OPTIONS

### Issue 3: "Credentials not included"

**Cause**: Missing credentials in requests **Solution**: Check Supabase client configuration:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

### Issue 4: "Mixed content"

**Cause**: HTTPS site trying to connect to HTTP endpoint **Solution**: Ensure all URLs use HTTPS in
production

## 🔧 **Emergency CORS Fix**

If you're blocked in production:

1. **Immediate Fix**:

   - Add `*` temporarily (ONLY for emergencies)
   - This should be reverted within 24 hours

2. **Proper Fix**:
   - Add specific domain
   - Test thoroughly
   - Remove wildcard

## 📊 **Monitoring CORS Issues**

With our monitoring setup, CORS errors will be tracked:

```typescript
// In src/services/monitoring.ts
monitoringService.captureError(new Error('CORS blocked'), {
  url: window.location.href,
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString(),
});
```

## ✅ **CORS Checklist**

- [ ] Production domain added to Supabase CORS settings
- [ ] HTTPS used for all production URLs
- [ ] No wildcard (\*) in production
- [ ] Staging environment properly configured
- [ ] Development localhost entries present
- [ ] CORS errors monitored and tracked
- [ ] Regular security audits scheduled

---

**Last Updated**: December 2024 **Security Note**: Always prioritize security over convenience when
configuring CORS.
