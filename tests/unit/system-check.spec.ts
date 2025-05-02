import { SystemCheck } from '../../src/utils/system-check';
import { execSync } from 'child_process';
import { withConsoleMocks } from '@digitaldefiance/express-suite-test-utils';

jest.mock('child_process');

describe('SystemCheck', () => {
  const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes when all tools are available', () => {
    withConsoleMocks({ mute: true }, () => {
      mockExecSync.mockReturnValue(Buffer.from(''));

      const result = SystemCheck.check();

      expect(result.passed).toBe(true);
      expect(result.missing).toHaveLength(0);
    });
  });

  it('detects missing C++ compiler', () => {
    withConsoleMocks({ mute: true }, () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('g++') || cmd.toString().includes('clang++')) {
          throw new Error('not found');
        }
        return Buffer.from('');
      });

      const result = SystemCheck.check();

      expect(result.passed).toBe(false);
      expect(result.missing).toContain('C++ compiler (g++ or clang++)');
    });
  });

  it('detects missing Python', () => {
    withConsoleMocks({ mute: true }, () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('python')) {
          throw new Error('not found');
        }
        return Buffer.from('');
      });

      const result = SystemCheck.check();

      expect(result.passed).toBe(false);
      expect(result.missing).toContain('Python 3');
    });
  });

  it('detects missing make', () => {
    withConsoleMocks({ mute: true }, () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('make')) {
          throw new Error('not found');
        }
        return Buffer.from('');
      });

      const result = SystemCheck.check();

      expect(result.passed).toBe(false);
      expect(result.missing).toContain('make');
    });
  });

  it('warns about missing git', () => {
    withConsoleMocks({ mute: true }, () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('git')) {
          throw new Error('not found');
        }
        return Buffer.from('');
      });

      const result = SystemCheck.check();

      expect(result.passed).toBe(true);
      expect(result.warnings).toContain('git (required for version control)');
    });
  });

  it('detects multiple missing tools', () => {
    withConsoleMocks({ mute: true }, () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('not found');
      });

      const result = SystemCheck.check();

      expect(result.passed).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
    });
  });

  it('prints report with missing tools', () => {
    withConsoleMocks({ mute: true }, () => {
      const result = {
        passed: false,
        missing: ['C++ compiler', 'Python 3'],
        warnings: [],
      };

      expect(() => SystemCheck.printReport(result)).not.toThrow();
    })
  });

  it('prints report with warnings', () => {
    withConsoleMocks({ mute: true }, () => {
      const result = {
        passed: true,
        missing: [],
        warnings: ['git'],
      };

      expect(() => SystemCheck.printReport(result)).not.toThrow();
    });
  });

  it('prints report when all pass', () => {
    withConsoleMocks({ mute: true }, () => {
      const result = {
        passed: true,
        missing: [],
        warnings: [],
      };

      expect(() => SystemCheck.printReport(result)).not.toThrow();
    });
  });
});
