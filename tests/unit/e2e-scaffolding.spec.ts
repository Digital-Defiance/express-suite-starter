import * as fs from 'fs';
import * as path from 'path';

const SCAFFOLDING = path.resolve(__dirname, '../../scaffolding');

function read(relativePath: string): string {
  return fs.readFileSync(path.join(SCAFFOLDING, relativePath), 'utf-8');
}

/** All .ts and .mts files (also with a .mustache suffix) below a directory. */
function listSources(dir: string): string[] {
  const result: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...listSources(full));
    } else if (/\.m?ts(\.mustache)?$/.test(entry.name)) {
      result.push(full);
    }
  }
  return result;
}

describe('e2e scaffolding', () => {
  describe('health route', () => {
    it('is identical in the MERN and BrightStack api-lib scaffolding', () => {
      expect(read('api-lib-mern/src/lib/routers/health.ts')).toBe(
        read('api-lib-brightstack/src/lib/routers/health.ts'),
      );
    });

    it.each(['api-lib-mern', 'api-lib-brightstack'])(
      'is registered through registerHealthRoute in %s',
      (dir) => {
        const application = read(`${dir}/src/lib/application.ts`);
        expect(application).toContain('registerHealthRoute(apiRouter.router)');
        expect(application).not.toMatch(/router\.get\(\s*'\/health'/);
      },
    );
  });

  describe('shared e2e helpers', () => {
    it('keeps auth.ts identical in api-e2e and react-e2e', () => {
      expect(read('api-e2e/src/support/auth.ts.mustache')).toBe(
        read('react-e2e/src/support/auth.ts.mustache'),
      );
    });

    it('keeps the shared part of e2e-env in api-e2e and react-e2e in sync', () => {
      const strip = (source: string): string =>
        source
          .split('\n')
          .filter((line) => !line.includes('e2e-env.ts'))
          .join('\n');
      const api = strip(read('api-e2e/src/support/e2e-env.ts.mustache'));
      const react = strip(read('react-e2e/src/support/e2e-env.ts.mustache'));
      expect(react.startsWith(api.trimEnd())).toBe(true);
    });
  });

  describe('scaffolding sources', () => {
    const sources = [
      ...listSources(path.join(SCAFFOLDING, 'api-e2e')),
      ...listSources(path.join(SCAFFOLDING, 'react-e2e')),
    ];

    it('finds the e2e sources', () => {
      expect(sources.length).toBeGreaterThanOrEqual(10);
    });

    it.each(sources.map((file) => [path.relative(SCAFFOLDING, file), file]))(
      '%s has no any, as never or unexplained eslint-disable',
      (_name, file) => {
        const lines = fs.readFileSync(file, 'utf-8').split('\n');
        lines.forEach((line, index) => {
          expect(line).not.toMatch(/:\s*any\b|<any>|\bas any\b|\bas never\b/);
          if (line.includes('eslint-disable')) {
            // A disable needs a justification after `--` on the same line.
            expect({ line: index + 1, text: line }).toEqual({
              line: index + 1,
              text: expect.stringMatching(/eslint-disable.*--\s*\S+/),
            });
          }
        });
      },
    );

    it('has no skipped tests', () => {
      for (const file of sources) {
        expect(fs.readFileSync(file, 'utf-8')).not.toMatch(
          /\b(test|it|describe)\.skip\b|\bxit\(|\bxdescribe\(/,
        );
      }
    });
  });

  describe('api-e2e project.json', () => {
    it('depends on post-build, not the continuous serve task', () => {
      const project = read('api-e2e/project.json.mustache');
      expect(project).toContain('"dependsOn": ["{{apiName}}:post-build"]');
      expect(project).not.toContain(':serve');
    });
  });
});
