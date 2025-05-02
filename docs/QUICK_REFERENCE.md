# Quick Reference - Express Suite Starter v2.0

## Installation

```bash
cd express-suite/packages/digitaldefiance-express-suite-starter
yarn install
```

## Usage

```bash
yarn start
```

## Project Types

| Type | Purpose | Optional |
|------|---------|----------|
| lib | Universal shared code | No |
| react | React frontend app | No |
| api | Express backend | No |
| react-lib | React components | Yes |
| api-lib | API business logic | Yes |
| e2e | End-to-end tests | Yes |
| inituserdb | DB initialization | Yes |
| test-utils | Test utilities | Yes |

## When to Use react-lib

✅ **Use when:**
- Multiple React apps
- Shared component library
- Design system
- Publishing components

❌ **Skip when:**
- Single React app
- Simple project
- Rapid prototyping

## When to Use api-lib

✅ **Use when:**
- Complex business logic
- Multiple API apps
- Shared services
- Clean architecture

❌ **Skip when:**
- Simple CRUD API
- Single API app
- Rapid prototyping

## File Structure

```
src/
├── core/
│   ├── interfaces/           # All interfaces
│   ├── validators/           # Validation classes
│   ├── project-generator.ts  # Project generation
│   └── step-executor.ts      # Step execution
├── cli/
│   └── logger.ts            # Chalk logger
├── templates/
│   ├── engines/             # Template engines
│   └── template-engine-factory.ts
└── utils/
    ├── shell-utils.ts       # Command execution
    └── template-renderer.ts # Template rendering
```

## Logger API

```typescript
Logger.success('Done')       // ✓ Green
Logger.error('Failed')       // ✗ Red
Logger.warning('Warning')    // ⚠ Yellow
Logger.info('Info')          // ℹ Blue
Logger.step(1, 5, 'Step')   // [1/5] Cyan
Logger.command('yarn')       // $ Gray
Logger.header('Title')       // Bold cyan
Logger.path('/path')         // Cyan
Logger.code('code')          // Yellow
```

## Testing

```bash
yarn test              # Run all
yarn test:watch        # Watch mode
yarn test:coverage     # Coverage report
```

## Presets

**Standard** (`config/presets/standard.json`):
- All Express Suite packages
- Full testing setup
- Material-UI
- MongoDB

**Minimal** (`config/presets/minimal.json`):
- Basic packages only
- No E2E tests
- Minimal dependencies

## Commands

```bash
# Generate
yarn start

# Build
yarn build

# Test
yarn test

# Resume from step
yarn start --start-at=generateProjects
```

## Valid Steps

- checkTargetDir
- createMonorepo
- setupGitOrigin
- yarnBerrySetup
- addNxPlugins
- addYarnPackages
- generateProjects
- renderTemplates
- copyScaffolding
- generateLicense
- addScripts
- initialCommit

## Generated Monorepo Structure

```
my-app/
├── my-app-lib/              # Universal code
├── my-app-react/            # React app
├── my-app-react-lib/        # React components (optional)
├── my-app-api/              # Express API
├── my-app-api-lib/          # API logic (optional)
├── my-app-api-e2e/          # API tests (optional)
├── my-app-react-e2e/        # React tests (optional)
├── my-app-inituserdb/       # DB init (optional)
└── my-app-test-utils/       # Test utils (optional)
```

## Import Patterns

```typescript
// From barrel exports
import { GeneratorConfig } from './core/config-schema';
import { Logger } from './cli/logger';
import { createEngine } from './templates';

// Direct imports
import { WorkspaceConfig } from './core/interfaces/workspace-config.interface';
```

## Troubleshooting

**Dependencies not installed:**
```bash
yarn install
```

**Build errors:**
```bash
yarn build
```

**Test failures:**
```bash
yarn test:coverage
```

**Generation failed:**
```bash
# Resume from last checkpoint
yarn start --start-at=<step-name>
```

## Documentation

- README.md - User guide
- ARCHITECTURE.md - Architecture details
- STRUCTURE.md - File organization
- CONTEXT.md - Development context
- IMPLEMENTATION_COMPLETE.md - What's done

## License

MIT © Digital Defiance
