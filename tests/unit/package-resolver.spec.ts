import { PackageResolver } from '../../src/core/package-resolver';
import { withConsoleMocks } from '@digitaldefiance/express-suite-test-utils';

jest.mock('child_process');

describe('PackageResolver', () => {
  const mockExecSync = require('child_process').execSync;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resolveVersion', () => {
    it('returns version spec if not latest or stable', async () => {
      const result = await PackageResolver.resolveVersion('react', '^19.0.0');
      expect(result).toBe('^19.0.0');
    });

    it('resolves latest version', async () => {
      mockExecSync.mockReturnValue('19.0.0\n');
      
      const result = await PackageResolver.resolveVersion('react', 'latest');
      
      expect(result).toBe('^19.0.0');
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm view react version',
        expect.any(Object)
      );
    });

    it('resolves stable version', async () => {
      mockExecSync.mockReturnValue('19.0.0\n');
      
      const result = await PackageResolver.resolveVersion('react', 'stable');
      
      expect(result).toBe('^19.0.0');
    });

    it('falls back to latest on error', async () => {
      withConsoleMocks({mute: true }, async () => {
        mockExecSync.mockImplementation(() => {
          throw new Error('Network error');
        });
        
        const result = await PackageResolver.resolveVersion('react', 'latest');
        
        expect(result).toBe('latest');
        expect(console.log).toHaveBeenCalled();
      });
      });
  });

  describe('resolvePackages', () => {
    it('resolves multiple packages', async () => {
      mockExecSync.mockReturnValue('19.0.0\n');
      
      const result = await PackageResolver.resolvePackages([
        'react@latest',
        'express@^5.0.0',
      ]);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'react',
        version: 'latest',
        resolved: '^19.0.0',
      });
      expect(result[1]).toEqual({
        name: 'express',
        version: '^5.0.0',
        resolved: '^5.0.0',
      });
    });

    it('handles packages without version spec', async () => {
      mockExecSync.mockReturnValue('19.0.0\n');
      
      const result = await PackageResolver.resolvePackages(['react']);
      
      expect(result[0].version).toBe('latest');
    });
  });

  describe('formatPackageList', () => {
    it('formats resolutions as package strings', () => {
      const resolutions = [
        { name: 'react', version: 'latest', resolved: '^19.0.0' },
        { name: 'express', version: '^5.0.0', resolved: '^5.0.0' },
      ];
      
      const result = PackageResolver.formatPackageList(resolutions);
      
      expect(result).toEqual(['react@^19.0.0', 'express@^5.0.0']);
    });
  });
});
