import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import { Logger } from '../../src/cli/logger';
import {
  formatGeneratedCode,
  hasDependency,
  removeReactRouterDom,
  removeStockE2eExample,
} from '../../src/utils/generated-workspace';

jest.mock('child_process');
jest.mock('../../src/cli/logger');

const mockExecSync = jest.mocked(execSync);
const PRETTIER_COMMAND = "yarn prettier --write '**/*.{ts,tsx}'";

describe('generated-workspace', () => {
  let workspace: string;

  function writePackageJson(contents: object): void {
    fs.writeFileSync(
      path.join(workspace, 'package.json'),
      JSON.stringify(contents),
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'generated-ws-'));
  });

  afterEach(() => {
    fs.rmSync(workspace, { recursive: true, force: true });
  });

  describe('hasDependency', () => {
    it('finds packages in dependencies and devDependencies', () => {
      const pkg = { dependencies: { a: '1' }, devDependencies: { b: '2' } };
      expect(hasDependency(pkg, 'a')).toBe(true);
      expect(hasDependency(pkg, 'b')).toBe(true);
      expect(hasDependency(pkg, 'c')).toBe(false);
      expect(hasDependency(undefined, 'a')).toBe(false);
    });
  });

  describe('removeReactRouterDom', () => {
    it('removes react-router-dom when it is a dependency', () => {
      writePackageJson({
        dependencies: { 'react-router': '^8', 'react-router-dom': '6.30.3' },
      });
      removeReactRouterDom(workspace, false);
      expect(mockExecSync).toHaveBeenCalledWith(
        'yarn remove react-router-dom',
        expect.objectContaining({ cwd: workspace }),
      );
    });

    it('leaves a package.json without react-router-dom', () => {
      writePackageJson({
        dependencies: { 'react-router': '^8', 'react-router-dom': '6.30.3' },
        devDependencies: { 'react-router-dom': '6.30.3' },
      });
      // Stand in for `yarn remove`, which edits package.json in the workspace.
      mockExecSync.mockImplementationOnce((command, options) => {
        expect(command).toBe('yarn remove react-router-dom');
        const cwd = String(options?.cwd);
        const file = path.join(cwd, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<
          string,
          Record<string, string>
        >;
        delete pkg['dependencies']['react-router-dom'];
        delete pkg['devDependencies']['react-router-dom'];
        fs.writeFileSync(file, JSON.stringify(pkg));
        return Buffer.from('');
      });
      removeReactRouterDom(workspace, false);
      const result = fs.readFileSync(
        path.join(workspace, 'package.json'),
        'utf-8',
      );
      expect(result).not.toContain('react-router-dom');
      expect(result).toContain('"react-router"');
    });

    it('removes react-router-dom when it is a devDependency', () => {
      writePackageJson({ devDependencies: { 'react-router-dom': '6.30.3' } });
      removeReactRouterDom(workspace, false);
      expect(mockExecSync).toHaveBeenCalledTimes(1);
    });

    it('does nothing when react-router-dom is absent', () => {
      writePackageJson({ dependencies: { 'react-router': '^8' } });
      removeReactRouterDom(workspace, false);
      expect(mockExecSync).not.toHaveBeenCalled();
    });

    it('does nothing when there is no package.json', () => {
      removeReactRouterDom(workspace, true);
      expect(mockExecSync).not.toHaveBeenCalled();
    });
  });

  describe('formatGeneratedCode', () => {
    it('runs prettier when it is a devDependency', () => {
      writePackageJson({ devDependencies: { prettier: '^3' } });
      formatGeneratedCode(workspace, false);
      expect(mockExecSync).toHaveBeenCalledWith(
        PRETTIER_COMMAND,
        expect.objectContaining({ cwd: workspace }),
      );
    });

    it('skips with a log message when prettier is not in the workspace', () => {
      writePackageJson({ devDependencies: { eslint: '^9' } });
      formatGeneratedCode(workspace, false);
      expect(mockExecSync).not.toHaveBeenCalled();
      expect(Logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Skipping Prettier'),
      );
    });

    it('fails when prettier is present and formatting fails', () => {
      writePackageJson({ devDependencies: { prettier: '^3' } });
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('prettier syntax error');
      });
      expect(() => formatGeneratedCode(workspace, false)).toThrow(
        'prettier syntax error',
      );
    });

    it('does not execute prettier in a dry run', () => {
      formatGeneratedCode(workspace, true);
      expect(mockExecSync).not.toHaveBeenCalled();
    });
  });

  describe('removeStockE2eExample', () => {
    function writeExample(): string {
      const dir = path.join(workspace, 'app-react-e2e', 'src');
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, 'example.spec.ts');
      fs.writeFileSync(file, "test('has title', () => {});");
      return file;
    }
    it('deletes the stock example spec', () => {
      const file = writeExample();
      expect(removeStockE2eExample(workspace, 'app-react-e2e', false)).toBe(
        true,
      );
      expect(fs.existsSync(file)).toBe(false);
    });
    it('keeps other specs in the project', () => {
      writeExample();
      const other = path.join(workspace, 'app-react-e2e', 'src', 'x.spec.ts');
      fs.writeFileSync(other, '');
      removeStockE2eExample(workspace, 'app-react-e2e', false);
      expect(fs.existsSync(other)).toBe(true);
    });
    it('does nothing when the example is absent or there is no react e2e project', () => {
      expect(removeStockE2eExample(workspace, 'app-react-e2e', false)).toBe(
        false,
      );
      expect(removeStockE2eExample(workspace, '', false)).toBe(false);
    });
    it('leaves the file in a dry run', () => {
      const file = writeExample();
      expect(removeStockE2eExample(workspace, 'app-react-e2e', true)).toBe(
        false,
      );
      expect(fs.existsSync(file)).toBe(true);
    });
  });
});
