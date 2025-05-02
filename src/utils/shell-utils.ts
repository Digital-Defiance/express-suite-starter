import { execSync } from 'child_process';
import { Logger } from '../cli/logger';
import { CommandOptions } from '../core/interfaces/command-options.interface';

export function runCommand(command: string, options: CommandOptions = {}): void {
  if (!options.silent) {
    Logger.command(command);
  }

  try {
    execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit', 
      cwd: options.cwd
    });
  } catch (err: any) {
    Logger.error(`Command failed: ${command}`);
    throw err;
  }
}

export function setPerms(filePath: string): void {
  // Skip chmod on Windows
  if (process.platform === 'win32') {
    return;
  }
  
  const fs = require('fs');
  if (filePath.endsWith('.sh')) {
    fs.chmodSync(filePath, 0o755);
  }
}
