import { ValidationReport, ValidationIssue } from '../interfaces/validation-issue.interface';
import { GeneratorContext } from '../interfaces';
import { Logger } from '../../cli/logger';
import { runCommand } from '../../utils/shell-utils';
import * as fs from 'fs';
import * as path from 'path';

export class PostGenerationValidator {
  static async validate(context: GeneratorContext): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    const monorepoPath = context.state.get('monorepoPath');

    Logger.section('Running post-generation validation');

    // Validate package.json exists
    issues.push(...this.validatePackageJson(monorepoPath));

    // Validate dependencies
    issues.push(...this.validateDependencies(monorepoPath));

    // Check for common issues
    issues.push(...this.validateBestPractices(monorepoPath));

    const summary = {
      errors: issues.filter(i => i.type === 'error').length,
      warnings: issues.filter(i => i.type === 'warning').length,
      info: issues.filter(i => i.type === 'info').length,
    };

    return {
      passed: summary.errors === 0,
      issues,
      summary,
    };
  }

  private static validatePackageJson(monorepoPath: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const packageJsonPath = path.join(monorepoPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      issues.push({
        type: 'error',
        category: 'bestPractice',
        message: 'package.json not found',
        file: 'package.json',
      });
      return issues;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      if (!packageJson.name) {
        issues.push({
          type: 'warning',
          category: 'bestPractice',
          message: 'package.json missing name field',
          file: 'package.json',
        });
      }

      if (!packageJson.version) {
        issues.push({
          type: 'warning',
          category: 'bestPractice',
          message: 'package.json missing version field',
          file: 'package.json',
        });
      }

      if (!packageJson.scripts || Object.keys(packageJson.scripts).length === 0) {
        issues.push({
          type: 'warning',
          category: 'bestPractice',
          message: 'package.json has no scripts defined',
          file: 'package.json',
        });
      }
    } catch (error) {
      issues.push({
        type: 'error',
        category: 'bestPractice',
        message: `Invalid package.json: ${error}`,
        file: 'package.json',
      });
    }

    return issues;
  }

  private static validateDependencies(monorepoPath: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const packageJsonPath = path.join(monorepoPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) return issues;

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check for common conflicts
      if (deps['react'] && deps['@types/react']) {
        const reactVersion = deps['react'];
        const typesVersion = deps['@types/react'];
        
        if (reactVersion.includes('19') && !typesVersion.includes('19')) {
          issues.push({
            type: 'warning',
            category: 'dependency',
            message: 'React version mismatch with @types/react',
            file: 'package.json',
            fix: 'Update @types/react to match React version',
          });
        }
      }

      // Check for missing peer dependencies
      if (deps['react'] && !deps['react-dom']) {
        issues.push({
          type: 'error',
          category: 'dependency',
          message: 'react-dom is required when using react',
          file: 'package.json',
          fix: 'yarn add react-dom',
        });
      }
    } catch (error) {
      // Already handled in validatePackageJson
    }

    return issues;
  }

  private static validateBestPractices(monorepoPath: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check for .gitignore
    if (!fs.existsSync(path.join(monorepoPath, '.gitignore'))) {
      issues.push({
        type: 'warning',
        category: 'bestPractice',
        message: '.gitignore file not found',
        fix: 'Create .gitignore to exclude node_modules, dist, etc.',
      });
    }

    // Check for README
    if (!fs.existsSync(path.join(monorepoPath, 'README.md'))) {
      issues.push({
        type: 'info',
        category: 'bestPractice',
        message: 'README.md not found',
        fix: 'Add README.md to document your project',
      });
    }

    // Check for LICENSE
    if (!fs.existsSync(path.join(monorepoPath, 'LICENSE'))) {
      issues.push({
        type: 'info',
        category: 'bestPractice',
        message: 'LICENSE file not found',
        fix: 'Add LICENSE file to specify project license',
      });
    }

    return issues;
  }

  static printReport(report: ValidationReport): void {
    if (report.passed && report.issues.length === 0) {
      Logger.success('Validation passed with no issues');
      return;
    }

    Logger.header('Validation Report');
    Logger.info(`Errors: ${report.summary.errors}`);
    Logger.info(`Warnings: ${report.summary.warnings}`);
    Logger.info(`Info: ${report.summary.info}`);

    if (report.issues.length > 0) {
      Logger.section('Issues:');
      
      report.issues.forEach(issue => {
        const location = issue.file ? ` (${issue.file}${issue.line ? `:${issue.line}` : ''})` : '';
        const message = `[${issue.category}] ${issue.message}${location}`;
        
        switch (issue.type) {
          case 'error':
            Logger.error(message);
            break;
          case 'warning':
            Logger.warning(message);
            break;
          case 'info':
            Logger.info(message);
            break;
        }

        if (issue.fix) {
          Logger.dim(`  Fix: ${issue.fix}`);
        }
      });
    }

    if (report.passed) {
      Logger.success('Validation passed (with warnings)');
    } else {
      Logger.error('Validation failed');
    }
  }
}
