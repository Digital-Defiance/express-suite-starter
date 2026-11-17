import type { ProjectConfig } from '../core/interfaces/project-config.interface';

/** The project name suffixes that identify the two generated e2e projects. */
const API_E2E_SUFFIX = '-api-e2e';
const REACT_E2E_SUFFIX = '-react-e2e';

/** Project types whose scaffolding directory is suffixed with the stack type. */
const STACK_DEPENDENT_TYPES: readonly string[] = [
  'api',
  'api-lib',
  'inituserdb',
];

/** The names of the generated projects that the e2e scripts and scaffolding refer to. */
export interface IE2eProjectNames {
  apiName: string;
  reactName: string;
  apiE2eName: string;
  reactE2eName: string;
}

function findName(
  projects: readonly ProjectConfig[],
  predicate: (project: ProjectConfig) => boolean,
): string {
  return projects.find((p) => p.enabled && predicate(p))?.name ?? '';
}

/** Resolve the api, react and e2e project names from the generated project list ( when a project is not generated). */
export function getE2eProjectNames(
  projects: readonly ProjectConfig[],
): IE2eProjectNames {
  return {
    apiName: findName(projects, (p) => p.type === 'api'),
    reactName: findName(projects, (p) => p.type === 'react'),
    apiE2eName: findName(
      projects,
      (p) => p.type === 'e2e' && p.name.endsWith(API_E2E_SUFFIX),
    ),
    reactE2eName: findName(
      projects,
      (p) => p.type === 'e2e' && p.name.endsWith(REACT_E2E_SUFFIX),
    ),
  };
}

/**
 * Build the e2e related package.json scripts of a generated workspace.
 *
 * - `test:e2e` runs the API e2e project through Nx (its own server, in-memory DB).
 * - `test:e2e:web` builds the API and React projects, then runs Playwright
 *   directly. Playwright is invoked without the Nx plugin because the generator
 *   removes the Nx Playwright target on purpose. Extra arguments pass through
 *   (`yarn test:e2e:web --project=firefox`).
 * - `test:all` runs the unit tests and every e2e script that exists.
 */
export function buildE2eScripts(
  projects: readonly ProjectConfig[],
): Record<string, string> {
  const { apiName, reactName, apiE2eName, reactE2eName } =
    getE2eProjectNames(projects);
  const scripts: Record<string, string> = {};
  const allSteps = ['yarn test:jest'];
  if (apiE2eName) {
    scripts['test:e2e'] = `NODE_ENV=development npx nx e2e ${apiE2eName}`;
    allSteps.push('yarn test:e2e');
  }
  if (reactE2eName && apiName && reactName) {
    scripts['test:e2e:web'] =
      `npx nx run-many -t post-build,build -p ${apiName},${reactName} && npx playwright test -c ${reactE2eName}/playwright.config.mts`;
    allSteps.push('yarn test:e2e:web');
  }
  scripts['test:all'] = allSteps.join(' && ');
  return scripts;
}

/**
 * Name of the scaffolding directory that supplies a project's files.
 *
 * Stack dependent projects use a suffixed directory (api-mern, api-lib-brightstack, ...).
 * The api and react e2e projects have their own scaffolding (api-e2e, react-e2e).
 * Everything else uses its project type.
 */
export function resolveScaffoldingDirName(
  project: ProjectConfig,
  stackType: string,
): string {
  if (STACK_DEPENDENT_TYPES.includes(project.type)) {
    return `${project.type}-${stackType}`;
  }
  if (project.type === 'e2e') {
    if (project.name.endsWith(API_E2E_SUFFIX)) {
      return 'api-e2e';
    }
    if (project.name.endsWith(REACT_E2E_SUFFIX)) {
      return 'react-e2e';
    }
  }
  return project.type;
}
