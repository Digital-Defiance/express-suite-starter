const fs = require("fs");

/**
 * Helper to run shell commands and print output.
 */
export function runCommand(command: string, options: { cwd?: string } = {}) {
  console.log(`\n$ ${command}`);
  const { execSync } = require("child_process");
  try {
    execSync(command, { stdio: "inherit", ...options });
  } catch (err) {
    console.error(`Error running command: ${command}`);
    process.exit(1);
  }
}

/**
 * Set executable permissions for shell scripts.
 */
export function setPerms(filePath: string) {
  if (filePath.endsWith(".sh")) {
    fs.chmodSync(filePath, 0o755);
  }
}
