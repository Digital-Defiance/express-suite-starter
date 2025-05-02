import * as fs from 'fs';
import * as path from 'path';

/**
 * Adds or updates a script in the "scripts" section of a package.json file.
 * @param packageJsonPath Path to the package.json file.
 * @param scripts Object containing script names and their corresponding commands.
 */
export function addScriptsToPackageJson(
  packageJsonPath: string,
  scripts: Record<string, string>,
): void {
  const resolvedPath = path.resolve(packageJsonPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`package.json not found at path: ${resolvedPath}`);
  }

  const packageJsonRaw = fs.readFileSync(resolvedPath, 'utf-8');
  let packageJson: any;
  try {
    packageJson = JSON.parse(packageJsonRaw);
  } catch (err) {
    throw new Error(`Failed to parse package.json: ${err}`);
  }

  if (!packageJson.scripts || typeof packageJson.scripts !== 'object') {
    packageJson.scripts = {};
  }

  for (const [scriptName, command] of Object.entries(scripts)) {
    if (typeof scriptName !== 'string' || typeof command !== 'string') {
      throw new Error(`Invalid script name or command: ${scriptName}, ${command}`);
    }
    packageJson.scripts[scriptName] = command;
  }

  // Write back with 2-space indentation
  fs.writeFileSync(resolvedPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
}
