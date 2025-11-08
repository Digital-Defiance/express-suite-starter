import { PostGenerationValidator } from '../../src/core/validators/post-generation-validator';
import { GeneratorContext } from '../../src/core/interfaces';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('../../src/cli/logger');

describe('Validation Integration', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates complete generated project', async () => {
    const context: GeneratorContext = {
      config: {},
      state: new Map([['monorepoPath', '/test/monorepo']]),
      dryRun: false,
      checkpointPath: '/tmp/checkpoint.json',
    };

    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({
      name: 'test-monorepo',
      version: '1.0.0',
      scripts: {
        build: 'nx build',
        test: 'nx test',
      },
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
      devDependencies: {
        '@types/react': '^19.0.0',
      },
    }));

    const report = await PostGenerationValidator.validate(context);

    expect(report.passed).toBe(true);
    expect(report.summary.errors).toBe(0);
  });

  it('detects missing critical files', async () => {
    const context: GeneratorContext = {
      config: {},
      state: new Map([['monorepoPath', '/test/monorepo']]),
      dryRun: false,
      checkpointPath: '/tmp/checkpoint.json',
    };

    mockFs.existsSync.mockReturnValue(false);

    const report = await PostGenerationValidator.validate(context);

    expect(report.passed).toBe(false);
    expect(report.summary.errors).toBeGreaterThan(0);
    expect(report.issues).toContainEqual(
      expect.objectContaining({
        type: 'error',
        message: 'package.json not found',
      })
    );
  });

  it('provides actionable fix suggestions', async () => {
    const context: GeneratorContext = {
      config: {},
      state: new Map([['monorepoPath', '/test/monorepo']]),
      dryRun: false,
      checkpointPath: '/tmp/checkpoint.json',
    };

    mockFs.existsSync.mockImplementation((p) => {
      return p.toString().includes('package.json');
    });

    mockFs.readFileSync.mockReturnValue(JSON.stringify({
      name: 'test',
      version: '1.0.0',
      dependencies: {
        react: '^19.0.0',
      },
    }));

    const report = await PostGenerationValidator.validate(context);

    const missingReactDom = report.issues.find(i => 
      i.message.includes('react-dom')
    );

    expect(missingReactDom).toBeDefined();
    expect(missingReactDom?.fix).toBeDefined();
    expect(missingReactDom?.fix).toContain('yarn add');
  });

  it('categorizes issues correctly', async () => {
    const context: GeneratorContext = {
      config: {},
      state: new Map([['monorepoPath', '/test/monorepo']]),
      dryRun: false,
      checkpointPath: '/tmp/checkpoint.json',
    };

    mockFs.existsSync.mockImplementation((p) => {
      return p.toString().includes('package.json');
    });

    mockFs.readFileSync.mockReturnValue(JSON.stringify({
      name: 'test',
      version: '1.0.0',
      dependencies: {
        react: '^19.0.0',
        '@types/react': '^18.0.0',
      },
    }));

    const report = await PostGenerationValidator.validate(context);

    const categories = new Set(report.issues.map(i => i.category));
    expect(categories.has('dependency')).toBe(true);
    expect(categories.has('bestPractice')).toBe(true);
  });
});
