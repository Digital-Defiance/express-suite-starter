import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { runCommand } from '../utils/shell-utils';
import { ProjectConfig } from './interfaces';

export class ProjectGenerator {
  private static readonly nxEnv = { NX_DAEMON: 'false' };

  /**
   * Patch the generated @nx/node rolldown config so the suite's dependency
   * chain bundles cleanly:
   *
   * 1. ESM output instead of the generator's default CJS — the crypto chain
   *    (e.g. bigint-crypto-utils) uses top-level await, which rolldown's "cjs"
   *    format rejects ("INVALID_TLA_FORMAT").
   * 2. Externalize every bare module specifier, not just the API project's own
   *    direct deps. Transitive deps (e.g. nat-upnp via node-express-suite) are
   *    otherwise bundled, and some ship ESM-incompatible/dynamic code that
   *    rolldown cannot parse (e.g. `interface` used as an identifier). Node
   *    server bundles install node_modules at runtime, so externalizing them
   *    is both correct and avoids these parse failures.
   *
   * No-op if the config is absent or already patched, so it stays safe across
   * future @nx/node versions that may change the bundler or defaults.
   */
  private static useEsmApiBundle(
    config: ProjectConfig,
    monorepoPath: string,
    dryRun: boolean,
  ): void {
    if (dryRun) {
      return;
    }
    const configPath = join(monorepoPath, config.name, 'rolldown.config.ts');
    if (!existsSync(configPath)) {
      return;
    }
    // The workspace scope (e.g. "@my-workspace") identifies the project's own
    // internal libraries, which MUST stay bundled; everything else bare is a
    // real node_modules dependency to externalize.
    const scope = config.importPath.split('/')[0];

    const original = readFileSync(configPath, 'utf-8');
    let patched = original.replace(/format:\s*['"]cjs['"]/g, "format: 'esm'");
    // ESM output has no CommonJS `__dirname`/`__filename` globals; the
    // scaffolded main.ts (and some bundled code) rely on them. Inject a banner
    // that recreates them from import.meta.url. Only add once, alongside the
    // esm format switch.
    if (patched.includes("format: 'esm'") && !patched.includes('banner:')) {
      patched = patched.replace(
        /(format:\s*'esm',)/,
        `$1\n      banner:\n        "import { fileURLToPath as __esmFileURLToPath } from 'node:url';\\nimport { dirname as __esmDirname } from 'node:path';\\nconst __filename = __esmFileURLToPath(import.meta.url);\\nconst __dirname = __esmDirname(__filename);",`,
      );
    }
    // Broaden externalization to all bare specifiers (transitive deps, node:
    // builtins) EXCEPT the workspace's own internal libs, if the config still
    // only checks direct dependencies.
    if (
      patched.includes(
        'dependencies.some((dep) => id === dep || id.startsWith(`${dep}/`))',
      ) &&
      !patched.includes('isBareDependency')
    ) {
      patched = patched.replace(
        'dependencies.some((dep) => id === dep || id.startsWith(`${dep}/`))',
        'isBareDependency(id)',
      );
      // The direct-dependency list is no longer referenced; drop it and the
      // package.json import that only fed it so lint (no-unused-vars) passes.
      patched = patched
        .replace(
          /\/\/ Installed at runtime[^\n]*\n/,
          '',
        )
        .replace(
          /const dependencies = Object\.keys\(packageJson\.dependencies\);\n/,
          '',
        )
        .replace(
          /import packageJson from '\.\/package\.json' with \{ type: 'json' \};\n/,
          '',
        );
      // Insert the helper just before the default export.
      const helper = `// Externalize real dependencies (node_modules + node: builtins) but keep
// the workspace's own internal libraries (${scope}/*), rolldown's injected
// runtime helpers (@oxc-project/*, which are not declared deps and must be
// inlined), and relative/absolute imports bundled.
const WORKSPACE_SCOPE = '${scope}';
function isBareDependency(id: string): boolean {
  if (id.startsWith('.') || id.startsWith('/') || /^[A-Za-z]:/.test(id)) {
    return false;
  }
  if (id === WORKSPACE_SCOPE || id.startsWith(\`\${WORKSPACE_SCOPE}/\`)) {
    return false;
  }
  if (id === '@oxc-project/runtime' || id.startsWith('@oxc-project/')) {
    return false;
  }
  return true;
}

`;
      patched = patched.replace(
        /export default defineConfig/,
        `${helper}export default defineConfig`,
      );
    }
    if (patched !== original) {
      writeFileSync(configPath, patched);
    }
  }

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
    this.useEsmApiBundle(config, monorepoPath, dryRun);
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
    this.useEsmApiBundle(config, monorepoPath, dryRun);
  }

  static generateTestUtils(config: ProjectConfig, monorepoPath: string, nx: any, dryRun = false): void {
    runCommand(
      `npx nx g @nx/js:lib ${config.name} --bundler=none --linter=eslint --unitTestRunner=jest --importPath=${config.importPath} --no-interactive`,
      { cwd: monorepoPath, dryRun, env: this.nxEnv }
    );
  }
}
