import { PackageResolution } from './interfaces/package-resolution.interface';
import { Logger } from '../cli/logger';
import { runCommand } from '../utils/shell-utils';

export class PackageResolver {
  static async resolveVersion(packageName: string, versionSpec: string): Promise<string> {
    if (versionSpec === 'latest') {
      return this.getLatestVersion(packageName);
    }
    if (versionSpec === 'stable') {
      return this.getStableVersion(packageName);
    }
    return versionSpec;
  }

  static async resolvePackages(packages: string[]): Promise<PackageResolution[]> {
    const resolutions: PackageResolution[] = [];

    for (const pkg of packages) {
      const [name, versionSpec] = this.parsePackageString(pkg);
      const resolved = await this.resolveVersion(name, versionSpec || 'latest');
      
      resolutions.push({
        name,
        version: versionSpec || 'latest',
        resolved,
      });
    }

    return resolutions;
  }

  private static parsePackageString(pkg: string): [string, string | undefined] {
    const match = pkg.match(/^(.+?)@(.+)$/);
    if (match) {
      return [match[1], match[2]];
    }
    return [pkg, undefined];
  }

  private static async getLatestVersion(packageName: string): Promise<string> {
    try {
      const { execSync } = require('child_process');
      const result = execSync(`npm view ${packageName} version`, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return `^${result.trim()}`;
    } catch (error) {
      Logger.warning(`Failed to resolve latest version for ${packageName}, using 'latest'`);
      return 'latest';
    }
  }

  private static async getStableVersion(packageName: string): Promise<string> {
    try {
      const { execSync } = require('child_process');
      const result = execSync(`npm view ${packageName} dist-tags.latest`, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return `^${result.trim()}`;
    } catch (error) {
      Logger.warning(`Failed to resolve stable version for ${packageName}, using 'latest'`);
      return 'latest';
    }
  }

  static formatPackageList(resolutions: PackageResolution[]): string[] {
    return resolutions.map(r => `${r.name}@${r.resolved}`);
  }
}
