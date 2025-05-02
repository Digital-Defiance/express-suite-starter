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
      checkpointPath: '/tmp/checkpoint.json',
    };
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
});
