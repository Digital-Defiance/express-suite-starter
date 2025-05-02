import { ProjectConfig } from './interfaces';

export class ProjectConfigBuilder {
  static build(
    prefix: string,
    namespace: string,
    options: {
      includeReactLib?: boolean;
      includeApiLib?: boolean;
      includeE2e?: boolean;
      includeInitUserDb?: boolean;
      includeTestUtils?: boolean;
    } = {}
  ): ProjectConfig[] {
    const projects: ProjectConfig[] = [];

    // Core projects (always included)
    projects.push({
      type: 'lib',
      name: `${prefix}-lib`,
      importPath: `${namespace}/lib`,
      enabled: true,
    });

    projects.push({
      type: 'react',
      name: `${prefix}-react`,
      importPath: `${namespace}/react`,
      enabled: true,
    });

    projects.push({
      type: 'api',
      name: `${prefix}-api`,
      importPath: `${namespace}/api`,
      enabled: true,
    });

    // Optional projects
    if (options.includeReactLib) {
      projects.push({
        type: 'react-lib',
        name: `${prefix}-react-lib`,
        importPath: `${namespace}/react-lib`,
        enabled: true,
      });
    }

    if (options.includeApiLib) {
      projects.push({
        type: 'api-lib',
        name: `${prefix}-api-lib`,
        importPath: `${namespace}/api-lib`,
        enabled: true,
      });
    }

    if (options.includeE2e) {
      projects.push({
        type: 'e2e',
        name: `${prefix}-api-e2e`,
        importPath: `${namespace}/api-e2e`,
        enabled: true,
      });

      projects.push({
        type: 'e2e',
        name: `${prefix}-react-e2e`,
        importPath: `${namespace}/react-e2e`,
        enabled: true,
      });
    }

    if (options.includeInitUserDb) {
      projects.push({
        type: 'inituserdb',
        name: `${prefix}-inituserdb`,
        importPath: `${namespace}/inituserdb`,
        enabled: true,
      });
    }

    if (options.includeTestUtils) {
      projects.push({
        type: 'test-utils',
        name: `${prefix}-test-utils`,
        importPath: `${namespace}/test-utils`,
        enabled: true,
      });
    }

    return projects;
  }
}
