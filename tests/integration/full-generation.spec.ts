import { StepExecutor } from '../../src/core/step-executor';
import { ProjectConfigBuilder } from '../../src/core/project-config-builder';
import { GeneratorContext } from '../../src/core/interfaces';
import * as fs from 'fs';

jest.mock('fs');
jest.mock('../../src/utils/shell-utils');
jest.mock('../../src/cli/logger');

describe('Full Generation Flow', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockImplementation(() => undefined);
    mockFs.writeFileSync.mockImplementation(() => undefined);
  });

  it('generates minimal monorepo', async () => {
    const executor = new StepExecutor();
    const context: GeneratorContext = {
      config: {
        workspace: {
          name: 'test-app',
          prefix: 'test',
          namespace: '@test',
          parentDir: '/tmp',
        },
      },
      state: new Map([['monorepoPath', '/tmp/test-app']]),
      checkpointPath: '/tmp/.test-app.checkpoint',
    };

    executor.addStep({
      name: 'checkTargetDir',
      description: 'Check target directory',
      execute: () => {
        if (mockFs.existsSync(context.state.get('monorepoPath'))) {
          throw new Error('Directory exists');
        }
      },
    });

    await executor.execute(context);

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      context.checkpointPath,
      expect.any(String),
      'utf-8'
    );
  });

  it('builds project configuration with all options', () => {
    const projects = ProjectConfigBuilder.build('test', '@test', {
      includeReactLib: true,
      includeApiLib: true,
      includeE2e: true,
      includeInitUserDb: true,
      includeTestUtils: true,
    });

    expect(projects.length).toBeGreaterThan(3);
    expect(projects.find(p => p.type === 'react-lib')).toBeDefined();
    expect(projects.find(p => p.type === 'api-lib')).toBeDefined();
  });

  it('resumes from checkpoint', async () => {
    const executor = new StepExecutor();
    const checkpoint = {
      executedSteps: ['step1'],
      state: [['key', 'value']],
      timestamp: new Date().toISOString(),
    };

    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(checkpoint));

    const restored = await executor.restoreCheckpoint('/tmp/checkpoint.json');

    expect(restored.executedSteps).toContain('step1');
    expect(restored.state.get('key')).toBe('value');
  });

  it('handles step failure gracefully', async () => {
    const executor = new StepExecutor();
    const context: GeneratorContext = {
      config: {},
      state: new Map(),
      checkpointPath: '/tmp/checkpoint.json',
    };

    executor.addStep({
      name: 'failingStep',
      description: 'Failing step',
      execute: () => {
        throw new Error('Step failed');
      },
    });

    await expect(executor.execute(context)).rejects.toThrow('Step failed');
  });
});
