import * as path from 'path';

interface IEsmTransformer {
  process(
    sourceText: string,
    sourcePath: string,
  ): { code: string; map: unknown };
  getCacheKey(sourceText: string, sourcePath: string): string;
}

const transformer: IEsmTransformer = require(
  path.resolve(__dirname, '../../scaffolding/react/src/esm-js-transformer.js'),
);

const sourcePath = '/node_modules/react-router/dist/index.js';

describe('esm-js-transformer', () => {
  it('rewrites import.meta.hot to undefined and emits CommonJS', () => {
    const { code } = transformer.process(
      'import { a } from "./a";\nexport const hot = import.meta.hot;\n',
      sourcePath,
    );
    expect(code).not.toContain('import.meta');
    expect(code).toContain('exports.hot = void 0');
    expect(code).toContain('require("./a")');
  });

  it('does not rewrite other import.meta members', () => {
    const { code } = transformer.process(
      'export const url = import.meta.url;\n',
      sourcePath,
    );
    expect(code).toContain('import.meta.url');
  });

  it('versions the cache key', () => {
    expect(transformer.getCacheKey('x', sourcePath)).toContain(
      'esm-js-transformer:v3',
    );
  });
});
