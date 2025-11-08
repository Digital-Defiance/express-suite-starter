import { execSync } from 'child_process';
import { Logger } from '../cli/logger';
import { getStarterTranslation, StarterStringKey } from '../i18n';

export interface SystemCheckResult {
  passed: boolean;
  missing: string[];
  warnings: string[];
}

export class SystemCheck {
  static check(): SystemCheckResult {
    const missing: string[] = [];
    const warnings: string[] = [];

    // Check for C++ compiler
    if (!this.hasCommand('g++') && !this.hasCommand('clang++')) {
      missing.push('C++ compiler (g++ or clang++)');
    }

    // Check for Python (needed by node-gyp)
    if (!this.hasCommand('python3') && !this.hasCommand('python')) {
      missing.push('Python 3');
    }

    // Check for make
    if (!this.hasCommand('make')) {
      missing.push('make');
    }

    // Check for git
    if (!this.hasCommand('git')) {
      warnings.push('git (required for version control)');
    }

    return {
      passed: missing.length === 0,
      missing,
      warnings,
    };
  }

  private static hasCommand(cmd: string): boolean {
    try {
      const isWindows = process.platform === 'win32';
      const checkCmd = isWindows ? `where ${cmd}` : `command -v ${cmd}`;
      execSync(checkCmd, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  static printReport(result: SystemCheckResult): void {
    if (result.passed && result.warnings.length === 0) {
      Logger.success(getStarterTranslation(StarterStringKey.SYSTEM_CHECK_PASSED));
      return;
    }

    if (result.missing.length > 0) {
      Logger.error(getStarterTranslation(StarterStringKey.SYSTEM_CHECK_MISSING_TOOLS));
      result.missing.forEach(tool => Logger.dim(`  - ${tool}`));
      Logger.section(getStarterTranslation(StarterStringKey.SYSTEM_CHECK_INSTALL_INSTRUCTIONS));
      const isWindows = process.platform === 'win32';
      if (isWindows) {
        Logger.dim('  ' + getStarterTranslation(StarterStringKey.SYSTEM_CHECK_WINDOWS));
      } else {
        Logger.dim('  ' + getStarterTranslation(StarterStringKey.SYSTEM_CHECK_UBUNTU_DEBIAN));
        Logger.dim('  ' + getStarterTranslation(StarterStringKey.SYSTEM_CHECK_FEDORA_RHEL));
        Logger.dim('  ' + getStarterTranslation(StarterStringKey.SYSTEM_CHECK_MACOS));
      }
    }

    if (result.warnings.length > 0) {
      Logger.warning(getStarterTranslation(StarterStringKey.SYSTEM_CHECK_OPTIONAL_TOOLS));
      result.warnings.forEach(tool => Logger.dim(`  - ${tool}`));
    }
  }
}
