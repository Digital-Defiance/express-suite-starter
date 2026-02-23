# Node Express Suite Starter

<img src="assets/albatross.svg" style="height: 200px;" />

Automated generator for MERN stack monorepos using [@digitaldefiance/node-express-suite](https://www.npmjs.com/package/@digitaldefiance/node-express-suite).

Part of [Express Suite](https://github.com/Digital-Defiance/express-suite)

## Features

- 🚀 **Nx Monorepo** - Modern build system with caching
- ⚛️ **React 19** - Latest React with TypeScript
- 🔧 **Express 5** - Node.js API with @digitaldefiance/node-express-suite
- 🗄️ **MongoDB** - Database with Mongoose ODM
- 🎨 **Material-UI** - Component library
- 🔐 **ECIES Encryption** - Built-in cryptography
- 🌍 **i18n** - Multi-language support with @digitaldefiance/i18n-lib
- 🧪 **Testing** - Jest + Playwright E2E
- 🎯 **Enhanced CLI** - Chalk-powered interface with progress tracking
- 📦 **Package Groups** - Optional feature sets (auth, validation, docs)
- 🔄 **Rollback Support** - Checkpoint/restore for failed generations
- 🎨 **Template Engines** - Mustache with variable substitution
- 🐳 **DevContainer** - 4 options (none, simple, MongoDB, MongoDB replica set)
- 🔌 **Plugin System** - Extensible with lifecycle hooks
- ✅ **Validation** - Post-generation checks with fix suggestions
- 🖥️ **Cross-Platform** - Windows, macOS, and Linux support

**Express Suite** is a comprehensive TypeScript framework providing a complete foundation for building secure, scalable, and internationalized web applications. It integrates enterprise-grade cryptography, multi-language internationalization, and a full-stack MERN framework—all structured as modular packages for modern development workflows.

Formerly known as **Project Albatross**, the suite draws inspiration from the great albatross bird, symbolizing endurance and the ability to traverse vast distances—qualities reflected in the suite's goal to deliver far-reaching, reliable solutions.

Express Suite Starter is a scaffolding generator which can produce fully functional application boilerplate using all of Express Suite's features (internationalization, mnemonic login, backup codes, etc):

<img width="1071" height="1051" alt="Screenshot 2026-02-22 at 11 39 01 AM" src="https://github.com/user-attachments/assets/5cc74425-aa8a-4a10-94f1-5a1e2979b646" />

<img width="1071" height="1051" alt="Screenshot 2026-02-22 at 11 40 09 AM" src="https://github.com/user-attachments/assets/4b6c9c13-9452-4fa2-9356-5cdd1f26f42d" />

<img width="1071" height="1051" alt="Screenshot 2026-02-22 at 11 40 19 AM" src="https://github.com/user-attachments/assets/2ef7614f-fa96-4af5-843b-663a5322bc38" />

<img width="1071" height="1051" alt="Screenshot 2026-02-22 at 11 39 50 AM" src="https://github.com/user-attachments/assets/92dda51f-204e-4e1a-84bb-367b6bd0a44a" />

## Quick Start

### NPX (Recommended)

```bash
npx @digitaldefiance/express-suite-starter
```

The generator will guide you through an interactive setup process with the following prompts:

1. **Language Selection** - Choose your preferred language from 8 options
2. **Workspace Configuration** - Name, prefix, namespace, parent directory, git repository
3. **Site Configuration** - Hostname, site title, description, and tagline
4. **Optional Projects** - Choose which projects to include (E2E tests, etc.)
5. **Package Groups** - Select optional package groups (authentication, validation, documentation)
6. **DevContainer** - Configure development container (None, Simple, MongoDB, Replica Set)
7. **Database** - Choose between in-memory database or MongoDB
8. **Security** - Auto-generate secrets (JWT, encryption keys, HMAC)
9. **Final Options** - Documentation generation, git commit, Playwright installation

### Local Development

```bash
yarn install
yarn build
yarn start
```

## Interactive Generation Process

When you run `npx @digitaldefiance/express-suite-starter`, you'll see a branded ASCII art logo and be guided through a comprehensive setup wizard:

<details>
<summary>View example generation session</summary>

```text
➜  express-suite npx @digitaldefiance/express-suite-starter        

...

v22.21.1 is already installed.
Now using node v22.21.1 (npm v10.9.4)

✔ Select language: English (US)

╔═════════════════════════════════════════════════════════════════════════════╗
║ Node Express Suite Starter v2.2.1                                           ║
║ Formerly Project Albatross                                                  ║
╠═════════════════════════════════════════════════════════════════════════════╣
║ Node Express Suite Starter generates an NX monorepo MERN stack with React   ║
║ app, Express API, shared libraries, @digitaldefiance/node-express-suite,    ║
║ and @digitaldefiance/express-suite-react-components integration.            ║
╚═════════════════════════════════════════════════════════════════════════════╝

System Check
────────────
✓ System check passed

Workspace Configuration
───────────────────────
✔ Enter the workspace name: my-awesome-app
✔ Enter the project prefix: awesome
✔ Enter the npm namespace: @awesome
✔ Enter the parent directory: /home/user/projects
✔ Enter the git repository URL (optional): 
✔ Enter the hostname: awesome.example.com
✔ Enter the site title: My Awesome App
✔ Enter the site description: A comprehensive web application...
✔ Enter the site tagline: Built with Express Suite
✔ Run in dry-run mode? No

Optional Projects
✔ Include E2E tests? Yes

Package Groups
✔ Select optional package groups: authentication, validation, documentation

DevContainer Configuration
✔ Set up DevContainer configuration? Yes
✔ DevContainer configuration: MongoDB

Database Configuration
✔ Use in-memory database for development? No
✔ Enter MongoDB database name: awesome_db

Security Configuration
✔ Generate JWT_SECRET? Yes
ℹ Generated JWT_SECRET
✔ Generate MNEMONIC_ENCRYPTION_KEY? Yes
ℹ Generated MNEMONIC_ENCRYPTION_KEY
✔ Generate MNEMONIC_HMAC_SECRET? Yes
ℹ Generated MNEMONIC_HMAC_SECRET

Starting generation (19 steps)
──────────────────────────────
[1/19] Checking target directory
✓ Completed: Checking target directory

[2/19] Creating Nx workspace
$ npx create-nx-workspace@latest "my-awesome-app" --package-manager=yarn...
✓ Completed: Creating Nx workspace

[3/19] Updating TypeScript base configuration
✓ Completed: Updating TypeScript base configuration

[5/19] Setting up Yarn Berry
✓ Completed: Setting up Yarn Berry

[6/19] Adding Nx plugins
✓ Completed: Adding Nx plugins

[7/19] Installing dependencies
✓ Completed: Installing dependencies

[8/19] Generating project structure
ℹ Generating lib: awesome-lib
ℹ Generating react: awesome-react
ℹ Generating api: awesome-api
✓ Completed: Generating project structure

[9/19] Installing React components package
✓ Completed: Installing React components package

[10/19] Rendering configuration templates
✓ Completed: Rendering configuration templates

[11/19] Copying scaffolding files
✓ Completed: Copying scaffolding files

[12/19] Generating LICENSE file
✓ Completed: Generating LICENSE file

[13/19] Adding package.json scripts
✓ Completed: Adding package.json scripts

[14/19] Generating documentation
✓ Completed: Generating documentation

[15/19] Setting up environment files
✓ Completed: Setting up environment files

[16/19] Building native modules
✓ Completed: Building native modules

[17/19] Validating generated project
✓ Completed: Validating generated project

[18/19] Creating initial commit
✓ Completed: Creating initial commit

[19/19] Installing Playwright browsers
✓ Completed: Installing Playwright browsers

Generation Complete!
────────────────────
✓ Monorepo created at: /home/user/projects/my-awesome-app

Next steps:
  cd my-awesome-app
  yarn build:dev
  yarn serve:dev
```

</details>

The generator performs 19 automated steps including:

- System validation (build tools, Node.js version)
- Nx workspace creation with Yarn Berry
- Project scaffolding (lib, api, react, etc.)
- Dependency installation and configuration
- Secret generation and environment setup
- Documentation generation
- Git initialization and commit
- Post-generation validation

## What Gets Generated

### Projects (7 total, some optional)

```
my-app/
├── my-app-lib/              # Shared library (i18n, constants, enumerations)
├── my-app-api-lib/          # API business logic (App, Environment, Constants)
├── my-app-api/              # Express server (main.ts, views, .env)
├── my-app-api-e2e/          # API E2E tests (Jest)
├── my-app-react/            # React frontend (Vite + Material-UI)
├── my-app-react-lib/        # React component library (optional)
├── my-app-react-e2e/        # React E2E tests (Playwright, optional)
└── my-app-inituserdb/       # DB initialization (optional)
```

Note: Test utilities are provided by `@digitaldefiance/express-suite-test-utils` package.

### Scaffolding Files

- **lib**: i18n setup, string enumerations, constants, interfaces
- **api-lib**: Application class, Environment, Constants, interfaces
- **api**: main.ts entry point, EJS views, .env.example
- **react**: App structure, components, pages, assets
- **react-lib**: Theme configuration
- **root**: CI workflows, scripts, .gitignore, devcontainer

## Generated Scripts

The generated monorepo includes:

```bash
# Development
yarn build:dev          # Development build
yarn serve:dev          # Start API server (dev mode)
yarn serve:dev:stream   # Start API with streaming output

# Production
yarn build              # Production build (copies .env to dist/)
yarn serve              # Start API server (production mode)
node dist/example-project-api/main.js  # Direct production run

# Testing & Database
yarn test:all           # Run all tests
yarn inituserdb:full:drop  # Initialize database
```

## Architecture

### Structure (v2.1.40)

```
src/
├── core/
│   ├── interfaces/           # 15+ TypeScript interfaces
│   ├── validators/           # Config + post-generation validation
│   ├── config-schema.ts      # Configuration validation
│   ├── step-executor.ts      # Step execution with rollback
│   ├── dry-run-executor.ts   # Preview mode
│   ├── plugin-manager.ts     # Plugin system with 5 hooks
│   ├── project-generator.ts  # Nx project generation
│   ├── project-config-builder.ts  # Dynamic project configs
│   └── package-resolver.ts   # Version resolution
├── cli/
│   └── logger.ts             # Chalk-based semantic logging
├── templates/
│   ├── engines/              # Mustache + Handlebars
│   └── template-engine-factory.ts
└── utils/
    ├── shell-utils.ts        # Cross-platform commands
    ├── system-check.ts       # Build tool validation
    ├── template-renderer.ts  # File operations
    ├── doc-generator.ts      # README/ARCHITECTURE/API docs
    └── diff-viewer.ts        # Dry-run preview
```

### Interactive Prompts

- **Workspace Configuration**: Name, prefix, namespace, parent directory
- **Optional Projects**: react-lib, api-lib, E2E tests, inituserdb, test-utils
- **Package Groups**: Authentication, validation, documentation, UI components
- **Express Suite Packages**: react-components, test-utils
- **DevContainer**: None, simple (Node.js), MongoDB, MongoDB replica set
- **Documentation**: Auto-generate README, ARCHITECTURE, API docs
- **Git**: Optional commit and push
- **Playwright**: Optional browser installation

### DevContainer Options

1. **None** - No devcontainer
2. **Simple** - Node.js 20 only
3. **MongoDB** - Node.js + MongoDB single instance
4. **MongoDB Replica Set** - Node.js + MongoDB with transactions support

All devcontainers include VS Code extensions and run on Linux regardless of host OS.

### Template Processing

**Scaffolding files** with `.mustache` extension are automatically processed:

- Variables replaced: `{{workspaceName}}`, `{{WorkspaceName}}`, `{{prefix}}`, `{{namespace}}`, `{{hostname}}`
- Extension stripped: `app.tsx.mustache` → `app.tsx`
- Non-mustache files copied directly without modification

**Example:**

```typescript
// scaffolding/lib/src/lib/i18n-setup.ts.mustache
export const ComponentId = '{{WorkspaceName}}';

// Generated as: example-project-lib/src/lib/i18n-setup.ts
export const ComponentId = 'ExampleProject';
```

## Development

### Build

```bash
yarn build             # TypeScript compilation
```

### Test

```bash
yarn test              # Run all tests (21 suites, 137 tests)
yarn test:watch        # Watch mode
yarn test:coverage     # Coverage report
```

### System Requirements

Automatically checked before generation:

- **C++ compiler** (g++, clang++, or Visual Studio Build Tools)
- **Python 3** (for node-gyp)
- **make** (Unix) or **MSBuild** (Windows)
- **git** (optional, warning only)

### Cross-Platform Support

✅ **Windows**: Uses `where` for command checks, Visual Studio Build Tools
✅ **macOS**: Uses `command -v`, Xcode Command Line Tools
✅ **Linux**: Uses `command -v`, build-essential package

## Packages Installed

### Express Suite (Core)

- `@digitaldefiance/node-express-suite` - Backend framework with BaseApplication, BaseRouter
- `@digitaldefiance/suite-core-lib` - Core utilities and constants
- `@digitaldefiance/ecies-lib` - Browser ECIES encryption
- `@digitaldefiance/node-ecies-lib` - Node.js ECIES encryption
- `@digitaldefiance/i18n-lib` - Multi-language support with I18nEngine

### Express Suite (Optional)

- `@digitaldefiance/express-suite-react-components` - Pre-built React components (useAuth, etc.)
- `@digitaldefiance/express-suite-test-utils` - Testing utilities (always included)

### Core Stack

- **Backend**: Express 5, MongoDB, Mongoose
- **Frontend**: React 19, Vite, Material-UI
- **Testing**: Jest, Playwright
- **Build**: Nx, TypeScript, ESLint, Prettier

## Advanced Features

### Plugin System

Create custom plugins with 5 lifecycle hooks:

```typescript
import { Plugin } from '@digitaldefiance/express-suite-starter';

export const myPlugin: Plugin = {
  name: 'my-plugin',
  hooks: {
    beforeGeneration: async (context) => { /* ... */ },
    afterGeneration: async (context) => { /* ... */ },
    beforeStep: async (step, context) => { /* ... */ },
    afterStep: async (step, context) => { /* ... */ },
    onError: async (error, step, context) => { /* ... */ },
  },
};
```

### Dry-Run Mode

Preview changes without creating files:

```bash
npx @digitaldefiance/express-suite-starter --dry-run
```

### Post-Generation Validation

Automatic checks after generation:

- ✅ package.json validation
- ✅ Dependency conflict detection
- ✅ Best practices checking
- ✅ Fix suggestions

### Package Groups

Optional feature sets in `config/package-groups.json`:

- **testing**: Additional test utilities
- **linting**: Enhanced linting rules
- **ui-components**: Extra UI libraries
- **database**: Database tools
- **authentication**: Auth utilities
- **validation**: Validation libraries
- **documentation**: Doc generation tools

## CLI Features

### Progress Tracking

```
[1/15] Checking target directory ✓
[2/15] Creating Nx monorepo ✓
[3/15] Setting up git remote ✓
...
[15/15] Installing Playwright browsers ✓
```

### Color-Coded Output

- ✓ Green: Success
- ✗ Red: Errors  
- ⚠ Yellow: Warnings
- ℹ Blue: Information
- $ Gray: Commands

### Semantic Logging

```typescript
Logger.success('message')    // ✓ Green
Logger.error('message')      // ✗ Red
Logger.warning('message')    // ⚠ Yellow
Logger.info('message')       // ℹ Blue
Logger.step(1, 5, 'msg')    // [1/5] Cyan
Logger.command('cmd')        // $ Gray
```

## Documentation

- **ARCHITECTURE.md** - Comprehensive architecture documentation
- **CONTEXT.md** - Development context and decisions
- **PLUGIN_GUIDE.md** - Plugin development guide
- **QUICKSTART.md** - 10-minute quick start
- **EXAMPLES.md** - Usage examples

## Testing

- **21 test suites** (18 unit + 3 integration)
- **96 tests** passing
- **95%+ coverage** on core components
- **100% coverage** on critical paths

## Environment Configuration

### Development

1. **API .env**: Update `{prefix}-api/.env` with your configuration
2. **DevContainer .env** (if using MongoDB devcontainer): Update `.devcontainer/.env`
   - Replica set: `MONGO_URI=mongodb://localhost:27017/dbname?replicaSet=rs0&directConnection=true`
   - Single instance: `MONGO_URI=mongodb://localhost:27017/dbname?directConnection=true`

### Production Deployment

```bash
# Build (copies .env to dist/)
yarn build

# Run from dist/
node dist/example-project-api/main.js

# Or use process manager
pm2 start dist/example-project-api/main.js
```

The `.env` file is automatically copied to `dist/` during build via `post-build` target in `project.json`.

## Version

**Current**: 2.1.45

**Status**: Beta

## Links

- [Express Suite Packages](https://www.npmjs.com/search?q=%40digitaldefiance)
- [GitHub Repository](https://github.com/Digital-Defiance/express-suite)
- [Nx Documentation](https://nx.dev)

## License

MIT © Digital Defiance

## ChangeLog

### Version 2.3.1

- Update react-components, test-utils
- Add new @digitaldefiance/mongoose-types dep
- Make scaffolded app use mongoose-types

### Version 2.3.0

- Minor version updates

### Version 2.2.2

- Add Formerly project albatross subtitle
- Reorganize strings into subdir

### Version 2.2.0

#### Dependencies

- Updated `@digitaldefiance/express-suite-react-components` ^2.2.0 → ^2.5.12
- Updated `@digitaldefiance/i18n-lib` 3.6.0 → 3.6.4
- Updated `@digitaldefiance/express-suite-test-utils` 1.0.8 → 1.0.10

#### Features

- Added Yarn registry configuration to devcontainer post-create scripts
- Added `siteUrl` field to environment interface
- Added runtime configuration support via `window.APP_CONFIG`

#### Breaking Changes

- Renamed `window.__RUNTIME_CONFIG__` to `window.APP_CONFIG`
- Converted `environment.prod.ts` to template format (`environment.prod.ts.mustache`)
- Removed automatic `/api` suffix stripping from API URL handling

#### Improvements

- Refactored environment files to support dynamic runtime configuration
- Updated TypeScript target from ES2020 to ES2022
- Improved API URL resolution logic with better null checking
- Updated deployment documentation to reflect new config naming

#### Bug Fixes

- Fixed Yarn registry configuration in Verdaccio detection for all devcontainer variants

### Version 2.1.69

- Update libs

### Version 2.1.68

- Query for and template siteTitle/Desc/Tagline into constants/i18n

### Version 2.1.67

- Verdaccio configs

### Version 2.1.66

- Add .env to simple devcontainer

### Version 2.1.65

- Add multi-lingual support to strings

### Version 2.1.64

- Update react components

### Version 2.1.63

- Update react components

### Version 2.1.62

- Fix AuthProvider navigation

### Version 2.1.61

- Fix vite.config

### Version 2.1.60

- CORS + mkcert tweaks

### Version 2.1.59

- Fix views assets project.json config

### Version 2.1.58

- EmailServiceRegistry improvements

### Version 2.1.57

- Misc Improvements

### Version 2.1.55

- Add inituserdb to package.json

### Version 2.1.54

- Fix @@ in app.tsx

### Version 2.1.53

- Missing file bugfix

### Version 2.1.52

- Bugfix to workspacename

### Version 2.1.51

- Misc updates

### Version 2.1.50

#### Added

- Complete user guide and deployment documentation

- Runtime configuration support for multi-domain deployments

#### Changed

- inituserdb now always included (breaking change)

- React app uses environment-based API URLs

#### Fixed

- Template renderer no longer copies .mustache source files

- VerifyEmailPage wrapper usage in scaffolding

### Version 2.1.45

- Translate UI

### Version 2.1.43

#### Added

- Interactive database configuration prompts (in-memory vs MongoDB)
- Automated secret generation (JWT_SECRET, MNEMONIC_ENCRYPTION_KEY, MNEMONIC_HMAC_SECRET)
- MongoDB password configuration for DevContainers
- Automatic .env population with generated secrets

#### Changed

- `.env.example` includes detailed comments
- DEV_DATABASE now optional (empty = use MONGO_URI)
- `.env` files populated with values instead of copied from example
- MONGO_URI dynamically built with workspace name and optional auth

#### Fixed

- DevContainer MongoDB URI uses workspace name instead of "example-project"

#### Documentation

- JWT_SECRET validation string keys and translations (8 languages)

### Version 2.1.41

- Update MONGO_URI and docs
