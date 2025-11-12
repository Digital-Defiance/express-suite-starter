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
import { getStarterTranslation, StarterStringKey, getStarterI18nEngine, StarterComponentId } from './i18n';
import { TranslatableGenericError } from '@digitaldefiance/i18n-lib';
import { LanguageCodes } from '@digitaldefiance/i18n-lib';

async function main() {
  printBanner();
  checkAndUseNode();

  // Disable Yarn build scripts globally to avoid native module issues
  process.env.YARN_ENABLE_SCRIPTS = 'false';

  // Language selection
  const selectedLanguage = await select({
    message: 'Select language / Seleccionar idioma / Choisir la langue / Sprache wählen / 选择语言 / 言語を選択 / Виберіть мову:',
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
      message: getStarterTranslation(StarterStringKey.SYSTEM_CHECK_CONTINUE_ANYWAY),
      default: false,
    });
    
    if (!proceed) {
      Logger.info(getStarterTranslation(StarterStringKey.CLI_CANCELLED));
      process.exit(0);
    }
  }

  // Load preset
  const presetPath = path.resolve(__dirname, '../../config/presets/standard.json');
  const preset = JSON.parse(fs.readFileSync(presetPath, 'utf-8'));

  // Prompt for workspace configuration
  Logger.header(getStarterTranslation(StarterStringKey.SECTION_WORKSPACE_CONFIG));

  const workspaceName = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_WORKSPACE_NAME),
    default: 'example-project',
    validate: (val: string) =>
      ConfigValidator.validateWorkspaceName(val) || getStarterTranslation(StarterStringKey.VALIDATION_INVALID_WORKSPACE_NAME),
  });

  const projectPrefix = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_PROJECT_PREFIX),
    default: workspaceName,
    validate: (val: string) =>
      ConfigValidator.validatePrefix(val) || getStarterTranslation(StarterStringKey.VALIDATION_INVALID_PREFIX),
  });

  const namespaceRoot = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_NPM_NAMESPACE),
    default: `@${projectPrefix}`,
    validate: (val: string) =>
      ConfigValidator.validateNamespace(val) || getStarterTranslation(StarterStringKey.VALIDATION_INVALID_NAMESPACE),
  });

  const parentDir = path.resolve(
    await input({
      message: getStarterTranslation(StarterStringKey.PROMPT_PARENT_DIRECTORY),
      default: process.cwd(),
    })
  );

  const gitRepo = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_GIT_REPO),
    validate: (val: string) =>
      ConfigValidator.validateGitRepo(val) || getStarterTranslation(StarterStringKey.VALIDATION_INVALID_GIT_REPO),
  });

  const hostname = await input({
    message: getStarterTranslation(StarterStringKey.PROMPT_HOSTNAME),
    default: `${workspaceName}.local`,
    validate: (val: string) =>
      /^[a-z0-9-]+(\.[a-z0-9-]+)*$/.test(val) || getStarterTranslation(StarterStringKey.VALIDATION_INVALID_HOSTNAME),
  });

  const dryRun = await confirm({
    message: getStarterTranslation(StarterStringKey.PROMPT_DRY_RUN),
    default: false,
  });

  Logger.section(getStarterTranslation(StarterStringKey.SECTION_OPTIONAL_PROJECTS));
  
  const includeE2e = await confirm({
    message: getStarterTranslation(StarterStringKey.PROMPT_INCLUDE_E2E),
    default: true,
  });

  Logger.section(getStarterTranslation(StarterStringKey.SECTION_PACKAGE_GROUPS));
  
  const packageGroupsPath = path.resolve(__dirname, '../../config/package-groups.json');
  const packageGroups = JSON.parse(fs.readFileSync(packageGroupsPath, 'utf-8')).groups;
  
  const selectedGroups = await checkbox({
    message: getStarterTranslation(StarterStringKey.PROMPT_SELECT_PACKAGE_GROUPS),
    choices: packageGroups
      .filter((g: any) => !g.enabled)
      .map((g: any) => ({
        name: `${g.name} - ${g.description}`,
        value: g.name,
        checked: true,
      })),
  });

  const enableDocGeneration = await confirm({
    message: getStarterTranslation(StarterStringKey.PROMPT_ENABLE_DOC_GENERATION),
    default: true,
  });

  Logger.section(getStarterTranslation(StarterStringKey.SECTION_DEVCONTAINER_CONFIG));
  
  const setupDevcontainer = await confirm({
    message: getStarterTranslation(StarterStringKey.PROMPT_SETUP_DEVCONTAINER),
    default: true,
  });

  let devcontainerChoice = 'none';
  let mongoPassword = '';
  if (setupDevcontainer) {
    devcontainerChoice = await select({
      message: getStarterTranslation(StarterStringKey.PROMPT_DEVCONTAINER_CONFIG),
      choices: [
        { name: getStarterTranslation(StarterStringKey.DEVCONTAINER_SIMPLE), value: 'simple' },
        { name: getStarterTranslation(StarterStringKey.DEVCONTAINER_MONGODB), value: 'mongodb' },
        { name: getStarterTranslation(StarterStringKey.DEVCONTAINER_MONGODB_REPLICASET), value: 'mongodb-replicaset' },
      ],
      default: 'mongodb-replicaset',
    });
    
    if (devcontainerChoice === 'mongodb' || devcontainerChoice === 'mongodb-replicaset') {
      mongoPassword = await input({
        message: getStarterTranslation(StarterStringKey.PROMPT_MONGO_PASSWORD),
        validate: (val: string) => val.length > 0 || getStarterTranslation(StarterStringKey.VALIDATION_PASSWORD_REQUIRED),
      });
    }
  }

  Logger.section(getStarterTranslation(StarterStringKey.SECTION_DATABASE_CONFIG));
  
  const useInMemoryDb = await confirm({
    message: getStarterTranslation(StarterStringKey.PROMPT_USE_IN_MEMORY_DB),
    default: false,
  });
  
  let devDatabaseName = '';
  if (useInMemoryDb) {
    devDatabaseName = await input({
      message: getStarterTranslation(StarterStringKey.PROMPT_DEV_DATABASE_NAME),
      default: 'test',
      validate: (val: string) => val.length > 0 || getStarterTranslation(StarterStringKey.VALIDATION_DATABASE_NAME_REQUIRED),
    });
  }

  Logger.section(getStarterTranslation(StarterStringKey.SECTION_SECURITY_CONFIG));
  
  const crypto = await import('crypto');
  const HEX_64_REGEX = /^[0-9a-f]{64}$/i;
  
  const promptOrGenerateSecret = async (name: string): Promise<string> => {
    const generate = await confirm({
      message: getStarterTranslation(StarterStringKey.PROMPT_GENERATE_SECRET, { name }),
      default: true,
    });
    
    if (generate) {
      const secret = crypto.randomBytes(32).toString('hex');
      Logger.info(getStarterTranslation(StarterStringKey.ENV_GENERATED_SECRET, { name }));
      return secret;
    } else {
      return await input({
        message: getStarterTranslation(StarterStringKey.PROMPT_ENTER_SECRET, { name }),
        validate: (val: string) => HEX_64_REGEX.test(val) || getStarterTranslation(StarterStringKey.VALIDATION_MUST_BE_HEX_64),
      });
    }
  };
  
  const jwtSecret = await promptOrGenerateSecret('JWT_SECRET');
  const mnemonicEncryptionKey = await promptOrGenerateSecret('MNEMONIC_ENCRYPTION_KEY');
  const mnemonicHmacSecret = await promptOrGenerateSecret('MNEMONIC_HMAC_SECRET');

  Logger.section(getStarterTranslation(StarterStringKey.SECTION_EXPRESS_SUITE_PACKAGES));

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
    validation.errors.forEach(err => Logger.error(err));
    process.exit(1);
  }

  // Setup context with all project names
  const stateEntries: [string, any][] = [
    ['monorepoPath', monorepoPath],
    ['templatesDir', path.resolve(__dirname, '../../templates')],
    ['scaffoldingDir', path.resolve(__dirname, '../../scaffolding')],
  ];

  projects.forEach(project => {
    stateEntries.push([project.type === 'lib' ? 'libName' : `${project.type}Name`, project.name]);
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
    Logger.warning(getStarterTranslation(StarterStringKey.GENERATION_DRY_RUN_MODE));
  }

  executor.addStep({
    name: 'checkTargetDir',
    description: getStarterTranslation(StarterStringKey.STEP_CHECK_TARGET_DIR),
    execute: () => {
      if (fs.existsSync(monorepoPath) && fs.readdirSync(monorepoPath).length > 0) {
        throw new TranslatableGenericError(
          StarterComponentId,
          StarterStringKey.ERROR_DIRECTORY_NOT_EMPTY,
          { path: monorepoPath }
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
        { cwd: parentDir, dryRun: context.dryRun }
      );
    },
  });

  executor.addStep({
    name: 'updateTsConfigBase',
    description: getStarterTranslation(StarterStringKey.STEP_UPDATE_TSCONFIG_BASE),
    execute: (context) => {
      const tsconfigBasePath = path.join(monorepoPath, 'tsconfig.base.json');
      if (fs.existsSync(tsconfigBasePath)) {
        const tsconfigBase = JSON.parse(fs.readFileSync(tsconfigBasePath, 'utf-8'));
        
        // Add esModuleInterop and allowSyntheticDefaultImports to compilerOptions
        tsconfigBase.compilerOptions = tsconfigBase.compilerOptions || {};
        tsconfigBase.compilerOptions.esModuleInterop = true;
        tsconfigBase.compilerOptions.allowSyntheticDefaultImports = true;
        
        fs.writeFileSync(tsconfigBasePath, JSON.stringify(tsconfigBase, null, 2) + '\n');
        Logger.info(getStarterTranslation(StarterStringKey.TSCONFIG_BASE_UPDATED));
      }
    },
  });

  executor.addStep({
    name: 'setupGitOrigin',
    description: getStarterTranslation(StarterStringKey.STEP_SETUP_GIT_ORIGIN),
    skip: () => !gitRepo,
    execute: () => {
      runCommand(`git remote add origin ${gitRepo}`, { cwd: monorepoPath, dryRun: context.dryRun });
    },
  });

  executor.addStep({
    name: 'yarnBerrySetup',
    description: getStarterTranslation(StarterStringKey.STEP_YARN_BERRY_SETUP),
    execute: () => {
      runCommand('yarn set version berry', { cwd: monorepoPath, dryRun: context.dryRun });
      runCommand('yarn config set nodeLinker node-modules', { cwd: monorepoPath, dryRun: context.dryRun });
      runCommand('yarn', { cwd: monorepoPath, dryRun: context.dryRun });
    },
  });

  executor.addStep({
    name: 'addNxPlugins',
    description: getStarterTranslation(StarterStringKey.STEP_ADD_NX_PLUGINS),
    execute: () => {
      try {
        runCommand('yarn add -D @nx/react @nx/node', { cwd: monorepoPath, dryRun: context.dryRun });
      } catch (error: any) {
        if (error.status === 1) {
          Logger.error('\n' + getStarterTranslation(StarterStringKey.PACKAGE_INSTALLATION_FAILED));
          Logger.section(getStarterTranslation(StarterStringKey.PACKAGE_INSTALL_BUILD_TOOLS));
          Logger.dim('  ' + getStarterTranslation(StarterStringKey.SYSTEM_CHECK_UBUNTU_DEBIAN));
          Logger.dim('  ' + getStarterTranslation(StarterStringKey.SYSTEM_CHECK_FEDORA_RHEL));
          Logger.dim('  ' + getStarterTranslation(StarterStringKey.SYSTEM_CHECK_MACOS));
          Logger.section('\n' + getStarterTranslation(StarterStringKey.PACKAGE_RETRY_OR_SKIP));
        }
        throw error;
      }
    },
  });

  executor.addStep({
    name: 'addYarnPackages',
    description: getStarterTranslation(StarterStringKey.STEP_ADD_YARN_PACKAGES),
    execute: () => {
      const devPkgs = config.packages?.dev || [];
      const prodPkgs = config.packages?.prod || [];
      
      if (devPkgs.length > 0) {
        runCommand(`yarn add -D ${devPkgs.join(' ')}`, { cwd: monorepoPath, dryRun: context.dryRun });
      }
      if (prodPkgs.length > 0) {
        runCommand(`yarn add ${prodPkgs.join(' ')}`, { cwd: monorepoPath, dryRun: context.dryRun });
      }
    },
  });

  executor.addStep({
    name: 'generateProjects',
    description: getStarterTranslation(StarterStringKey.STEP_GENERATE_PROJECTS),
    execute: () => {
      projects.forEach(project => {
        if (!project.enabled) return;
        
        Logger.info(getStarterTranslation(StarterStringKey.PROJECT_GENERATING, { type: project.type, name: project.name }));
        
        switch (project.type) {
          case 'react':
            ProjectGenerator.generateReact(project, monorepoPath, config.nx, context.dryRun);
            break;
          case 'react-lib':
            ProjectGenerator.generateReactLib(project, monorepoPath, config.nx, context.dryRun);
            break;
          case 'api':
            ProjectGenerator.generateApi(project, monorepoPath, config.nx, context.dryRun);
            break;
          case 'api-lib':
            ProjectGenerator.generateApiLib(project, monorepoPath, config.nx, context.dryRun);
            break;
          case 'lib':
            ProjectGenerator.generateLib(project, monorepoPath, config.nx, context.dryRun);
            break;
          case 'inituserdb':
            ProjectGenerator.generateInitUserDb(project, monorepoPath, context.dryRun);
            break;
        }
      });
      
      // Add copy-env and post-build targets to api and inituserdb project.json
      const apiProject = projects.find(p => p.type === 'api' && p.enabled);
      const initUserDbProject = projects.find(p => p.type === 'inituserdb' && p.enabled);
      
      if (apiProject) {
        const projectJsonPath = path.join(monorepoPath, apiProject.name, 'project.json');
        if (fs.existsSync(projectJsonPath)) {
          const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
          
          // Configure assets with proper object notation for esbuild executor
          if (projectJson.targets?.build?.options) {
            // Convert any existing string-format assets to object notation
            const existingAssets = projectJson.targets.build.options.assets || [];
            const newAssets = [];
            
            // Check if assets already contains object notation
            const hasObjectAssets = existingAssets.some((asset: any) => 
              typeof asset === 'object' && asset.input
            );
            
            if (!hasObjectAssets) {
              // Add assets directory with proper object notation
              newAssets.push({
                input: `${apiProject.name}/src/assets`,
                glob: '**/*',
                output: 'assets'
              });
              
              // Add views directory with proper object notation
              newAssets.push({
                input: `${apiProject.name}/src/views`,
                glob: '**/*',
                output: 'views'
              });
              
              projectJson.targets.build.options.assets = newAssets;
            } else {
              // Check if views is already configured
              const hasViews = existingAssets.some((asset: any) => 
                (typeof asset === 'string' && asset.includes('/views')) ||
                (typeof asset === 'object' && asset.input?.includes('/views'))
              );
              
              if (!hasViews) {
                existingAssets.push({
                  input: `${apiProject.name}/src/views`,
                  glob: '**/*',
                  output: 'views'
                });
              }
            }
          }
          
          projectJson.targets['copy-env'] = {
            executor: 'nx:run-commands',
            options: {
              command: `cp ${apiProject.name}/.env dist/${apiProject.name}/.env`
            }
          };
          projectJson.targets['post-build'] = {
            executor: 'nx:run-commands',
            dependsOn: ['build'],
            options: {
              command: `cp ${apiProject.name}/.env dist/${apiProject.name}/.env`
            }
          };
          // Update serve to depend on post-build instead of build
          if (projectJson.targets.serve) {
            projectJson.targets.serve.dependsOn = ['post-build'];
            projectJson.targets.serve.options.buildTarget = `${apiProject.name}:post-build`;
            if (projectJson.targets.serve.configurations) {
              Object.keys(projectJson.targets.serve.configurations).forEach(config => {
                projectJson.targets.serve.configurations[config].buildTarget = `${apiProject.name}:post-build`;
              });
            }
          }
          fs.writeFileSync(projectJsonPath, JSON.stringify(projectJson, null, 2) + '\n');
          Logger.info(getStarterTranslation(StarterStringKey.PROJECT_ADDED_TARGETS, { name: apiProject.name }));
        }
      }
      
      if (initUserDbProject) {
        const projectJsonPath = path.join(monorepoPath, initUserDbProject.name, 'project.json');
        if (fs.existsSync(projectJsonPath)) {
          const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
          projectJson.targets['copy-env'] = {
            executor: 'nx:run-commands',
            options: {
              command: `cp ${initUserDbProject.name}/.env dist/${initUserDbProject.name}/.env`
            }
          };
          projectJson.targets['post-build'] = {
            executor: 'nx:run-commands',
            dependsOn: ['build'],
            options: {
              commands: [
                `cp ${initUserDbProject.name}/.env dist/${initUserDbProject.name}/.env`,
                `cd dist/${initUserDbProject.name} && yarn install`
              ],
              parallel: false
            }
          };
          // Update serve to depend on post-build instead of build
          if (projectJson.targets.serve) {
            projectJson.targets.serve.dependsOn = ['post-build'];
            projectJson.targets.serve.options.buildTarget = `${initUserDbProject.name}:post-build`;
            if (projectJson.targets.serve.configurations) {
              Object.keys(projectJson.targets.serve.configurations).forEach(config => {
                projectJson.targets.serve.configurations[config].buildTarget = `${initUserDbProject.name}:post-build`;
              });
            }
          }
          fs.writeFileSync(projectJsonPath, JSON.stringify(projectJson, null, 2) + '\n');
          Logger.info(getStarterTranslation(StarterStringKey.PROJECT_ADDED_TARGETS, { name: initUserDbProject.name }));
        }
      }
      
      // Configure React project with explicit build configurations
      const reactProject = projects.find(p => p.type === 'react' && p.enabled);
      if (reactProject) {
        const projectJsonPath = path.join(monorepoPath, reactProject.name, 'project.json');
        if (fs.existsSync(projectJsonPath)) {
          const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
          
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
              command: 'vite build --mode development'
            },
            configurations: {
              development: {
                command: 'vite build --mode development'
              },
              production: {
                command: 'vite build --mode production'
              }
            }
          };
          
          fs.writeFileSync(projectJsonPath, JSON.stringify(projectJson, null, 2) + '\n');
          Logger.info(getStarterTranslation(StarterStringKey.PROJECT_ADDED_TARGETS, { name: reactProject.name }));
        }
        
        // Update vite.config.ts to handle mode properly
        const viteConfigPath = path.join(monorepoPath, reactProject.name, 'vite.config.ts');
        if (fs.existsSync(viteConfigPath)) {
          let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
          
          // Replace the export default with one that accepts mode parameter
          viteConfig = viteConfig.replace(
            /export default defineConfig\(\{/,
            'export default defineConfig(({ mode }) => ({'
          );
          
          // Add mode to config if not already present
          if (!viteConfig.includes('mode:')) {
            viteConfig = viteConfig.replace(
              /cacheDir: '[^']*',/,
              `cacheDir: '../node_modules/.vite/${reactProject.name}',\n  mode: mode || process.env.NODE_ENV || 'production',`
            );
          }
          
          // Update build config to conditionally minify
          if (!viteConfig.includes('minify:')) {
            viteConfig = viteConfig.replace(
              /commonjsOptions: \{[^}]*\},/,
              `commonjsOptions: {\n      transformMixedEsModules: true,\n    },\n    minify: mode === 'production' ? 'esbuild' : false,`
            );
          }
          
          // Close the config function properly
          viteConfig = viteConfig.replace(/\}\);$/, '}));');
          
          fs.writeFileSync(viteConfigPath, viteConfig);
        }
      }
    },
  });

  executor.addStep({
    name: 'installReactComponents',
    description: getStarterTranslation(StarterStringKey.STEP_INSTALL_REACT_COMPONENTS),
    execute: () => {
      const reactLibProject = projects.find(p => p.type === 'react-lib' && p.enabled);
      
      if (reactLibProject) {
        Logger.info(getStarterTranslation(StarterStringKey.PROJECT_INSTALLING_PACKAGE, { package: '@digitaldefiance/express-suite-react-components', project: reactLibProject.name }));
        const projectPackageJsonPath = path.join(monorepoPath, reactLibProject.name, 'package.json');
        const projectPackageJson = JSON.parse(fs.readFileSync(projectPackageJsonPath, 'utf-8'));
        projectPackageJson.dependencies = projectPackageJson.dependencies || {};
        projectPackageJson.dependencies['@digitaldefiance/express-suite-react-components'] = 'latest';
        fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2) + '\n');
        runCommand('yarn install', { cwd: monorepoPath, dryRun: context.dryRun });
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
        EXAMPLE_PASSWORD: obfuscatePassword(projectPrefix),
        EXAMPLE_JWT_SECRET: obfuscatePassword(`${workspaceName}Secret`),
        GIT_REPO: gitRepo,
        NVM_USE_VERSION: config.node?.version,
        YARN_VERSION: config.node?.yarnVersion,
      };

      projects.forEach(project => {
        const key = project.type === 'lib' ? 'LIB_NAME' : `${project.type.toUpperCase().replace(/-/g, '_')}_NAME`;
        variables[key] = project.name;
      });

      renderTemplates(
        context.state.get('templatesDir'),
        monorepoPath,
        variables,
        config.templates?.engine,
        context.dryRun
      );
    },
  });

  executor.addStep({
    name: 'copyScaffolding',
    description: getStarterTranslation(StarterStringKey.STEP_COPY_SCAFFOLDING),
    execute: () => {
      const scaffoldingDir = context.state.get('scaffoldingDir');
      
      // Template variables for scaffolding
      const scaffoldingVars: Record<string, any> = {
        workspaceName,
        WorkspaceName: workspaceName.charAt(0).toUpperCase() + workspaceName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
        prefix: projectPrefix,
        namespace: namespaceRoot,
        hostname,
      };
      
      // Copy root scaffolding
      const rootSrc = path.join(scaffoldingDir, 'root');
      if (fs.existsSync(rootSrc)) {
        copyDir(rootSrc, monorepoPath, scaffoldingVars, 'mustache', context.dryRun);
      }

      // Copy devcontainer configuration
      if (devcontainerChoice !== 'none') {
        const devcontainerSrc = path.join(scaffoldingDir, `devcontainer-${devcontainerChoice}`);
        if (fs.existsSync(devcontainerSrc)) {
          Logger.info(`Copying devcontainer configuration: ${devcontainerChoice}`);
          copyDir(devcontainerSrc, monorepoPath, scaffoldingVars, 'handlebars', context.dryRun);
        }
      }

      // Copy project-specific scaffolding
      projects.forEach(project => {
        const projectSrc = path.join(scaffoldingDir, project.type);
        if (fs.existsSync(projectSrc)) {
          copyDir(projectSrc, path.join(monorepoPath, project.name), scaffoldingVars, 'mustache', context.dryRun);
        }
      });
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

      projects.forEach(project => {
        scriptContext[`${project.type}Name`] = project.name;
      });

      const addScripts: Record<string, string> = {
        'build': 'NODE_ENV=production npx nx run-many --target=build --all --configuration=production',
        'build:dev': 'NODE_ENV=development npx nx run-many --target=build --all --configuration=development',
        'test:all': 'yarn test:jest && yarn test:e2e',
        'test:jest': 'NODE_ENV=development npx nx run-many --target=test --all --configuration=development',
        'lint:all': 'npx nx run-many --target=lint --all',
        'prettier:check': "prettier --check '**/*.{ts,tsx}'",
        'prettier:fix': "prettier --write '**/*.{ts,tsx}'",
      };

      const apiProject = projects.find(p => p.type === 'api');
      if (apiProject) {
        addScripts['serve'] = `npx nx serve ${apiProject.name} --configuration production`;
        addScripts['serve:stream'] = `npx nx serve ${apiProject.name} --configuration production --output-style=stream`;
        addScripts['serve:dev'] = `npx nx serve ${apiProject.name} --configuration development`;
        addScripts['serve:dev:stream'] = `npx nx serve ${apiProject.name} --configuration development --output-style=stream`;
        addScripts['build:api'] = `npx nx build ${apiProject.name}`;
      }

      const reactProject = projects.find(p => p.type === 'react');
      if (reactProject) {
        addScripts['build:react'] = `npx nx build ${reactProject.name}`;
      }

      const initUserDbProject = projects.find(p => p.type === 'inituserdb');
      if (initUserDbProject) {
        addScripts['inituserdb'] = `yarn build:dev && npx nx serve ${initUserDbProject.name} --output-style=stream`;
        addScripts['inituserdb:drop'] = `yarn build:dev && npx nx serve ${initUserDbProject.name} --output-style=stream --args=--drop`;
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
    description: getStarterTranslation(StarterStringKey.STEP_GENERATE_DOCUMENTATION),
    skip: () => !enableDocGeneration || dryRun,
    execute: async () => {
      const { DocGenerator } = await import('./utils/doc-generator');
      DocGenerator.generateProjectDocs(context);
    },
  });

  executor.addStep({
    name: 'setupEnvironment',
    description: getStarterTranslation(StarterStringKey.STEP_SETUP_ENVIRONMENT),
    execute: () => {
      const apiProject = projects.find(p => p.type === 'api');
      const initUserDbProject = projects.find(p => p.type === 'inituserdb');
      
      // Escape password for .env file usage
      const escapeEnvValue = (value: string) => {
        // Use single quotes - safest for passwords with special chars
        // Only need to escape single quotes themselves
        const escaped = value.replace(/'/g, "'\\''")
        return `'${escaped}'`;
      };
      
      // Build MONGO_URI with optional password (URL-encode password for special characters)
      const buildMongoUri = (dbName: string) => {
        const auth = mongoPassword ? `admin:${encodeURIComponent(mongoPassword)}@` : '';
        // authSource=admin is always required when authenticating as admin user
        // replicaSet and directConnection settings depend on the MongoDB setup
        const params = devcontainerChoice === 'mongodb-replicaset'
          ? '?authSource=admin&replicaSet=rs0&directConnection=true'
          : '?authSource=admin&directConnection=true';
        return `mongodb://${auth}db:27017/${dbName}${params}`;
      };
      
      // Setup API .env
      if (apiProject) {
        const envExamplePath = path.join(monorepoPath, apiProject.name, '.env.example');
        const envPath = path.join(monorepoPath, apiProject.name, '.env');
        if (fs.existsSync(envExamplePath)) {
          let envContent = fs.readFileSync(envExamplePath, 'utf-8');
          
          // Replace DEV_DATABASE
          if (useInMemoryDb) {
            envContent = envContent.replace(/DEV_DATABASE=.*/g, `DEV_DATABASE=${devDatabaseName}`);
          } else {
            envContent = envContent.replace(/DEV_DATABASE=.*/g, 'DEV_DATABASE=');
          }
          
          // Replace secrets
          envContent = envContent.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${jwtSecret}`);
          envContent = envContent.replace(/MNEMONIC_ENCRYPTION_KEY=.*/g, `MNEMONIC_ENCRYPTION_KEY=${mnemonicEncryptionKey}`);
          envContent = envContent.replace(/MNEMONIC_HMAC_SECRET=.*/g, `MNEMONIC_HMAC_SECRET=${mnemonicHmacSecret}`);
          
          // Replace MONGO_URI if MongoDB devcontainer
          if (devcontainerChoice === 'mongodb' || devcontainerChoice === 'mongodb-replicaset') {
            const mongoUri = buildMongoUri(workspaceName);
            envContent = envContent.replace(/MONGO_URI=.*/g, `MONGO_URI=${mongoUri}`);
          }
          
          // Enable transactions for replica set
          if (devcontainerChoice === 'mongodb-replicaset') {
            envContent = envContent.replace(/MONGO_USE_TRANSACTIONS=.*/g, 'MONGO_USE_TRANSACTIONS=true');
          } else {
            envContent = envContent.replace(/MONGO_USE_TRANSACTIONS=.*/g, 'MONGO_USE_TRANSACTIONS=false');
          }
          
          fs.writeFileSync(envPath, envContent);
          Logger.info(`Created ${apiProject.name}/.env with secrets`);
        }
      }
      
      // Setup inituserdb .env
      if (initUserDbProject && apiProject) {
        const apiEnvPath = path.join(monorepoPath, apiProject.name, '.env');
        const initEnvPath = path.join(monorepoPath, initUserDbProject.name, '.env');
        if (fs.existsSync(apiEnvPath)) {
          fs.copyFileSync(apiEnvPath, initEnvPath);
          Logger.info(`Created ${initUserDbProject.name}/.env from ${apiProject.name}/.env`);
        }
      }
      
      // Setup devcontainer .env if devcontainer with MongoDB
      if (devcontainerChoice === 'mongodb' || devcontainerChoice === 'mongodb-replicaset') {
        const devcontainerEnvExamplePath = path.join(monorepoPath, '.devcontainer', '.env.example');
        const devcontainerEnvPath = path.join(monorepoPath, '.devcontainer', '.env');
        
        if (fs.existsSync(devcontainerEnvExamplePath)) {
          let envContent = fs.readFileSync(devcontainerEnvExamplePath, 'utf-8');
          const mongoUri = buildMongoUri(workspaceName);
          
          // Replace MongoDB configuration for Docker Compose
          envContent = envContent.replace(/MONGO_INITDB_ROOT_PASSWORD=.*/g, `MONGO_INITDB_ROOT_PASSWORD=${escapeEnvValue(mongoPassword)}`);
          envContent = envContent.replace(/MONGO_INITDB_DATABASE=.*/g, `MONGO_INITDB_DATABASE=${workspaceName}`);
          envContent = envContent.replace(/COMPOSE_PROJECT_NAME=.*/g, `COMPOSE_PROJECT_NAME=${workspaceName}_devcontainer`);
          
          fs.writeFileSync(devcontainerEnvPath, envContent);
          Logger.info(getStarterTranslation(StarterStringKey.ENV_CREATED_DEVCONTAINER_FROM_EXAMPLE));
        } else {
          // Fallback to minimal .env if .env.example doesn't exist
          const envContent = `MONGO_INITDB_ROOT_PASSWORD=${escapeEnvValue(mongoPassword)}\nMONGO_INITDB_DATABASE=${workspaceName}\nCOMPOSE_PROJECT_NAME=${workspaceName}_devcontainer\n`;
          fs.writeFileSync(devcontainerEnvPath, envContent);
          Logger.warning(getStarterTranslation(StarterStringKey.ENV_CREATED_DEVCONTAINER_MINIMAL));
        }
      }
    },
  });

  executor.addStep({
    name: 'rebuildNativeModules',
    description: getStarterTranslation(StarterStringKey.STEP_REBUILD_NATIVE_MODULES),
    execute: () => {
      Logger.info(getStarterTranslation(StarterStringKey.COMMAND_REBUILDING_NATIVE));
      runCommand('yarn config set enableScripts true', { cwd: monorepoPath, dryRun: context.dryRun });
      runCommand('yarn rebuild', { cwd: monorepoPath, dryRun: context.dryRun });
    },
  });

  executor.addStep({
    name: 'validateGeneration',
    description: getStarterTranslation(StarterStringKey.STEP_VALIDATE_GENERATION),
    skip: () => dryRun,
    execute: async () => {
      const { PostGenerationValidator } = await import('./core/validators/post-generation-validator');
      const report = await PostGenerationValidator.validate(context);
      PostGenerationValidator.printReport(report);
      
      if (!report.passed) {
        Logger.warning(getStarterTranslation(StarterStringKey.WARNING_VALIDATION_ERRORS));
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
        message: getStarterTranslation(StarterStringKey.PROMPT_CREATE_INITIAL_COMMIT),
        default: true,
      });

      if (doCommit) {
        runCommand('git add -A', { cwd: monorepoPath, dryRun: context.dryRun });
        runCommand('git commit -m "Initial commit"', { cwd: monorepoPath, dryRun: context.dryRun });

        if (gitRepo) {
          const doPush = await confirm({
            message: getStarterTranslation(StarterStringKey.PROMPT_PUSH_TO_REMOTE),
            default: true,
          });

          if (doPush) {
            runCommand('git push --set-upstream origin main', { cwd: monorepoPath, dryRun: context.dryRun });
          }
        }
      }
    },
  });

  executor.addStep({
    name: 'installPlaywright',
    description: getStarterTranslation(StarterStringKey.STEP_INSTALL_PLAYWRIGHT),
    skip: () => !includeE2e,
    execute: async () => {
      const installPlaywright = await confirm({
        message: getStarterTranslation(StarterStringKey.PROMPT_INSTALL_PLAYWRIGHT),
        default: true,
      });

      if (installPlaywright) {
        Logger.info(getStarterTranslation(StarterStringKey.COMMAND_INSTALLING_PLAYWRIGHT_BROWSERS));
        runCommand('yarn playwright install --with-deps', { cwd: monorepoPath, dryRun: context.dryRun });
      } else {
        Logger.warning(getStarterTranslation(StarterStringKey.COMMAND_SKIPPED_PLAYWRIGHT));
      }
    },
  });

  // Execute
  try {
    await executor.execute(context);
    
    if (dryRun) {
      Logger.warning(getStarterTranslation(StarterStringKey.WARNING_DRY_RUN_RERUN));
      process.exit(0);
    }
    
    Logger.header(getStarterTranslation(StarterStringKey.SUCCESS_GENERATION_COMPLETE));
    Logger.success(getStarterTranslation(StarterStringKey.SUCCESS_MONOREPO_CREATED, { path: Logger.path(monorepoPath) }));
    
    const apiProject = projects.find(p => p.type === 'api');
    if (apiProject) {
      Logger.warning(`\n` + getStarterTranslation(StarterStringKey.WARNING_UPDATE_ENV_FILE, { name: apiProject.name }));
    }
    
    if (devcontainerChoice === 'mongodb' || devcontainerChoice === 'mongodb-replicaset') {
      Logger.warning(getStarterTranslation(StarterStringKey.WARNING_UPDATE_DEVCONTAINER_ENV));
    }
    
    Logger.section(getStarterTranslation(StarterStringKey.SECTION_NEXT_STEPS));
    Logger.dim(`  cd ${workspaceName}`);
    if (apiProject) {
      Logger.dim(`  ${getStarterTranslation(StarterStringKey.SECTION_NEXT_STEPS_UPDATE_ENV, { name: apiProject.name })}`);
    }
    Logger.dim(`  yarn build:dev`);
    Logger.dim(`  yarn serve:dev`);
    
    Logger.section(getStarterTranslation(StarterStringKey.SECTION_GENERATED_PROJECTS));
    projects.forEach(p => {
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
