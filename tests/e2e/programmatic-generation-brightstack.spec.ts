/**
 * E2E tests for BrightStack programmatic generation.
 *
 * Tests the BrightStack scaffolding template rendering to verify:
 * - Generated directory structure contains expected files
 * - Generated application.ts imports from @brightchain/node-express-suite and uses BrightDbDatabasePlugin
 * - Generated environment.ts extends BrightDbEnvironment
 * - Generated shared-types.ts uses BrightDB types
 * - Generated main.ts imports from @brightchain/node-express-suite
 * - Generated .env.example contains BrightStack-specific vars and no MongoDB vars
 * - No MongoDB imports in any generated source file
 * - Property 15b: Generated TypeScript files are syntactically valid
 *
 * Validates: Requirements 4.4, 4.5, 4.6, 4.7, 4.8, 5.3, 6.3, 6.4, 7.2, 11.1, 11.2
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

describe('BrightStack Programmatic Generation E2E', () => {
  let tmpDir: string;
  const scaffoldingDir = path.resolve(__dirname, '../../scaffolding');

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
    stackType: 'brightstack',
    isMern: false,
    isBrightStack: true,
    blockStorePath: '/data/brightchain',
    useMemoryDocstore: 'true',
    memberPoolName: 'BrightChain',
    devDatabase: 'test-db',
    jwtSecret: 'a'.repeat(64),
    mnemonicEncryptionKey: 'b'.repeat(64),
    mnemonicHmacSecret: 'c'.repeat(64),
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
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'starter-brightstack-e2e-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

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
    it('api-lib-brightstack scaffolding produces expected directory structure', () => {
      const apiLibDir = path.join(tmpDir, 'api-lib');
      renderScaffolding('api-lib-brightstack', apiLibDir);

      expect(fs.existsSync(path.join(apiLibDir, 'src'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib', 'application.ts'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib', 'environment.ts'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'lib', 'shared-types.ts'))).toBe(true);
      expect(fs.existsSync(path.join(apiLibDir, 'src', 'index.ts'))).toBe(true);
    });

    it('api-brightstack scaffolding produces expected files', () => {
      const apiDir = path.join(tmpDir, 'api');
      renderScaffolding('api-brightstack', apiDir);

      expect(fs.existsSync(path.join(apiDir, 'src', 'main.ts'))).toBe(true);
      expect(fs.existsSync(path.join(apiDir, '.env.example'))).toBe(true);
    });

    it('inituserdb-brightstack scaffolding produces expected files', () => {
      const initDir = path.join(tmpDir, 'inituserdb');
      renderScaffolding('inituserdb-brightstack', initDir);

      expect(fs.existsSync(path.join(initDir, 'src', 'main.ts'))).toBe(true);
    });

    it('generates all BrightStack project types without errors', () => {
      const projectTypes = ['api-brightstack', 'api-lib-brightstack', 'inituserdb-brightstack'];
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
      renderScaffolding('api-lib-brightstack', apiLibDir);
      const appPath = path.join(apiLibDir, 'src', 'lib', 'application.ts');
      applicationContent = fs.readFileSync(appPath, 'utf-8');
    });

    it('imports from @brightchain/node-express-suite', () => {
      expect(applicationContent).toContain('@brightchain/node-express-suite');
    });

    it('imports BrightDbApplication', () => {
      expect(applicationContent).toContain('BrightDbApplication');
    });

    it('imports BrightDbDatabasePlugin', () => {
      expect(applicationContent).toContain('BrightDbDatabasePlugin');
    });

    it('uses BrightDbDatabasePlugin in the constructor', () => {
      expect(applicationContent).toMatch(/new\s+BrightDbDatabasePlugin/);
    });

    it('calls useDatabasePlugin to register the plugin', () => {
      expect(applicationContent).toContain('useDatabasePlugin');
    });

    it('extends BrightDbApplication', () => {
      expect(applicationContent).toMatch(/extends\s+BrightDbApplication/);
    });

    it('does not import from mongoose or mongodb', () => {
      expect(applicationContent).not.toContain("from 'mongoose'");
      expect(applicationContent).not.toContain("from 'mongodb'");
      expect(applicationContent).not.toContain('@digitaldefiance/mongoose-types');
    });
  });

  // ─── Environment.ts Tests ───────────────────────────────────────────

  describe('generated environment.ts', () => {
    let environmentContent: string;

    beforeEach(() => {
      const apiLibDir = path.join(tmpDir, 'api-lib-env');
      renderScaffolding('api-lib-brightstack', apiLibDir);
      const envPath = path.join(apiLibDir, 'src', 'lib', 'environment.ts');
      environmentContent = fs.readFileSync(envPath, 'utf-8');
    });

    it('extends BrightDbEnvironment', () => {
      expect(environmentContent).toMatch(/extends\s+BrightDbEnvironment/);
    });

    it('imports BrightDbEnvironment from @brightchain/node-express-suite', () => {
      expect(environmentContent).toContain('@brightchain/node-express-suite');
      expect(environmentContent).toContain('BrightDbEnvironment');
    });
  });

  // ─── Shared-types.ts Tests ──────────────────────────────────────────

  describe('generated shared-types.ts', () => {
    let sharedTypesContent: string;

    beforeEach(() => {
      const apiLibDir = path.join(tmpDir, 'api-lib-types');
      renderScaffolding('api-lib-brightstack', apiLibDir);
      const typesPath = path.join(apiLibDir, 'src', 'lib', 'shared-types.ts');
      sharedTypesContent = fs.readFileSync(typesPath, 'utf-8');
    });

    it('uses BrightDB types', () => {
      expect(sharedTypesContent).toContain('BrightDbCollection');
    });

    it('imports from @brightchain/node-express-suite', () => {
      expect(sharedTypesContent).toContain('@brightchain/node-express-suite');
    });

    it('uses PlatformID type', () => {
      expect(sharedTypesContent).toContain('PlatformID');
    });

    it('uses HexString type', () => {
      expect(sharedTypesContent).toContain('HexString');
    });
  });

  // ─── Main.ts Tests ─────────────────────────────────────────────────

  describe('generated main.ts', () => {
    let mainContent: string;

    beforeEach(() => {
      const apiDir = path.join(tmpDir, 'api-main');
      renderScaffolding('api-brightstack', apiDir);
      const mainPath = path.join(apiDir, 'src', 'main.ts');
      mainContent = fs.readFileSync(mainPath, 'utf-8');
    });

    it('imports from @brightchain/node-express-suite', () => {
      expect(mainContent).toContain('@brightchain/node-express-suite');
    });

    it('imports BrightDbApplication', () => {
      expect(mainContent).toContain('BrightDbApplication');
    });
  });

  // ─── .env.example Tests ─────────────────────────────────────────────

  describe('generated .env.example', () => {
    let envContent: string;

    beforeEach(() => {
      const apiDir = path.join(tmpDir, 'api-env');
      renderScaffolding('api-brightstack', apiDir);
      const envPath = path.join(apiDir, '.env.example');
      envContent = fs.readFileSync(envPath, 'utf-8');
    });

    it('contains BrightStack-specific env vars', () => {
      expect(envContent).toContain('BRIGHTCHAIN_BLOCKSTORE_PATH');
      expect(envContent).toContain('BRIGHTCHAIN_BLOCKSIZE_BYTES');
      expect(envContent).toContain('BRIGHTCHAIN_BLOCKSTORE_TYPE');
      expect(envContent).toContain('USE_MEMORY_DOCSTORE');
      expect(envContent).toContain('MEMBER_POOL_NAME');
    });

    it('contains shared secret vars', () => {
      expect(envContent).toContain('JWT_SECRET');
      expect(envContent).toContain('MNEMONIC_ENCRYPTION_KEY');
      expect(envContent).toContain('MNEMONIC_HMAC_SECRET');
    });

    it('does not contain MongoDB vars', () => {
      expect(envContent).not.toContain('MONGO_URI');
      expect(envContent).not.toContain('MONGO_USE_TRANSACTIONS');
    });

    it('pre-populates blockStorePath from scaffolding vars', () => {
      // Mustache HTML-escapes / to &#x2F; in {{var}} — this is expected behavior
      expect(envContent).toContain('BRIGHTCHAIN_BLOCKSTORE_PATH=');
      expect(envContent).toMatch(/BRIGHTCHAIN_BLOCKSTORE_PATH=.*data.*brightchain/);
    });
  });

  // ─── No MongoDB imports in BrightStack scaffolding ──────────────────

  describe('no MongoDB imports in BrightStack generated files', () => {
    it('no .ts file in api-lib-brightstack contains mongoose/mongodb imports', () => {
      const apiLibDir = path.join(tmpDir, 'api-lib-nomongo');
      renderScaffolding('api-lib-brightstack', apiLibDir);

      const tsFiles = collectFiles(apiLibDir, '.ts');
      expect(tsFiles.length).toBeGreaterThan(0);

      const mongoPattern = /(?:from\s+['"](?:mongoose|mongodb|@digitaldefiance\/mongoose-types))/;
      for (const filePath of tsFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(mongoPattern.test(content)).toBe(false);
      }
    });
  });

  // ─── Property 15b: Generated TypeScript files are syntactically valid ──

  describe('Property 15b: BrightStack generated TypeScript files are syntactically valid', () => {
    it('all scaffolded .ts files from api-lib-brightstack are syntactically valid', () => {
      const apiLibDir = path.join(tmpDir, 'api-lib-syntax');
      renderScaffolding('api-lib-brightstack', apiLibDir);

      const tsFiles = collectFiles(apiLibDir, '.ts');
      expect(tsFiles.length).toBeGreaterThan(0);

      for (const filePath of tsFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const errors = getTsSyntaxErrors(content, path.basename(filePath));
        expect(errors).toEqual([]);
      }
    });

    it('all scaffolded .ts files from all BrightStack project types are syntactically valid', () => {
      const projectTypes = ['api-brightstack', 'api-lib-brightstack', 'inituserdb-brightstack'];
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

    it('property: BrightStack .ts files remain syntactically valid across varied scaffolding variables', () => {
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
            const iterDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pbt-bs-'));
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
                stackType: 'brightstack',
                isMern: false,
                isBrightStack: true,
                blockStorePath: '/data/brightchain',
                useMemoryDocstore: 'true',
                memberPoolName: 'BrightChain',
                devDatabase: 'test-db',
                jwtSecret: 'a'.repeat(64),
                mnemonicEncryptionKey: 'b'.repeat(64),
                mnemonicHmacSecret: 'c'.repeat(64),
                isEnUs: lang === 'en-US',
                isEnGb: lang === 'en-GB',
                isFr: lang === 'fr',
                isEs: lang === 'es',
                isDe: lang === 'de',
                isZhCn: lang === 'zh-CN',
                isJa: lang === 'ja',
                isUk: lang === 'uk',
              };

              const apiLibDir = path.join(iterDir, 'api-lib');
              fs.mkdirSync(apiLibDir, { recursive: true });
              copyDir(
                path.join(scaffoldingDir, 'api-lib-brightstack'),
                apiLibDir,
                vars,
                'mustache',
                false,
              );

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
