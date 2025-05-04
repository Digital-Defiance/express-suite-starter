import { setPerms } from "./shellUtils";
const fs = require("fs");
const path = require("path");
const mustache = require("mustache");

/**
 * Helper to copy and render mustache templates.
 */
export function renderTemplates(
  templatesDir: string,
  destDir: string,
  variables: Record<string, any>
) {
  if (!fs.existsSync(templatesDir)) return;

  // Helper to render all templates in a directory to a destination
  function renderDir(srcDir: string, outDir: string) {
    if (!fs.existsSync(srcDir)) return;
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(outDir, entry.name.replace(/\.mustache$/, ""));
      if (entry.isDirectory()) {
        renderDir(srcPath, destPath);
      } else if (entry.isFile()) {
        const template = fs.readFileSync(srcPath, "utf8");
        const rendered = mustache.render(template, variables);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, rendered, "utf8");
        setPerms(destPath);
        console.log(`Rendered: ${destPath}`);
      }
    }
  }

  // Map subdir to destination
  const subdirs = [
    { name: "root", dest: destDir },
    { name: "react", dest: variables.REACT_APP_NAME ? path.join(destDir, variables.REACT_APP_NAME) : null },
    { name: "api", dest: variables.API_APP_NAME ? path.join(destDir, variables.API_APP_NAME) : null },
    { name: "lib", dest: variables.LIB_NAME ? path.join(destDir, variables.LIB_NAME) : null },
  ];

  for (const { name, dest } of subdirs) {
    if (!dest) continue;
    const src = path.join(templatesDir, name);
    if (fs.existsSync(src)) {
      renderDir(src, dest);
    }
  }
}

/**
 * Recursively copy files from srcDir to destDir, preserving subdirectory structure.
 * Creates directories as needed. Overwrites files if they exist.
 */
export function copyDir(srcDir: string, destDir: string) {
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
      setPerms(destPath);
      console.log(`Scaffolded: ${destPath}`);
    }
  }
}

/**
 * Copy files from scaffolding/react, scaffolding/lib, and scaffolding/root
 * to their respective destinations in the monorepo.
 */
export function copyScaffoldingFiles(
  scaffoldingDir: string,
  monorepoPath: string,
  reactAppName: string,
  libName: string
) {
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
