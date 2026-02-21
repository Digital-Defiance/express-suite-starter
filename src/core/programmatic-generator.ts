import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { GeneratorConfig } from './interfaces/generator-config.interface';
import { GeneratorContext } from './interfaces/generator-context.interface';
import { ProjectConfig } from './interfaces/project-config.interface';
import { StepExecutor } from './step-executor';
import { DryRunExecutor } from './dry-run-executor';
import { ConfigValidator } from './validators/config-validator';
import { ProjectGenerator } from './project-generator';
import { Logger } from '../cli/logger';
import { runCommand } from '../utils/shell-utils';
import { renderTemplates, copyDir } from '../utils/template-renderer';
import { obfuscatePassword } from '../../scripts/passwordObfuscator';
import { checkAndUseNode } from '../../scripts/nodeSetup';
import { addScriptsToPackageJson } from '../../scripts/addScriptsToPackageJson';
import { interpolateTemplateStrings } from '../../scripts/templateUtils';
import { LanguageCodes, CommonLanguageCode } from '@digitaldefiance/i18n-lib';
import { TranslatableGenericError } from '@digitaldefiance/i18n-lib';
import {
  getStarterTranslation,
  StarterStringKey,
  StarterComponentId,
} from '../i18n';
import { PostGenerationValidator } from './validators/post-generation-validator';

/**
 * Options for programmatic (headless) monorepo generation.
 * Provides all values that would normally be gathered via interactive prompts.
 */
export interface ProgrammaticOptions {
  /** Fully-formed generator configuration (workspace, projects, packages, etc.) */
  config: GeneratorConfig;
  /** Run in dry-run mode without making filesystem changes */
  dryRun?: boolean;
  /** Hostname for the generated project (defaults to `{workspaceName}.local`) */
  hostname?: string;
  /** Language code for i18n (defaults to EN_US) */
  language?: CommonLanguageCode;
  /** Site metadata */
  siteTitle?: string;
  siteDescription?: string;
  siteTagline?: string;
  /** Whether to include E2E projects */
  includeE2e?: boolean;
  /** Additional package group names to include */
  selectedGroups?: string[];
  /** Devcontainer configuration */
  devcontainer?: {
    type: 'none' | 'simple' | 'mongodb' | 'mongodb-replicaset';
    mongoPassword?: string;
  };
  /** In-memory database configuration */
  inMemoryDb?: {
    enabled: boolean;
    databaseName?: string;
  };
  /** Security secrets (auto-generated if not provided) */
  secrets?: {
    jwtSecret?: string;
    mnemonicEncryptionKey?: string;
    mnemonicHmacSecret?: string;
  };
  /** Whether to create an initial git commit */
  createInitialCommit?: boolean;
  /** Whether to push to remote after commit */
  pushToRemote?: boolean;
  /** Whether to install Playwright browsers */
  installPlaywright?: boolean;
  /** Whether to skip system check */
  skipSystemCheck?: boolean;
}

/**
 * Run the monorepo generator programmatically without interactive prompts.
 * Accepts a fully-formed configuration and executes the same step pipeline
 * as the interactive CLI.
 *
 * @param options - Programmatic generation options
 * @throws Error if configuration validation fails or a step fails
 */
export async function generateMonorepo(
  options: ProgrammaticOptions,
): Promise<void> {
  const {
    config,
    dryRun = false,
    hostname = `${config.workspace.name}.local`,
    language = LanguageCodes.EN_US,
    siteTitle = 'Your Site Title',
    siteDescription = 'Your description here',
    siteTagline = 'Your tagline here',
    includeE2e = true,
    selectedGroups = [],
    devcontainer = { type: 'none' },
    inMemoryDb = { enabled: false },
    secrets = {},
    createInitialCommit = false,
    pushToRemote = false,
    installPlaywright = false,
    skipSystemCheck: _skipSystemCheck = true,
  } = options;

  checkAndUseNode();

  // Disable Yarn build scripts globally to avoid native module issues
  process.env.YARN_ENABLE_SCRIPTS = 'false';

  // Validate configuration
  const validation = ConfigValidator.validate(config);
  if (!validation.valid) {
    throw new Error(
      `Invalid configuration: ${validation.errors.join(', ')}`,
    );
  }

  const { workspace, projects } = config;
  const monorepoPath = path.join(workspace.parentDir, workspace.name);

  // Generate secrets if not provided
  const jwtSecret =
    secrets.jwtSecret ?? crypto.randomBytes(32).toString('hex');
  const mnemonicEncryptionKey =
    secrets.mnemonicEncryptionKey ?? crypto.randomBytes(32).toString('hex');
  const mnemonicHmacSecret =
    secrets.mnemonicHmacSecret ?? crypto.randomBytes(32).toString('hex');

  const devcontainerChoice = devcontainer.type;
  const mongoPassword = devcontainer.mongoPassword ?? '';
  const useInMemoryDb = inMemoryDb.enabled;
  const devDatabaseName = inMemoryDb.databaseName ?? 'test';

  // Merge selected package groups
  const packageGroupsPath = path.resolve(
    __dirname,
    '../../config/package-groups.json',
  );
  if (
    selectedGroups.length > 0 &&
    fs.existsSync(packageGroupsPath)
  ) {
    const packageGroups = JSON.parse(
      fs.readFileSync(packageGroupsPath, 'utf-8'),
    ).groups;
    const additionalPackages: string[] = [];
    selectedGroups.forEach((groupName) => {
      const group = packageGroups.find(
        (g: { name: string; packages: string[] }) => g.name === groupName,
      );
      if (group) {
        additionalPackages.push(...group.packages);
      }
    });

    if (additionalPackages.length > 0 && config.packages) {
      config.packages = {
        ...config.packages,
        dev: [...(config.packages.dev || []), ...additionalPackages],
        prod: config.packages.prod || [],
      };
    }
  }

  // Build state entries (same as interactive flow)
  const stateEntries: [string, string][] = [
    ['monorepoPath', monorepoPath],
    ['templatesDir', path.resolve(__dirname, '../../templates')],
    ['scaffoldingDir', path.resolve(__dirname, '../../scaffolding')],
  ];

  projects.forEach((project) => {
    stateEntries.push([
      project.type === 'lib' ? 'libName' : `${project.type}Name`,
      project.name,
    ]);
  });

  const context: GeneratorContext = {
    config,
    state: new Map<string, string>(stateEntries),
    checkpointPath: path.join(
      workspace.parentDir,
      `.${workspace.name}.checkpoint`,
    ),
    dryRun,
  };

  // Create executor
  const executor = dryRun ? new DryRunExecutor() : new StepExecutor();

  if (dryRun) {
    Logger.warning(
      getStarterTranslation(StarterStringKey.GENERATION_DRY_RUN_MODE),
    );
  }

  // Build the same step pipeline as the interactive CLI
  buildSteps(executor, {
    config,
    context,
    monorepoPath,
    projects,
    workspace,
    hostname,
    language,
    siteTitle,
    siteDescription,
    siteTagline,
    includeE2e,
    devcontainerChoice,
    mongoPassword,
    useInMemoryDb,
    devDatabaseName,
    jwtSecret,
    mnemonicEncryptionKey,
    mnemonicHmacSecret,
    createInitialCommit,
    pushToRemote,
    installPlaywright,
    dryRun,
  });

  // Execute
  await executor.execute(context);
}


