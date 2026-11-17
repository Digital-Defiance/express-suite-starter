import { ProjectConfigBuilder } from '../../src/core/project-config-builder';
import type { ProjectConfig } from '../../src/core/interfaces/project-config.interface';
import {
  buildE2eScripts,
  getE2eProjectNames,
  resolveScaffoldingDirName,
} from '../../src/utils/generated-scripts';

function buildProjects(includeE2e: boolean): ProjectConfig[] {
  return ProjectConfigBuilder.build('app', '@app', {
    includeReactLib: true,
    includeApiLib: true,
    includeInitUserDb: true,
    includeE2e,
  });
}

describe('generated-scripts', () => {
  describe('getE2eProjectNames', () => {
    it('finds the api, react and both e2e projects', () => {
      expect(getE2eProjectNames(buildProjects(true))).toEqual({
        apiName: 'app-api',
        reactName: 'app-react',
        apiE2eName: 'app-api-e2e',
        reactE2eName: 'app-react-e2e',
      });
    });

    it('returns empty names for projects that are not generated', () => {
      const names = getE2eProjectNames(buildProjects(false));
      expect(names.apiE2eName).toBe('');
      expect(names.reactE2eName).toBe('');
    });
  });

  describe('buildE2eScripts', () => {
    it('builds the api e2e, web e2e and combined scripts', () => {
      const scripts = buildE2eScripts(buildProjects(true));
      expect(scripts['test:e2e']).toBe(
        'NODE_ENV=development npx nx e2e app-api-e2e',
      );
      expect(scripts['test:e2e:web']).toBe(
        'npx nx run-many -t post-build,build -p app-api,app-react && npx playwright test -c app-react-e2e/playwright.config.mts',
      );
      expect(scripts['test:all']).toBe(
        'yarn test:jest && yarn test:e2e && yarn test:e2e:web',
      );
    });

    it('only runs unit tests in test:all without e2e projects', () => {
      const scripts = buildE2eScripts(buildProjects(false));
      expect(scripts).toEqual({ 'test:all': 'yarn test:jest' });
    });

    it('is deterministic for the same projects', () => {
      expect(buildE2eScripts(buildProjects(true))).toEqual(
        buildE2eScripts(buildProjects(true)),
      );
    });
  });

  describe('resolveScaffoldingDirName', () => {
    const byName = (name: string): ProjectConfig => {
      const project = buildProjects(true).find((p) => p.name === name);
      if (!project) {
        throw new Error('no project named ' + name);
      }
      return project;
    };

    it('maps the e2e projects to their own scaffolding', () => {
      expect(resolveScaffoldingDirName(byName('app-api-e2e'), 'mern')).toBe(
        'api-e2e',
      );
      expect(resolveScaffoldingDirName(byName('app-react-e2e'), 'mern')).toBe(
        'react-e2e',
      );
    });

    it('suffixes stack dependent project types with the stack', () => {
      expect(resolveScaffoldingDirName(byName('app-api'), 'brightstack')).toBe(
        'api-brightstack',
      );
      expect(resolveScaffoldingDirName(byName('app-api-lib'), 'mern')).toBe(
        'api-lib-mern',
      );
      expect(
        resolveScaffoldingDirName(byName('app-inituserdb'), 'mern'),
      ).toBe('inituserdb-mern');
    });

    it('uses the project type for everything else', () => {
      expect(resolveScaffoldingDirName(byName('app-react'), 'mern')).toBe(
        'react',
      );
    });
  });
});
