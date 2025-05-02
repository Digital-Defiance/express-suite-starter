import input from "@inquirer/input";
import select from "@inquirer/select";
import { execSync, spawnSync } from "child_process";
const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const https = require("https");

// === NX Generator Defaults ===
const LINTER = "eslint";
const UNIT_TEST_RUNNER = "jest";
const E2E_TEST_RUNNER = "playwright";
const STYLE = "scss";
const BUNDLER = "vite";
const CI_PROVIDER = "github";
const NODE_API_E2E_TEST_RUNNER = "jest";
const NODE_API_FRAMEWORK = "express";
const LIB_BUNDLER = "none";

// Helper to run shell commands and print output
function runCommand(command: string, options: { cwd?: string } = {}) {
  console.log(`\n$ ${command}`);
  try {
    execSync(command, { stdio: "inherit", ...options });
  } catch (err) {
    console.error(`Error running command: ${command}`);
    process.exit(1);
  }
}

// Helper to copy and render mustache templates
function renderTemplates(
  templatesDir: string,
  destDir: string,
  variables: Record<string, any>
) {
  if (!fs.existsSync(templatesDir)) return;
  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(dir, entry.name);
      const relPath = path.relative(templatesDir, srcPath);
      const destPath = path.join(destDir, relPath.replace(/\.mustache$/, ""));
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        walk(srcPath);
      } else if (entry.isFile()) {
        const template = fs.readFileSync(srcPath, "utf8");
        const rendered = mustache.render(template, variables);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, rendered, "utf8");
        console.log(`Rendered: ${destPath}`);
      }
    }
  };
  walk(templatesDir);
}

function checkAndUseNode22() {
  // Try to source nvm and use node 22 in a subshell
  const nvmDir = process.env.NVM_DIR || `${process.env.HOME}/.nvm`;
  const nvmScript = `${nvmDir}/nvm.sh`;
  const shellCmd = `[ -s "${nvmScript}" ] && . "${nvmScript}" && nvm install 22 && nvm use 22`;
  try {
    execSync(shellCmd, { stdio: "inherit", shell: "/bin/bash" });
    console.log("\nUsed nvm to ensure Node.js 22 is installed and active.");
  } catch {
    console.warn("nvm not found or failed to activate Node.js 22. Please ensure Node.js 22 is active before running this script.");
  }
  // Enable corepack and prepare yarn
  try {
    execSync("corepack enable", { stdio: "inherit" });
    execSync("corepack prepare yarn@stable --activate", { stdio: "inherit" });
    console.log("Corepack enabled and Yarn set up.");
  } catch {
    console.warn("Failed to enable corepack or set up Yarn. Please ensure corepack and yarn are available.");
  }
}

/**
 * Recursively copy files from srcDir to destDir, preserving subdirectory structure.
 * Creates directories as needed. Overwrites files if they exist.
 */
function copyDir(srcDir: string, destDir: string) {
  const fs = require("fs");
  const path = require("path");
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      console.log(`Scaffolded: ${destPath}`);
    }
  }
}

/**
 * Copy files from scaffolding/react, scaffolding/lib, and scaffolding/root
 * to their respective destinations in the monorepo.
 */
function copyScaffoldingFiles(scaffoldingDir: string, monorepoPath: string, reactAppName: string, libName: string) {
  const path = require("path");
  const fs = require("fs");
  // Copy react files
  const reactSrc = path.join(scaffoldingDir, "react");
  const reactDest = path.join(monorepoPath, reactAppName);
  if (fs.existsSync(reactSrc)) {
    copyDir(reactSrc, reactDest);
  }
  // Copy lib files
  const libSrc = path.join(scaffoldingDir, "lib");
  const libDest = path.join(monorepoPath, libName);
  if (fs.existsSync(libSrc)) {
    copyDir(libSrc, libDest);
  }
  // Copy root files (preserve structure)
  const rootSrc = path.join(scaffoldingDir, "root");
  if (fs.existsSync(rootSrc)) {
    copyDir(rootSrc, monorepoPath);
  }
}