/** Internal parameters for step building */
interface StepBuildParams {
  config: GeneratorConfig;
  context: GeneratorContext;
  monorepoPath: string;
  projects: ProjectConfig[];
  workspace: GeneratorConfig['workspace'];
  hostname: string;
  language: CommonLanguageCode;
  siteTitle: string;
  siteDescription: string;
  siteTagline: string;
  includeE2e: boolean;
  devcontainerChoice: string;
  mongoPassword: string;
  useInMemoryDb: boolean;
  devDatabaseName: string;
  jwtSecret: string;
  mnemonicEncryptionKey: string;
  mnemonicHmacSecret: string;
  createInitialCommit: boolean;
  pushToRemote: boolean;
  installPlaywright: boolean;
  dryRun: boolean;
}

/**
 * Builds the step pipeline — same steps as the interactive CLI
 * but without any interactive prompts.
 */
function buildSteps(executor: StepExecutor, params: StepBuildParams): void {
  const {
    config,
    context,
    monorepoPath,
    projects,
    workspace,
    hostname,
    language,
    siteTitle,
    siteDescription,
    siteTagline,
    includeE2e,
    devcontainerChoice,
    mongoPassword,
    useInMemoryDb,
    devDatabaseName,
    jwtSecret,
    mnemonicEncryptionKey,
    mnemonicHmacSecret,
    createInitialCommit,
    pushToRemote,
    installPlaywright,
    dryRun,
  } = params;

  const workspaceName = workspace.name;
  const projectPrefix = workspace.prefix;
  const namespaceRoot = workspace.namespace;
  const parentDir = workspace.parentDir;
  const gitRepo = workspace.gitRepo ?? '';

  executor.addStep({
    name: 'checkTargetDir',
    description: getStarterTranslation(StarterStringKey.STEP_CHECK_TARGET_DIR),
    execute: () => {
      if (
        fs.existsSync(monorepoPath) &&
        fs.readdirSync(monorepoPath).length > 0
      ) {
        throw new TranslatableGenericError(
          StarterComponentId,
          StarterStringKey.ERROR_DIRECTORY_NOT_EMPTY,
          { path: monorepoPath },
        );
      }
    },
  });

  executor.addStep({
    name: 'createMonorepo',
    description: getStarterTranslation(StarterStringKey.STEP_CREATE_MONOREPO),
    execute: (ctx) => {
      runCommand(
        `npx create-nx-workspace@latest "${workspaceName}" --package-manager=yarn --preset=apps --ci=${config.nx?.ciProvider}`,
        { cwd: parentDir, dryRun: ctx.dryRun },
      );
    },
  });

  executor.addStep({
    name: 'updateTsConfigBase',
    description: getStarterTranslation(
      StarterStringKey.STEP_UPDATE_TSCONFIG_BASE,
    ),
    execute: () => {
      const tsconfigBasePath = path.join(monorepoPath, 'tsconfig.base.json');
      if (fs.existsSync(tsconfigBasePath)) {
        const tsconfigBase = JSON.parse(
          fs.readFileSync(tsconfigBasePath, 'utf-8'),
        );
        tsconfigBase.compilerOptions = tsconfigBase.compilerOptions || {};
        tsconfigBase.compilerOptions.esModuleInterop = true;
        tsconfigBase.compilerOptions.allowSyntheticDefaultImports = true;
        tsconfigBase.compilerOptions.allowImportingTsExtensions = true;
        tsconfigBase.compilerOptions.target = 'es2020';
        tsconfigBase.compilerOptions.skipLibCheck = true;
        tsconfigBase.compilerOptions.skipDefaultLibCheck = true;
        tsconfigBase.compilerOptions.noImplicitOverride = false;
        fs.writeFileSync(
          tsconfigBasePath,
          JSON.stringify(tsconfigBase, null, 2) + '\n',
        );
        Logger.info(
          getStarterTranslation(StarterStringKey.TSCONFIG_BASE_UPDATED),
        );
      }
    },
  });

  executor.addStep({
    name: 'setupGitOrigin',
    description: getStarterTranslation(StarterStringKey.STEP_SETUP_GIT_ORIGIN),
    skip: () => !gitRepo,
    execute: () => {
      if (!fs.existsSync(path.join(monorepoPath, '.git'))) {
        runCommand('git init', { cwd: monorepoPath, dryRun: context.dryRun });
      }
      try {
        runCommand(`git remote add origin ${gitRepo}`, {
          cwd: monorepoPath,
          dryRun: context.dryRun,
        });
      } catch (error: unknown) {
        const errorMsg =
          error instanceof Error ? error.message : String(error);
        if (
          errorMsg.includes('remote origin already exists') ||
          (error !== null &&
            typeof error === 'object' &&
            'status' in error &&
            (error as { status: number }).status === 3)
        ) {
          Logger.info('Remote origin already exists, updating URL...');
          runCommand(`git remote set-url origin ${gitRepo}`, {
            cwd: monorepoPath,
            dryRun: context.dryRun,
          });
        } else {
          throw error;
        }
      }
    },
  });

  executor.addStep({
    name: 'yarnBerrySetup',
    description: getStarterTranslation(StarterStringKey.STEP_YARN_BERRY_SETUP),
    execute: () => {
      runCommand('yarn set version berry', {
        cwd: monorepoPath,
        dryRun: context.dryRun,
      });
      runCommand('yarn config set nodeLinker node-modules', {
        cwd: monorepoPath,
        dryRun: context.dryRun,
      });
      runCommand('yarn', { cwd: monorepoPath, dryRun: context.dryRun });
    },
  });

  executor.addStep({
    name: 'addPackageResolutions',
    description: getStarterTranslation(
      StarterStringKey.STEP_ADD_PACKAGE_RESOLUTIONS,
    ),
    execute: () => {
      const packageJsonPath = path.join(monorepoPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf-8'),
        );
        packageJson.resolutions = {
          '@noble/curves': '1.4.2',
          '@noble/hashes': '1.4.0',
          '@scure/bip32': '1.4.0',
          '@scure/bip39': '1.3.0',
        };
        fs.writeFileSync(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2) + '\n',
        );
        Logger.info(
          getStarterTranslation(StarterStringKey.PACKAGE_RESOLUTIONS_ADDED),
        );
      }
    },
  });

  executor.addStep({
    name: 'addNxPlugins',
    description: getStarterTranslation(StarterStringKey.STEP_ADD_NX_PLUGINS),
    execute: () => {
      runCommand('yarn add -D @nx/react @nx/node', {
        cwd: monorepoPath,
        dryRun: context.dryRun,
      });
    },
  });

  executor.addStep({
    name: 'resetNxDaemon',
    description: 'Resetting Nx daemon',
    execute: () => {
      runCommand('npx nx reset', {
        cwd: monorepoPath,
        dryRun: context.dryRun,
      });
    },
  });

  executor.addStep({
    name: 'addYarnPackages',
    description: getStarterTranslation(
      StarterStringKey.STEP_ADD_YARN_PACKAGES,
    ),
    execute: () => {
      const devPkgs = config.packages?.dev || [];
      const prodPkgs = config.packages?.prod || [];
      if (devPkgs.length > 0) {
        runCommand(`yarn add -D ${devPkgs.join(' ')}`, {
          cwd: monorepoPath,
          dryRun: context.dryRun,
        });
      }
      if (prodPkgs.length > 0) {
        runCommand(`yarn add ${prodPkgs.join(' ')}`, {
          cwd: monorepoPath,
          dryRun: context.dryRun,
        });
      }
    },
  });


  executor.addStep({
    name: 'generateProjects',
    description: getStarterTranslation(
      StarterStringKey.STEP_GENERATE_PROJECTS,
    ),
    execute: () => {
      projects.forEach((project) => {
        if (!project.enabled) return;

        Logger.info(
          getStarterTranslation(StarterStringKey.PROJECT_GENERATING, {
            type: project.type,
            name: project.name,
          }),
        );

        switch (project.type) {
          case 'react':
            ProjectGenerator.generateReact(
              project,
              monorepoPath,
              config.nx,
              context.dryRun,
            );
            break;
          case 'react-lib':
            ProjectGenerator.generateReactLib(
              project,
              monorepoPath,
              config.nx,
              context.dryRun,
            );
            break;
          case 'api':
            ProjectGenerator.generateApi(
              project,
              monorepoPath,
              config.nx,
              context.dryRun,
            );
            break;
          case 'api-lib':
            ProjectGenerator.generateApiLib(
              project,
              monorepoPath,
              config.nx,
              context.dryRun,
            );
            break;
          case 'lib':
            ProjectGenerator.generateLib(
              project,
              monorepoPath,
              config.nx,
              context.dryRun,
            );
            break;
          case 'inituserdb':
            ProjectGenerator.generateInitUserDb(
              project,
              monorepoPath,
              context.dryRun,
            );
            break;
        }
      });

      // Configure project.json targets for api and inituserdb
      configureApiProjectJson(projects, monorepoPath);
      configureInitUserDbProjectJson(projects, monorepoPath);
      configureReactProjectJson(projects, monorepoPath);
    },
  });

  executor.addStep({
    name: 'updateTsConfigAppFiles',
    description: 'Updating tsconfig.app.json files with skipLibCheck',
    execute: () => {
      const apiProject = projects.find((p) => p.type === 'api' && p.enabled);
      const initUserDbProject = projects.find(
        (p) => p.type === 'inituserdb' && p.enabled,
      );

      [apiProject, initUserDbProject].forEach((project) => {
        if (project) {
          const tsconfigAppPath = path.join(
            monorepoPath,
            project.name,
            'tsconfig.app.json',
          );
          if (fs.existsSync(tsconfigAppPath)) {
            const tsconfigApp = JSON.parse(
              fs.readFileSync(tsconfigAppPath, 'utf-8'),
            );
            tsconfigApp.compilerOptions = tsconfigApp.compilerOptions || {};
            tsconfigApp.compilerOptions.skipLibCheck = true;
            fs.writeFileSync(
              tsconfigAppPath,
              JSON.stringify(tsconfigApp, null, 2) + '\n',
            );
            Logger.info(
              `Updated ${project.name}/tsconfig.app.json with skipLibCheck`,
            );
          }
        }
      });
    },
  });

  executor.addStep({
    name: 'installReactComponents',
    description: getStarterTranslation(
      StarterStringKey.STEP_INSTALL_REACT_COMPONENTS,
    ),
    execute: () => {
      const reactLibProject = projects.find(
        (p) => p.type === 'react-lib' && p.enabled,
      );
      if (reactLibProject) {
        const projectPackageJsonPath = path.join(
          monorepoPath,
          reactLibProject.name,
          'package.json',
        );
        const projectPackageJson = JSON.parse(
          fs.readFileSync(projectPackageJsonPath, 'utf-8'),
        );
        projectPackageJson.dependencies =
          projectPackageJson.dependencies || {};
        projectPackageJson.dependencies[
          '@digitaldefiance/express-suite-react-components'
        ] = 'latest';
        fs.writeFileSync(
          projectPackageJsonPath,
          JSON.stringify(projectPackageJson, null, 2) + '\n',
        );
        runCommand('yarn install', {
          cwd: monorepoPath,
          dryRun: context.dryRun,
        });
      }
    },
  });

  executor.addStep({
    name: 'renderTemplates',
    description: getStarterTranslation(StarterStringKey.STEP_RENDER_TEMPLATES),
    execute: () => {
      const variables: Record<string, string | undefined> = {
        WORKSPACE_NAME: workspaceName,
        PROJECT_PREFIX: projectPrefix,
        NAMESPACE_ROOT: namespaceRoot,
        HOSTNAME: hostname,
        SITE_TITLE: siteTitle,
        SITE_DESCRIPTION: siteDescription,
        SITE_TAGLINE: siteTagline,
        EXAMPLE_PASSWORD: obfuscatePassword(projectPrefix),
        EXAMPLE_JWT_SECRET: obfuscatePassword(`${workspaceName}Secret`),
        GIT_REPO: gitRepo,
        NVM_USE_VERSION: config.node?.version,
        YARN_VERSION: config.node?.yarnVersion,
      };

      projects.forEach((project) => {
        const key =
          project.type === 'lib'
            ? 'LIB_NAME'
            : `${project.type.toUpperCase().replace(/-/g, '_')}_NAME`;
        variables[key] = project.name;
      });

      renderTemplates(
        context.state.get('templatesDir'),
        monorepoPath,
        variables,
        config.templates?.engine,
        context.dryRun,
      );
    },
  });

  executor.addStep({
    name: 'copyScaffolding',
    description: getStarterTranslation(StarterStringKey.STEP_COPY_SCAFFOLDING),
    execute: () => {
      const scaffoldingDir = context.state.get('scaffoldingDir');

      const escapeForTypeScript = (str: string): string => {
        return str
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
      };

      const scaffoldingVars: Record<string, string | boolean> = {
        workspaceName,
        WorkspaceName:
          workspaceName.charAt(0).toUpperCase() +
          workspaceName
            .slice(1)
            .replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase()),
        prefix: projectPrefix,
        namespace: namespaceRoot,
        hostname,
        selectedLanguage: language,
        siteTitle: escapeForTypeScript(siteTitle),
        siteDescription: escapeForTypeScript(siteDescription),
        siteTagline: escapeForTypeScript(siteTagline),
        isEnUs: language === LanguageCodes.EN_US,
        isEnGb: language === LanguageCodes.EN_GB,
        isFr: language === LanguageCodes.FR,
        isEs: language === LanguageCodes.ES,
        isDe: language === LanguageCodes.DE,
        isZhCn: language === LanguageCodes.ZH_CN,
        isJa: language === LanguageCodes.JA,
        isUk: language === LanguageCodes.UK,
      };

      // Copy root scaffolding
      const rootSrc = path.join(scaffoldingDir, 'root');
      if (fs.existsSync(rootSrc)) {
        copyDir(
          rootSrc,
          monorepoPath,
          scaffoldingVars,
          'mustache',
          context.dryRun,
        );
      }

      // Copy devcontainer configuration
      if (devcontainerChoice !== 'none') {
        const devcontainerSrc = path.join(
          scaffoldingDir,
          `devcontainer-${devcontainerChoice}`,
        );
        if (fs.existsSync(devcontainerSrc)) {
          Logger.info(
            `Copying devcontainer configuration: ${devcontainerChoice}`,
          );
          copyDir(
            devcontainerSrc,
            monorepoPath,
            scaffoldingVars,
            'handlebars',
            context.dryRun,
          );
        }
      }

      // Copy project-specific scaffolding
      projects.forEach((project) => {
        const projectSrc = path.join(scaffoldingDir, project.type);
        if (fs.existsSync(projectSrc)) {
          copyDir(
            projectSrc,
            path.join(monorepoPath, project.name),
            scaffoldingVars,
            'mustache',
            context.dryRun,
          );
        }
      });
    },
  });


  executor.addStep({
    name: 'fixPlaywrightPlugin',
    description: 'Configuring Nx Playwright plugin to avoid daemon issues',
    skip: () => !includeE2e,
    execute: () => {
      const nxJsonPath = path.join(monorepoPath, 'nx.json');
      if (fs.existsSync(nxJsonPath)) {
        const nxJson = JSON.parse(fs.readFileSync(nxJsonPath, 'utf-8'));
        if (nxJson.plugins && Array.isArray(nxJson.plugins)) {
          const playwrightPluginIndex = nxJson.plugins.findIndex(
            (plugin: string | { plugin?: string }) =>
              (typeof plugin === 'string' && plugin.includes('playwright')) ||
              (typeof plugin === 'object' &&
                plugin.plugin?.includes('playwright')),
          );
          if (playwrightPluginIndex !== -1) {
            nxJson.plugins.splice(playwrightPluginIndex, 1);
            Logger.info(
              'Removed Playwright plugin from nx.json to avoid daemon worker issues',
            );
          }
        }
        fs.writeFileSync(nxJsonPath, JSON.stringify(nxJson, null, 2) + '\n');
      }
    },
  });

  executor.addStep({
    name: 'createTypesDirectory',
    description: 'Creating types directory with global.d.ts',
    execute: () => {
      const typesDir = path.join(monorepoPath, 'types');
      const globalDtsPath = path.join(typesDir, 'global.d.ts');
      if (!fs.existsSync(typesDir)) {
        fs.mkdirSync(typesDir, { recursive: true });
      }
      const globalDtsContent = buildGlobalDtsContent();
      fs.writeFileSync(globalDtsPath, globalDtsContent);
      Logger.info('Created types/global.d.ts with Error extensions');

      const nodeModulesTypesDir = path.join(
        monorepoPath,
        'node_modules',
        'types',
      );
      if (!fs.existsSync(nodeModulesTypesDir)) {
        fs.mkdirSync(nodeModulesTypesDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(nodeModulesTypesDir, 'global.d.ts'),
        globalDtsContent,
      );
      Logger.info(
        'Created node_modules/types/global.d.ts for library references',
      );
    },
  });

  // Skip license prompt in programmatic mode (no interactive prompt)
  executor.addStep({
    name: 'generateLicense',
    description: getStarterTranslation(StarterStringKey.STEP_GENERATE_LICENSE),
    skip: () => true, // Skipped in programmatic mode — no interactive prompt
    execute: () => {
      // no-op
    },
  });

  executor.addStep({
    name: 'addScripts',
    description: getStarterTranslation(StarterStringKey.STEP_ADD_SCRIPTS),
    execute: () => {
      const packageJsonPath = path.join(monorepoPath, 'package.json');
      const scriptContext: Record<string, string> = {
        workspaceName,
        projectPrefix,
        namespaceRoot,
        gitRepo,
      };

      projects.forEach((project) => {
        scriptContext[`${project.type}Name`] = project.name;
      });

      const addScripts: Record<string, string> = {
        build:
          'NODE_ENV=production npx nx run-many --target=build --all --configuration=production',
        'build:dev':
          'NODE_ENV=development npx nx run-many --target=build --all --configuration=development',
        'test:all': 'yarn test:jest && yarn test:e2e',
        'test:jest':
          'NODE_ENV=development npx nx run-many --target=test --all --configuration=development',
        'lint:all': 'npx nx run-many --target=lint --all',
        'prettier:check': "prettier --check '**/*.{ts,tsx}'",
        'prettier:fix': "prettier --write '**/*.{ts,tsx}'",
      };

      const apiProject = projects.find((p) => p.type === 'api');
      if (apiProject) {
        addScripts['serve'] =
          `npx nx serve ${apiProject.name} --configuration production`;
        addScripts['serve:stream'] =
          `npx nx serve ${apiProject.name} --configuration production --output-style=stream`;
        addScripts['serve:dev'] =
          `npx nx serve ${apiProject.name} --configuration development`;
        addScripts['serve:dev:stream'] =
          `npx nx serve ${apiProject.name} --configuration development --output-style=stream`;
        addScripts['build:api'] = `npx nx build ${apiProject.name}`;
      }

      const reactProject = projects.find((p) => p.type === 'react');
      if (reactProject) {
        addScripts['build:react'] = `npx nx build ${reactProject.name}`;
      }

      const initUserDbProject = projects.find(
        (p) => p.type === 'inituserdb',
      );
      if (initUserDbProject) {
        addScripts['inituserdb'] =
          `yarn build:dev && npx nx serve ${initUserDbProject.name} --output-style=stream`;
        addScripts['inituserdb:drop'] =
          `yarn build:dev && npx nx serve ${initUserDbProject.name} --output-style=stream --args=--drop`;
        addScripts['inituserdb:setenv'] =
          `yarn build:dev && npx nx serve ${initUserDbProject.name} --output-style=stream --args=--setEnv`;
        addScripts['inituserdb:drop:setenv'] =
          `yarn build:dev && npx nx serve ${initUserDbProject.name} --output-style=stream --args="--drop --setEnv"`;
      }

      const interpolatedScripts: Record<string, string> = {};
      for (const [k, v] of Object.entries(addScripts)) {
        interpolatedScripts[k] = interpolateTemplateStrings(v, scriptContext);
      }

      addScriptsToPackageJson(packageJsonPath, interpolatedScripts);
    },
  });

  executor.addStep({
    name: 'generateDocumentation',
    description: getStarterTranslation(
      StarterStringKey.STEP_GENERATE_DOCUMENTATION,
    ),
    skip: () => true, // Disabled — README comes from scaffolding/root/
    execute: async () => {
      const { DocGenerator } = await import('../utils/doc-generator');
      DocGenerator.generateProjectDocs(context);
    },
  });

  executor.addStep({
    name: 'setupEnvironment',
    description: getStarterTranslation(
      StarterStringKey.STEP_SETUP_ENVIRONMENT,
    ),
    execute: () => {
      setupEnvironmentFiles({
        projects,
        monorepoPath,
        workspaceName,
        devcontainerChoice,
        mongoPassword,
        useInMemoryDb,
        devDatabaseName,
        jwtSecret,
        mnemonicEncryptionKey,
        mnemonicHmacSecret,
      });
    },
  });

  executor.addStep({
    name: 'rebuildNativeModules',
    description: getStarterTranslation(
      StarterStringKey.STEP_REBUILD_NATIVE_MODULES,
    ),
    execute: () => {
      Logger.info(
        getStarterTranslation(StarterStringKey.COMMAND_REBUILDING_NATIVE),
      );
      runCommand('yarn config set enableScripts true', {
        cwd: monorepoPath,
        dryRun: context.dryRun,
      });
      runCommand('yarn rebuild', {
        cwd: monorepoPath,
        dryRun: context.dryRun,
      });
    },
  });

  executor.addStep({
    name: 'validateGeneration',
    description: getStarterTranslation(
      StarterStringKey.STEP_VALIDATE_GENERATION,
    ),
    skip: () => dryRun,
    execute: async () => {
      const report = await PostGenerationValidator.validate(context);
      PostGenerationValidator.printReport(report);
      if (!report.passed) {
        Logger.warning(
          getStarterTranslation(StarterStringKey.WARNING_VALIDATION_ERRORS),
        );
      }
    },
  });

  executor.addStep({
    name: 'initialCommit',
    description: getStarterTranslation(StarterStringKey.STEP_INITIAL_COMMIT),
    skip: () => !createInitialCommit,
    execute: () => {
      if (!fs.existsSync(path.join(monorepoPath, '.git'))) {
        runCommand('git init', { cwd: monorepoPath, dryRun: context.dryRun });
      }
      runCommand('git add -A', { cwd: monorepoPath, dryRun: context.dryRun });
      runCommand('git commit -m "Initial commit"', {
        cwd: monorepoPath,
        dryRun: context.dryRun,
      });
      if (gitRepo && pushToRemote) {
        runCommand('git push --set-upstream origin main', {
          cwd: monorepoPath,
          dryRun: context.dryRun,
        });
      }
    },
  });

  executor.addStep({
    name: 'installPlaywright',
    description: getStarterTranslation(
      StarterStringKey.STEP_INSTALL_PLAYWRIGHT,
    ),
    skip: () => !includeE2e || !installPlaywright,
    execute: () => {
      Logger.info(
        getStarterTranslation(
          StarterStringKey.COMMAND_INSTALLING_PLAYWRIGHT_BROWSERS,
        ),
      );
      runCommand('yarn playwright install --with-deps', {
        cwd: monorepoPath,
        dryRun: context.dryRun,
      });
    },
  });
}


