import input from '@inquirer/input';
import select from '@inquirer/select';
import confirm from '@inquirer/confirm';
import checkbox from '@inquirer/checkbox';
import * as path from 'path';
import * as fs from 'fs';
import { printBanner, printIntro } from '../scripts/albatross';
import { Logger } from './cli/logger';
import { ConfigValidator, GeneratorConfig } from './core/config-schema';
import { SystemCheck } from './utils/system-check';
import { StepExecutor } from './core/step-executor';
import { GeneratorContext } from './core/interfaces';
import { ProjectConfigBuilder } from './core/project-config-builder';
import { ProjectGenerator } from './core/project-generator';
import { runCommand } from './utils/shell-utils';
import { renderTemplates, copyDir } from './utils/template-renderer';
import { obfuscatePassword } from '../scripts/passwordObfuscator';
import { checkAndUseNode } from '../scripts/nodeSetup';
import { promptAndGenerateLicense } from '../scripts/licensePrompt';
import { addScriptsToPackageJson } from '../scripts/addScriptsToPackageJson';
import { interpolateTemplateStrings } from '../scripts/templateUtils';
import {
  getStarterTranslation,
  StarterStringKey,
  getStarterI18nEngine,
  StarterComponentId,
} from './i18n';
import { TranslatableGenericError } from '@digitaldefiance/i18n-lib';
import { LanguageCodes } from '@digitaldefiance/i18n-lib';
import { PostGenerationValidator } from './core/validators/post-generation-validator';

