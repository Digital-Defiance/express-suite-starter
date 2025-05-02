import { execSync } from 'child_process';
import { Logger } from '../cli/logger';

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
      Logger.success('System check passed');
      return;
    }

    if (result.missing.length > 0) {
      Logger.error('Missing required build tools:');
      result.missing.forEach(tool => Logger.dim(`  - ${tool}`));
      Logger.section('Installation instructions:');
      const isWindows = process.platform === 'win32';
      if (isWindows) {
        Logger.dim('  Windows:       Install Visual Studio Build Tools');
        Logger.dim('                 https://visualstudio.microsoft.com/downloads/');
        Logger.dim('                 Or install via: npm install --global windows-build-tools');
      } else {
        Logger.dim('  Ubuntu/Debian: sudo apt-get install build-essential python3');
        Logger.dim('  Fedora/RHEL:   sudo dnf install gcc-c++ make python3');
        Logger.dim('  macOS:         xcode-select --install');
      }
    }

    if (result.warnings.length > 0) {
      Logger.warning('Optional tools not found:');
      result.warnings.forEach(tool => Logger.dim(`  - ${tool}`));
    }
  }
}