/** Configure api project.json targets */
function configureApiProjectJson(
  projects: ProjectConfig[],
  monorepoPath: string,
): void {
  const apiProject = projects.find((p) => p.type === 'api' && p.enabled);
  if (!apiProject) return;

  const projectJsonPath = path.join(
    monorepoPath,
    apiProject.name,
    'project.json',
  );
  if (!fs.existsSync(projectJsonPath)) return;

  const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));

  if (projectJson.targets?.build?.options) {
    projectJson.targets.build.options.skipTypeCheck = true;
    projectJson.targets.build.options.bundle = true;

    const existingAssets = projectJson.targets.build.options.assets || [];
    const hasObjectAssets = existingAssets.some(
      (asset: string | { input?: string }) =>
        typeof asset === 'object' && asset.input,
    );

    if (!hasObjectAssets) {
      projectJson.targets.build.options.assets = [
        {
          input: `${apiProject.name}/src/assets`,
          glob: '**/*',
          output: 'assets',
        },
        {
          input: `${apiProject.name}/src/views`,
          glob: '**/*',
          output: 'views',
        },
      ];
    }
  }

  projectJson.targets['copy-env'] = {
    executor: 'nx:run-commands',
    options: {
      command: `cp ${apiProject.name}/.env dist/${apiProject.name}/.env`,
    },
  };
  projectJson.targets['post-build'] = {
    executor: 'nx:run-commands',
    dependsOn: ['build'],
    options: {
      command: `cp ${apiProject.name}/.env dist/${apiProject.name}/.env`,
    },
  };
  projectJson.targets.serve = {
    continuous: true,
    executor: 'nx:run-commands',
    defaultConfiguration: 'development',
    dependsOn: ['post-build'],
    options: {
      cwd: `dist/${apiProject.name}`,
      command: 'node main.js',
    },
    configurations: {
      development: {
        cwd: `dist/${apiProject.name}`,
        command: 'node main.js',
      },
      production: {
        cwd: `dist/${apiProject.name}`,
        command: 'node main.js',
      },
    },
  };

  fs.writeFileSync(
    projectJsonPath,
    JSON.stringify(projectJson, null, 2) + '\n',
  );
  Logger.info(
    getStarterTranslation(StarterStringKey.PROJECT_ADDED_TARGETS, {
      name: apiProject.name,
    }),
  );
}

