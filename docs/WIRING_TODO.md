# Wiring TODO

## High Priority 🔴

### 1. Hostname Configuration
- ✅ Add hostname prompt to generator
- ✅ Add hostname to workspace config
- ✅ Add {{HOSTNAME}} mustache variable
- ✅ Update .env templates with hostname variable
- [ ] Use hostname in devcontainer mkcert setup scripts
- [ ] Update React environment configs with hostname

### 2. API Setup (api-lib)
- [ ] Create ApplicationConcrete similar to node-express-suite
- [ ] Set up constants (similar to LocalhostConstants)
- [ ] Create ApiRouter with all auth endpoints
- [ ] Create AppRouter
- [ ] Wire up controllers for:
  - [ ] Register
  - [ ] Login (email/username + password/mnemonic)
  - [ ] Verify email
  - [ ] Backup code login
  - [ ] Change password
  - [ ] Get backup codes
  - [ ] Logout
  - [ ] Token verification

### 3. React Page Wrappers
Need to create page components that wire forms to API:

- [ ] `LoginPage.tsx` - Wire LoginForm to auth API
- [ ] `RegisterPage.tsx` - Wire RegisterForm to auth API
- [ ] `VerifyEmailPage.tsx` - Wire to verification endpoint
- [ ] `BackupCodeLoginPage.tsx` - Wire BackupCodeLoginForm to API
- [ ] `ChangePasswordPage.tsx` - Wire ChangePasswordForm to API
- [ ] `BackupCodesPage.tsx` - Wire BackupCodesForm to API

### 4. Constants Setup
- [ ] Create constants file in api-lib with:
  - [ ] JWT settings
  - [ ] Password requirements
  - [ ] Mnemonic settings
  - [ ] Session settings
  - [ ] Email settings

### 5. Environment Integration
- [ ] Wire environment.ts to API base URL
- [ ] Update api.ts to use environment config
- [ ] Add environment switching for dev/prod

## Current State

### ✅ What's Working
- Scaffolding structure complete
- Components package has all UI components
- Routing structure in place
- Theme and styling configured
- Hostname prompt and variable system
- Mustache variable: {{HOSTNAME}} available in templates

### ❌ What's Missing
- API endpoints not implemented
- Forms not wired to API calls
- No auth state management
- No error handling
- Constants not defined
- Hostname configuration

## Implementation Plan

### Phase 1: API Foundation
1. Create constants file
2. Set up ApplicationConcrete
3. Create basic routers (ApiRouter, AppRouter)
4. Implement auth controllers

### Phase 2: React Integration
1. Create page wrappers for each form
2. Wire onSubmit handlers to API calls
3. Add error handling and loading states
4. Test auth flow end-to-end

### Phase 3: Configuration
1. Add hostname prompt
2. Update devcontainer mkcert setup
3. Wire environment configs
4. Test full generation

## Notes

The express-suite-react-components provides:
- Form UI components (LoginForm, RegisterForm, etc.)
- These take `onSubmit` callbacks
- We need to create page components that provide these callbacks
- Callbacks should call our API endpoints

Example pattern:
```tsx
const LoginPage = () => {
  const handleSubmit = async (values) => {
    const response = await api.post('/login', values);
    // Handle response
  };
  
  return <LoginForm onSubmit={handleSubmit} />;
};
```
