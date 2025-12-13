import { runCommand } from '../utils/shell-utils';
import { ProjectConfig } from './interfaces';

export class ProjectGenerator {
  private static readonly nxEnv = { NX_DAEMON: 'false' };

  static generateReact(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/react:application ${config.name} --style=${nx.style} --routing=true --bundler=${nx.bundler} --linter=eslint --unitTestRunner=jest --e2eTestRunner=${nx.e2eTestRunner} --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun, env: this.nxEnv }
    );
  }

  static generateReactLib(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/react:library ${config.name} --style=${nx.style} --bundler=${nx.bundler} --linter=eslint --unitTestRunner=jest --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun, env: this.nxEnv }
    );
  }

  static generateApi(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/node:application ${config.name} --framework=express --linter=eslint --unitTestRunner=jest --e2eTestRunner=jest --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun, env: this.nxEnv }
    );
  }

  static generateApiLib(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/js:lib ${config.name} --bundler=none --linter=eslint --unitTestRunner=jest --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun, env: this.nxEnv }
    );
  }

  static generateLib(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/js:lib ${config.name} --bundler=none --linter=eslint --unitTestRunner=jest --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun, env: this.nxEnv }
    );
  }

  static generateInitUserDb(config: ProjectConfig, monorepoPath: string, dryRun = false): void {
    runCommand(
      `npx nx g @nx/node:application ${config.name} --framework=none --linter=eslint --unitTestRunner=jest --no-interactive`,
      { cwd: monorepoPath, dryRun, env: this.nxEnv }
    );
  }

  static generateTestUtils(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/js:lib ${config.name} --bundler=none --linter=eslint --unitTestRunner=jest --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun, env: this.nxEnv }
    );
  }
}