/** Configure inituserdb project.json targets */
function configureInitUserDbProjectJson(
  projects: ProjectConfig[],
  monorepoPath: string,
): void {
  const initUserDbProject = projects.find(
    (p) => p.type === 'inituserdb' && p.enabled,
  );
  if (!initUserDbProject) return;

  const projectJsonPath = path.join(
    monorepoPath,
    initUserDbProject.name,
    'project.json',
  );
  if (!fs.existsSync(projectJsonPath)) return;

  const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));

  if (projectJson.targets?.build?.options) {
    projectJson.targets.build.options.skipTypeCheck = true;
    projectJson.targets.build.options.format = ['esm'];
    delete projectJson.targets.build.options.platform;
    projectJson.targets.build.options.bundle = true;
    projectJson.targets.build.options.thirdParty = false;
    projectJson.targets.build.options.generatePackageJson = false;
    if (!projectJson.targets.build.options.esbuildOptions) {
      projectJson.targets.build.options.esbuildOptions = {};
    }
    projectJson.targets.build.options.esbuildOptions.external = [
      '@digitaldefiance/*',
    ];
    if (projectJson.targets.build.configurations?.production) {
      if (
        !projectJson.targets.build.configurations.production.esbuildOptions
      ) {
        projectJson.targets.build.configurations.production.esbuildOptions =
          {};
      }
      projectJson.targets.build.configurations.production.esbuildOptions.external =
        ['@digitaldefiance/*'];
    }
  }

  projectJson.targets['copy-env'] = {
    executor: 'nx:run-commands',
    options: {
      command: `cp ${initUserDbProject.name}/.env dist/${initUserDbProject.name}/.env`,
    },
  };
  projectJson.targets['post-build'] = {
    executor: 'nx:run-commands',
    dependsOn: ['build'],
    options: {
      command: `cp ${initUserDbProject.name}/.env dist/${initUserDbProject.name}/.env`,
    },
  };
  projectJson.targets.serve = {
    executor: 'nx:run-commands',
    defaultConfiguration: 'development',
    dependsOn: ['post-build'],
    options: {
      command: `node dist/${initUserDbProject.name}/main.js`,
      cwd: '{workspaceRoot}',
    },
    configurations: {
      development: {
        command: `node dist/${initUserDbProject.name}/main.js`,
      },
      production: {
        command: `node dist/${initUserDbProject.name}/main.js`,
      },
    },
  };

  fs.writeFileSync(
    projectJsonPath,
    JSON.stringify(projectJson, null, 2) + '\n',
  );
  Logger.info(
    getStarterTranslation(StarterStringKey.PROJECT_ADDED_TARGETS, {
      name: initUserDbProject.name,
    }),
  );
}

