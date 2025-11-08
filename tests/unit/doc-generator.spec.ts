import { DocGenerator } from '../../src/utils/doc-generator';
import { GeneratorContext } from '../../src/core/interfaces';
import * as fs from 'fs';

jest.mock('fs');
jest.mock('../../src/cli/logger');

describe('DocGenerator', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  let context: GeneratorContext;

  beforeEach(() => {
    jest.clearAllMocks();
    context = {
      config: {
        workspace: { name: 'test-project', prefix: 'test', namespace: '@test', parentDir: '/tmp' },
        projects: [
          { type: 'lib', name: 'test-lib', importPath: '@test/lib', enabled: true },
          { type: 'react', name: 'test-react', importPath: '@test/react', enabled: true },
          { type: 'api', name: 'test-api', importPath: '@test/api', enabled: true },
        ],
      },
      state: new Map([['monorepoPath', '/test/monorepo']]),
      dryRun: false,
      checkpointPath: '/tmp/checkpoint.json',
    };
    mockFs.writeFileSync.mockImplementation(() => undefined);
  });

  it('generates README.md', () => {
    DocGenerator.generateProjectDocs(context);

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      '/test/monorepo/README.md',
      expect.stringContaining('# test-project')
    );
  });

  it('generates ARCHITECTURE.md', () => {
    DocGenerator.generateProjectDocs(context);

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      '/test/monorepo/ARCHITECTURE.md',
      expect.stringContaining('# Architecture')
    );
  });

  it('generates API documentation for API project', () => {
    DocGenerator.generateProjectDocs(context);

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      '/test/monorepo/test-api/API.md',
      expect.stringContaining('# API Documentation')
    );
  });

  it('includes all projects in README', () => {
    DocGenerator.generateProjectDocs(context);

    const readmeCall = (mockFs.writeFileSync as jest.Mock).mock.calls.find(
      call => call[0] === '/test/monorepo/README.md'
    );

    expect(readmeCall[1]).toContain('test-lib');
    expect(readmeCall[1]).toContain('test-react');
    expect(readmeCall[1]).toContain('test-api');
  });

  it('skips API docs if no API project', () => {
    context.config.projects = [
      { type: 'lib', name: 'test-lib', importPath: '@test/lib', enabled: true },
    ];

    DocGenerator.generateProjectDocs(context);

    const apiDocCall = (mockFs.writeFileSync as jest.Mock).mock.calls.find(
      call => call[0].includes('API.md')
    );

    expect(apiDocCall).toBeUndefined();
  });
});
