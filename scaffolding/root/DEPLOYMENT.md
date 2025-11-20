# Deployment Guide

## API Base URL Configuration

The React frontend needs to know where your API is hosted. There are three configuration methods:

### 1. Same Domain (Recommended for Production)

Deploy frontend and API on the same domain. The production build uses relative URLs by default.

**Example**: `https://example.com` (frontend) and `https://example.com/api` (API)

No configuration needed - uses `environment.prod.ts` with `apiUrl: '/api'`

### 2. Different Domain (Build-Time)

Edit `{{prefix}}-react/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com/api',
};
```

Rebuild: `yarn build`

### 3. Different Domain (Runtime)

For deploying the same build to multiple domains, inject runtime config in your index.html:

```html
<script>
  window.APP_CONFIG = {
    apiUrl: 'https://api.example.com/api'
  };
</script>
```

This overrides the environment file without rebuilding.

## Environment Files

### Development (`environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

### Production (`environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: '/api',  // Relative URL for same-domain deployment
};
```

## Build Commands

```bash
# Development
yarn serve:dev

# Production build
yarn build

# Production serve
yarn serve
```

## API Environment Variables

Configure `{{prefix}}-api/.env`:

```bash
# Required
MONGO_URI=mongodb://localhost:27017/{{workspaceName}}
JWT_SECRET=your-64-char-hex-secret
MNEMONIC_HMAC_SECRET=your-64-char-hex-secret
MNEMONIC_ENCRYPTION_KEY=your-64-char-hex-secret

# Optional
PORT=3000
HOST=0.0.0.0
DEBUG=false
```

Generate secrets: `yarn new:secret`

## Deployment Checklist

- [ ] Set production environment variables in `{{prefix}}-api/.env`
- [ ] Configure API base URL (method 1, 2, or 3 above)
- [ ] Run `yarn build` to build all projects
- [ ] Test production build locally: `yarn serve`
- [ ] Deploy `dist/{{prefix}}-api` to your API server
- [ ] Deploy `dist/{{prefix}}-react` to your web server
- [ ] Verify HTTPS is enabled
- [ ] Test authentication flow
- [ ] Monitor logs for errors