/** Configure react project.json targets */
function configureReactProjectJson(
  projects: ProjectConfig[],
  monorepoPath: string,
): void {
  const reactProject = projects.find(
    (p) => p.type === 'react' && p.enabled,
  );
  if (!reactProject) return;

  const projectJsonPath = path.join(
    monorepoPath,
    reactProject.name,
    'project.json',
  );
  if (!fs.existsSync(projectJsonPath)) return;

  const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));

  if (!projectJson.targets) {
    projectJson.targets = {};
  }

  projectJson.targets['build'] = {
    executor: 'nx:run-commands',
    dependsOn: ['^build'],
    cache: true,
    outputs: [`{workspaceRoot}/dist/${reactProject.name}`],
    options: {
      cwd: reactProject.name,
      command: 'vite build --mode development',
    },
    configurations: {
      development: { command: 'vite build --mode development' },
      production: { command: 'vite build --mode production' },
    },
  };

  fs.writeFileSync(
    projectJsonPath,
    JSON.stringify(projectJson, null, 2) + '\n',
  );
  Logger.info(
    getStarterTranslation(StarterStringKey.PROJECT_ADDED_TARGETS, {
      name: reactProject.name,
    }),
  );

  // Update vite.config.ts to handle mode properly
  const viteConfigPath = path.join(
    monorepoPath,
    reactProject.name,
    'vite.config.ts',
  );
  if (fs.existsSync(viteConfigPath)) {
    let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
    viteConfig = viteConfig.replace(
      /export default defineConfig\(\(\) => \(\{/,
      'export default defineConfig(({ mode }) => ({',
    );
    if (!viteConfig.includes('mode:')) {
      viteConfig = viteConfig.replace(
        /cacheDir: '[^']*',/,
        `cacheDir: '../node_modules/.vite/${reactProject.name}',\n  mode: mode || process.env.NODE_ENV || 'production',`,
      );
    }
    if (!viteConfig.includes('minify:')) {
      viteConfig = viteConfig.replace(
        /commonjsOptions: \{[^}]*\},/,
        `commonjsOptions: {\n      transformMixedEsModules: true,\n    },\n    minify: mode === 'production' ? ('esbuild' as const) : false,`,
      );
    }
    viteConfig = viteConfig.replace(/\}\);(\s*)$/, '}));$1');
    fs.writeFileSync(viteConfigPath, viteConfig);
  }
}

