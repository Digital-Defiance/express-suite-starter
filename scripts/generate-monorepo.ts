import input from "@inquirer/input";
import select from "@inquirer/select";
import { obfuscatePassword } from "./passwordObfuscator";
import { addScriptsToPackageJson } from "./addScriptsToPackageJson";
import { printBanner } from "./albatross";
import { runCommand } from "./shellUtils";
import { renderTemplates, copyScaffoldingFiles } from "./fsUtils";
import { checkAndUseNode } from "./nodeSetup";
import { promptAndGenerateLicense } from "./licensePrompt";
import { interpolateTemplateStrings } from "./templateUtils";
import {
  LINTER,
  UNIT_TEST_RUNNER,
  E2E_TEST_RUNNER,
  STYLE,
  BUNDLER,
  CI_PROVIDER,
  NODE_API_E2E_TEST_RUNNER,
  NODE_API_FRAMEWORK,
  LIB_BUNDLER,
  devPackages,
  packages,
  addScripts,
  NVM_USE_VERSION,
  YARN_VERSION
} from "./monorepoConfig";
const fs = require("fs");
const path = require("path");

/**
 * Parse --start-at argument from process.argv, or return null if not present.
 */
function getStartAtStep(): string | null {
  const arg = process.argv.find((arg) => arg.startsWith("--start-at="));
  return arg ? arg.split("=")[1] : null;
}

