/**
 * E2E tests for programmatic generation.
 *
 * Tests the scaffolding template rendering to verify:
 * - Generated directory structure contains expected files
 * - Generated application.ts imports from @digitaldefiance/node-express-suite and uses MongoDatabasePlugin
 * - Property 15: Generated TypeScript files are syntactically valid
 *
 * Validates: Requirements 9.3, 9.4, 9.5
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as ts from 'typescript';
import * as fc from 'fast-check';
import { copyDir } from '../../src/utils/template-renderer';

// Suppress logger output during tests
jest.mock('../../src/cli/logger', () => ({
  Logger: {
    dim: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    step: jest.fn(),
    header: jest.fn(),
    command: jest.fn(),
    section: jest.fn(),
  },
}));

describe('Programmatic Generation E2E', () => {
  let tmpDir: string;
  const scaffoldingDir = path.resolve(__dirname, '../../scaffolding');

  // Default scaffolding variables matching what the generator would produce
  const defaultScaffoldingVars: Record<string, string | boolean> = {
    workspaceName: 'test-workspace',
    WorkspaceName: 'TestWorkspace',
    prefix: 'test',
    namespace: '@test',
    hostname: 'test-workspace.local',
    selectedLanguage: 'en-US',
    siteTitle: 'Test Site',
    siteDescription: 'A test site',
    siteTagline: 'Testing tagline',
    isEnUs: true,
    isEnGb: false,
    isFr: false,
    isEs: false,
    isDe: false,
    isZhCn: false,
    isJa: false,
    isUk: false,
  };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'starter-e2e-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  /**
   * Helper: render scaffolding for a given project type into a destination directory.
   */
  function renderScaffolding(
    projectType: string,
    destDir: string,
    vars: Record<string, string | boolean> = defaultScaffoldingVars,
  ): void {
    const srcDir = path.join(scaffoldingDir, projectType);
    if (fs.existsSync(srcDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      copyDir(srcDir, destDir, vars, 'mustache', false);
    }
  }

  /**
   * Helper: recursively collect all files with a given extension under a directory.
   */
  function collectFiles(dir: string, ext: string): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...collectFiles(fullPath, ext));
      } else if (entry.isFile() && entry.name.endsWith(ext)) {
        results.push(fullPath);
      }
    }
    return results;
  }

  /**
   * Helper: check if a TypeScript source string is syntactically valid.
   * Returns an array of syntax diagnostic messages (empty = valid).
   */
  function getTsSyntaxErrors(source: string, fileName = 'test.ts'): string[] {
    const sourceFile = ts.createSourceFile(
      fileName,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    const diagnostics = (sourceFile as ReturnType<typeof ts.createSourceFile> & {
      parseDiagnostics?: ts.DiagnosticWithLocation[];
    }).parseDiagnostics;

    if (!diagnostics || diagnostics.length === 0) return [];

    return diagnostics.map((d) => {
      const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
      return `${fileName}(${d.start}): ${msg}`;
    });
  }

  // ─── Directory Structure Tests ───────────────────────────────────────

  describe('generated directory structure', () => {
    it('api-lib scaffolding produces expected directory structure', () => {
      const apiLibDir = path.join(tmpDir, 'api-lib');
      renderScaffolding('api-lib', apiLibDir);

      // Verify key directories exist
      expect(fs.existsSync(path.join(apiLibDir, 'src'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib', 'routers'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib', 'schemas'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib', 'services'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib', 'interfaces'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib', 'documents'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib', 'models'))).toBe(true);

      // Verify key files exist
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib', 'application.ts'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib', 'environment.ts'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib', 'shared-types.ts'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'index.ts'))).toBe(true);
    });

    it('api scaffolding produces expected files', () => {
      const apiDir = path.join(tmpDir, 'api');
      renderScaffolding('api', apiDir);

      expect(fs.existsSync(path.join(apiDir, 'src', 'main.ts'))).toBe(true);
    });

    it('inituserdb scaffolding produces expected files', () => {
      const initDir = path.join(tmpDir, 'inituserdb');
      renderScaffolding('inituserdb', initDir);

      expect(fs.existsSync(path.join(initDir, 'src', 'main.ts'))).toBe(true);
    });

    it('lib scaffolding produces expected files', () => {
      const libDir = path.join(tmpDir, 'lib');
      renderScaffolding('lib', libDir);

      expect(fs.existsSync(path.join(libDir, 'src'))).toBe(true);
      expect(fs.existsSync(path.join(libDir, 'src', 'lib'))).toBe(true);
    });

    it('generates all project types without errors', () => {
      const projectTypes = ['api', 'api-lib', 'lib', 'inituserdb', 'react', 'react-lib'];
      for (const projectType of projectTypes) {
        const destDir = path.join(tmpDir, projectType);
        expect(() => renderScaffolding(projectType, destDir)).not.toThrow();
      }
    });
  });

  // ─── Application.ts Import Tests ────────────────────────────────────

  describe('generated application.ts imports and plugin usage', () => {
    let applicationContent: string;

    beforeEach(() => {
      const apiLibDir = path.join(tmpDir, 'api-lib');
      renderScaffolding('api-lib', apiLibDir);
      const appPath = path.join(apiLibDir, 'src', 'lib', 'application.ts');
      applicationContent = fs.readFileSync(appPath, 'utf-8');
    });

    it('imports from @digitaldefiance/node-express-suite', () => {
      expect(applicationContent).toContain(
        '@digitaldefiance/node-express-suite',
      );
    });

    it('imports MongoDatabasePlugin', () => {
      expect(applicationContent).toContain('MongoDatabasePlugin');
    });

    it('uses MongoDatabasePlugin in the constructor', () => {
      // The scaffolded application.ts should instantiate MongoDatabasePlugin
      expect(applicationContent).toMatch(/new\s+MongoDatabasePlugin/);
    });

    it('calls useDatabasePlugin to register the plugin', () => {
      expect(applicationContent).toContain('useDatabasePlugin');
    });

    it('imports Application from node-express-suite', () => {
      // Verify Application is imported (the base class)
      expect(applicationContent).toMatch(
        /import\s*\{[^}]*\bApplication\b[^}]*\}\s*from\s*['"]@digitaldefiance\/node-express-suite['"]/,
      );
    });
  });

  // ─── Property 15: Generated TypeScript files are syntactically valid ──

  describe('Property 15: Generated TypeScript files are syntactically valid', () => {
    /**
     * Feature: plugin-migration-cleanup, Property 15: Generated TypeScript files are syntactically valid
     * Validates: Requirements 9.3, 9.4, 9.5
     *
     * For any .ts file generated by the starter's programmatic mode,
     * the file should be parseable by the TypeScript compiler without syntax errors.
     */

    it('all scaffolded .ts files from api-lib are syntactically valid', () => {
      const apiLibDir = path.join(tmpDir, 'api-lib-syntax');
      renderScaffolding('api-lib', apiLibDir);

      const tsFiles = collectFiles(apiLibDir, '.ts');
      expect(tsFiles.length).toBeGreaterThan(0);

      for (const filePath of tsFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const errors = getTsSyntaxErrors(content, path.basename(filePath));
        expect(errors).toEqual([]);
      }
    });

    it('all scaffolded .ts files from all project types are syntactically valid', () => {
      const projectTypes = ['api', 'api-lib', 'lib', 'inituserdb'];
      for (const projectType of projectTypes) {
        const destDir = path.join(tmpDir, `syntax-${projectType}`);
        renderScaffolding(projectType, destDir);

        const tsFiles = collectFiles(destDir, '.ts');
        for (const filePath of tsFiles) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const errors = getTsSyntaxErrors(content, path.relative(tmpDir, filePath));
          expect(errors).toEqual([]);
        }
      }
    });

    it('property: generated .ts files remain syntactically valid across varied scaffolding variables', () => {
      // Use fast-check to generate varied scaffolding variable combinations
      // and verify that all generated .ts files are syntactically valid.
      //
      // The real generator applies escapeForTypeScript() to user-provided strings
      // before passing them to templates. We replicate that here so the property
      // tests the same invariant the production code guarantees.
      const escapeForTypeScript = (str: string): string => {
        return str
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
      };

      const validNameArb = fc.stringMatching(/^[a-z][a-z0-9-]{1,20}$/);
      const validPascalArb = fc.stringMatching(/^[A-Z][a-zA-Z0-9]{1,20}$/);

      fc.assert(
        fc.property(
          validNameArb,
          validPascalArb,
          validNameArb,
          fc.constantFrom('en-US', 'en-GB', 'fr', 'es', 'de', 'zh-CN', 'ja', 'uk'),
          fc.string({ minLength: 0, maxLength: 50 }),
          fc.string({ minLength: 0, maxLength: 50 }),
          (workspaceName, pascalName, prefix, lang, title, description) => {
            const iterDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pbt-'));
            try {
              const vars: Record<string, string | boolean> = {
                workspaceName,
                WorkspaceName: pascalName,
                prefix,
                namespace: `@${prefix}`,
                hostname: `${workspaceName}.local`,
                selectedLanguage: lang,
                siteTitle: escapeForTypeScript(title),
                siteDescription: escapeForTypeScript(description),
                siteTagline: 'tagline',
                isEnUs: lang === 'en-US',
                isEnGb: lang === 'en-GB',
                isFr: lang === 'fr',
                isEs: lang === 'es',
                isDe: lang === 'de',
                isZhCn: lang === 'zh-CN',
                isJa: lang === 'ja',
                isUk: lang === 'uk',
              };

              // Render api-lib scaffolding (the most important one with application.ts)
              const apiLibDir = path.join(iterDir, 'api-lib');
              fs.mkdirSync(apiLibDir, { recursive: true });
              copyDir(
                path.join(scaffoldingDir, 'api-lib'),
                apiLibDir,
                vars,
                'mustache',
                false,
              );

              // Collect and validate all .ts files
              const tsFiles = collectFiles(apiLibDir, '.ts');
              for (const filePath of tsFiles) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const errors = getTsSyntaxErrors(content, path.basename(filePath));
                if (errors.length > 0) {
                  return false;
                }
              }
              return true;
            } finally {
              fs.rmSync(iterDir, { recursive: true, force: true });
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