/** Setup .env files for api, inituserdb, and devcontainer */
function setupEnvironmentFiles(params: {
  projects: ProjectConfig[];
  monorepoPath: string;
  workspaceName: string;
  devcontainerChoice: string;
  mongoPassword: string;
  useInMemoryDb: boolean;
  devDatabaseName: string;
  jwtSecret: string;
  mnemonicEncryptionKey: string;
  mnemonicHmacSecret: string;
}): void {
  const {
    projects,
    monorepoPath,
    workspaceName,
    devcontainerChoice,
    mongoPassword,
    useInMemoryDb,
    devDatabaseName,
    jwtSecret,
    mnemonicEncryptionKey,
    mnemonicHmacSecret,
  } = params;

  const apiProject = projects.find((p) => p.type === 'api');
  const initUserDbProject = projects.find((p) => p.type === 'inituserdb');

  const escapeEnvValue = (value: string) => {
    const escaped = value.replace(/'/g, "'\\''");
    return `'${escaped}'`;
  };

  const buildMongoUri = (dbName: string) => {
    const auth = mongoPassword
      ? `admin:${encodeURIComponent(mongoPassword)}@`
      : '';
    const mongoParams =
      devcontainerChoice === 'mongodb-replicaset'
        ? '?authSource=admin&replicaSet=rs0&directConnection=true'
        : '?authSource=admin&directConnection=true';
    return `mongodb://${auth}db:27017/${dbName}${mongoParams}`;
  };

  // Setup API .env
  if (apiProject) {
    const envExamplePath = path.join(
      monorepoPath,
      apiProject.name,
      '.env.example',
    );
    const envPath = path.join(monorepoPath, apiProject.name, '.env');
    if (fs.existsSync(envExamplePath)) {
      let envContent = fs.readFileSync(envExamplePath, 'utf-8');
      if (useInMemoryDb) {
        envContent = envContent.replace(
          /DEV_DATABASE=.*/g,
          `DEV_DATABASE=${devDatabaseName}`,
        );
      } else {
        envContent = envContent.replace(/DEV_DATABASE=.*/g, 'DEV_DATABASE=');
      }
      envContent = envContent.replace(
        /JWT_SECRET=.*/g,
        `JWT_SECRET=${jwtSecret}`,
      );
      envContent = envContent.replace(
        /MNEMONIC_ENCRYPTION_KEY=.*/g,
        `MNEMONIC_ENCRYPTION_KEY=${mnemonicEncryptionKey}`,
      );
      envContent = envContent.replace(
        /MNEMONIC_HMAC_SECRET=.*/g,
        `MNEMONIC_HMAC_SECRET=${mnemonicHmacSecret}`,
      );
      if (
        devcontainerChoice === 'mongodb' ||
        devcontainerChoice === 'mongodb-replicaset'
      ) {
        const mongoUri = buildMongoUri(workspaceName);
        envContent = envContent.replace(
          /MONGO_URI=.*/g,
          `MONGO_URI=${mongoUri}`,
        );
      }
      if (devcontainerChoice === 'mongodb-replicaset') {
        envContent = envContent.replace(
          /MONGO_USE_TRANSACTIONS=.*/g,
          'MONGO_USE_TRANSACTIONS=true',
        );
      } else {
        envContent = envContent.replace(
          /MONGO_USE_TRANSACTIONS=.*/g,
          'MONGO_USE_TRANSACTIONS=false',
        );
      }
      fs.writeFileSync(envPath, envContent);
      Logger.info(`Created ${apiProject.name}/.env with secrets`);
    }
  }

  // Setup inituserdb .env
  if (initUserDbProject && apiProject) {
    const apiEnvPath = path.join(monorepoPath, apiProject.name, '.env');
    const initEnvPath = path.join(
      monorepoPath,
      initUserDbProject.name,
      '.env',
    );
    if (fs.existsSync(apiEnvPath)) {
      fs.copyFileSync(apiEnvPath, initEnvPath);
      Logger.info(
        `Created ${initUserDbProject.name}/.env from ${apiProject.name}/.env`,
      );
    }
  }

  // Setup devcontainer .env
  if (
    devcontainerChoice === 'mongodb' ||
    devcontainerChoice === 'mongodb-replicaset'
  ) {
    const devcontainerEnvExamplePath = path.join(
      monorepoPath,
      '.devcontainer',
      '.env.example',
    );
    const devcontainerEnvPath = path.join(
      monorepoPath,
      '.devcontainer',
      '.env',
    );
    if (fs.existsSync(devcontainerEnvExamplePath)) {
      let envContent = fs.readFileSync(devcontainerEnvExamplePath, 'utf-8');
      envContent = envContent.replace(
        /MONGO_INITDB_ROOT_PASSWORD=.*/g,
        `MONGO_INITDB_ROOT_PASSWORD=${escapeEnvValue(mongoPassword)}`,
      );
      envContent = envContent.replace(
        /MONGO_INITDB_DATABASE=.*/g,
        `MONGO_INITDB_DATABASE=${workspaceName}`,
      );
      envContent = envContent.replace(
        /COMPOSE_PROJECT_NAME=.*/g,
        `COMPOSE_PROJECT_NAME=${workspaceName}_devcontainer`,
      );
      fs.writeFileSync(devcontainerEnvPath, envContent);
    } else {
      const envContent = `MONGO_INITDB_ROOT_PASSWORD=${escapeEnvValue(mongoPassword)}\nMONGO_INITDB_DATABASE=${workspaceName}\nCOMPOSE_PROJECT_NAME=${workspaceName}_devcontainer\n`;
      fs.writeFileSync(devcontainerEnvPath, envContent);
    }
  } else if (devcontainerChoice === 'simple') {
    const devcontainerEnvExamplePath = path.join(
      monorepoPath,
      '.devcontainer',
      '.env.example',
    );
    const devcontainerEnvPath = path.join(
      monorepoPath,
      '.devcontainer',
      '.env',
    );
    if (fs.existsSync(devcontainerEnvExamplePath)) {
      fs.copyFileSync(devcontainerEnvExamplePath, devcontainerEnvPath);
    }
  }
}

/** Build the global.d.ts content for the generated project */
function buildGlobalDtsContent(): string {
  return `/**
 * Global ambient type declarations for Error and globalThis extensions
 */
declare global {
  interface ErrorConstructor {
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
  }
  interface Error {
    disposedAt?: string;
    type?: string;
    componentId?: string;
    reasonMap?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }
  var GlobalActiveContext: any;
}
export {};
`;
}