/**
 * Parse --start-at argument from process.argv, or return null if not present.
 */
function getStartAtStep(): string | null {
  const arg = process.argv.find(arg => arg.startsWith('--start-at='));
  return arg ? arg.split('=')[1] : null;
}

async function main() {
  // Ensure Node.js 22 is active via nvm if available
  checkAndUseNode22();

  // 1. Prompt for workspace name, destination directory, and git repo URL
  const workspaceName = await input({
    message: "Enter the workspace name (e.g. example-project):",
    default: "example-project",
    validate: (val) =>
      /^[a-zA-Z0-9-]+$/.test(val) ? true : "Invalid workspace name (letters, numbers, dashes only)",
  });

  const projectPrefix = await input({
    message: "Enter the project prefix for sub-projects (e.g. example-project):",
    default: "example-project",
    validate: (val) =>
      /^[a-z0-9-]+$/.test(val) ? true : "Invalid prefix (lowercase letters, numbers, dashes only)",
  });

  const namespaceRoot = await input({
    message: "Enter the npm namespace root (e.g. @example-project):",
    default: "@example-project",
    validate: (val) =>
      /^@[a-z0-9-]+$/.test(val) ? true : "Invalid namespace (must start with @, lowercase letters, numbers, dashes only)",
  });

  const defaultParentDir = process.cwd();
  const parentDirInput = await input({
    message: `Enter the parent directory where the workspace will be created (default: ${defaultParentDir}):`,
    default: defaultParentDir,
    validate: (val) => val && val.length > 0 ? true : "Parent directory required",
  });
  const parentDir = path.resolve(parentDirInput);

  const gitRepo = await input({
    message: "Enter the git repository URL (optional):",
  });

  const licenseChoices = [
    { name: "MIT", value: "mit" },
    { name: "Apache 2.0", value: "apache-2.0" },
    { name: "GPL v3.0", value: "gpl-3.0" },
    { name: "BSD 3-Clause", value: "bsd-3-clause" },
    { name: "MPL 2.0", value: "mpl-2.0" },
    { name: "Unlicense", value: "unlicense" },
    { name: "None", value: "" },
  ];
  const licenseKey = await select({
    message: "Choose a license to add to the project (optional):",
    choices: licenseChoices.map(l => ({ name: l.name, value: l.value })),
    default: "mit",
  });

  // Step control
  const startAt = getStartAtStep();
  const steps = [
    "checkTargetDir",
    "createMonorepo",
    "setupGitOrigin",
    "yarnBerrySetup",
    "addNxPlugins",
    "createReactApp",
    "createApiApp",
    "createLib",
    "renderTemplates",
    "copyScaffoldingFiles",
    "createLicense",
    "initialCommit"
  ];
  const stepFns: Record<string, () => Promise<void> | void> = {
    checkTargetDir: () => {
      const monorepoPath = path.join(parentDir, workspaceName);
      if (fs.existsSync(monorepoPath) && fs.readdirSync(monorepoPath).length > 0) {
        console.error(`Error: Target directory "${monorepoPath}" already exists and is not empty. Please remove it or choose a different workspace name or parent directory.`);
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
      const monorepoPath = path.join(parentDir, workspaceName);
      if (gitRepo) {
        runCommand(`git remote add origin ${gitRepo}`, { cwd: monorepoPath });
      }
    },
    yarnBerrySetup: () => {
      const monorepoPath = path.join(parentDir, workspaceName);
      runCommand(`yarn set version berry`, { cwd: monorepoPath });
      runCommand(`yarn config set nodeLinker node-modules`, { cwd: monorepoPath });
      runCommand(`yarn`, { cwd: monorepoPath });
    },
    addNxPlugins: () => {
      const monorepoPath = path.join(parentDir, workspaceName);
      runCommand(`yarn add -D @nx/react @nx/node`, { cwd: monorepoPath });
    },
    createReactApp: () => {
      const monorepoPath = path.join(parentDir, workspaceName);
      const reactAppName = `${projectPrefix}-react`;
      const reactImportPath = `${namespaceRoot}/react`;
      runCommand(
        `npx nx g @nx/react:application ${reactAppName} --style=${STYLE} --routing=true --bundler=${BUNDLER} --linter=${LINTER} --unitTestRunner=${UNIT_TEST_RUNNER} --e2eTestRunner=${E2E_TEST_RUNNER} --importPath=${reactImportPath}`,
        { cwd: monorepoPath }
      );
    },
    createApiApp: () => {
      const monorepoPath = path.join(parentDir, workspaceName);
      const apiAppName = `${projectPrefix}-api`;
      const apiImportPath = `${namespaceRoot}/api`;
      runCommand(
        `npx nx g @nx/node:application ${apiAppName} --framework=${NODE_API_FRAMEWORK} --linter=${LINTER} --unitTestRunner=${UNIT_TEST_RUNNER} --e2eTestRunner=${NODE_API_E2E_TEST_RUNNER} --importPath=${apiImportPath}`,
        { cwd: monorepoPath }
      );
    },
    createLib: () => {
      const monorepoPath = path.join(parentDir, workspaceName);
      const libName = `${projectPrefix}-lib`;
      const libImportPath = `${namespaceRoot}/lib`;
      runCommand(
        `npx nx g @nx/js:lib ${libName} --bundler=${LIB_BUNDLER} --linter=${LINTER} --unitTestRunner=${UNIT_TEST_RUNNER} --importPath=${libImportPath}`,
        { cwd: monorepoPath }
      );
    },
    renderTemplates: () => {
      const monorepoPath = path.join(parentDir, workspaceName);
      const templatesDir = path.resolve(process.cwd(), "templates");
      const reactAppName = `${projectPrefix}-react`;
      const apiAppName = `${projectPrefix}-api`;
      const libName = `${projectPrefix}-lib`;
      const reactImportPath = `${namespaceRoot}/react`;
      const apiImportPath = `${namespaceRoot}/api`;
      const libImportPath = `${namespaceRoot}/lib`;
      renderTemplates(templatesDir, monorepoPath, {
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
      });
    },
    copyScaffoldingFiles: () => {
      const monorepoPath = path.join(parentDir, workspaceName);
      const reactAppName = `${projectPrefix}-react`;
      const libName = `${projectPrefix}-lib`;
      const scaffoldingDir = path.resolve(process.cwd(), "scaffolding");
      copyScaffoldingFiles(scaffoldingDir, monorepoPath, reactAppName, libName);
    },
    createLicense: async () => {
      const monorepoPath = path.join(parentDir, workspaceName);
      if (licenseKey) {
        const licenseUrl = `https://api.github.com/licenses/${licenseKey}`;
        const licenseText = await new Promise<string>((resolve, reject) => {
          https.get(
            licenseUrl,
            {
              headers: {
                "User-Agent": "project-generator",
                "Accept": "application/vnd.github.v3+json",
              },
            },
            (res: import("http").IncomingMessage) => {
              let data = "";
              res.on("data", (chunk: Buffer) => (data += chunk));
              res.on("end", () => {
                try {
                  const json = JSON.parse(data);
                  if (json.body) {
                    resolve(json.body);
                  } else {
                    reject(new Error("License text not found in GitHub API response."));
                  }
                } catch (e) {
                  reject(e);
                }
              });
            }
          ).on("error", reject);
        });
        fs.writeFileSync(path.join(monorepoPath, "LICENSE"), licenseText, "utf8");
        console.log(`LICENSE file created with ${licenseKey.toUpperCase()} license.`);
      } else {
        console.log("No license selected. Skipping LICENSE file creation.");
      }
    },
    initialCommit: async () => {
      const monorepoPath = path.join(parentDir, workspaceName);
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
          console.log("Pushed to remote repository and set upstream for main branch.");
        } else {
          console.log("Push skipped.");
        }
      } else {
        console.log("Initial commit skipped.");
      }
    }
  };

  // Find the index to start at
  const startIndex = startAt ? steps.indexOf(startAt) : 0;
  if (startIndex === -1) {
    console.error(`Invalid --start-at value: ${startAt}. Valid steps: ${steps.join(", ")}`);
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
