import { PostGenerationValidator } from '../../src/core/validators/post-generation-validator';
import { GeneratorContext } from '../../src/core/interfaces';
import * as fs from 'fs';

jest.mock('fs');
jest.mock('../../src/cli/logger');
jest.mock('../../src/utils/shell-utils');

describe('PostGenerationValidator', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  let context: GeneratorContext;

  beforeEach(() => {
    jest.clearAllMocks();
    context = {
      config: {},
      state: new Map([['monorepoPath', '/test/monorepo']]),
      dryRun: false,
      checkpointPath: '/tmp/checkpoint.json',
    };
    // Default: readdirSync returns empty array so collectTsFiles doesn't fail
    mockFs.readdirSync.mockReturnValue([] as any);
  });

  describe('validate', () => {
    it('passes validation for valid project', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        scripts: { build: 'nx build' },
        dependencies: {},
        devDependencies: {},
      }));

      const report = await PostGenerationValidator.validate(context);

      expect(report.passed).toBe(true);
    });

    it('fails validation for missing package.json', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const report = await PostGenerationValidator.validate(context);

      expect(report.passed).toBe(false);
      expect(report.issues).toContainEqual(
        expect.objectContaining({
          type: 'error',
          message: 'package.json not found',
        })
      );
    });

    it('warns about missing name in package.json', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        version: '1.0.0',
      }));

      const report = await PostGenerationValidator.validate(context);

      expect(report.issues).toContainEqual(
        expect.objectContaining({
          type: 'warning',
          message: 'package.json missing name field',
        })
      );
    });

    it('detects React version mismatch', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        name: 'test',
        version: '1.0.0',
        dependencies: {
          react: '^19.0.0',
          '@types/react': '^18.0.0',
        },
      }));

      const report = await PostGenerationValidator.validate(context);

      expect(report.issues).toContainEqual(
        expect.objectContaining({
          category: 'dependency',
          message: expect.stringContaining('version mismatch'),
        })
      );
    });

    it('detects missing react-dom', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        name: 'test',
        version: '1.0.0',
        dependencies: {
          react: '^19.0.0',
        },
      }));

      const report = await PostGenerationValidator.validate(context);

      expect(report.issues).toContainEqual(
        expect.objectContaining({
          type: 'error',
          category: 'dependency',
          message: expect.stringContaining('react-dom'),
        })
      );
    });

    it('warns about missing .gitignore', async () => {
      mockFs.existsSync.mockImplementation((p) => {
        return p.toString().includes('package.json');
      });
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        name: 'test',
        version: '1.0.0',
      }));

      const report = await PostGenerationValidator.validate(context);

      expect(report.issues).toContainEqual(
        expect.objectContaining({
          type: 'warning',
          message: '.gitignore file not found',
        })
      );
    });

    it('provides fix suggestions', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        name: 'test',
        version: '1.0.0',
        dependencies: {
          react: '^19.0.0',
        },
      }));

      const report = await PostGenerationValidator.validate(context);

      const reactDomIssue = report.issues.find(i => i.message.includes('react-dom'));
      expect(reactDomIssue?.fix).toBeDefined();
    });

    it('calculates summary correctly', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const report = await PostGenerationValidator.validate(context);

      expect(report.summary.errors).toBeGreaterThan(0);
      expect(report.summary.warnings).toBeGreaterThanOrEqual(0);
      expect(report.summary.info).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validateNoMongoImports', () => {
    it('reports warning when BrightStack project contains mongoose import', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir: any) => {
        const d = dir.toString();
        if (d.endsWith('api') || d.endsWith('api-lib')) {
          return [{ name: 'src', isDirectory: () => true, isFile: () => false }] as any;
        }
        if (d.endsWith('src')) {
          return [{ name: 'app.ts', isDirectory: () => false, isFile: () => true }] as any;
        }
        return [];
      });
      mockFs.readFileSync.mockReturnValue("import { Schema } from 'mongoose';");

      const issues = PostGenerationValidator.validateNoMongoImports('/test/monorepo');

      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toMatchObject({
        type: 'warning',
        category: 'stackMismatch',
      });
      expect(issues[0].message).toContain('MongoDB import');
    });

    it('reports no issues when BrightStack project has no MongoDB imports', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir: any) => {
        const d = dir.toString();
        if (d.endsWith('api') || d.endsWith('api-lib')) {
          return [{ name: 'src', isDirectory: () => true, isFile: () => false }] as any;
        }
        if (d.endsWith('src')) {
          return [{ name: 'app.ts', isDirectory: () => false, isFile: () => true }] as any;
        }
        return [];
      });
      mockFs.readFileSync.mockReturnValue("import { BrightDbApplication } from '@brightchain/node-express-suite';");

      const issues = PostGenerationValidator.validateNoMongoImports('/test/monorepo');

      expect(issues).toEqual([]);
    });
  });

  describe('validateNoBrightStackImports', () => {
    it('reports warning when MERN project contains @brightchain import', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir: any) => {
        const d = dir.toString();
        if (d.endsWith('api') || d.endsWith('api-lib')) {
          return [{ name: 'src', isDirectory: () => true, isFile: () => false }] as any;
        }
        if (d.endsWith('src')) {
          return [{ name: 'app.ts', isDirectory: () => false, isFile: () => true }] as any;
        }
        return [];
      });
      mockFs.readFileSync.mockReturnValue("import { BrightDbApplication } from '@brightchain/node-express-suite';");

      const issues = PostGenerationValidator.validateNoBrightStackImports('/test/monorepo');

      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toMatchObject({
        type: 'warning',
        category: 'stackMismatch',
      });
      expect(issues[0].message).toContain('BrightChain import');
    });

    it('reports no issues when MERN project has no BrightChain imports', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir: any) => {
        const d = dir.toString();
        if (d.endsWith('api') || d.endsWith('api-lib')) {
          return [{ name: 'src', isDirectory: () => true, isFile: () => false }] as any;
        }
        if (d.endsWith('src')) {
          return [{ name: 'app.ts', isDirectory: () => false, isFile: () => true }] as any;
        }
        return [];
      });
      mockFs.readFileSync.mockReturnValue("import { Schema } from 'mongoose';");

      const issues = PostGenerationValidator.validateNoBrightStackImports('/test/monorepo');

      expect(issues).toEqual([]);
    });
  });

  describe('validateBrightStackEnvVars', () => {
    it('reports missing BrightStack env vars', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('JWT_SECRET=abc\nSOME_OTHER=val');

      const issues = PostGenerationValidator.validateBrightStackEnvVars('/test/monorepo');

      expect(issues.length).toBe(1);
      expect(issues[0]).toMatchObject({
        type: 'warning',
        category: 'stackMismatch',
      });
      expect(issues[0].message).toContain('BRIGHTCHAIN_BLOCKSTORE_PATH');
    });

    it('reports no issues when all BrightStack env vars present', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(
        'BRIGHTCHAIN_BLOCKSTORE_PATH=/data\nBRIGHTCHAIN_BLOCKSIZE_BYTES=1048576\n' +
        'BRIGHTCHAIN_BLOCKSTORE_TYPE=disk\nUSE_MEMORY_DOCSTORE=true\n' +
        'DEV_DATABASE=test\nMEMBER_POOL_NAME=BrightChain',
      );

      const issues = PostGenerationValidator.validateBrightStackEnvVars('/test/monorepo');

      expect(issues).toEqual([]);
    });

    it('returns no issues when .env.example does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const issues = PostGenerationValidator.validateBrightStackEnvVars('/test/monorepo');

      expect(issues).toEqual([]);
    });
  });

  describe('validateMernEnvVars', () => {
    it('reports missing MERN env vars', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('JWT_SECRET=abc\nSOME_OTHER=val');

      const issues = PostGenerationValidator.validateMernEnvVars('/test/monorepo');

      expect(issues.length).toBe(1);
      expect(issues[0]).toMatchObject({
        type: 'warning',
        category: 'stackMismatch',
      });
      expect(issues[0].message).toContain('MONGO_URI');
    });

    it('reports no issues when all MERN env vars present', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(
        'MONGO_URI=mongodb://localhost\nMONGO_USE_TRANSACTIONS=true\nDEV_DATABASE=test',
      );

      const issues = PostGenerationValidator.validateMernEnvVars('/test/monorepo');

      expect(issues).toEqual([]);
    });

    it('returns no issues when .env.example does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const issues = PostGenerationValidator.validateMernEnvVars('/test/monorepo');

      expect(issues).toEqual([]);
    });
  });
});
