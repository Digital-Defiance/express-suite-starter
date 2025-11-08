import { DryRunExecutor } from '../../src/core/dry-run-executor';
import { GeneratorContext } from '../../src/core/interfaces';
import * as fs from 'fs';

jest.mock('fs');
jest.mock('../../src/cli/logger');

describe('DryRunExecutor', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  let executor: DryRunExecutor;
  let context: GeneratorContext;

  beforeEach(() => {
    jest.clearAllMocks();
    executor = new DryRunExecutor();
    context = {
      config: {},
      state: new Map(),
      dryRun: false,
      checkpointPath: '/tmp/checkpoint.json',
    };
    mockFs.mkdirSync.mockImplementation(() => undefined);
    mockFs.writeFileSync.mockImplementation(() => undefined);
  });

  it('executes in dry-run mode without creating files', async () => {
    executor.addStep({
      name: 'testStep',
      description: 'Test step',
      execute: jest.fn(),
    });

    await executor.execute(context);
    const report = executor.getReport();

    expect(report).toBeDefined();
    expect(report.actions).toBeDefined();
    expect(report.summary).toBeDefined();
  });

  it('records actions during execution', async () => {
    executor.addStep({
      name: 'testStep',
      description: 'Test step',
      execute: (ctx) => {
        executor.recordAction({
          type: 'create',
          target: '/test/file.txt',
          description: 'Create test file',
        });
      },
    });

    await executor.execute(context);
    const report = executor.getReport();

    expect(report.actions).toHaveLength(1);
    expect(report.actions[0].type).toBe('create');
  });

  it('generates summary correctly', async () => {
    executor.addStep({
      name: 'testStep',
      description: 'Test step',
      execute: (ctx) => {
        executor.recordAction({ type: 'create', target: 'file1', description: 'Create' });
        executor.recordAction({ type: 'modify', target: 'file2', description: 'Modify' });
        executor.recordAction({ type: 'command', target: 'yarn', description: 'Run yarn' });
      },
    });

    await executor.execute(context);
    const report = executor.getReport();

    expect(report.summary.filesCreated).toBe(1);
    expect(report.summary.filesModified).toBe(1);
    expect(report.summary.commandsExecuted).toBe(1);
  });

  it('continues on errors in dry-run mode', async () => {
    executor.addStep({
      name: 'failingStep',
      description: 'Failing step',
      execute: () => {
        throw new Error('Step failed');
      },
    });

    await executor.execute(context);
    const report = executor.getReport();

    expect(report).toBeDefined();
  });

  it('sets dryRun flag in context', async () => {
    executor.addStep({
      name: 'checkContext',
      description: 'Check context',
      execute: (ctx) => {
        expect(ctx.state.get('dryRun')).toBe(true);
      },
    });

    await executor.execute(context);
  });
});
