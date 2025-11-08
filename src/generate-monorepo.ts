import input from '@inquirer/input';
import select from '@inquirer/select';
import confirm from '@inquirer/confirm';
import checkbox from '@inquirer/checkbox';
import * as path from 'path';
import * as fs from 'fs';
import { printBanner } from '../scripts/albatross';
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

async function main() {
  printBanner();
  checkAndUseNode();

  // Disable Yarn build scripts globally to avoid native module issues
  process.env.YARN_ENABLE_SCRIPTS = 'false';

  // System check
  Logger.header('System Check');
  const systemCheck = SystemCheck.check();
  SystemCheck.printReport(systemCheck);
  
  if (!systemCheck.passed) {
    const proceed = await confirm({
      message: 'Continue anyway? (Installation may fail)',
      default: false,
    });
    
    if (!proceed) {
      Logger.info('Cancelled. Please install required tools and try again.');
      process.exit(0);
    }
  }

  // Load preset
  const presetPath = path.resolve(__dirname, '../../config/presets/standard.json');
  const preset = JSON.parse(fs.readFileSync(presetPath, 'utf-8'));

  // Prompt for workspace configuration
  Logger.header('Workspace Configuration');

  const workspaceName = await input({
    message: 'Enter the workspace name:',
    default: 'example-project',
    validate: (val: string) =>
      ConfigValidator.validateWorkspaceName(val) || 'Invalid workspace name (letters, numbers, dashes only)',
  });

  const projectPrefix = await input({
    message: 'Enter the project prefix:',
    default: workspaceName,
    validate: (val: string) =>
      ConfigValidator.validatePrefix(val) || 'Invalid prefix (lowercase letters, numbers, dashes only)',
  });

  const namespaceRoot = await input({
    message: 'Enter the npm namespace:',
    default: `@${projectPrefix}`,
    validate: (val: string) =>
      ConfigValidator.validateNamespace(val) || 'Invalid namespace (must start with @)',
  });

  const parentDir = path.resolve(
    await input({
      message: 'Enter the parent directory:',
      default: process.cwd(),
    })
  );

  const gitRepo = await input({
    message: 'Enter the git repository URL (optional):',
    validate: (val: string) =>
      ConfigValidator.validateGitRepo(val) || 'Invalid git repository URL',
  });

  const hostname = await input({
    message: 'Enter the hostname for development (e.g., example-project.local):',
    default: `${workspaceName}.local`,
    validate: (val: string) =>
      /^[a-z0-9-]+(\.[a-z0-9-]+)*$/.test(val) || 'Invalid hostname format',
  });

  const dryRun = await confirm({
    message: 'Run in dry-run mode (preview without creating files)?',
    default: false,
  });

  Logger.section('Optional Projects');
  
  const includeE2e = await confirm({
    message: 'Include E2E tests?',
    default: true,
  });

  Logger.section('Package Groups');
  
  const packageGroupsPath = path.resolve(__dirname, '../../config/package-groups.json');
  const packageGroups = JSON.parse(fs.readFileSync(packageGroupsPath, 'utf-8')).groups;
  
  const selectedGroups = await checkbox({
    message: 'Select optional package groups:',
    choices: packageGroups
      .filter((g: any) => !g.enabled)
      .map((g: any) => ({
        name: `${g.name} - ${g.description}`,
        value: g.name,
        checked: true,
      })),
  });

  const enableDocGeneration = await confirm({
    message: 'Generate documentation (README, ARCHITECTURE, API docs)?',
    default: true,
  });

  Logger.section('DevContainer Configuration');
  
  const setupDevcontainer = await confirm({
    message: 'Set up DevContainer configuration?',
    default: true,
  });

  let devcontainerChoice = 'none';
  let mongoPassword = '';
  if (setupDevcontainer) {
    devcontainerChoice = await select({
      message: 'DevContainer configuration:',
      choices: [
        { name: 'Simple (Node.js only)', value: 'simple' },
        { name: 'With MongoDB', value: 'mongodb' },
        { name: 'With MongoDB Replica Set', value: 'mongodb-replicaset' },
      ],
      default: 'mongodb-replicaset',
    });
    
    if (devcontainerChoice === 'mongodb' || devcontainerChoice === 'mongodb-replicaset') {
      mongoPassword = await input({
        message: 'Enter MongoDB root password:',
        validate: (val: string) => val.length > 0 || 'Password required',
      });
    }
  }

  Logger.section('Database Configuration');
  
  const useInMemoryDb = await confirm({
    message: 'Use in-memory database for development?',
    default: false,
  });
  
  let devDatabaseName = '';
  if (useInMemoryDb) {
    devDatabaseName = await input({
      message: 'Enter the in-memory database name:',
      default: 'test',
      validate: (val: string) => val.length > 0 || 'Database name cannot be empty',
    });
  }

  Logger.section('Security Configuration');
  
  const crypto = await import('crypto');
  const HEX_64_REGEX = /^[0-9a-f]{64}$/i;
  
  const promptOrGenerateSecret = async (name: string): Promise<string> => {
    const generate = await confirm({
      message: `Generate ${name}?`,
      default: true,
    });
    
    if (generate) {
      const secret = crypto.randomBytes(32).toString('hex');
      Logger.info(`Generated ${name}`);
      return secret;
    } else {
      return await input({
        message: `Enter ${name} (64-character hex string):`,
        validate: (val: string) => HEX_64_REGEX.test(val) || 'Must be 64-character hex string',
      });
    }
  };
  
  const jwtSecret = await promptOrGenerateSecret('JWT_SECRET');
  const mnemonicEncryptionKey = await promptOrGenerateSecret('MNEMONIC_ENCRYPTION_KEY');
  const mnemonicHmacSecret = await promptOrGenerateSecret('MNEMONIC_HMAC_SECRET');

  Logger.section('Express Suite Packages');

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
    Logger.warning('DRY RUN MODE - No files will be created');
  }

  executor.addStep({
    name: 'checkTargetDir',
    description: 'Checking target directory',
    execute: () => {
      if (fs.existsSync(monorepoPath) && fs.readdirSync(monorepoPath).length > 0) {
        throw new Error(`Directory ${Logger.path(monorepoPath)} already exists and is not empty`);
      }
    },
  });

  executor.addStep({
    name: 'createMonorepo',
    description: 'Creating Nx monorepo',
    execute: () => {
      runCommand(
        `npx create-nx-workspace@latest "${workspaceName}" --package-manager=yarn --preset=apps --ci=${config.nx?.ciProvider}`,
        { cwd: parentDir }
      );
    },
  });

  executor.addStep({
    name: 'setupGitOrigin',
    description: 'Setting up git remote',
    skip: () => !gitRepo,
    execute: () => {
      runCommand(`git remote add origin ${gitRepo}`, { cwd: monorepoPath });
    },
  });

  executor.addStep({
    name: 'yarnBerrySetup',
    description: 'Configuring Yarn Berry',
    execute: () => {
      runCommand('yarn set version berry', { cwd: monorepoPath });
      runCommand('yarn config set nodeLinker node-modules', { cwd: monorepoPath });
      runCommand('yarn', { cwd: monorepoPath });
    },
  });

  executor.addStep({
    name: 'addNxPlugins',
    description: 'Installing Nx plugins',
    execute: () => {
      try {
        runCommand('yarn add -D @nx/react @nx/node', { cwd: monorepoPath });
      } catch (error: any) {
        if (error.status === 1) {
          Logger.error('\nPackage installation failed.');
          Logger.section('If you see "exit code 127" above, install build tools:');
          Logger.dim('  Ubuntu/Debian: sudo apt-get install build-essential python3');
          Logger.dim('  Fedora/RHEL:   sudo dnf install gcc-c++ make python3');
          Logger.dim('  macOS:         xcode-select --install');
          Logger.section('\nThen retry or skip: yarn start --start-at=addYarnPackages');
        }
        throw error;
      }
    },
  });

  executor.addStep({
    name: 'addYarnPackages',
    description: 'Installing dependencies',
    execute: () => {
      const devPkgs = config.packages?.dev || [];
      const prodPkgs = config.packages?.prod || [];
      
      if (devPkgs.length > 0) {
        runCommand(`yarn add -D ${devPkgs.join(' ')}`, { cwd: monorepoPath });
      }
      if (prodPkgs.length > 0) {
        runCommand(`yarn add ${prodPkgs.join(' ')}`, { cwd: monorepoPath });
      }
    },
  });

  executor.addStep({
    name: 'generateProjects',
    description: 'Generating project structure',
    execute: () => {
      projects.forEach(project => {
        if (!project.enabled) return;
        
        Logger.info(`Generating ${project.type}: ${project.name}`);
        
        switch (project.type) {
          case 'react':
            ProjectGenerator.generateReact(project, monorepoPath, config.nx);
            break;
          case 'react-lib':
            ProjectGenerator.generateReactLib(project, monorepoPath, config.nx);
            break;
          case 'api':
            ProjectGenerator.generateApi(project, monorepoPath, config.nx);
            break;
          case 'api-lib':
            ProjectGenerator.generateApiLib(project, monorepoPath, config.nx);
            break;
          case 'lib':
            ProjectGenerator.generateLib(project, monorepoPath, config.nx);
            break;
          case 'inituserdb':
            ProjectGenerator.generateInitUserDb(project, monorepoPath);
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
          Logger.info(`Added copy-env and post-build targets to ${apiProject.name}/project.json`);
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
          Logger.info(`Added copy-env and post-build targets to ${initUserDbProject.name}/project.json`);
        }
      }
    },
  });

  executor.addStep({
    name: 'installReactComponents',
    description: 'Installing React components package',
    execute: () => {
      const reactLibProject = projects.find(p => p.type === 'react-lib' && p.enabled);
      
      if (reactLibProject) {
        Logger.info(`Installing @digitaldefiance/express-suite-react-components in ${reactLibProject.name}`);
        const projectPackageJsonPath = path.join(monorepoPath, reactLibProject.name, 'package.json');
        const projectPackageJson = JSON.parse(fs.readFileSync(projectPackageJsonPath, 'utf-8'));
        projectPackageJson.dependencies = projectPackageJson.dependencies || {};
        projectPackageJson.dependencies['@digitaldefiance/express-suite-react-components'] = 'latest';
        fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2) + '\n');
        runCommand('yarn install', { cwd: monorepoPath });
      }
    },
  });

  executor.addStep({
    name: 'renderTemplates',
    description: 'Rendering configuration templates',
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
        config.templates?.engine
      );
    },
  });

  executor.addStep({
    name: 'copyScaffolding',
    description: 'Copying scaffolding files',
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
        copyDir(rootSrc, monorepoPath, scaffoldingVars);
      }

      // Copy devcontainer configuration
      if (devcontainerChoice !== 'none') {
        const devcontainerSrc = path.join(scaffoldingDir, `devcontainer-${devcontainerChoice}`);
        if (fs.existsSync(devcontainerSrc)) {
          Logger.info(`Copying devcontainer configuration: ${devcontainerChoice}`);
          copyDir(devcontainerSrc, monorepoPath, scaffoldingVars);
        }
      }

      // Copy project-specific scaffolding
      projects.forEach(project => {
        const projectSrc = path.join(scaffoldingDir, project.type);
        if (fs.existsSync(projectSrc)) {
          copyDir(projectSrc, path.join(monorepoPath, project.name), scaffoldingVars);
        }
      });
    },
  });

  executor.addStep({
    name: 'generateLicense',
    description: 'Generating LICENSE file',
    execute: async () => {
      await promptAndGenerateLicense(monorepoPath);
    },
  });

  executor.addStep({
    name: 'addScripts',
    description: 'Adding package.json scripts',
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

      const interpolatedScripts: Record<string, string> = {};
      for (const [k, v] of Object.entries(addScripts)) {
        interpolatedScripts[k] = interpolateTemplateStrings(v, scriptContext);
      }

      addScriptsToPackageJson(packageJsonPath, interpolatedScripts);
    },
  });

  executor.addStep({
    name: 'generateDocumentation',
    description: 'Generating documentation',
    skip: () => !enableDocGeneration || dryRun,
    execute: async () => {
      const { DocGenerator } = await import('./utils/doc-generator');
      DocGenerator.generateProjectDocs(context);
    },
  });

  executor.addStep({
    name: 'setupEnvironment',
    description: 'Setting up environment files',
    execute: () => {
      const apiProject = projects.find(p => p.type === 'api');
      const initUserDbProject = projects.find(p => p.type === 'inituserdb');
      
      // Build MONGO_URI with optional password
      const buildMongoUri = (dbName: string) => {
        const auth = mongoPassword ? `root:${mongoPassword}@` : '';
        const params = devcontainerChoice === 'mongodb-replicaset'
          ? '?replicaSet=rs0&directConnection=true'
          : '?directConnection=true';
        return `mongodb://${auth}localhost:27017/${dbName}${params}`;
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
        const devcontainerEnvPath = path.join(monorepoPath, '.devcontainer', '.env');
        const mongoUri = buildMongoUri(workspaceName);
        const envContent = `MONGO_PASSWORD=${mongoPassword}\nMONGO_URI=${mongoUri}\n`;
        fs.writeFileSync(devcontainerEnvPath, envContent);
        Logger.info('Created .devcontainer/.env with MongoDB configuration');
      }
    },
  });

  executor.addStep({
    name: 'rebuildNativeModules',
    description: 'Building native modules',
    execute: () => {
      Logger.info('Re-enabling build scripts and building native modules...');
      runCommand('yarn config set enableScripts true', { cwd: monorepoPath });
      runCommand('yarn rebuild', { cwd: monorepoPath });
    },
  });

  executor.addStep({
    name: 'validateGeneration',
    description: 'Validating generated project',
    skip: () => dryRun,
    execute: async () => {
      const { PostGenerationValidator } = await import('./core/validators/post-generation-validator');
      const report = await PostGenerationValidator.validate(context);
      PostGenerationValidator.printReport(report);
      
      if (!report.passed) {
        Logger.warning('Validation found errors, but continuing...');
      }
    },
  });

  executor.addStep({
    name: 'initialCommit',
    description: 'Creating initial commit',
    execute: async () => {
      // Ensure git is initialized
      if (!fs.existsSync(path.join(monorepoPath, '.git'))) {
        runCommand('git init', { cwd: monorepoPath });
      }

      const doCommit = await confirm({
        message: 'Create initial git commit?',
        default: true,
      });

      if (doCommit) {
        runCommand('git add -A', { cwd: monorepoPath });
        runCommand('git commit -m "Initial commit"', { cwd: monorepoPath });

        if (gitRepo) {
          const doPush = await confirm({
            message: 'Push to remote repository?',
            default: true,
          });

          if (doPush) {
            runCommand('git push --set-upstream origin main', { cwd: monorepoPath });
          }
        }
      }
    },
  });

  executor.addStep({
    name: 'installPlaywright',
    description: 'Installing Playwright browsers',
    skip: () => !includeE2e,
    execute: async () => {
      const installPlaywright = await confirm({
        message: 'Install Playwright browsers? (Required for E2E tests)',
        default: true,
      });

      if (installPlaywright) {
        Logger.info('Installing Playwright browsers (this may take a few minutes)...');
        runCommand('yarn playwright install --with-deps', { cwd: monorepoPath });
      } else {
        Logger.warning('Skipped. Run manually later: yarn playwright install --with-deps');
      }
    },
  });

  // Execute
  try {
    await executor.execute(context);
    
    if (dryRun) {
      Logger.warning('Dry-run complete. Re-run without dry-run to generate.');
      process.exit(0);
    }
    
    Logger.header('Generation Complete!');
    Logger.success(`Monorepo created at: ${Logger.path(monorepoPath)}`);
    
    const apiProject = projects.find(p => p.type === 'api');
    if (apiProject) {
      Logger.warning(`\nIMPORTANT: Update ${apiProject.name}/.env with your configuration`);
    }
    
    if (devcontainerChoice === 'mongodb' || devcontainerChoice === 'mongodb-replicaset') {
      Logger.warning(`IMPORTANT: Update .devcontainer/.env with your MongoDB configuration`);
    }
    
    Logger.section('Next steps:');
    Logger.dim(`  cd ${workspaceName}`);
    if (apiProject) {
      Logger.dim(`  # Update ${apiProject.name}/.env with your settings`);
    }
    Logger.dim(`  yarn build:dev`);
    Logger.dim(`  yarn serve:dev`);
    
    Logger.section('Generated projects:');
    projects.forEach(p => {
      if (p.enabled) {
        Logger.dim(`  ${p.type.padEnd(12)} ${p.name}`);
      }
    });
  } catch (error) {
    Logger.error('Generation failed');
    console.error(error);
    process.exit(1);
  }
}

export { main };

if (require.main === module) {
  main().catch((err) => {
    Logger.error('Fatal error');
    console.error(err);
    process.exit(1);
  });
}
