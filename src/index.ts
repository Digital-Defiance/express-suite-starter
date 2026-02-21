/**
 * @module @digitaldefiance/express-suite-starter
 *
 * Public API for the Express Suite Starter.
 * Exports the programmatic generator for headless/E2E usage,
 * along with core interfaces and configuration types.
 */

// Programmatic generator (headless mode)
export {
  generateMonorepo,
  ProgrammaticOptions,
} from './core/programmatic-generator';

// Core interfaces and types
export { GeneratorConfig } from './core/interfaces/generator-config.interface';
export { GeneratorContext } from './core/interfaces/generator-context.interface';
export { WorkspaceConfig } from './core/interfaces/workspace-config.interface';
export { ProjectConfig } from './core/interfaces/project-config.interface';
export { PackageConfig } from './core/interfaces/package-config.interface';
export { TemplateConfig } from './core/interfaces/template-config.interface';
export { NxConfig } from './core/interfaces/nx-config.interface';
export { NodeConfig } from './core/interfaces/node-config.interface';
export { DevContainerConfig } from './core/interfaces/devcontainer-config.interface';
export { Step } from './core/interfaces/step.interface';
export { ValidationResult } from './core/interfaces/validation-result.interface';

// Validators
export { ConfigValidator } from './core/validators/config-validator';

// Builders
export { ProjectConfigBuilder } from './core/project-config-builder';

// Step execution
export { StepExecutor } from './core/step-executor';
export { DryRunExecutor } from './core/dry-run-executor';
