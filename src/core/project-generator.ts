import { runCommand } from '../utils/shell-utils';
import { ProjectConfig } from './interfaces';

export class ProjectGenerator {
  static generateReact(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/react:application ${config.name} --style=${nx.style} --routing=true --bundler=${nx.bundler} --linter=eslint --unitTestRunner=jest --e2eTestRunner=${nx.e2eTestRunner} --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun }
    );
  }

  static generateReactLib(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/react:library ${config.name} --style=${nx.style} --bundler=${nx.bundler} --linter=eslint --unitTestRunner=jest --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun }
    );
  }

  static generateApi(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/node:application ${config.name} --framework=express --linter=eslint --unitTestRunner=jest --e2eTestRunner=jest --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun }
    );
  }

  static generateApiLib(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/js:lib ${config.name} --bundler=none --linter=eslint --unitTestRunner=jest --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun }
    );
  }

  static generateLib(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/js:lib ${config.name} --bundler=none --linter=eslint --unitTestRunner=jest --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun }
    );
  }

  static generateInitUserDb(config: ProjectConfig, monorepoPath: string, dryRun = false): void {
    runCommand(
      `npx nx g @nx/node:application ${config.name} --framework=none --linter=eslint --unitTestRunner=jest --no-interactive`,
      { cwd: monorepoPath, dryRun }
    );
  }

  static generateTestUtils(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/js:lib ${config.name} --bundler=none --linter=eslint --unitTestRunner=jest --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun }
    );
  }
}