async function main() {
  printBanner();

  // Ensure Node.js is active via nvm if available
  checkAndUseNode();

  // 1. Prompt for workspace name, destination directory, and git repo URL
  const workspaceName = await input({
    message: "Enter the workspace name (e.g. example-project):",
    default: "example-project",
    validate: (val: string) =>
      /^[a-zA-Z0-9-]+$/.test(val)
        ? true
        : "Invalid workspace name (letters, numbers, dashes only)",
  });

  const projectPrefix = await input({
    message: "Enter the project prefix for sub-projects (e.g. example-project):",
    default: "example-project",
    validate: (val: string) =>
      /^[a-z0-9-]+$/.test(val)
        ? true
        : "Invalid prefix (lowercase letters, numbers, dashes only)",
  });

  const namespaceRoot = await input({
    message: "Enter the npm namespace root (e.g. @example-project):",
    default: "@example-project",
    validate: (val: string) =>
      /^@[a-z0-9-]+$/.test(val)
        ? true
        : "Invalid namespace (must start with @, lowercase letters, numbers, dashes only)",
  });

  const defaultParentDir = process.cwd();
  const parentDirInput = await input({
    message: `Enter the parent directory where the workspace will be created (default: ${defaultParentDir}):`,
    default: defaultParentDir,
    validate: (val: string) => (val && val.length > 0 ? true : "Parent directory required"),
  });
  const parentDir = path.resolve(parentDirInput);
  const monorepoPath = path.join(parentDir, workspaceName);

  const templatesDir = path.resolve(process.cwd(), "templates");
  const reactAppName = `${projectPrefix}-react`;
  const apiAppName = `${projectPrefix}-api`;
  const libName = `${projectPrefix}-lib`;
  const reactImportPath = `${namespaceRoot}/react`;
  const apiImportPath = `${namespaceRoot}/api`;
  const libImportPath = `${namespaceRoot}/lib`;

  const gitRepo = await input({
    message: "Enter the git repository URL (optional):",
  });

  // Step control
  const startAt = getStartAtStep();
  const steps = [
    "checkTargetDir",
    "createMonorepo",
    "setupGitOrigin",
    "yarnBerrySetup",
    "addNxPlugins",
    "addYarnPackages",
    "createReactApp",
    "createApiApp",
    "createLib",
    "renderTemplates",
    "copyScaffoldingFiles",
    "createLicense",
    "addScripts",
    "initialCommit",
  ];
  const stepFns: Record<string, () => Promise<void> | void> = {
    checkTargetDir: () => {
      if (fs.existsSync(monorepoPath) && fs.readdirSync(monorepoPath).length > 0) {
        console.error(
          `Error: Target directory "${monorepoPath}" already exists and is not empty. Please remove it or choose a different workspace name or parent directory.`
        );
        process.exit(1);
      }
    },
    createMonorepo: () => {
      runCommand(
        `npx create-nx-workspace@latest "${workspaceName}" --package-manager=yarn --preset=apps --ci=${CI_PROVIDER}`,
        { cwd: parentDir }
      );
    },
    setupGitOrigin: () => {
      if (gitRepo) {
        runCommand(`git remote add origin ${gitRepo}`, { cwd: monorepoPath });
      }
    },
    yarnBerrySetup: () => {
      runCommand(`yarn set version berry`, { cwd: monorepoPath });
      runCommand(`yarn config set nodeLinker node-modules`, { cwd: monorepoPath });
      runCommand(`yarn`, { cwd: monorepoPath });
    },
    addNxPlugins: () => {
      runCommand(`yarn add -D @nx/react @nx/node`, { cwd: monorepoPath });
    },
    addYarnPackages: () => {
      devPackages.length > 0 &&
        runCommand(`yarn add -D ${devPackages.join(" ")}`, { cwd: monorepoPath });
      packages.length > 0 &&
        runCommand(`yarn add ${packages.join(" ")}`, { cwd: monorepoPath });
    },
    createReactApp: () => {
      runCommand(
        `npx nx g @nx/react:application ${reactAppName} --style=${STYLE} --routing=true --bundler=${BUNDLER} --linter=${LINTER} --unitTestRunner=${UNIT_TEST_RUNNER} --e2eTestRunner=${E2E_TEST_RUNNER} --importPath=${reactImportPath}`,
        { cwd: monorepoPath }
      );
    },
    createApiApp: () => {
      runCommand(
        `npx nx g @nx/node:application ${apiAppName} --framework=${NODE_API_FRAMEWORK} --linter=${LINTER} --unitTestRunner=${UNIT_TEST_RUNNER} --e2eTestRunner=${NODE_API_E2E_TEST_RUNNER} --importPath=${apiImportPath}`,
        { cwd: monorepoPath }
      );
    },
    createLib: () => {
      runCommand(
        `npx nx g @nx/js:lib ${libName} --bundler=${LIB_BUNDLER} --linter=${LINTER} --unitTestRunner=${UNIT_TEST_RUNNER} --importPath=${libImportPath}`,
        { cwd: monorepoPath }
      );
    },
    renderTemplates: () => {
      renderTemplates(templatesDir, monorepoPath, {
        WORKSPACE_NAME: workspaceName,
        PROJECT_PREFIX: projectPrefix,
        EXAMPLE_PASSWORD: obfuscatePassword(projectPrefix),
        EXAMPLE_JWT_SECRET: obfuscatePassword(`${workspaceName}Secret`),
        NAMESPACE_ROOT: namespaceRoot,
        REACT_APP_NAME: reactAppName,
        API_APP_NAME: apiAppName,
        LIB_NAME: libName,
        REACT_IMPORT_PATH: reactImportPath,
        API_IMPORT_PATH: apiImportPath,
        LIB_IMPORT_PATH: libImportPath,
        GIT_REPO: gitRepo,
        NVM_USE_VERSION: NVM_USE_VERSION,
        YARN_VERSION: YARN_VERSION,
      });
    },
    copyScaffoldingFiles: () => {
      const scaffoldingDir = path.resolve(process.cwd(), "scaffolding");
      copyScaffoldingFiles(scaffoldingDir, monorepoPath, reactAppName, libName);
    },
    createLicense: async () => {
      await promptAndGenerateLicense(monorepoPath);
    },
    addScripts: () => {
      const packageJsonPath = path.join(monorepoPath, "package.json");
      // Build a context object with all relevant variables
      const context = {
        workspaceName,
        projectPrefix,
        namespaceRoot,
        reactAppName,
        apiAppName,
        libName,
        reactImportPath,
        apiImportPath,
        libImportPath,
        gitRepo,
      };
      // Interpolate all variables in addScripts using the context
      const interpolatedScripts: Record<string, string> = {};
      for (const [k, v] of Object.entries(addScripts)) {
        interpolatedScripts[k] = interpolateTemplateStrings(v, context);
      }
      addScriptsToPackageJson(packageJsonPath, interpolatedScripts);
      console.log("Scripts added to package.json.");
    },
    initialCommit: async () => {
      const doCommit = await select({
        message: "Would you like to make an initial git commit?",
        choices: [
          { name: "Yes", value: "yes" },
          { name: "No", value: "no" },
        ],
        default: "yes",
      });

      if (doCommit === "yes") {
        runCommand("git add -A", { cwd: monorepoPath });
        runCommand('git commit -m "Initial commit"', { cwd: monorepoPath });
        console.log("Initial commit created.");

        const doPush = await select({
          message: "Would you like to push to the remote repository?",
          choices: [
            { name: "Yes", value: "yes" },
            { name: "No", value: "no" },
          ],
          default: "yes",
        });

        if (doPush === "yes") {
          runCommand("git push --set-upstream origin main", { cwd: monorepoPath });
          console.log(
            "Pushed to remote repository and set upstream for main branch."
          );
        } else {
          console.log("Push skipped.");
        }
      } else {
        console.log("Initial commit skipped.");
      }
    },
  };

  // Find the index to start at
  const startIndex = startAt ? steps.indexOf(startAt) : 0;
  if (startIndex === -1) {
    console.error(
      `Invalid --start-at value: ${startAt}. Valid steps: ${steps.join(", ")}`
    );
    process.exit(1);
  }

  // Run steps in order from startIndex
  for (let i = startIndex; i < steps.length; i++) {
    const fn = stepFns[steps[i]];
    if (fn) {
      await fn();
    }
  }

  console.log("\nMonorepo setup complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
