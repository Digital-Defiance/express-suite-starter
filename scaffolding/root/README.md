# Express Suite Example Application

**A complete reference implementation demonstrating how to build a production-ready MERN stack application with Express Suite.**

This example serves as your guide to building secure, scalable, and internationalized web applications using the Express Suite ecosystem. Follow along to see how all the pieces fit together.

## What You'll Learn

This example demonstrates:

- 🔐 **Authentication & Authorization** - JWT tokens, email verification, backup codes, RBAC
- 🗄️ **Database Integration** - MongoDB with Mongoose, user management, role system
- 🔒 **End-to-End Encryption** - ECIES encryption for sensitive data
- 🌍 **Internationalization** - Multi-language support with i18n-lib
- ⚛️ **React Integration** - Pre-built auth components, hooks, and providers
- 🎨 **Material-UI Theming** - Dark/light mode, responsive design
- 🧪 **Testing** - Unit tests, integration tests, API e2e tests and browser e2e tests with Playwright
- 📦 **Monorepo Structure** - Nx workspace with shared libraries

## Architecture Overview

This monorepo contains 8 projects demonstrating the complete Express Suite stack:

```
express-suite-example/
├── express-suite-example-api/          # Express 5 backend with node-express-suite
├── express-suite-example-api-lib/      # Shared API types and utilities
├── express-suite-example-react/        # React 19 frontend with MUI
├── express-suite-example-react-lib/    # Shared React components
├── express-suite-example-lib/          # Shared business logic
├── express-suite-example-inituserdb/   # Database initialization script
├── express-suite-example-api-e2e/      # API e2e tests (own server, auth flow)
└── express-suite-example-react-e2e/    # Frontend E2E tests (Playwright)
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+ (or use in-memory database for development)
- Yarn package manager

### Installation

```bash
# Clone and install
git clone https://github.com/Digital-Defiance/express-suite-example.git
cd express-suite-example
yarn install

# Build all projects
yarn build:dev

# Initialize database with default users and roles
yarn init:db

# Start the API server (http://localhost:3000)
yarn serve:dev

# In another terminal, start the React app (http://localhost:4200)
cd apps/express-suite-example-react
yarn start
```

### Default Users

After running `yarn init:db`, you'll have:

- **Admin**: `admin@example.com` / `AdminPassword123!`
- **User**: `user@example.com` / `UserPassword123!`

## Key Implementation Examples

### 1. Setting Up Authentication (API)

See `apps/express-suite-example-api/src/main.ts`:

```typescript
import { Application } from '@digitaldefiance/node-express-suite';

const app = new Application({
  port: 3000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  defaultLanguage: 'en-US'
});

await app.start();
```

### 2. Protected Routes with RBAC

See `apps/express-suite-example-api/src/routes/users.ts`:

```typescript
import { requireAuth, requireRole } from '@digitaldefiance/node-express-suite';

router.get('/users', 
  requireAuth(),
  requireRole(['admin']),
  async (req, res) => {
    // Only admins can list users
  }
);
```

### 3. React Authentication Flow

See `apps/express-suite-example-react/src/App.tsx`:

```typescript
import { 
  SuiteConfigProvider,
  AuthProvider,
  LoginFormWrapper 
} from '@digitaldefiance/express-suite-react-components';

function App() {
  return (
    <SuiteConfigProvider baseUrl="http://localhost:3000" routes={{ dashboard: '/dashboard' }}>
      <AuthProvider baseUrl="http://localhost:3000">
        <LoginFormWrapper />
      </AuthProvider>
    </SuiteConfigProvider>
  );
}
```

### 4. Encrypted Data Storage

See `apps/express-suite-example-api-lib/src/services/encryption.ts`:

```typescript
import { ECIESService } from '@digitaldefiance/node-ecies-lib';

const ecies = new ECIESService();
const encrypted = await ecies.encryptWithLength(publicKey, sensitiveData);
const decrypted = await ecies.decryptWithLengthAndHeader(privateKey, encrypted);
```

### 5. Internationalization

See `apps/express-suite-example-react/src/i18n.ts`:

```typescript
import { PluginI18nEngine, LanguageCodes } from '@digitaldefiance/i18n-lib';

