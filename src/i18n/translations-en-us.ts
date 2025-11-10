import { StarterStringKey } from './starter-string-key';

export const enUsTranslations: Record<StarterStringKey, string> = {
  // Titles
  [StarterStringKey.STARTER_TITLE]: 'Node Express Suite Starter',
  [StarterStringKey.STARTER_DESCRIPTION]: 'Node Express Suite Starter generates an NX monorepo MERN stack with React app, Express API, shared libraries, @digitaldefiance/node-express-suite, and @digitaldefiance/express-suite-react-components integration.',
  
  // CLI Messages
  [StarterStringKey.CLI_BANNER]: 'Express Suite Starter',
  [StarterStringKey.CLI_FATAL_ERROR]: 'Fatal error',
  [StarterStringKey.CLI_CANCELLED]: 'Cancelled. Please install required tools and try again.',
  [StarterStringKey.CLI_INSTALL_REQUIRED_TOOLS]: 'Please install required tools and try again',
  
  // System Check
  [StarterStringKey.SYSTEM_CHECK_HEADER]: 'System Check',
  [StarterStringKey.SYSTEM_CHECK_PASSED]: 'System check passed',
  [StarterStringKey.SYSTEM_CHECK_CONTINUE_ANYWAY]: 'Continue anyway? (Installation may fail)',
  [StarterStringKey.SYSTEM_CHECK_MISSING_TOOLS]: 'Missing required build tools:',
  [StarterStringKey.SYSTEM_CHECK_OPTIONAL_TOOLS]: 'Optional tools not found:',
  [StarterStringKey.SYSTEM_CHECK_INSTALL_INSTRUCTIONS]: 'Installation instructions:',
  [StarterStringKey.SYSTEM_CHECK_UBUNTU_DEBIAN]: 'Ubuntu/Debian: sudo apt-get install build-essential python3',
  [StarterStringKey.SYSTEM_CHECK_FEDORA_RHEL]: 'Fedora/RHEL: sudo dnf install gcc-c++ make python3',
  [StarterStringKey.SYSTEM_CHECK_MACOS]: 'macOS: xcode-select --install',
  [StarterStringKey.SYSTEM_CHECK_WINDOWS]: 'Windows: Install Visual Studio Build Tools',
  
  // Prompts
  [StarterStringKey.PROMPT_WORKSPACE_NAME]: 'Enter the workspace name:',
  [StarterStringKey.PROMPT_PROJECT_PREFIX]: 'Enter the project prefix:',
  [StarterStringKey.PROMPT_NPM_NAMESPACE]: 'Enter the npm namespace:',
  [StarterStringKey.PROMPT_PARENT_DIRECTORY]: 'Enter the parent directory:',
  [StarterStringKey.PROMPT_GIT_REPO]: 'Enter the git repository URL (optional):',
  [StarterStringKey.PROMPT_HOSTNAME]: 'Enter the hostname that will be used for production:',
  [StarterStringKey.PROMPT_DRY_RUN]: 'Run in dry-run mode (preview without creating files)?',
  [StarterStringKey.PROMPT_INCLUDE_E2E]: 'Include E2E tests?',
  [StarterStringKey.PROMPT_SELECT_PACKAGE_GROUPS]: 'Select optional package groups:',
  [StarterStringKey.PROMPT_ENABLE_DOC_GENERATION]: 'Generate documentation (README, ARCHITECTURE, API docs)?',
  [StarterStringKey.PROMPT_SETUP_DEVCONTAINER]: 'Set up DevContainer configuration?',
  [StarterStringKey.PROMPT_DEVCONTAINER_CONFIG]: 'DevContainer configuration:',
  [StarterStringKey.PROMPT_MONGO_PASSWORD]: 'Enter MongoDB root password:',
  [StarterStringKey.PROMPT_USE_IN_MEMORY_DB]: 'Use in-memory database for development?',
  [StarterStringKey.PROMPT_DEV_DATABASE_NAME]: 'Enter the in-memory database name:',
  [StarterStringKey.PROMPT_GENERATE_SECRET]: 'Generate {name}?',
  [StarterStringKey.PROMPT_ENTER_SECRET]: 'Enter {name} (64-character hex string):',
  [StarterStringKey.PROMPT_CREATE_INITIAL_COMMIT]: 'Create initial git commit?',
  [StarterStringKey.PROMPT_PUSH_TO_REMOTE]: 'Push to remote repository?',
  [StarterStringKey.PROMPT_INSTALL_PLAYWRIGHT]: 'Install Playwright browsers? (Required for E2E tests)',
  
  // Validation Messages
  [StarterStringKey.VALIDATION_INVALID_WORKSPACE_NAME]: 'Invalid workspace name (letters, numbers, dashes only)',
  [StarterStringKey.VALIDATION_INVALID_PREFIX]: 'Invalid prefix (lowercase letters, numbers, dashes only)',
  [StarterStringKey.VALIDATION_INVALID_NAMESPACE]: 'Invalid namespace (must start with @)',
  [StarterStringKey.VALIDATION_INVALID_GIT_REPO]: 'Invalid git repository URL',
  [StarterStringKey.VALIDATION_INVALID_HOSTNAME]: 'Invalid hostname format',
  [StarterStringKey.VALIDATION_PASSWORD_REQUIRED]: 'Password required',
  [StarterStringKey.VALIDATION_DATABASE_NAME_REQUIRED]: 'Database name cannot be empty',
  [StarterStringKey.VALIDATION_MUST_BE_HEX_64]: 'Must be 64-character hex string',
  [StarterStringKey.VALIDATION_PACKAGE_JSON_NOT_FOUND]: 'package.json not found',
  [StarterStringKey.VALIDATION_PACKAGE_JSON_INVALID]: 'Invalid package.json',
  [StarterStringKey.VALIDATION_PACKAGE_JSON_MISSING_NAME]: 'package.json missing name field',
  [StarterStringKey.VALIDATION_PACKAGE_JSON_MISSING_VERSION]: 'package.json missing version field',
  [StarterStringKey.VALIDATION_PACKAGE_JSON_NO_SCRIPTS]: 'package.json has no scripts defined',
  [StarterStringKey.VALIDATION_REACT_VERSION_MISMATCH]: 'React version mismatch with @types/react',
  [StarterStringKey.VALIDATION_REACT_DOM_REQUIRED]: 'react-dom is required when using react',
  [StarterStringKey.VALIDATION_GITIGNORE_NOT_FOUND]: '.gitignore file not found',
  [StarterStringKey.VALIDATION_README_NOT_FOUND]: 'README.md not found',
  [StarterStringKey.VALIDATION_LICENSE_NOT_FOUND]: 'LICENSE file not found',
  [StarterStringKey.VALIDATION_PASSED]: 'Validation passed with no issues',
  [StarterStringKey.VALIDATION_PASSED_WITH_WARNINGS]: 'Validation passed (with warnings)',
  [StarterStringKey.VALIDATION_FAILED]: 'Validation failed',
  [StarterStringKey.VALIDATION_REPORT_HEADER]: 'Validation Report',
  [StarterStringKey.VALIDATION_ERRORS]: 'Errors: {count}',
  [StarterStringKey.VALIDATION_WARNINGS]: 'Warnings: {count}',
  [StarterStringKey.VALIDATION_INFO]: 'Info: {count}',
  [StarterStringKey.VALIDATION_FIX]: 'Fix: {fix}',
  
  // Step Descriptions
  [StarterStringKey.STEP_CHECK_TARGET_DIR]: 'Checking target directory',
  [StarterStringKey.STEP_CREATE_MONOREPO]: 'Creating Nx monorepo',
  [StarterStringKey.STEP_SETUP_GIT_ORIGIN]: 'Setting up git remote',
  [StarterStringKey.STEP_YARN_BERRY_SETUP]: 'Configuring Yarn Berry',
  [StarterStringKey.STEP_ADD_NX_PLUGINS]: 'Installing Nx plugins',
  [StarterStringKey.STEP_ADD_YARN_PACKAGES]: 'Installing dependencies',
  [StarterStringKey.STEP_GENERATE_PROJECTS]: 'Generating project structure',
  [StarterStringKey.STEP_INSTALL_REACT_COMPONENTS]: 'Installing React components package',
  [StarterStringKey.STEP_RENDER_TEMPLATES]: 'Rendering configuration templates',
  [StarterStringKey.STEP_COPY_SCAFFOLDING]: 'Copying scaffolding files',
  [StarterStringKey.STEP_GENERATE_LICENSE]: 'Generating LICENSE file',
  [StarterStringKey.STEP_ADD_SCRIPTS]: 'Adding package.json scripts',
  [StarterStringKey.STEP_GENERATE_DOCUMENTATION]: 'Generating documentation',
  [StarterStringKey.STEP_SETUP_ENVIRONMENT]: 'Setting up environment files',
  [StarterStringKey.STEP_REBUILD_NATIVE_MODULES]: 'Building native modules',
  [StarterStringKey.STEP_VALIDATE_GENERATION]: 'Validating generated project',
  [StarterStringKey.STEP_INITIAL_COMMIT]: 'Creating initial commit',
  [StarterStringKey.STEP_INSTALL_PLAYWRIGHT]: 'Installing Playwright browsers',
  [StarterStringKey.STEP_SKIPPING]: 'Skipping: {description}',
  [StarterStringKey.STEP_COMPLETED]: 'Completed: {description}',
  [StarterStringKey.STEP_FAILED]: 'Failed: {description}',
  
  // Generation Messages
  [StarterStringKey.GENERATION_STARTING]: 'Starting generation ({count} steps)',
  [StarterStringKey.GENERATION_COMPLETE]: 'Generation complete!',
  [StarterStringKey.GENERATION_FAILED]: 'Generation failed',
  [StarterStringKey.GENERATION_DRY_RUN_MODE]: 'DRY RUN MODE - No files will be created',
  [StarterStringKey.GENERATION_DRY_RUN_COMPLETE]: 'Dry-run complete. Re-run without dry-run to generate.',
  [StarterStringKey.GENERATION_ROLLBACK]: 'Rolling back changes...',
  [StarterStringKey.GENERATION_ROLLBACK_FAILED]: 'Rollback failed for: {description}',
  
  // Project Generation
  [StarterStringKey.PROJECT_GENERATING]: 'Generating {type}: {name}',
  [StarterStringKey.PROJECT_ADDED_TARGETS]: 'Added copy-env and post-build targets to {name}/project.json',
  [StarterStringKey.PROJECT_INSTALLING_PACKAGE]: 'Installing {package} in {project}',
  [StarterStringKey.PROJECT_COPYING_DEVCONTAINER]: 'Copying devcontainer configuration: {type}',
  
  // Environment Setup
  [StarterStringKey.ENV_CREATED_WITH_SECRETS]: 'Created {name}/.env with secrets',
  [StarterStringKey.ENV_CREATED_FROM_API]: 'Created {name}/.env from {apiName}/.env',
  [StarterStringKey.ENV_CREATED_DEVCONTAINER]: 'Created .devcontainer/.env with MongoDB configuration',
  [StarterStringKey.ENV_CREATED_DEVCONTAINER_FROM_EXAMPLE]: 'Created .devcontainer/.env from .env.example with MongoDB configuration',
  [StarterStringKey.ENV_CREATED_DEVCONTAINER_MINIMAL]: 'Created minimal .devcontainer/.env (no .env.example found)',
  [StarterStringKey.ENV_GENERATED_SECRET]: 'Generated {name}',
  
  // Documentation
  [StarterStringKey.DOC_GENERATED_README]: 'Generated: README.md',
  [StarterStringKey.DOC_GENERATED_ARCHITECTURE]: 'Generated: ARCHITECTURE.md',
  [StarterStringKey.DOC_GENERATED_API]: 'Generated: {name}/API.md',
  
  // Template Rendering
  [StarterStringKey.TEMPLATE_RENDERED]: 'Rendered: {path}',
  [StarterStringKey.TEMPLATE_COPIED]: 'Copied: {path}',
  
  // Package Management
  [StarterStringKey.PACKAGE_INSTALLATION_FAILED]: 'Package installation failed.',
  [StarterStringKey.PACKAGE_INSTALL_BUILD_TOOLS]: 'If you see "exit code 127" above, install build tools:',
  [StarterStringKey.PACKAGE_RETRY_OR_SKIP]: 'Then retry or skip: yarn start --start-at=addYarnPackages',
  [StarterStringKey.PACKAGE_RESOLVING_VERSION]: 'Resolving version for {package}',
  [StarterStringKey.PACKAGE_FAILED_RESOLVE_LATEST]: 'Failed to resolve latest version for {package}, using \'latest\'',
  [StarterStringKey.PACKAGE_FAILED_RESOLVE_STABLE]: 'Failed to resolve stable version for {package}, using \'latest\'',
  
  // Plugin System
  [StarterStringKey.PLUGIN_REGISTERING]: 'Registering plugin: {name} v{version}',
  [StarterStringKey.PLUGIN_HOOK_FAILED]: 'Plugin {name} hook {hook} failed: {error}',
  
  // Dry Run
  [StarterStringKey.DRY_RUN_HEADER]: 'Dry Run Mode - No files will be created',
  [StarterStringKey.DRY_RUN_SUMMARY]: 'Dry Run Summary',
  [StarterStringKey.DRY_RUN_FILES_TO_CREATE]: 'Files to create: {count}',
  [StarterStringKey.DRY_RUN_FILES_TO_MODIFY]: 'Files to modify: {count}',
  [StarterStringKey.DRY_RUN_FILES_TO_DELETE]: 'Files to delete: {count}',
  [StarterStringKey.DRY_RUN_COMMANDS_TO_RUN]: 'Commands to run: {count}',
  [StarterStringKey.DRY_RUN_ENCOUNTERED_ERROR]: 'Dry run encountered error: {error}',
  [StarterStringKey.DRY_RUN_ACTIONS]: 'Actions:',
  
  // Diff Viewer
  [StarterStringKey.DIFF_CHANGES_SUMMARY]: 'Changes Summary',
  [StarterStringKey.DIFF_FILES_ADDED]: '{count} files added',
  [StarterStringKey.DIFF_FILES_MODIFIED]: '{count} files modified',
  [StarterStringKey.DIFF_FILES_DELETED]: '{count} files deleted',
  [StarterStringKey.DIFF_TRUNCATED]: '... (truncated)',
  [StarterStringKey.DIFF_BEFORE]: 'Before:',
  [StarterStringKey.DIFF_AFTER]: 'After:',
  
  // Command Execution
  [StarterStringKey.COMMAND_FAILED]: 'Command failed: {command}',
  [StarterStringKey.COMMAND_REBUILDING_NATIVE]: 'Re-enabling build scripts and building native modules...',
  [StarterStringKey.COMMAND_INSTALLING_PLAYWRIGHT_BROWSERS]: 'Installing Playwright browsers (this may take a few minutes)...',
  [StarterStringKey.COMMAND_SKIPPED_PLAYWRIGHT]: 'Skipped. Run manually later: yarn playwright install --with-deps',
  
  // Success Messages
  [StarterStringKey.SUCCESS_GENERATION_COMPLETE]: 'Generation Complete!',
  [StarterStringKey.SUCCESS_MONOREPO_CREATED]: 'Monorepo created at: {path}',
  [StarterStringKey.SUCCESS_VALIDATION_NO_ISSUES]: 'Validation passed with no issues',
  
  // Warning Messages
  [StarterStringKey.WARNING_DIRECTORY_EXISTS]: 'Directory {path} already exists and is not empty',
  [StarterStringKey.WARNING_UPDATE_ENV_FILE]: 'IMPORTANT: Update {name}/.env with your configuration',
  [StarterStringKey.WARNING_UPDATE_DEVCONTAINER_ENV]: 'IMPORTANT: Update .devcontainer/.env with your MongoDB configuration',
  [StarterStringKey.WARNING_VALIDATION_ERRORS]: 'Validation found errors, but continuing...',
  [StarterStringKey.WARNING_DRY_RUN_RERUN]: 'Dry-run complete. Re-run without dry-run to generate.',
  
  // Error Messages
  [StarterStringKey.ERROR_DIRECTORY_NOT_EMPTY]: 'Directory {path} already exists and is not empty',
  [StarterStringKey.ERROR_INVALID_START_STEP]: 'Invalid start step: {step}',
  [StarterStringKey.ERROR_FATAL]: 'Fatal error',
  
  // Section Headers
  [StarterStringKey.SECTION_WORKSPACE_CONFIG]: 'Workspace Configuration',
  [StarterStringKey.SECTION_OPTIONAL_PROJECTS]: 'Optional Projects',
  [StarterStringKey.SECTION_PACKAGE_GROUPS]: 'Package Groups',
  [StarterStringKey.SECTION_DEVCONTAINER_CONFIG]: 'DevContainer Configuration',
  [StarterStringKey.SECTION_DATABASE_CONFIG]: 'Database Configuration',
  [StarterStringKey.SECTION_SECURITY_CONFIG]: 'Security Configuration',
  [StarterStringKey.SECTION_EXPRESS_SUITE_PACKAGES]: 'Express Suite Packages',
  [StarterStringKey.SECTION_NEXT_STEPS]: 'Next steps:',
  [StarterStringKey.SECTION_NEXT_STEPS_UPDATE_ENV]: '# Update {name}/.env with your settings',
  [StarterStringKey.SECTION_GENERATED_PROJECTS]: 'Generated projects:',
  [StarterStringKey.SECTION_ISSUES]: 'Issues:',
  [StarterStringKey.SECTION_RUNNING_VALIDATION]: 'Running post-generation validation',
  
  // DevContainer Options
  [StarterStringKey.DEVCONTAINER_SIMPLE]: 'Simple (Node.js only)',
  [StarterStringKey.DEVCONTAINER_MONGODB]: 'With MongoDB',
  [StarterStringKey.DEVCONTAINER_MONGODB_REPLICASET]: 'With MongoDB Replica Set',
};
