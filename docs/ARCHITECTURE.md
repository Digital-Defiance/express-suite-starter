# Express Suite Starter - Architecture v2.0

## Overview

The Express Suite Starter has been refactored to provide a more maintainable, testable, and extensible architecture for generating MERN stack monorepos.

## Design Principles

1. **Separation of Concerns** - Clear boundaries between CLI, core logic, and utilities
2. **Type Safety** - Full TypeScript with strict validation
3. **Testability** - Unit and integration tests for all components
4. **Extensibility** - Plugin system for custom generators
5. **Resilience** - Checkpoint/rollback for error recovery
6. **User Experience** - Enhanced CLI with chalk-powered output

## Architecture Layers

### 1. CLI Layer (`src/cli/`)

**Purpose:** User interaction and presentation

**Components:**
- `logger.ts` - Chalk-based logging with semantic methods
- `prompts.ts` - Interactive configuration prompts (future)

**Key Features:**
- Color-coded output (success, error, warning, info)
- Progress tracking with step numbers
- Command echo for transparency
- Path and code highlighting

### 2. Core Layer (`src/core/`)

**Purpose:** Business logic and orchestration

**Components:**
- `config-schema.ts` - Configuration types and validation
- `step-executor.ts` - Step execution with checkpoint/rollback
- `plugin-manager.ts` - Plugin system (future)

**Key Features:**
- Schema validation before generation
- Step-by-step execution with skip logic
- Automatic checkpoint saving
- Rollback support for cleanup
- Resume from last successful step

### 3. Template Layer (`src/templates/`)

**Purpose:** Template rendering abstraction

**Components:**
- `engine.ts` - Template engine interface and implementations

**Supported Engines:**
- **Mustache** (default) - Logic-less, simple, portable
- **Handlebars** (optional) - Advanced features, conditionals, loops

**Key Features:**
- Engine abstraction for flexibility
- Easy switching between engines
- Consistent API regardless of engine

### 4. Utility Layer (`src/utils/`)

**Purpose:** Shared utilities and helpers

**Components:**
- `shell-utils.ts` - Command execution with logging
- `fs-utils.ts` - File system operations (future migration)

**Key Features:**
- Integrated logging for all commands
- Error handling and propagation
- Silent mode for internal operations

## Configuration System

### Schema Definition

```typescript
interface GeneratorConfig {
  workspace: WorkspaceConfig;      // Name, prefix, namespace
  projects: ProjectConfig[];       // Apps to generate
  packages: PackageConfig;         // Dependencies
  templates: TemplateConfig;       // Engine selection
  nx: NxConfig;                    // Nx settings
  node: NodeConfig;                // Node/Yarn versions
}
```

### Validation

All configuration is validated before generation:
- Workspace names: `[a-zA-Z0-9-]+`
- Prefixes: `[a-z0-9-]+`
- Namespaces: `@[a-z0-9-]+`
- Git URLs: Valid URL or SSH format

### Presets

Located in `config/presets/`:
- `standard.json` - Default configuration
- `minimal.json` - Minimal setup (future)
- `full.json` - All features enabled (future)

## Step Execution Flow

### 1. Configuration Phase
```
User Input → Validation → Config Object → Context Creation
```

### 2. Execution Phase
```
For each step:
  1. Check skip condition
  2. Log step start
  3. Execute step function
  4. Save checkpoint
  5. Log step completion
```

### 3. Error Handling
```
On error:
  1. Log error
  2. Optionally rollback
  3. Save state for resume
  4. Exit with error code
```

### 4. Resume Flow
```
On resume:
  1. Load checkpoint
  2. Restore state
  3. Find start step
  4. Continue execution
```

## Step Definition

```typescript
interface Step {
  name: string;                    // Unique identifier
  description: string;             // User-friendly description
  execute: (context) => void;      // Main logic
  rollback?: (context) => void;    // Cleanup logic
  skip?: (context) => boolean;     // Skip condition
}
```

## Context Object

The context object flows through all steps:

```typescript
interface GeneratorContext {
  config: GeneratorConfig;         // User configuration
  state: Map<string, any>;         // Runtime state
  checkpointPath: string;          // Checkpoint file location
}
```