const engine = PluginI18nEngine.createInstance('app', [
  { id: LanguageCodes.EN_US, name: 'English', code: 'en-US', isDefault: true },
  { id: LanguageCodes.FR, name: 'Français', code: 'fr' }
]);
```

## Project Structure Deep Dive

### API Project (`express-suite-example-api`)

**Key Files:**
- `src/main.ts` - Application entry point with Express Suite setup
- `src/routes/` - API route definitions with authentication
- `src/middleware/` - Custom middleware (logging, error handling)
- `src/services/` - Business logic services

**Features Demonstrated:**
- JWT authentication with refresh tokens
- Email verification flow
- Password reset with tokens
- Backup code generation and validation
- Role-based access control
- MongoDB transactions
- Error handling with i18n

### React Project (`express-suite-example-react`)

**Key Files:**
- `src/App.tsx` - Root component with providers
- `src/pages/` - Page components (Login, Dashboard, Settings)
- `src/components/` - Custom components
- `src/hooks/` - Custom React hooks

**Features Demonstrated:**
- Authentication flow (login, register, verify email)
- Protected routes
- User settings management
- Theme switching (dark/light mode)
- Language switching
- API integration with axios

### Shared Libraries

**`express-suite-example-lib`** - Business logic shared between API and React:
- User interfaces and types
- Validation schemas
- Constants and enums

**`express-suite-example-api-lib`** - API-specific shared code:
- Database models
- API types
- Utility functions

**`express-suite-example-react-lib`** - React-specific shared code:
- Reusable components
- Custom hooks
- Context providers

## Testing

### Run the tests

```bash
# Unit and integration tests of every project (Jest)
yarn test:jest

# API end-to-end tests (Jest against a real server, see below)
yarn test:e2e

# Browser end-to-end tests (Playwright, see below)
yarn test:e2e:web

# All of the above
yarn test:all
```

### API end-to-end tests: `yarn test:e2e`

Runs the `express-suite-example-api-e2e` project through Nx. It builds the API,
then its Jest `globalSetup` starts the built API (`dist/express-suite-example-api/main.js`)
on a free port with an in-memory database and stops it again afterwards. It
does not need a running dev server, port 3000 or the devcontainer paths in `.env`.

The specs cover:

- `GET /api/health`
- register a user, reject a duplicate registration
- an unverified user cannot log in
- verify the email (the test reads the captured mail through the admin API)
- log in with the direct-login challenge (sign the challenge with the key
  derived from the mnemonic) and receive a JWT
- `GET /api/user/verify` returns 200 with the token, and 401 without a token or
  with a malformed token
- a challenge signed with the wrong key is rejected

### Browser end-to-end tests: `yarn test:e2e:web`

Builds the API and the React app, then runs Playwright with
`express-suite-example-react-e2e/playwright.config.mts` (Chromium, Firefox and
WebKit). Playwright starts the built API, which also serves the built React app,
on port 4310 (set `E2E_WEB_PORT` to change it). Install the browsers once:

```bash
npx playwright install
```

Extra arguments pass through to Playwright:

```bash
yarn test:e2e:web --project=chromium
yarn test:e2e:web --headed
```

The flow registers a user through the `/register` form, verifies the email
through the admin API, signs in on `/login` with username and mnemonic, lands on
`/dashboard`, opens `/user-settings`, logs out, and checks that `/dashboard`
and `/user-settings` redirect an anonymous visitor to `/login`.

Nx's Playwright plugin is not used. The generator removes it on purpose because
its daemon is unreliable in this setup, so the browser tests are only run through
this script.

### Test-only administrator (MERN)

Both e2e projects start the server with a fixed `ADMIN_MNEMONIC`
(`src/support/e2e-env.ts` in each e2e project), so the tests can log in as
`admin` without reading the server output. The mnemonic is for the throwaway
in-memory database of the e2e server only. Never use it, or put it in an `.env`
file, for a real deployment.

The generated server reads its `.env` with override enabled, so the `.env`
file wins over process environment variables. For that reason the e2e projects
do not run `dist/<api>/main.js` directly. They write the e2e settings (free
port, in-memory database, the test mnemonic, the real `dist` directories) into
a copy of the bundle and its `.env` under `dist/.e2e/`, and run that copy. The
deployable output in `dist/<api>` is not modified.

### BrightStack projects

The e2e projects of a BrightStack workspace cover less than the MERN ones. A
BrightStack server seeds a random administrator and ignores `ADMIN_MNEMONIC`,
so the tests cannot read the verification mail through the admin API and cannot
finish a login:

- API e2e: health, registration (which returns a token), `GET /api/user/verify`
  with that token (200), without a token (401) and with a malformed token
  (rejected), a refused login for the unverified user, a refused login with the
  wrong key.
- Browser e2e: registration through the form, a refused sign in before the email
  is verified, and the redirect of anonymous visitors from the private pages.

Registering with an `@<EMAIL_DOMAIN>` address (default `example.com`) is
refused by BrightStack, so the tests use `@e2e-users.test` addresses.

### Known behavior of the Express Suite that the tests work around

- A duplicate registration answers HTTP 500 (MERN) instead of a 4xx, so the test
  only asserts that it is rejected.
- WebKit does not exempt `http://localhost` from the `upgrade-insecure-requests`
  directive in the API's Content-Security-Policy and would load the app over
  https. `src/support/fixtures.ts` in the browser e2e project removes that one
  directive from the document response for WebKit only.

