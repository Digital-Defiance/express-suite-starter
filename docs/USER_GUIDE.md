# Express Suite Starter - Complete User Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Generating Your Project](#generating-your-project)
3. [Understanding Your Generated Project](#understanding-your-generated-project)
4. [Configuration](#configuration)
5. [Running Your Application](#running-your-application)
6. [Development Workflow](#development-workflow)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 22+** - [Download](https://nodejs.org/)
- **Yarn 4.x** - Installed automatically by the generator
- **MongoDB** - Local installation or Docker
- **Git** - For version control (optional)
- **Build Tools**:
  - **Linux**: `build-essential` (`sudo apt install build-essential`)
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Windows**: Visual Studio Build Tools or `windows-build-tools`

---

## Generating Your Project

### Step 1: Run the Generator

```bash
npx @digitaldefiance/express-suite-starter
```

### Step 2: Answer the Prompts

The generator will ask you:

1. **Workspace name** (e.g., `my-app`) - Used for directory and package names
2. **Prefix** (e.g., `myapp`) - Used for project names (`myapp-api`, `myapp-react`)
3. **Namespace** (e.g., `@mycompany`) - Used for package scoping
4. **Parent directory** - Where to create the workspace (default: current directory)
5. **Git repository URL** (optional) - For remote repository setup
6. **Optional projects**:
   - E2E tests (`api-e2e`, `react-e2e`)
7. **Optional packages**:
   - Authentication packages
   - Validation packages
   - Documentation tools
8. **DevContainer configuration**:
   - None
   - Simple (Node.js only)
   - MongoDB (single instance)
   - MongoDB Replica Set (for transactions)
9. **Database configuration**:
   - In-memory database for development
   - Database name
10. **Security secrets** - Auto-generated or provide your own
11. **Documentation generation** - Auto-generate README, ARCHITECTURE docs
12. **Git initialization** - Create initial commit and push

### Step 3: Wait for Generation

The generator will:

- Create Nx monorepo
- Install dependencies
- Generate projects
- Copy scaffolding files
- Configure environment files
- Generate documentation

This takes 5-10 minutes depending on your internet connection.

---

## Understanding Your Generated Project

### Project Structure

```
my-app/
├── myapp-lib/              # Shared library (frontend + backend)
│   ├── src/
│   │   ├── constants.ts    # Application constants
│   │   ├── i18n-setup.ts   # Internationalization setup
│   │   └── string-name.ts  # Translation keys
│   └── project.json
├── myapp-api-lib/          # API business logic
│   ├── src/
│   │   ├── application.ts  # Express application setup
│   │   ├── constants.ts    # API constants
│   │   └── environment.ts  # Environment validation
│   └── project.json
├── myapp-api/              # Express API server
│   ├── src/
│   │   └── main.ts         # API entry point
│   ├── .env.example        # Environment template
│   └── project.json
├── myapp-react-lib/        # React component library (optional)
│   ├── src/
│   │   └── theme.ts        # Material-UI theme
│   └── project.json
├── myapp-react/            # React frontend
│   ├── src/
│   │   ├── app/
│   │   │   └── app.tsx     # Main app component
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── environments/   # Environment configs
│   └── project.json
├── myapp-inituserdb/       # Database initialization
│   ├── src/
│   │   └── main.ts         # DB init script
│   └── project.json
├── myapp-api-e2e/          # API E2E tests
├── myapp-react-e2e/        # React E2E tests
├── package.json            # Root package.json with scripts
├── nx.json                 # Nx configuration
└── .devcontainer/          # DevContainer config (optional)
```

### Key Files

- **package.json** - Root scripts and dependencies
- **nx.json** - Nx workspace configuration
- **tsconfig.base.json** - TypeScript path mappings
- **.env files** - Environment configuration (not committed to git)

---

## Configuration

### Step 1: Configure API Environment

Copy the example environment file:

```bash
cd my-app
cp myapp-api/.env.example myapp-api/.env
```

Edit `myapp-api/.env`:

```bash
# Database
MONGO_URI=mongodb://localhost:27017/myapp
DEV_DATABASE=myapp-dev  # Optional: in-memory database for development

# Security (auto-generated during setup)
JWT_SECRET=your-64-char-hex-secret
MNEMONIC_HMAC_SECRET=your-64-char-hex-secret
MNEMONIC_ENCRYPTION_KEY=your-64-char-hex-secret

# Server
PORT=3000
HOST=0.0.0.0
DEBUG=true

EMAIL_SENDER=noreply@example.com
```

**Generate new secrets** (if needed):

```bash
yarn new:secret
```

### Step 2: Configure Database Initialization

Copy the environment file for the database initialization utility:

```bash
cp myapp-inituserdb/.env.example myapp-inituserdb/.env
```

Use the same values as `myapp-api/.env`.

### Step 3: Configure React Environment (Optional)

For custom API URLs, edit:

**Development**: `myapp-react/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

**Production**: `myapp-react/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: '/api',  // Relative URL for same-domain deployment
};
```

### Step 4: Start MongoDB

**Local MongoDB**:

```bash
mongod --dbpath /path/to/data
```

**Docker**:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**DevContainer**: MongoDB starts automatically if you selected MongoDB devcontainer option.

---

## Running Your Application

### Step 1: Install Dependencies (if not done)

```bash
yarn install
```

### Step 2: Initialize Database

Run the database initialization utility:

```bash
yarn nx run myapp-inituserdb:serve
```

This creates system users and initial data required for the application.

### Step 3: Build Projects

```bash
yarn build
```

Or build specific projects:

```bash
yarn nx build myapp-lib
yarn nx build myapp-api-lib
yarn nx build myapp-api
yarn nx build myapp-react-lib
yarn nx build myapp-react
```

### Step 4: Start API Server

**Development mode** (with watch):

```bash
yarn nx serve myapp-api
```

**Production mode**:

```bash
yarn nx serve myapp-api --configuration=production
```

The API will be available at `http://localhost:3000`

### Step 5: Start React Frontend

In a new terminal:

```bash
yarn nx serve myapp-react
```

The frontend will be available at `http://localhost:4200`

### Step 6: Access Your Application

Open your browser to `http://localhost:4200`

**Default routes**:

- `/` - Splash page
- `/register` - User registration
- `/login` - User login
- `/dashboard` - User dashboard (requires authentication)
- `/api-access` - API access page (requires authentication)

---

## Development Workflow

### Common Commands

```bash
# Build all projects
yarn build

# Build in development mode
yarn build:dev

# Serve API (development)
yarn nx serve myapp-api

# Serve React (development)
yarn nx serve myapp-react

# Run all tests
yarn test

# Run specific project tests
yarn nx test myapp-api
yarn nx test myapp-react

# Run E2E tests
yarn nx e2e myapp-api-e2e
yarn nx e2e myapp-react-e2e

# Lint all projects
yarn nx run-many --target=lint --all

# Format code
yarn nx format:write
```

### Adding New Features

1. **Add a new API endpoint**:
   - Edit `myapp-api-lib/src/application.ts`
   - Add route handler
   - Rebuild: `yarn nx build myapp-api-lib`

2. **Add a new React component**:
   - Create component in `myapp-react/src/components/`
   - Import and use in pages
   - Rebuild: `yarn nx build myapp-react`

3. **Add shared constants**:
   - Edit `myapp-lib/src/constants.ts`
   - Rebuild: `yarn nx build myapp-lib`

4. **Add translations**:
   - Edit `myapp-lib/src/string-name.ts`
   - Add translation keys
   - Update i18n files

### Hot Reload

Both API and React support hot reload in development mode:

- **API**: Automatically restarts on file changes
- **React**: Automatically refreshes browser on file changes

---

## Deployment

### Production Build

```bash
# Build all projects for production
yarn build

# Output is in dist/ directory
ls dist/
# myapp-api/
# myapp-react/
# myapp-lib/
# myapp-api-lib/
# myapp-react-lib/
```

### Deploy API

1. Copy `dist/myapp-api/` to your server
2. Copy `.env` file to server
3. Install production dependencies:

   ```bash
   cd dist/myapp-api
   npm install --production
   ```

4. Start server:

   ```bash
   node main.js
   ```

### Deploy React

1. Copy `dist/myapp-react/` to your web server
2. Configure web server to serve `index.html` for all routes (SPA)
3. Set up HTTPS

**Nginx example**:

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/myapp-react;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
    }
}
```

### API Base URL Configuration

See [DEPLOYMENT.md](../scaffolding/root/DEPLOYMENT.md) for detailed API URL configuration options.

---

## Troubleshooting

### Build Errors

**Error**: `Cannot find module '@mycompany/myapp-lib'`

**Solution**: Build dependencies first:

```bash
yarn nx build myapp-lib
yarn nx build myapp-api-lib
yarn nx build myapp-react-lib
```

### MongoDB Connection Errors

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solution**: Ensure MongoDB is running:

```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod --dbpath /path/to/data
```

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**: Kill the process using the port:

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

Or change the port in `.env`:

```bash
PORT=3001
```

### Environment Variables Not Loading

**Solution**: Ensure `.env` file exists and is in the correct location:

```bash
ls myapp-api/.env
```

Copy from example if missing:

```bash
cp myapp-api/.env.example myapp-api/.env
```

### React Can't Connect to API

**Error**: Network errors in browser console

**Solution**: Check API base URL in `myapp-react/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',  // Must match API server
};
```

### TypeScript Errors

**Solution**: Rebuild all projects:

```bash
yarn build
```

Clear Nx cache:

```bash
yarn nx reset
```

---

## Next Steps

- Read [ARCHITECTURE.md](../scaffolding/root/ARCHITECTURE.md) for system architecture
- Read [DEPLOYMENT.md](../scaffolding/root/DEPLOYMENT.md) for deployment details
- Explore Express Suite packages:
  - [@digitaldefiance/node-express-suite](https://www.npmjs.com/package/@digitaldefiance/node-express-suite)
  - [@digitaldefiance/express-suite-react-components](https://www.npmjs.com/package/@digitaldefiance/express-suite-react-components)
  - [@digitaldefiance/i18n-lib](https://www.npmjs.com/package/@digitaldefiance/i18n-lib)
  - [@digitaldefiance/ecies-lib](https://www.npmjs.com/package/@digitaldefiance/ecies-lib)

---

## Support

- **Issues**: [GitHub Issues](https://github.com/Digital-Defiance/express-suite-starter/issues)
- **Documentation**: [Express Suite Docs](https://github.com/Digital-Defiance/express-suite-starter)
- **NPM Package**: [@digitaldefiance/express-suite-starter](https://www.npmjs.com/package/@digitaldefiance/express-suite-starter)
