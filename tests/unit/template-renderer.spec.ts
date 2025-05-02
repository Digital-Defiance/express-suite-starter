import { renderTemplates, copyDir } from '../../src/utils/template-renderer';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('../../src/templates', () => ({
  createEngine: jest.fn(() => ({
    render: jest.fn((template) => template),
  })),
}));
jest.mock('../../src/utils/shell-utils');
jest.mock('../../src/cli/logger');

describe('template-renderer', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderTemplates', () => {
    it('skips if templates directory does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      renderTemplates('/nonexistent', '/dest', {});

      expect(mockFs.readdirSync).not.toHaveBeenCalled();
    });

    it('renders templates for all subdirectories', () => {
      mockFs.existsSync.mockImplementation((p) => {
        const pathStr = p.toString();
        return pathStr.includes('templates') || pathStr.includes('root');
      });
      
      mockFs.readdirSync.mockReturnValue([
        { name: 'file.txt.mustache', isDirectory: () => false, isFile: () => true },
      ] as any);
      
      mockFs.readFileSync.mockReturnValue('Hello {{name}}');
      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      const variables = {
        name: 'World',
        REACT_APP_NAME: 'my-react',
        API_APP_NAME: 'my-api',
        LIB_NAME: 'my-lib',
      };

      renderTemplates('/templates', '/dest', variables);

      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });

    it('removes .mustache extension from output files', () => {
      mockFs.existsSync.mockImplementation((p) => {
        const pathStr = p.toString();
        return pathStr.includes('templates') || pathStr.includes('root');
      });
      
      mockFs.readdirSync.mockReturnValue([
        { name: 'config.json.mustache', isDirectory: () => false, isFile: () => true },
      ] as any);
      
      mockFs.readFileSync.mockReturnValue('{}');
      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      renderTemplates('/templates', '/dest', {});

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('config.json'),
        expect.anything(),
        'utf8'
      );
    });
  });

  describe('copyDir', () => {
    it('skips if source directory does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      copyDir('/nonexistent', '/dest');

      expect(mockFs.readdirSync).not.toHaveBeenCalled();
    });

    it('copies files recursively', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([
        { name: 'file.txt', isDirectory: () => false, isFile: () => true },
      ] as any);
      
      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.copyFileSync.mockImplementation(() => undefined);

      copyDir('/src', '/dest');

      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        expect.stringContaining('file.txt'),
        expect.stringContaining('file.txt')
      );
    });

    it('creates directories recursively', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValueOnce([
        { name: 'subdir', isDirectory: () => true, isFile: () => false },
      ] as any).mockReturnValueOnce([
        { name: 'file.txt', isDirectory: () => false, isFile: () => true },
      ] as any);
      
      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.copyFileSync.mockImplementation(() => undefined);

      copyDir('/src', '/dest');

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('subdir'),
        { recursive: true }
      );
    });
  });
});
