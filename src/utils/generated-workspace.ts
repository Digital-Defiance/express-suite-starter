import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../cli/logger';
import { runCommand } from './shell-utils';

/** The dependency sections of a package.json that this module inspects. */
export interface IDependencySections {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** Read the dependency sections of a workspace's root package.json, or undefined if it does not exist. */
function readRootPackageJson(
  monorepoPath: string,
): IDependencySections | undefined {
  const packageJsonPath = path.join(monorepoPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return undefined;
  }
  return JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf-8'),
  ) as IDependencySections;
}

/** True when the package is listed in dependencies or devDependencies. */
export function hasDependency(
  packageJson: IDependencySections | undefined,
  name: string,
): boolean {
  return Boolean(
    packageJson?.dependencies?.[name] ?? packageJson?.devDependencies?.[name],
  );
}

/**
 * Remove react-router-dom from the workspace root package.json.
 *
 * Nx's react generator adds react-router-dom, while the presets use
 * react-router v8 (which includes the DOM bindings). Leaving both installed
 * gives two router copies. `yarn remove` also updates the lockfile.
 */
export function removeReactRouterDom(
  monorepoPath: string,
  dryRun: boolean,
): void {
  if (!hasDependency(readRootPackageJson(monorepoPath), 'react-router-dom')) {
    return;
  }
  runCommand('yarn remove react-router-dom', { cwd: monorepoPath, dryRun });
}

/**
 * Format generated TypeScript with Prettier.
 *
 * Scaffolding is not stored in Prettier style, and `yarn prettier:check` and
 * the Prettier ESLint rule fail on it, so it is formatted once up front.
 * Presets without prettier (for example minimal) skip the step. When prettier
 * is present, any failure of the command is a real error and is thrown.
 */
export function formatGeneratedCode(
  monorepoPath: string,
  dryRun: boolean,
): void {
  if (dryRun) {
    runCommand("yarn prettier --write '**/*.{ts,tsx}'", {
      cwd: monorepoPath,
      dryRun,
    });
    return;
  }
  if (!hasDependency(readRootPackageJson(monorepoPath), 'prettier')) {
    Logger.info(
      'Skipping Prettier formatting: prettier is not part of this workspace',
    );
    return;
  }
  runCommand("yarn prettier --write '**/*.{ts,tsx}'", {
    cwd: monorepoPath,
    dryRun,
  });
}