**State Variables:**
- `monorepoPath` - Target directory
- `reactAppName` - React app name
- `apiAppName` - API app name
- `libName` - Library name

## Template System

### Engine Interface

```typescript
interface TemplateEngine {
  render(template: string, variables: Record<string, any>): string;
}
```

### Mustache Example

```mustache
MONGO_URI=mongodb://{{PROJECT_PREFIX}}:{{EXAMPLE_PASSWORD}}@localhost:27017
```

### Handlebars Example

```handlebars
{{#if USE_DOCKER}}
MONGO_URI=mongodb://mongo:27017/{{PROJECT_PREFIX}}
{{else}}
MONGO_URI=mongodb://localhost:27017/{{PROJECT_PREFIX}}
{{/if}}
```

## Logging System

### Semantic Methods

```typescript
Logger.success('Operation completed')    // ✓ Green
Logger.error('Operation failed')         // ✗ Red
Logger.warning('Potential issue')        // ⚠ Yellow
Logger.info('Information')               // ℹ Blue
Logger.step(1, 5, 'Step description')   // [1/5] Cyan
Logger.command('yarn install')           // $ Gray
```

### Output Formatting

```typescript
Logger.header('Section Title')           // Bold cyan with underline
Logger.section('Subsection')             // Bold
Logger.dim('Less important')             // Dimmed
Logger.highlight('Important')            // Bold yellow
Logger.path('/path/to/file')            // Cyan
Logger.code('code snippet')             // Yellow
```

## Testing Strategy

### Unit Tests (`tests/unit/`)

- Configuration validation
- Template rendering
- Logger output
- Utility functions

### Integration Tests (`tests/integration/`)

- Full generation flow
- Step execution
- Checkpoint/rollback
- Error scenarios

### Test Coverage Goals

- Core logic: 90%+
- Utilities: 80%+
- CLI: 70%+

## Future Enhancements

### Phase 2 (Short-term)

1. **Plugin System**
   - Custom step injection
   - Third-party template packs
   - Hook system (before/after steps)

2. **Advanced Templates**
   - Conditional file generation
   - Dynamic project structures
   - Template inheritance

3. **Validation**
   - Post-generation linting
   - Dependency conflict detection
   - Best practices checking

### Phase 3 (Long-term)

1. **Package Management**
   - Version resolution (latest, stable)
   - Optional package groups
   - Registry configuration

2. **Documentation Generation**
   - Project-specific docs
   - API documentation
   - Architecture diagrams

3. **Interactive Mode**
   - Real-time preview
   - Dry-run mode
   - Diff view for changes

## Migration Guide

### From v1.0 to v2.0

**Breaking Changes:**
- New directory structure (`src/` instead of `scripts/`)
- Configuration schema changes
- Different import paths

**Migration Steps:**

1. Update imports:
```typescript
// Old
import { runCommand } from './shellUtils';

// New
import { runCommand } from './utils/shell-utils';
```

2. Update configuration:
```typescript
// Old
const config = { /* flat structure */ };

// New
const config: GeneratorConfig = {
  workspace: { /* ... */ },
  packages: { /* ... */ },
  // ...
};
```

3. Use new logger:
```typescript
// Old
console.log('Success');

// New
Logger.success('Success');
```

## Performance Considerations

- **Checkpoint Size:** Minimal state stored (< 1KB)
- **Template Caching:** Templates loaded once per generation
- **Command Execution:** Streamed output for large operations
- **Memory Usage:** Constant regardless of project size

## Security Considerations

- **Input Validation:** All user input validated before use
- **Command Injection:** Commands properly escaped
- **File Permissions:** Shell scripts set to 755
- **Secrets:** No secrets stored in checkpoints

## Maintenance

### Adding New Steps

1. Define step in `src/generate-monorepo.ts`
2. Add to executor with `addStep()`
3. Implement execute and optional rollback
4. Add tests in `tests/integration/`

### Adding New Presets

1. Create JSON file in `config/presets/`
2. Follow schema in `src/core/config-schema.ts`
3. Document in README
4. Add validation tests

### Updating Dependencies

1. Update `config/presets/standard.json`
2. Test generation with new versions
3. Update documentation
4. Bump starter version

## License

MIT © Digital Defiance
