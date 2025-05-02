# Project Structure - One Class/Interface Per File

## Philosophy

Following best practices, each interface and class is in its own file for:
- Better discoverability
- Clearer dependencies
- Easier maintenance
- Better tree-shaking
- Single Responsibility Principle

## Directory Structure

```
src/
├── core/
│   ├── interfaces/                    # All interfaces
│   │   ├── checkpoint.interface.ts
│   │   ├── command-options.interface.ts
│   │   ├── generator-config.interface.ts
│   │   ├── generator-context.interface.ts
│   │   ├── node-config.interface.ts
│   │   ├── nx-config.interface.ts
│   │   ├── package-config.interface.ts
│   │   ├── project-config.interface.ts
│   │   ├── step.interface.ts
│   │   ├── template-config.interface.ts
│   │   ├── validation-result.interface.ts
│   │   ├── workspace-config.interface.ts
│   │   └── index.ts                   # Barrel export
│   ├── validators/                    # Validator classes
│   │   └── config-validator.ts
│   ├── config-schema.ts               # Barrel re-export
│   └── step-executor.ts               # Step executor class
├── cli/
│   └── logger.ts                      # Logger class
├── templates/
│   ├── interfaces/
│   │   └── template-engine.interface.ts
│   ├── engines/
│   │   ├── mustache-engine.ts         # MustacheEngine class
│   │   └── handlebars-engine.ts       # HandlebarsEngine class
│   ├── template-engine-factory.ts     # Factory function
│   └── index.ts                       # Barrel export
├── utils/
│   └── shell-utils.ts                 # Utility functions
└── generate-monorepo.ts               # Main entry point
```

## Import Patterns

### Using Barrel Exports (Recommended)

```typescript
// Import multiple interfaces from barrel
import { 
  GeneratorConfig, 
  WorkspaceConfig, 
  ValidationResult 
} from './core/interfaces';

// Import from top-level barrel
import { ConfigValidator } from './core/config-schema';

// Import template engines
import { MustacheEngine, createEngine } from './templates';
```

### Direct Imports (When Needed)

```typescript
// Import specific interface
import { WorkspaceConfig } from './core/interfaces/workspace-config.interface';

// Import specific class
import { ConfigValidator } from './core/validators/config-validator';
```

## File Naming Conventions

### Interfaces
- **Pattern:** `{name}.interface.ts`
- **Examples:**
  - `workspace-config.interface.ts`
  - `generator-context.interface.ts`
  - `validation-result.interface.ts`

### Classes
- **Pattern:** `{name}.ts` (kebab-case)
- **Examples:**
  - `config-validator.ts`
  - `step-executor.ts`
  - `mustache-engine.ts`

### Barrel Exports
- **Pattern:** `index.ts`
- **Purpose:** Re-export all files in directory
- **Example:**
```typescript
export * from './workspace-config.interface';
export * from './project-config.interface';
// ...
```

## Benefits of This Structure

### 1. Clear Dependencies
```typescript
// Easy to see what's imported
import { WorkspaceConfig } from './interfaces/workspace-config.interface';
import { ConfigValidator } from './validators/config-validator';
```

### 2. Better IDE Support
- Jump to definition goes to actual file
- Refactoring tools work better
- Easier to find usages

### 3. Easier Testing
```typescript
// Test one class at a time
import { ConfigValidator } from '../../src/core/validators/config-validator';

describe('ConfigValidator', () => {
  // Tests...
});
```

### 4. Better Tree-Shaking
- Bundlers can eliminate unused code more effectively
- Each file is a separate module

### 5. Clearer Code Reviews
- Changes to one interface don't affect others
- Smaller, focused diffs
- Easier to review

## When to Group Files

### Tightly Coupled Types
```typescript
// request.interface.ts
export interface Request {
  // ...
}

export interface RequestOptions {
  // Only used with Request
}
```

### Small Utility Types
```typescript
// types.ts
export type ID = string;
export type Timestamp = number;
export type Status = 'pending' | 'complete' | 'failed';
```

### Enums with Related Types
```typescript
// status.ts
export enum Status {
  Pending = 'pending',
  Complete = 'complete',
  Failed = 'failed'
}

export interface StatusChange {
  from: Status;
  to: Status;
  timestamp: Date;
}
```

## Comparison: Before vs After

### Before (Monolithic)
```typescript
// config-schema.ts (200+ lines)
export interface WorkspaceConfig { /* ... */ }
export interface ProjectConfig { /* ... */ }
export interface PackageConfig { /* ... */ }
export interface TemplateConfig { /* ... */ }
export interface GeneratorConfig { /* ... */ }
export class ConfigValidator { /* ... */ }
```

### After (Modular)
```
core/
├── interfaces/
│   ├── workspace-config.interface.ts    (5 lines)
│   ├── project-config.interface.ts      (6 lines)
│   ├── package-config.interface.ts      (5 lines)
│   ├── template-config.interface.ts     (4 lines)
│   ├── generator-config.interface.ts    (14 lines)
│   └── index.ts                         (7 lines)
└── validators/
    └── config-validator.ts              (45 lines)
```

## Tools Recommendation

### Chalk + Inquirer (Current Setup)

**Chalk v4** (CommonJS compatible):
```json
"chalk": "^4.1.2"
```

**Usage:**
```typescript
import chalk from 'chalk';
import input from '@inquirer/input';

// Styled prompts
const name = await input({
  message: chalk.cyan('Enter name:'),
  default: 'my-project'
});

// Styled output
console.log(chalk.green('✓'), 'Success!');
console.log(chalk.red('✗'), 'Error!');
console.log(chalk.yellow('⚠'), 'Warning!');
console.log(chalk.blue('ℹ'), 'Info');
```

**Why Both?**
- **Inquirer:** Interactive prompts (questions)
- **Chalk:** Terminal styling (colors, formatting)
- **Together:** Beautiful CLI experience

## Migration Checklist

- [x] Extract all interfaces to separate files
- [x] Extract all classes to separate files
- [x] Create barrel exports (index.ts)
- [x] Update imports in existing files
- [x] Update test imports
- [x] Add file naming conventions
- [x] Document structure

## Next Steps

1. **Add More Tests**
   - Test each interface validation
   - Test each class method
   - Integration tests

2. **Add More Classes**
   - Plugin manager
   - Template renderer
   - File system utilities

3. **Improve Documentation**
   - JSDoc comments on interfaces
   - Usage examples
   - Architecture diagrams

## License

MIT © Digital Defiance
