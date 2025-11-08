import { NVM_USE_VERSION } from "./monorepoConfig";

/**
 * Ensures Node.js is active via nvm if available, and sets up corepack/yarn.
 */
export function checkAndUseNode() {
  const { execSync } = require("child_process");
  const process = require("process");
  // Try to source nvm and use node NVM_USE_VERSION in a subshell
  const nvmDir = process.env.NVM_DIR || `${process.env.HOME}/.nvm`;
  const nvmScript = `${nvmDir}/nvm.sh`;
  const shellCmd = `[ -s "${nvmScript}" ] && . "${nvmScript}" && nvm install ${NVM_USE_VERSION} && nvm use ${NVM_USE_VERSION}`;
  try {
    execSync(shellCmd, { stdio: "inherit", shell: "/bin/bash" });
    console.log(`\nUsed nvm to ensure Node.js ${NVM_USE_VERSION} is installed and active.`);
  } catch {
    console.warn(`nvm not found or failed to activate Node.js ${NVM_USE_VERSION}. Please ensure Node.js ${NVM_USE_VERSION} is active before running this script.`);
  }
  // Enable corepack and prepare yarn
  try {
    execSync("corepack enable", { stdio: "inherit" });
    execSync("corepack prepare yarn@stable --activate", { stdio: "inherit" });
    console.log("Corepack enabled and Yarn set up.");
  } catch {
    console.warn("Failed to enable corepack or set up Yarn. Please ensure corepack and yarn are available.");
  }
  console.log('');
}
