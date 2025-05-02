import validator from 'validator';
import { GeneratorConfig } from '../interfaces/generator-config.interface';
import { ValidationResult } from '../interfaces/validation-result.interface';

export class ConfigValidator {
  static validateWorkspaceName(name: string): boolean {
    return /^[a-zA-Z0-9-]+$/.test(name);
  }

  static validatePrefix(prefix: string): boolean {
    return /^[a-z0-9-]+$/.test(prefix);
  }

  static validateNamespace(namespace: string): boolean {
    return /^@[a-z0-9-]+$/.test(namespace);
  }

  static validateGitRepo(repo: string): boolean {
    if (!repo) return true;
    return validator.isURL(repo, { protocols: ['http', 'https', 'git', 'ssh'] }) || 
           /^git@/.test(repo);
  }

  static validate(config: Partial<GeneratorConfig>): ValidationResult {
    const errors: string[] = [];

    if (config.workspace) {
      if (!this.validateWorkspaceName(config.workspace.name)) {
        errors.push('Invalid workspace name (letters, numbers, dashes only)');
      }
      if (!this.validatePrefix(config.workspace.prefix)) {
        errors.push('Invalid prefix (lowercase letters, numbers, dashes only)');
      }
      if (!this.validateNamespace(config.workspace.namespace)) {
        errors.push('Invalid namespace (must start with @, lowercase letters, numbers, dashes only)');
      }
      if (config.workspace.gitRepo && !this.validateGitRepo(config.workspace.gitRepo)) {
        errors.push('Invalid git repository URL');
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
