import { runCommand, setPerms } from '../../src/utils/shell-utils';
import { execSync } from 'child_process';
import * as fs from 'fs';

jest.mock('child_process');
jest.mock('fs');
jest.mock('../../src/cli/logger');

describe('shell-utils', () => {
  const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('runCommand', () => {
    it('executes command with inherit stdio by default', () => {
      runCommand('yarn install');

      expect(mockExecSync).toHaveBeenCalledWith(
        'yarn install',
        expect.objectContaining({ stdio: 'inherit' })
      );
    });

    it('executes command in specified directory', () => {
      runCommand('yarn install', { cwd: '/test/path' });

      expect(mockExecSync).toHaveBeenCalledWith(
        'yarn install',
        expect.objectContaining({ cwd: '/test/path' })
      );
    });

    it('executes command silently when silent option is true', () => {
      runCommand('yarn install', { silent: true });

      expect(mockExecSync).toHaveBeenCalledWith(
        'yarn install',
        expect.objectContaining({ stdio: 'pipe' })
      );
    });

    it('throws error when command fails', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      expect(() => runCommand('invalid-command')).toThrow();
    });
  });

  describe('setPerms', () => {
    it('sets executable permissions for shell scripts', () => {
      setPerms('/path/to/script.sh');

      expect(mockFs.chmodSync).toHaveBeenCalledWith('/path/to/script.sh', 0o755);
    });

    it('does not set permissions for non-shell files', () => {
      setPerms('/path/to/file.txt');

      expect(mockFs.chmodSync).not.toHaveBeenCalled();
    });
  });
});
