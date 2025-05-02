import { DryRunExecutor } from '../../src/core/dry-run-executor';

jest.mock('../../src/cli/logger');

describe('DryRunExecutor.printReport', () => {
  it('prints report with actions', () => {
    const report = {
      actions: [
        { type: 'create' as const, target: 'file.txt', description: 'Create file' },
        { type: 'modify' as const, target: 'other.txt', description: 'Modify file' },
        { type: 'delete' as const, target: 'old.txt', description: 'Delete file' },
        { type: 'command' as const, target: 'yarn', description: 'Run yarn' },
      ],
      summary: {
        filesCreated: 1,
        filesModified: 1,
        filesDeleted: 1,
        commandsExecuted: 1,
      },
    };

    expect(() => DryRunExecutor.printReport(report)).not.toThrow();
  });

  it('prints report with no actions', () => {
    const report = {
      actions: [],
      summary: {
        filesCreated: 0,
        filesModified: 0,
        filesDeleted: 0,
        commandsExecuted: 0,
      },
    };

    expect(() => DryRunExecutor.printReport(report)).not.toThrow();
  });
});