### Where the tests live

- API: `express-suite-example-api/src/**/*.spec.ts`
- React: `express-suite-example-react/src/**/*.spec.tsx`
- API e2e: `express-suite-example-api-e2e/src/**/*.spec.ts`
- Browser e2e: `express-suite-example-react-e2e/src/**/*.spec.ts`

## Development Workflow

### Adding a New Feature

1. **Define types** in `express-suite-example-lib`
2. **Create API endpoint** in `express-suite-example-api`
3. **Add database model** in `express-suite-example-api-lib`
4. **Build React component** in `express-suite-example-react`
5. **Write tests** for all layers

### Example: Adding a "Posts" Feature

```bash
# 1. Add types
echo "export interface IPost { title: string; content: string; }" > libs/express-suite-example-lib/src/interfaces/post.ts

# 2. Add API route
touch apps/express-suite-example-api/src/routes/posts.ts

# 3. Add model
touch apps/express-suite-example-api-lib/src/models/post.model.ts

# 4. Add React component
touch apps/express-suite-example-react/src/components/PostList.tsx

# 5. Add tests
touch apps/express-suite-example-api/src/routes/posts.spec.ts
touch apps/express-suite-example-react/src/components/PostList.spec.tsx
```

## Configuration

### Environment Variables

Create `.env` files in each app:

**`apps/express-suite-example-api/.env`:**
```bash
MONGODB_URI=mongodb://localhost:27017/express-suite-example
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
EMAIL_FROM=noreply@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
```

**`apps/express-suite-example-react/.env`:**
```bash
REACT_APP_API_URL=http://localhost:3000
```

## Deployment

### Production Build

```bash
# Build all projects for production
yarn build

# Start API in production mode
yarn serve
```

### Docker Support

See `docker-compose.yml` for containerized deployment:

```bash
docker-compose up -d
```

## Common Patterns

### Pattern 1: Authenticated API Call

```typescript
// React component
import { useAuth } from '@digitaldefiance/express-suite-react-components';

const { token } = useAuth();
const response = await axios.get('/api/users', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Pattern 2: Form Validation

```typescript
// Shared validation schema
import * as Yup from 'yup';

export const userSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required()
});
```

### Pattern 3: Error Handling

```typescript
// API error handler
import { handleError } from '@digitaldefiance/node-express-suite';

app.use((err, req, res, next) => {
  handleError(err, req, res);
});
```

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
mongosh

# Or use in-memory database for development
export USE_IN_MEMORY_DB=true
```

### Port Already in Use

```bash
# Change port in .env
PORT=3001
```

### Build Errors

```bash
# Clean and rebuild
yarn clean
yarn install
yarn build:dev
```

## Learn More

- [Express Suite Documentation](https://github.com/Digital-Defiance/express-suite)
- [Architecture Details](./ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Contributing Guide](./CONTRIBUTING.md)

## Scripts Reference

- `yarn build` - Production build of all projects
- `yarn build:dev` - Development build of all projects
- `yarn serve:dev` - Start API server in development mode
- `yarn serve` - Start API server in production mode
- `yarn test:all` - Run all tests (Jest, API e2e and browser e2e)
- `yarn test:jest` - Run Jest tests only
- `yarn test:e2e` - Run the API e2e tests (starts its own server)
- `yarn test:e2e:web` - Build, then run the Playwright browser e2e tests (`npx playwright install` first; extra arguments pass through)
- `yarn lint:all` - Lint all projects
- `yarn prettier:check` - Check code formatting
- `yarn prettier:fix` - Fix code formatting
- `yarn init:db` - Initialize database with default users

## License

MIT © Digital Defiance