async function main() {
  printBanner();
  checkAndUseNode();

  // Disable Yarn build scripts globally to avoid native module issues
  process.env.YARN_ENABLE_SCRIPTS = 'false';

  // Language selection
  const selectedLanguage = await select({
    message:
      'Select language / Seleccionar idioma / Choisir la langue / Sprache wählen / 选择语言 / 言語を選択 / Виберіть мову:',
    choices: [
      { name: 'English (US)', value: LanguageCodes.EN_US },
      { name: 'English (UK)', value: LanguageCodes.EN_GB },
      { name: 'Español', value: LanguageCodes.ES },
      { name: 'Français', value: LanguageCodes.FR },
      { name: 'Deutsch', value: LanguageCodes.DE },
      { name: '中文', value: LanguageCodes.ZH_CN },
      { name: '日本語', value: LanguageCodes.JA },
      { name: 'Українська', value: LanguageCodes.UK },
    ],
    default: LanguageCodes.EN_US,
  });

  // Set the language for the i18n engine
  const i18nEngine = getStarterI18nEngine();
  i18nEngine.setLanguage(selectedLanguage);

  printIntro();

  // System check
  Logger.header(getStarterTranslation(StarterStringKey.SYSTEM_CHECK_HEADER));
  const systemCheck = SystemCheck.check();
  SystemCheck.printReport(systemCheck);

  if (!systemCheck.passed) {
    const proceed = await confirm({
      message: getStarterTranslation(
        StarterStringKey.SYSTEM_CHECK_CONTINUE_ANYWAY,
      ),
      default: false,
    });

    if (!proceed) {
      Logger.info(getStarterTranslation(StarterStringKey.CLI_CANCELLED));
      process.exit(0);
    }
  }

  // Load preset
  const presetPath = path.resolve(
    __dirname,
    '../../config/presets/standard.json',
  );
  const preset = JSON.parse(fs.readFileSync(presetPath, 'utf-8'));

  // Prompt for workspace configuration
  Logger.header(
    getStarterTranslation(StarterStringKey.SECTION_WORKSPACE_CONFIG),
  );

  const workspaceName = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_WORKSPACE_NAME),
    default: 'example-project',
    validate: (val: string) =>
      ConfigValidator.validateWorkspaceName(val) ||
      getStarterTranslation(StarterStringKey.VALIDATION_INVALID_WORKSPACE_NAME),
  });

  const projectPrefix = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_PROJECT_PREFIX),
    default: workspaceName,
    validate: (val: string) =>
      ConfigValidator.validatePrefix(val) ||
      getStarterTranslation(StarterStringKey.VALIDATION_INVALID_PREFIX),
  });

  const namespaceRoot = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_NPM_NAMESPACE),
    default: `@${projectPrefix}`,
    validate: (val: string) =>
      ConfigValidator.validateNamespace(val) ||
      getStarterTranslation(StarterStringKey.VALIDATION_INVALID_NAMESPACE),
  });

  const parentDir = path.resolve(
    await input({
      message: getStarterTranslation(StarterStringKey.PROMPT_PARENT_DIRECTORY),
      default: process.cwd(),
    }),
  );

  const gitRepo = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_GIT_REPO),
    validate: (val: string) =>
      ConfigValidator.validateGitRepo(val) ||
      getStarterTranslation(StarterStringKey.VALIDATION_INVALID_GIT_REPO),
  });

  const hostname = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_HOSTNAME),
    default: `${workspaceName}.local`,
    validate: (val: string) =>
      /^[a-z0-9-]+(\.[a-z0-9-]+)*$/.test(val) ||
      getStarterTranslation(StarterStringKey.VALIDATION_INVALID_HOSTNAME),
  });

  // Get default strings based on selected language
  const defaultStrings = {
    [LanguageCodes.EN_US]: {
      siteTitle: 'Your Site Title',
      siteDescription: 'Your description here',
      siteTagline: 'Your tagline here',
    },
    [LanguageCodes.EN_GB]: {
      siteTitle: 'Your Site Title',
      siteDescription: 'Your description here',
      siteTagline: 'Your tagline here',
    },
    [LanguageCodes.FR]: {
      siteTitle: 'Titre de votre site',
      siteDescription: 'Votre description ici',
      siteTagline: 'Votre slogan ici',
    },
    [LanguageCodes.ES]: {
      siteTitle: 'Título de su sitio',
      siteDescription: 'Su descripción aquí',
      siteTagline: 'Su eslogan aquí',
    },
    [LanguageCodes.DE]: {
      siteTitle: 'Ihr Seitentitel',
      siteDescription: 'Ihre Beschreibung hier',
      siteTagline: 'Ihr Slogan hier',
    },
    [LanguageCodes.ZH_CN]: {
      siteTitle: '您的网站标题',
      siteDescription: '您的描述在这里',
      siteTagline: '您的标语在这里',
    },
    [LanguageCodes.JA]: {
      siteTitle: 'サイトのタイトル',
      siteDescription: 'ここに説明を入力',
      siteTagline: 'ここにキャッチフレーズを入力',
    },
    [LanguageCodes.UK]: {
      siteTitle: 'Назва вашого сайту',
      siteDescription: 'Ваш опис тут',
      siteTagline: 'Ваш слоган тут',
    },
  };

  const currentDefaults =
    defaultStrings[selectedLanguage as keyof typeof defaultStrings] ||
    defaultStrings[LanguageCodes.EN_US];

  const siteTitle = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_SITE_TITLE),
    default: currentDefaults.siteTitle,
  });

  const siteDescription = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_SITE_DESCRIPTION),
    default: currentDefaults.siteDescription,
  });

  const siteTagline = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_SITE_TAGLINE),
    default: currentDefaults.siteTagline,
  });

  Logger.info(
    getStarterTranslation(
      StarterStringKey.NOTICE_SITE_TITLE_TAGLINE_DESCRIPTIONS,
    ),
  );

  const dryRun = await confirm({
    message: getStarterTranslation(StarterStringKey.PROMPT_DRY_RUN),
    default: false,
  });

  Logger.section(
    getStarterTranslation(StarterStringKey.SECTION_OPTIONAL_PROJECTS),
  );

  const includeE2e = await confirm({
    message: getStarterTranslation(StarterStringKey.PROMPT_INCLUDE_E2E),
    default: true,
  });

  Logger.section(
    getStarterTranslation(StarterStringKey.SECTION_PACKAGE_GROUPS),
  );

  const packageGroupsPath = path.resolve(
    __dirname,
    '../../config/package-groups.json',
  );
  const packageGroups = JSON.parse(
    fs.readFileSync(packageGroupsPath, 'utf-8'),
  ).groups;

  const selectedGroups = await checkbox({
    message: getStarterTranslation(
      StarterStringKey.PROMPT_SELECT_PACKAGE_GROUPS,
    ),
    choices: packageGroups
      .filter((g: any) => !g.enabled)
      .map((g: any) => ({
        name: `${g.name} - ${g.description}`,
        value: g.name,
        checked: true,
      })),
  });

  // const enableDocGeneration = await confirm({
  //   message: getStarterTranslation(
  //     StarterStringKey.PROMPT_ENABLE_DOC_GENERATION,
  //   ),
  //   default: true,
  // });

  Logger.section(
    getStarterTranslation(StarterStringKey.SECTION_DEVCONTAINER_CONFIG),
  );

  const setupDevcontainer = await confirm({
    message: getStarterTranslation(StarterStringKey.PROMPT_SETUP_DEVCONTAINER),
    default: true,
  });

  let devcontainerChoice = 'none';
  let mongoPassword = '';
  if (setupDevcontainer) {
    devcontainerChoice = await select({
      message: getStarterTranslation(
        StarterStringKey.PROMPT_DEVCONTAINER_CONFIG,
      ),
      choices: [
        {
          name: getStarterTranslation(StarterStringKey.DEVCONTAINER_SIMPLE),
          value: 'simple',
        },
        {
          name: getStarterTranslation(StarterStringKey.DEVCONTAINER_MONGODB),
          value: 'mongodb',
        },
        {
          name: getStarterTranslation(
            StarterStringKey.DEVCONTAINER_MONGODB_REPLICASET,
          ),
          value: 'mongodb-replicaset',
        },
      ],
      default: 'mongodb-replicaset',
    });

    if (
      devcontainerChoice === 'mongodb' ||
      devcontainerChoice === 'mongodb-replicaset'
    ) {
      mongoPassword = await input({
        message: getStarterTranslation(StarterStringKey.PROMPT_MONGO_PASSWORD),
        validate: (val: string) =>
          val.length > 0 ||
          getStarterTranslation(StarterStringKey.VALIDATION_PASSWORD_REQUIRED),
      });
    }
  }

  Logger.section(
    getStarterTranslation(StarterStringKey.SECTION_DATABASE_CONFIG),
  );

  const useInMemoryDb = await confirm({
    message: getStarterTranslation(StarterStringKey.PROMPT_USE_IN_MEMORY_DB),
    default: false,
  });

  let devDatabaseName = '';
  if (useInMemoryDb) {
    devDatabaseName = await input({
      message: getStarterTranslation(StarterStringKey.PROMPT_DEV_DATABASE_NAME),
      default: 'test',
      validate: (val: string) =>
        val.length > 0 ||
        getStarterTranslation(
          StarterStringKey.VALIDATION_DATABASE_NAME_REQUIRED,
        ),
    });
  }

  Logger.section(
    getStarterTranslation(StarterStringKey.SECTION_SECURITY_CONFIG),
  );

  const crypto = await import('crypto');
  const HEX_64_REGEX = /^[0-9a-f]{64}$/i;

  const promptOrGenerateSecret = async (name: string): Promise<string> => {
    const generate = await confirm({
      message: getStarterTranslation(StarterStringKey.PROMPT_GENERATE_SECRET, {
        name,
      }),
      default: true,
    });

    if (generate) {
      const secret = crypto.randomBytes(32).toString('hex');
      Logger.info(
        getStarterTranslation(StarterStringKey.ENV_GENERATED_SECRET, { name }),
      );
      return secret;
    } else {
      return await input({
        message: getStarterTranslation(StarterStringKey.PROMPT_ENTER_SECRET, {
          name,
        }),
        validate: (val: string) =>
          HEX_64_REGEX.test(val) ||
          getStarterTranslation(StarterStringKey.VALIDATION_MUST_BE_HEX_64),
      });
    }
  };

  const jwtSecret = await promptOrGenerateSecret('JWT_SECRET');
  const mnemonicEncryptionKey = await promptOrGenerateSecret(
    'MNEMONIC_ENCRYPTION_KEY',
  );
  const mnemonicHmacSecret = await promptOrGenerateSecret(
    'MNEMONIC_HMAC_SECRET',
  );

  Logger.section(
    getStarterTranslation(StarterStringKey.SECTION_EXPRESS_SUITE_PACKAGES),
  );

  const monorepoPath = path.join(parentDir, workspaceName);

  // Build project configurations
  const projects = ProjectConfigBuilder.build(projectPrefix, namespaceRoot, {
    includeReactLib: true,
    includeApiLib: true,
    includeE2e,
    includeInitUserDb: true,
    includeTestUtils: false,
  });

  // Build configuration
  const config: Partial<GeneratorConfig> = {
    workspace: {
      name: workspaceName,
      prefix: projectPrefix,
      namespace: namespaceRoot,
      parentDir,
      gitRepo,
      hostname,
    },
    projects,
    ...preset,
  };

  // Validate configuration
  const validation = ConfigValidator.validate(config);
  if (!validation.valid) {
    validation.errors.forEach((err) => Logger.error(err));
    process.exit(1);
  }

  // Setup context with all project names
  const stateEntries: [string, any][] = [
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
    state: new Map(stateEntries),
    checkpointPath: path.join(parentDir, `.${workspaceName}.checkpoint`),
    dryRun,
  };

  // Merge selected package groups
  const additionalPackages: string[] = [];
  (selectedGroups as string[]).forEach((groupName) => {
    const group = packageGroups.find((g: any) => g.name === groupName);
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

  // Note: @digitaldefiance/express-suite-test-utils is always included in dev dependencies
  // react-components will be added to react-lib or react project directly

  // Setup steps
  const executor = dryRun
    ? new (await import('./core/dry-run-executor')).DryRunExecutor()
    : new StepExecutor();

  if (dryRun) {
    Logger.warning(
      getStarterTranslation(StarterStringKey.GENERATION_DRY_RUN_MODE),
    );
  }

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
    execute: (context) => {
      runCommand(
        `npx create-nx-workspace@latest "${workspaceName}" --package-manager=yarn --preset=apps --ci=${config.nx?.ciProvider}`,
        { cwd: parentDir, dryRun: context.dryRun },
      );
    },
  });

  executor.addStep({
    name: 'updateTsConfigBase',
    description: getStarterTranslation(
      StarterStringKey.STEP_UPDATE_TSCONFIG_BASE,
    ),
    execute: (_context) => {
      const tsconfigBasePath = path.join(monorepoPath, 'tsconfig.base.json');
      if (fs.existsSync(tsconfigBasePath)) {
        const tsconfigBase = JSON.parse(
          fs.readFileSync(tsconfigBasePath, 'utf-8'),
        );

        // Add esModuleInterop, allowSyntheticDefaultImports, and allowImportingTsExtensions to compilerOptions
        tsconfigBase.compilerOptions = tsconfigBase.compilerOptions || {};
        tsconfigBase.compilerOptions.esModuleInterop = true;
        tsconfigBase.compilerOptions.allowSyntheticDefaultImports = true;
        tsconfigBase.compilerOptions.allowImportingTsExtensions = true;

        // Set target to es2020 for BigInt support
        tsconfigBase.compilerOptions.target = 'es2020';

        // Enable skipLibCheck to avoid type errors in node_modules
        tsconfigBase.compilerOptions.skipLibCheck = true;
        tsconfigBase.compilerOptions.skipDefaultLibCheck = true;

        // Disable noImplicitOverride to avoid override modifier errors
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
      // Ensure git is initialized in the monorepo before setting origin
      if (!fs.existsSync(path.join(monorepoPath, '.git'))) {
        runCommand('git init', { cwd: monorepoPath, dryRun: context.dryRun });
      }

      try {
        // Try to add the remote
        runCommand(`git remote add origin ${gitRepo}`, {
          cwd: monorepoPath,
          dryRun: context.dryRun,
        });
      } catch (error: any) {
        // If remote already exists, update it instead
        const errorMsg = error.message || error.stderr?.toString() || '';
        if (
          errorMsg.includes('remote origin already exists') ||
          error.status === 3
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
    description: getStarterTranslation(StarterStringKey.STEP_ADD_PACKAGE_RESOLUTIONS),
    execute: (_context) => {
      const packageJsonPath = path.join(monorepoPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf-8'),
        );

        // Add resolutions to ensure consistent @noble package versions
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
      try {
        runCommand('yarn add -D @nx/react @nx/node', {
          cwd: monorepoPath,
          dryRun: context.dryRun,
        });
      } catch (error: any) {
        if (error.status === 1) {
          Logger.error(
            '\n' +
              getStarterTranslation(
                StarterStringKey.PACKAGE_INSTALLATION_FAILED,
              ),
          );
          Logger.section(
            getStarterTranslation(StarterStringKey.PACKAGE_INSTALL_BUILD_TOOLS),
          );
          Logger.dim(
            '  ' +
              getStarterTranslation(
                StarterStringKey.SYSTEM_CHECK_UBUNTU_DEBIAN,
              ),
          );
          Logger.dim(
            '  ' +
              getStarterTranslation(StarterStringKey.SYSTEM_CHECK_FEDORA_RHEL),
          );
          Logger.dim(
            '  ' + getStarterTranslation(StarterStringKey.SYSTEM_CHECK_MACOS),
          );
          Logger.section(
            '\n' +
              getStarterTranslation(StarterStringKey.PACKAGE_RETRY_OR_SKIP),
          );
        }
        throw error;
      }
    },
  });

  executor.addStep({
    name: 'resetNxDaemon',
    description: 'Resetting Nx daemon',
    execute: () => {
      // Reset Nx daemon to avoid plugin worker issues
      runCommand('npx nx reset', { cwd: monorepoPath, dryRun: context.dryRun });
    },
  });

  executor.addStep({
    name: 'addYarnPackages',
    description: getStarterTranslation(StarterStringKey.STEP_ADD_YARN_PACKAGES),
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
    description: getStarterTranslation(StarterStringKey.STEP_GENERATE_PROJECTS),
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

      // Add copy-env and post-build targets to api and inituserdb project.json
      const apiProject = projects.find((p) => p.type === 'api' && p.enabled);
      const initUserDbProject = projects.find(
        (p) => p.type === 'inituserdb' && p.enabled,
      );

      if (apiProject) {
        const projectJsonPath = path.join(
          monorepoPath,
          apiProject.name,
          'project.json',
        );
        if (fs.existsSync(projectJsonPath)) {
          const projectJson = JSON.parse(
            fs.readFileSync(projectJsonPath, 'utf-8'),
          );

          // Configure assets with proper object notation for esbuild executor
          if (projectJson.targets?.build?.options) {
            // Add skipTypeCheck to avoid type errors in node_modules
            projectJson.targets.build.options.skipTypeCheck = true;

            // Set bundle to true to properly resolve dependencies
            projectJson.targets.build.options.bundle = true;

            // Convert any existing string-format assets to object notation
            const existingAssets =
              projectJson.targets.build.options.assets || [];
            const newAssets = [];

            // Check if assets already contains object notation
            const hasObjectAssets = existingAssets.some(
              (asset: any) => typeof asset === 'object' && asset.input,
            );

            if (!hasObjectAssets) {
              // Add assets directory with proper object notation
              newAssets.push({
                input: `${apiProject.name}/src/assets`,
                glob: '**/*',
                output: 'assets',
              });

              // Add views directory with proper object notation
              newAssets.push({
                input: `${apiProject.name}/src/views`,
                glob: '**/*',
                output: 'views',
              });

              projectJson.targets.build.options.assets = newAssets;
            } else {
              // Check if views is already configured
              const hasViews = existingAssets.some(
                (asset: any) =>
                  (typeof asset === 'string' && asset.includes('/views')) ||
                  (typeof asset === 'object' &&
                    asset.input?.includes('/views')),
              );

              if (!hasViews) {
                existingAssets.push({
                  input: `${apiProject.name}/src/views`,
                  glob: '**/*',
                  output: 'views',
                });
              }
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
          // Replace serve target to use nx:run-commands instead of @nx/js:node
          // This avoids the issue where @nx/js:node tries to resolve 'nx' module
          // from within the dist directory after yarn install
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
      }

      if (initUserDbProject) {
        const projectJsonPath = path.join(
          monorepoPath,
          initUserDbProject.name,
          'project.json',
        );
        if (fs.existsSync(projectJsonPath)) {
          const projectJson = JSON.parse(
            fs.readFileSync(projectJsonPath, 'utf-8'),
          );

          // Add skipTypeCheck to avoid type errors in node_modules
          if (projectJson.targets?.build?.options) {
            projectJson.targets.build.options.skipTypeCheck = true;

            // Change format to ESM to match the published packages
            projectJson.targets.build.options.format = ['esm'];

            // Remove platform: node to prevent automatic externalization
            delete projectJson.targets.build.options.platform;

            // Set bundle to true to bundle all dependencies
            projectJson.targets.build.options.bundle = true;

            // Set thirdParty to false to bundle all dependencies including node_modules
            projectJson.targets.build.options.thirdParty = false;

            // Disable generatePackageJson since we're bundling everything
            projectJson.targets.build.options.generatePackageJson = false;

            // Mark @digitaldefiance packages as external to avoid bundling issues with dynamic requires
            if (!projectJson.targets.build.options.esbuildOptions) {
              projectJson.targets.build.options.esbuildOptions = {};
            }
            projectJson.targets.build.options.esbuildOptions.external = [
              '@digitaldefiance/*',
            ];

            // Also set external in production configuration
            if (projectJson.targets.build.configurations?.production) {
              if (
                !projectJson.targets.build.configurations.production
                  .esbuildOptions
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
          // Replace serve target to use nx:run-commands instead of @nx/js:node
          // This avoids the issue where @nx/js:node tries to resolve 'nx' module
          // from within the dist directory after yarn install
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
      }

      // Configure React project with explicit build configurations
      const reactProject = projects.find(
        (p) => p.type === 'react' && p.enabled,
      );
      if (reactProject) {
        const projectJsonPath = path.join(
          monorepoPath,
          reactProject.name,
          'project.json',
        );
        if (fs.existsSync(projectJsonPath)) {
          const projectJson = JSON.parse(
            fs.readFileSync(projectJsonPath, 'utf-8'),
          );

          // Add explicit build target with development and production configurations
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
              development: {
                command: 'vite build --mode development',
              },
              production: {
                command: 'vite build --mode production',
              },
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
        }

        // Update vite.config.ts to handle mode properly
        const viteConfigPath = path.join(
          monorepoPath,
          reactProject.name,
          'vite.config.ts',
        );
        if (fs.existsSync(viteConfigPath)) {
          let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');

          // Replace the export default with one that accepts mode parameter
          viteConfig = viteConfig.replace(
            /export default defineConfig\(\(\) => \(\{/,
            'export default defineConfig(({ mode }) => ({',
          );

          // Add mode to config if not already present
          if (!viteConfig.includes('mode:')) {
            viteConfig = viteConfig.replace(
              /cacheDir: '[^']*',/,
              `cacheDir: '../node_modules/.vite/${reactProject.name}',\n  mode: mode || process.env.NODE_ENV || 'production',`,
            );
          }

          // Update build config to conditionally minify with proper TypeScript type assertion
          if (!viteConfig.includes('minify:')) {
            viteConfig = viteConfig.replace(
              /commonjsOptions: \{[^}]*\},/,
              `commonjsOptions: {\n      transformMixedEsModules: true,\n    },\n    minify: mode === 'production' ? ('esbuild' as const) : false,`,
            );
          }

          // Close the config function properly - replace }); at end of file
          viteConfig = viteConfig.replace(/\}\);(\s*)$/, '}));$1');

          fs.writeFileSync(viteConfigPath, viteConfig);
        }
      }
    },
  });

  executor.addStep({
    name: 'updateTsConfigAppFiles',
    description: 'Updating tsconfig.app.json files with skipLibCheck',
    execute: () => {
      // Update tsconfig.app.json for API and inituserdb projects
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
        Logger.info(
          getStarterTranslation(StarterStringKey.PROJECT_INSTALLING_PACKAGE, {
            package: '@digitaldefiance/express-suite-react-components',
            project: reactLibProject.name,
          }),
        );
        const projectPackageJsonPath = path.join(
          monorepoPath,
          reactLibProject.name,
          'package.json',
        );
        const projectPackageJson = JSON.parse(
          fs.readFileSync(projectPackageJsonPath, 'utf-8'),
        );
        projectPackageJson.dependencies = projectPackageJson.dependencies || {};
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
      const variables: Record<string, any> = {
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

      // Helper function to escape strings for TypeScript string literals
      const escapeForTypeScript = (str: string): string => {
        return str
          .replace(/\\/g, '\\\\') // Backslash
          .replace(/'/g, "\\'") // Single quote
          .replace(/"/g, '\\"') // Double quote
          .replace(/\n/g, '\\n') // Newline
          .replace(/\r/g, '\\r') // Carriage return
          .replace(/\t/g, '\\t'); // Tab
      };

      // Template variables for scaffolding
      const scaffoldingVars: Record<string, any> = {
        workspaceName,
        WorkspaceName:
          workspaceName.charAt(0).toUpperCase() +
          workspaceName
            .slice(1)
            .replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
        prefix: projectPrefix,
        namespace: namespaceRoot,
        hostname,
        selectedLanguage,
        siteTitle: escapeForTypeScript(siteTitle),
        siteDescription: escapeForTypeScript(siteDescription),
        siteTagline: escapeForTypeScript(siteTagline),
        // Language-specific boolean flags for conditional rendering
        isEnUs: selectedLanguage === LanguageCodes.EN_US,
        isEnGb: selectedLanguage === LanguageCodes.EN_GB,
        isFr: selectedLanguage === LanguageCodes.FR,
        isEs: selectedLanguage === LanguageCodes.ES,
        isDe: selectedLanguage === LanguageCodes.DE,
        isZhCn: selectedLanguage === LanguageCodes.ZH_CN,
        isJa: selectedLanguage === LanguageCodes.JA,
        isUk: selectedLanguage === LanguageCodes.UK,
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

        // Find and disable the Playwright plugin to avoid daemon worker issues
        if (nxJson.plugins && Array.isArray(nxJson.plugins)) {
          const playwrightPluginIndex = nxJson.plugins.findIndex(
            (plugin: any) =>
              (typeof plugin === 'string' && plugin.includes('playwright')) ||
              (typeof plugin === 'object' &&
                plugin.plugin?.includes('playwright')),
          );

          if (playwrightPluginIndex !== -1) {
            // Comment out or remove the Playwright plugin to avoid daemon issues
            // Users can re-enable it manually if needed after the Nx team fixes the issue
            nxJson.plugins.splice(playwrightPluginIndex, 1);
            Logger.info(
              'Removed Playwright plugin from nx.json to avoid daemon worker issues',
            );
            Logger.info(
              'E2E tests will still work, but without automatic project graph inference',
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

      // Create types directory if it doesn't exist
      if (!fs.existsSync(typesDir)) {
        fs.mkdirSync(typesDir, { recursive: true });
      }

      // Create global.d.ts with Error extensions
      const globalDtsContent = `/**
 * Global ambient type declarations for Error and globalThis extensions
 *
 * This file extends standard TypeScript interfaces to support additional
 * properties and methods used throughout the Digital Defiance monorepo.
 */

/**
 * Extend global interfaces for Error and globalThis
 */
declare global {
  /**
   * Extend Error constructor interface to include V8's captureStackTrace method
   * This is available in Node.js and V8-based environments
   */
  interface ErrorConstructor {
    /**
     * Create a .stack property on the provided targetObject
     * @param targetObject - Object to capture stack trace for
     * @param constructorOpt - Optional constructor function to hide from stack trace
     */
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
  }

  /**
   * Extend Error instance interface to include custom properties
   * used for enhanced error handling throughout the codebase
   *
   * Note: The 'cause' property is already defined in ES2022 Error interface
   */
  interface Error {
    /**
     * Timestamp when error was disposed (for resource cleanup tracking)
     */
    disposedAt?: string;

    /**
     * Error type classification (e.g., 'validation', 'network', 'auth')
     */
    type?: string;

    /**
     * Component identifier where the error originated
     */
    componentId?: string;

    /**
     * Map of reasons or context for the error
     */
    reasonMap?: Record<string, unknown>;

    /**
     * Additional metadata associated with the error
     */
    metadata?: Record<string, unknown>;
  }

  /**
   * Global active context for tracking application state
   * TODO: Define proper type based on actual usage patterns
   */
  var GlobalActiveContext: any;
}

// This export statement is required to make this file a module
// and ensure the global augmentation works correctly
export {};
`;

      fs.writeFileSync(globalDtsPath, globalDtsContent);
      Logger.info('Created types/global.d.ts with Error extensions');

      // Also create node_modules/types/global.d.ts for library references
      const nodeModulesTypesDir = path.join(
        monorepoPath,
        'node_modules',
        'types',
      );
      const nodeModulesGlobalDtsPath = path.join(
        nodeModulesTypesDir,
        'global.d.ts',
      );

      if (!fs.existsSync(nodeModulesTypesDir)) {
        fs.mkdirSync(nodeModulesTypesDir, { recursive: true });
      }

      fs.writeFileSync(nodeModulesGlobalDtsPath, globalDtsContent);
      Logger.info(
        'Created node_modules/types/global.d.ts for library references',
      );
    },
  });

  executor.addStep({
    name: 'generateLicense',
    description: getStarterTranslation(StarterStringKey.STEP_GENERATE_LICENSE),
    execute: async () => {
      await promptAndGenerateLicense(monorepoPath);
    },
  });

  executor.addStep({
    name: 'addScripts',
    description: getStarterTranslation(StarterStringKey.STEP_ADD_SCRIPTS),
    execute: () => {
      const packageJsonPath = path.join(monorepoPath, 'package.json');
      const scriptContext: Record<string, any> = {
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

      const initUserDbProject = projects.find((p) => p.type === 'inituserdb');
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
    //skip: () => !enableDocGeneration || dryRun,
    skip: () => true, // Disabled - README now comes from scaffolding/root/
    execute: async () => {
      const { DocGenerator } = await import('./utils/doc-generator');
      DocGenerator.generateProjectDocs(context);
    },
  });

  executor.addStep({
    name: 'setupEnvironment',
    description: getStarterTranslation(StarterStringKey.STEP_SETUP_ENVIRONMENT),
    execute: () => {
      const apiProject = projects.find((p) => p.type === 'api');
      const initUserDbProject = projects.find((p) => p.type === 'inituserdb');

      // Escape password for .env file usage
      const escapeEnvValue = (value: string) => {
        // Use single quotes - safest for passwords with special chars
        // Only need to escape single quotes themselves
        const escaped = value.replace(/'/g, "'\\''");
        return `'${escaped}'`;
      };

      // Build MONGO_URI with optional password (URL-encode password for special characters)
      const buildMongoUri = (dbName: string) => {
        const auth = mongoPassword
          ? `admin:${encodeURIComponent(mongoPassword)}@`
          : '';
        // authSource=admin is always required when authenticating as admin user
        // replicaSet and directConnection settings depend on the MongoDB setup
        const params =
          devcontainerChoice === 'mongodb-replicaset'
            ? '?authSource=admin&replicaSet=rs0&directConnection=true'
            : '?authSource=admin&directConnection=true';
        return `mongodb://${auth}db:27017/${dbName}${params}`;
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

          // Replace DEV_DATABASE
          if (useInMemoryDb) {
            envContent = envContent.replace(
              /DEV_DATABASE=.*/g,
              `DEV_DATABASE=${devDatabaseName}`,
            );
          } else {
            envContent = envContent.replace(
              /DEV_DATABASE=.*/g,
              'DEV_DATABASE=',
            );
          }

          // Replace secrets
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

          // Replace MONGO_URI if MongoDB devcontainer
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

          // Enable transactions for replica set
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

      // Setup devcontainer .env if devcontainer with MongoDB
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
          const _mongoUri = buildMongoUri(workspaceName);

          // Replace MongoDB configuration for Docker Compose
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
          Logger.info(
            getStarterTranslation(
              StarterStringKey.ENV_CREATED_DEVCONTAINER_FROM_EXAMPLE,
            ),
          );
        } else {
          // Fallback to minimal .env if .env.example doesn't exist
          const envContent = `MONGO_INITDB_ROOT_PASSWORD=${escapeEnvValue(mongoPassword)}\nMONGO_INITDB_DATABASE=${workspaceName}\nCOMPOSE_PROJECT_NAME=${workspaceName}_devcontainer\n`;
          fs.writeFileSync(devcontainerEnvPath, envContent);
          Logger.warning(
            getStarterTranslation(
              StarterStringKey.ENV_CREATED_DEVCONTAINER_MINIMAL,
            ),
          );
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
          Logger.info(
            getStarterTranslation(
              StarterStringKey.ENV_CREATED_DEVCONTAINER_FROM_EXAMPLE,
            ),
          );
        } else {
          Logger.warning(
            `Devcontainer .env.example not found, skipping .env creation for simple devcontainer`,
          );
        }
      }
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
      runCommand('yarn rebuild', { cwd: monorepoPath, dryRun: context.dryRun });
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
    execute: async () => {
      // Ensure git is initialized
      if (!fs.existsSync(path.join(monorepoPath, '.git'))) {
        runCommand('git init', { cwd: monorepoPath, dryRun: context.dryRun });
      }

      const doCommit = await confirm({
        message: getStarterTranslation(
          StarterStringKey.PROMPT_CREATE_INITIAL_COMMIT,
        ),
        default: true,
      });

      if (doCommit) {
        runCommand('git add -A', { cwd: monorepoPath, dryRun: context.dryRun });
        runCommand('git commit -m "Initial commit"', {
          cwd: monorepoPath,
          dryRun: context.dryRun,
        });

        if (gitRepo) {
          const doPush = await confirm({
            message: getStarterTranslation(
              StarterStringKey.PROMPT_PUSH_TO_REMOTE,
            ),
            default: true,
          });

          if (doPush) {
            runCommand('git push --set-upstream origin main', {
              cwd: monorepoPath,
              dryRun: context.dryRun,
            });
          }
        }
      }
    },
  });

  executor.addStep({
    name: 'installPlaywright',
    description: getStarterTranslation(
      StarterStringKey.STEP_INSTALL_PLAYWRIGHT,
    ),
    skip: () => !includeE2e,
    execute: async () => {
      const installPlaywright = await confirm({
        message: getStarterTranslation(
          StarterStringKey.PROMPT_INSTALL_PLAYWRIGHT,
        ),
        default: true,
      });

      if (installPlaywright) {
        Logger.info(
          getStarterTranslation(
            StarterStringKey.COMMAND_INSTALLING_PLAYWRIGHT_BROWSERS,
          ),
        );
        runCommand('yarn playwright install --with-deps', {
          cwd: monorepoPath,
          dryRun: context.dryRun,
        });
      } else {
        Logger.warning(
          getStarterTranslation(StarterStringKey.COMMAND_SKIPPED_PLAYWRIGHT),
        );
      }
    },
  });

  // Execute
  try {
    await executor.execute(context);

    if (dryRun) {
      Logger.warning(
        getStarterTranslation(StarterStringKey.WARNING_DRY_RUN_RERUN),
      );
      process.exit(0);
    }

    Logger.header(
      getStarterTranslation(StarterStringKey.SUCCESS_GENERATION_COMPLETE),
    );
    Logger.success(
      getStarterTranslation(StarterStringKey.SUCCESS_MONOREPO_CREATED, {
        path: Logger.path(monorepoPath),
      }),
    );

    const apiProject = projects.find((p) => p.type === 'api');
    if (apiProject) {
      Logger.warning(
        `\n` +
          getStarterTranslation(StarterStringKey.WARNING_UPDATE_ENV_FILE, {
            name: apiProject.name,
          }),
      );
    }

    if (
      devcontainerChoice === 'mongodb' ||
      devcontainerChoice === 'mongodb-replicaset'
    ) {
      Logger.warning(
        getStarterTranslation(StarterStringKey.WARNING_UPDATE_DEVCONTAINER_ENV),
      );
    }

    Logger.section(getStarterTranslation(StarterStringKey.SECTION_NEXT_STEPS));

    // Add devcontainer setup instructions if applicable
    if (devcontainerChoice !== 'none') {
      Logger.info(`\n📦 DevContainer Setup:`);
      Logger.dim(`  1. Open the folder in VS Code:`);
      Logger.dim(`     code ${workspaceName}`);
      Logger.dim(`  2. When prompted, click "Reopen in Container"`);
      Logger.dim(
        `     Or use Command Palette: "Dev Containers: Rebuild and Reopen in Container"`,
      );
      Logger.dim(`  3. Wait for the container to build and start\n`);
    } else {
      Logger.dim(`  cd ${workspaceName}`);
    }

    if (apiProject) {
      Logger.dim(
        `  ${getStarterTranslation(StarterStringKey.SECTION_NEXT_STEPS_UPDATE_ENV, { name: apiProject.name })}`,
      );
    }

    // Add database initialization instructions for non-memory DB setups
    if (
      !useInMemoryDb &&
      (devcontainerChoice === 'mongodb' ||
        devcontainerChoice === 'mongodb-replicaset')
    ) {
      Logger.info(`\n🗄️  Database Initialization:`);
      Logger.dim(`  yarn build:dev`);
      Logger.dim(
        `  yarn inituserdb:setenv  # Recommended: Automatically updates ${apiProject?.name}/.env`,
      );
      Logger.info(
        `\n  💡 Alternative options:\n` +
          `     • yarn inituserdb           - View credentials without updating .env\n` +
          `     • yarn inituserdb:drop:setenv - Drop DB, reinitialize, and update .env\n`,
      );
      Logger.dim(`\n  yarn serve:dev`);
    } else {
      Logger.info(`\n🚀 Start Development:`);
      Logger.dim(`  yarn build:dev`);
      Logger.dim(`  yarn serve:dev`);
      if (useInMemoryDb) {
        Logger.info(
          `\n  ${getStarterTranslation(StarterStringKey.SECTION_NEXT_STEPS_MEMORY_DB_INFO)}\n`,
        );
      }
    }

    Logger.section(
      getStarterTranslation(StarterStringKey.SECTION_GENERATED_PROJECTS),
    );
    projects.forEach((p) => {
      if (p.enabled) {
        Logger.dim(`  ${p.type.padEnd(12)} ${p.name}`);
      }
    });
  } catch (error) {
    Logger.error(getStarterTranslation(StarterStringKey.GENERATION_FAILED));
    console.error(error);
    process.exit(1);
  }
}

export { main };

if (require.main === module) {
  main().catch((err) => {
    Logger.error(getStarterTranslation(StarterStringKey.ERROR_FATAL));
    console.error(err);
    process.exit(1);
  });
}
