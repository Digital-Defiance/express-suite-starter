import * as fs from 'fs';
import * as path from 'path';
import { getPackageRange } from '../../src/utils/package-range';

interface IPreset {
  node: { version: string; yarnVersion: string };
  packages: { dev: string[]; prod: string[] };
}

const presetsDir = path.resolve(__dirname, '../../config/presets');

function loadPreset(name: string): IPreset {
  return JSON.parse(
    fs.readFileSync(path.join(presetsDir, `${name}.json`), 'utf-8'),
  ) as IPreset;
}

describe('presets', () => {
  describe('standard (MERN)', () => {
    const preset = loadPreset('standard');

    it.each([
      ['@digitaldefiance/node-express-suite', '^6.0.0'],
      ['@digitaldefiance/node-express-suite-mongo', '^6.0.0'],
      ['@digitaldefiance/ecies-lib', '^5.2.3'],
      ['@digitaldefiance/node-ecies-lib', '^5.2.3'],
      ['@digitaldefiance/i18n-lib', '^4.8.0'],
      ['@digitaldefiance/suite-core-lib', '^5.0.1'],
      ['@digitaldefiance/express-suite-react-components', '^5.1.0'],
      ['@digitaldefiance/mongoose-types', '^8.20.9'],
      ['react', '^19'],
      ['react-dom', '^19'],
      ['react-router', '^8'],
    ])('pins %s to %s', (name, range) => {
      expect(getPackageRange(preset.packages.prod, name, 'unpinned')).toBe(
        range,
      );
    });

    it('pins express-suite-test-utils in dev dependencies', () => {
      expect(
        getPackageRange(
          preset.packages.dev,
          '@digitaldefiance/express-suite-test-utils',
          'unpinned',
        ),
      ).toBe('^1.1.2');
    });

    it('uses react-router instead of react-router-dom', () => {
      const names = preset.packages.prod.map((pkg) =>
        pkg.replace(/(?<=.)@.*$/, ''),
      );
      expect(names).toContain('react-router');
      expect(names).not.toContain('react-router-dom');
    });
  });

  const stripRange = (entry: string): string =>
    entry.replace(/(?<=.)@.*$/, '');

  describe.each(['standard', 'brightstack'])(
    '%s generator-dependent dev entries',
    (name) => {
      const preset = loadPreset(name);
      it.each([
        'prettier',
        '@testing-library/jest-dom',
        '@babel/core',
        '@babel/preset-env',
        'vite-plugin-node-polyfills',
        'eslint-plugin-playwright',
      ])('lists %s', (pkg) => {
        expect(preset.packages.dev.map(stripRange)).toContain(pkg);
      });
    },
  );

  it('standard lists mongodb-memory-server (BrightStack uses BrightDB, not MongoDB)', () => {
    expect(
      loadPreset('standard').packages.dev.map(stripRange),
    ).toContain('mongodb-memory-server');
  });

  describe('brightstack @digitaldefiance pins', () => {
    const standard = loadPreset('standard');
    const brightstack = loadPreset('brightstack');
    const scoped = (entries: string[]): string[] =>
      entries.filter((entry) => entry.startsWith('@digitaldefiance/'));

    it('pins every @digitaldefiance entry', () => {
      const entries = scoped([
        ...brightstack.packages.prod,
        ...brightstack.packages.dev,
      ]);
      expect(entries.length).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(getPackageRange([entry], stripRange(entry), 'unpinned')).toMatch(
          /^\^\d/,
        );
      }
    });

    it('uses the same ranges as standard for shared packages', () => {
      const standardEntries = scoped(standard.packages.prod);
      const shared = scoped(brightstack.packages.prod).filter((entry) =>
        standardEntries.some((s) => stripRange(s) === stripRange(entry)),
      );
      expect(shared.length).toBeGreaterThan(0);
      for (const entry of shared) {
        const name = stripRange(entry);
        expect(getPackageRange(brightstack.packages.prod, name)).toBe(
          getPackageRange(standard.packages.prod, name),
        );
      }
    });
  });

  describe.each(['standard', 'brightstack', 'minimal'])('%s', (name) => {
    it('uses Yarn 4.11.0 and Node 22', () => {
      const preset = loadPreset(name);
      expect(preset.node.yarnVersion).toBe('4.11.0');
      expect(preset.node.version).toBe('22');
    });
  });

  describe('getPackageRange', () => {
    it('reads the range of scoped and unscoped entries', () => {
      const packages = ['@scope/pkg@^1.2.3', 'plain@~2.0.0'];
      expect(getPackageRange(packages, '@scope/pkg')).toBe('^1.2.3');
      expect(getPackageRange(packages, 'plain')).toBe('~2.0.0');
    });

    it('falls back when the package is unpinned or missing', () => {
      expect(getPackageRange(['@scope/pkg'], '@scope/pkg')).toBe('latest');
      expect(getPackageRange(undefined, 'other', '*')).toBe('*');
    });
  });
});
