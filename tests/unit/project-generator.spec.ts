import { ProjectGenerator } from '../../src/core/project-generator';
import * as shellUtils from '../../src/utils/shell-utils';

jest.mock('../../src/utils/shell-utils');

describe('ProjectGenerator', () => {
  const mockRunCommand = shellUtils.runCommand as jest.MockedFunction<
    typeof shellUtils.runCommand
  >;
  const monorepoPath = '/test/path';
  const nx = {
    style: 'scss',
    bundler: 'vite',
    linter: 'eslint',
    unitTestRunner: 'jest',
    e2eTestRunner: 'playwright',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReact', () => {
    it('generates React application with correct parameters', () => {
      const config = {
        type: 'react' as const,
        name: 'my-react',
        importPath: '@test/react',
        enabled: true,
      };

      ProjectGenerator.generateReact(config, monorepoPath, nx);

      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('npx nx g @nx/react:application my-react'),
        { cwd: monorepoPath, dryRun: false, env: { NX_DAEMON: 'false' } },
      );
      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('--style=scss'),
        expect.anything(),
      );
      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('--routing=true'),
        expect.anything(),
      );
    });
  });

  describe('generateReactLib', () => {
    it('generates React library with correct parameters', () => {
      const config = {
        type: 'react-lib' as const,
        name: 'my-react-lib',
        importPath: '@test/react-lib',
        enabled: true,
      };

      ProjectGenerator.generateReactLib(config, monorepoPath, nx);

      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('npx nx g @nx/react:library my-react-lib'),
        { cwd: monorepoPath, dryRun: false, env: { NX_DAEMON: 'false' } },
      );
      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('--importPath=@test/react-lib'),
        expect.anything(),
      );
    });
  });

  describe('generateApi', () => {
    it('generates API application with Express framework', () => {
      const config = {
        type: 'api' as const,
        name: 'my-api',
        importPath: '@test/api',
        enabled: true,
      };

      ProjectGenerator.generateApi(config, monorepoPath, nx);

      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('npx nx g @nx/node:application my-api'),
        { cwd: monorepoPath, dryRun: false, env: { NX_DAEMON: 'false' } },
      );
      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('--framework=express'),
        expect.anything(),
      );
    });
  });

  describe('generateApiLib', () => {
    it('generates API library with no bundler', () => {
      const config = {
        type: 'api-lib' as const,
        name: 'my-api-lib',
        importPath: '@test/api-lib',
        enabled: true,
      };

      ProjectGenerator.generateApiLib(config, monorepoPath, nx);

      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('npx nx g @nx/js:lib my-api-lib'),
        { cwd: monorepoPath, dryRun: false, env: { NX_DAEMON: 'false' } },
      );
      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('--bundler=none'),
        expect.anything(),
      );
    });
  });

  describe('generateLib', () => {
    it('generates shared library', () => {
      const config = {
        type: 'lib' as const,
        name: 'my-lib',
        importPath: '@test/lib',
        enabled: true,
      };

      ProjectGenerator.generateLib(config, monorepoPath, nx);

      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('npx nx g @nx/js:lib my-lib'),
        { cwd: monorepoPath, dryRun: false, env: { NX_DAEMON: 'false' } },
      );
    });
  });

  describe('generateInitUserDb', () => {
    it('generates inituserdb with no framework', () => {
      const config = {
        type: 'inituserdb' as const,
        name: 'my-inituserdb',
        importPath: '@test/inituserdb',
        enabled: true,
      };

      ProjectGenerator.generateInitUserDb(config, monorepoPath);

      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('npx nx g @nx/node:application my-inituserdb'),
        { cwd: monorepoPath, dryRun: false, env: { NX_DAEMON: 'false' } },
      );
      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('--framework=none'),
        expect.anything(),
      );
    });
  });

  describe('generateTestUtils', () => {
    it('generates test-utils library', () => {
      const config = {
        type: 'test-utils' as const,
        name: 'my-test-utils',
        importPath: '@test/test-utils',
        enabled: true,
      };

      ProjectGenerator.generateTestUtils(config, monorepoPath, nx);

      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('npx nx g @nx/js:lib my-test-utils'),
        { cwd: monorepoPath, dryRun: false, env: { NX_DAEMON: 'false' } },
      );
    });
  });
});
