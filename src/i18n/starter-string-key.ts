export enum StarterStringKey {
  // Titles
  STARTER_TITLE = 'starter_title',
  STARTER_SUBTITLE = 'starter_subtitle',
  STARTER_DESCRIPTION = 'starter_description',

  // CLI Messages
  CLI_BANNER = 'cli_banner',
  CLI_FATAL_ERROR = 'cli_fatalError',
  CLI_CANCELLED = 'cli_cancelled',
  CLI_INSTALL_REQUIRED_TOOLS = 'cli_installRequiredTools',
  
  // System Check
  SYSTEM_CHECK_HEADER = 'systemCheck_header',
  SYSTEM_CHECK_PASSED = 'systemCheck_passed',
  SYSTEM_CHECK_CONTINUE_ANYWAY = 'systemCheck_continueAnyway',
  SYSTEM_CHECK_MISSING_TOOLS = 'systemCheck_missingTools',
  SYSTEM_CHECK_OPTIONAL_TOOLS = 'systemCheck_optionalTools',
  SYSTEM_CHECK_INSTALL_INSTRUCTIONS = 'systemCheck_installInstructions',
  SYSTEM_CHECK_UBUNTU_DEBIAN = 'systemCheck_ubuntuDebian',
  SYSTEM_CHECK_FEDORA_RHEL = 'systemCheck_fedoraRhel',
  SYSTEM_CHECK_MACOS = 'systemCheck_macos',
  SYSTEM_CHECK_WINDOWS = 'systemCheck_windows',
  
  // Prompts
  PROMPT_WORKSPACE_NAME = 'prompt_workspaceName',
  PROMPT_PROJECT_PREFIX = 'prompt_projectPrefix',
  PROMPT_NPM_NAMESPACE = 'prompt_npmNamespace',
  PROMPT_PARENT_DIRECTORY = 'prompt_parentDirectory',
  PROMPT_GIT_REPO = 'prompt_gitRepo',
  PROMPT_HOSTNAME = 'prompt_hostname',
  PROMPT_DRY_RUN = 'prompt_dryRun',
  PROMPT_INCLUDE_E2E = 'prompt_includeE2e',
  PROMPT_SELECT_PACKAGE_GROUPS = 'prompt_selectPackageGroups',
  PROMPT_ENABLE_DOC_GENERATION = 'prompt_enableDocGeneration',
  PROMPT_SETUP_DEVCONTAINER = 'prompt_setupDevcontainer',
  PROMPT_DEVCONTAINER_CONFIG = 'prompt_devcontainerConfig',
  PROMPT_MONGO_PASSWORD = 'prompt_mongoPassword',
  PROMPT_USE_IN_MEMORY_DB = 'prompt_useInMemoryDb',
  PROMPT_DEV_DATABASE_NAME = 'prompt_devDatabaseName',
  PROMPT_GENERATE_SECRET = 'prompt_generateSecret',
  PROMPT_ENTER_SECRET = 'prompt_enterSecret',
  PROMPT_CREATE_INITIAL_COMMIT = 'prompt_createInitialCommit',
  PROMPT_PUSH_TO_REMOTE = 'prompt_pushToRemote',
  PROMPT_INSTALL_PLAYWRIGHT = 'prompt_installPlaywright',
  PROMPT_SITE_TITLE = 'prompt_siteTitle',
  PROMPT_SITE_DESCRIPTION = 'prompt_siteDescription',
  PROMPT_SITE_TAGLINE = 'prompt_siteTagline',
  
  // Validation Messages
  VALIDATION_INVALID_WORKSPACE_NAME = 'validation_invalidWorkspaceName',
  VALIDATION_INVALID_PREFIX = 'validation_invalidPrefix',
  VALIDATION_INVALID_NAMESPACE = 'validation_invalidNamespace',
  VALIDATION_INVALID_GIT_REPO = 'validation_invalidGitRepo',
  VALIDATION_INVALID_HOSTNAME = 'validation_invalidHostname',
  VALIDATION_PASSWORD_REQUIRED = 'validation_passwordRequired',
  VALIDATION_DATABASE_NAME_REQUIRED = 'validation_databaseNameRequired',
  VALIDATION_MUST_BE_HEX_64 = 'validation_mustBeHex64',
  VALIDATION_PACKAGE_JSON_NOT_FOUND = 'validation_packageJsonNotFound',
  VALIDATION_PACKAGE_JSON_INVALID = 'validation_packageJsonInvalid',
  VALIDATION_PACKAGE_JSON_MISSING_NAME = 'validation_packageJsonMissingName',
  VALIDATION_PACKAGE_JSON_MISSING_VERSION = 'validation_packageJsonMissingVersion',
  VALIDATION_PACKAGE_JSON_NO_SCRIPTS = 'validation_packageJsonNoScripts',
  VALIDATION_REACT_VERSION_MISMATCH = 'validation_reactVersionMismatch',
  VALIDATION_REACT_DOM_REQUIRED = 'validation_reactDomRequired',
  VALIDATION_GITIGNORE_NOT_FOUND = 'validation_gitignoreNotFound',
  VALIDATION_README_NOT_FOUND = 'validation_readmeNotFound',
  VALIDATION_LICENSE_NOT_FOUND = 'validation_licenseNotFound',
  VALIDATION_PASSED = 'validation_passed',
  VALIDATION_PASSED_WITH_WARNINGS = 'validation_passedWithWarnings',
  VALIDATION_FAILED = 'validation_failed',
  VALIDATION_REPORT_HEADER = 'validation_reportHeader',
  VALIDATION_ERRORS = 'validation_errors',
  VALIDATION_WARNINGS = 'validation_warnings',
  VALIDATION_INFO = 'validation_info',
  VALIDATION_FIX = 'validation_fix',
  
  // Step Descriptions
  STEP_CHECK_TARGET_DIR = 'step_checkTargetDir',
  STEP_CREATE_MONOREPO = 'step_createMonorepo',
  STEP_UPDATE_TSCONFIG_BASE = 'step_updateTsConfigBase',
  STEP_SETUP_GIT_ORIGIN = 'step_setupGitOrigin',
  STEP_YARN_BERRY_SETUP = 'step_yarnBerrySetup',
  STEP_ADD_NX_PLUGINS = 'step_addNxPlugins',
  STEP_ADD_YARN_PACKAGES = 'step_addYarnPackages',
  STEP_GENERATE_PROJECTS = 'step_generateProjects',
  STEP_INSTALL_REACT_COMPONENTS = 'step_installReactComponents',
  STEP_RENDER_TEMPLATES = 'step_renderTemplates',
  STEP_COPY_SCAFFOLDING = 'step_copyScaffolding',
  STEP_GENERATE_LICENSE = 'step_generateLicense',
  STEP_ADD_SCRIPTS = 'step_addScripts',
  STEP_GENERATE_DOCUMENTATION = 'step_generateDocumentation',
  STEP_SETUP_ENVIRONMENT = 'step_setupEnvironment',
  STEP_REBUILD_NATIVE_MODULES = 'step_rebuildNativeModules',
  STEP_VALIDATE_GENERATION = 'step_validateGeneration',
  STEP_INITIAL_COMMIT = 'step_initialCommit',
  STEP_INSTALL_PLAYWRIGHT = 'step_installPlaywright',
  STEP_SKIPPING = 'step_skipping',
  STEP_COMPLETED = 'step_completed',
  STEP_FAILED = 'step_failed',
  
  // Generation Messages
  GENERATION_STARTING = 'generation_starting',
  GENERATION_COMPLETE = 'generation_complete',
  GENERATION_FAILED = 'generation_failed',
  GENERATION_DRY_RUN_MODE = 'generation_dryRunMode',
  GENERATION_DRY_RUN_COMPLETE = 'generation_dryRunComplete',
  GENERATION_ROLLBACK = 'generation_rollback',
  GENERATION_ROLLBACK_FAILED = 'generation_rollbackFailed',
  
  // Project Generation
  PROJECT_GENERATING = 'project_generating',
  PROJECT_ADDED_TARGETS = 'project_addedTargets',
  PROJECT_INSTALLING_PACKAGE = 'project_installingPackage',
  PROJECT_COPYING_DEVCONTAINER = 'project_copyingDevcontainer',
  
  // TypeScript Configuration
  TSCONFIG_BASE_UPDATED = 'tsconfig_baseUpdated',
  
  // Environment Setup
  ENV_CREATED_WITH_SECRETS = 'env_createdWithSecrets',
  ENV_CREATED_FROM_API = 'env_createdFromApi',
  ENV_CREATED_DEVCONTAINER = 'env_createdDevcontainer',
  ENV_CREATED_DEVCONTAINER_FROM_EXAMPLE = 'env_createdDevcontainerFromExample',
  ENV_CREATED_DEVCONTAINER_MINIMAL = 'env_createdDevcontainerMinimal',
  ENV_GENERATED_SECRET = 'env_generatedSecret',
  
  // Documentation
  DOC_GENERATED_README = 'doc_generatedReadme',
  DOC_GENERATED_ARCHITECTURE = 'doc_generatedArchitecture',
  DOC_GENERATED_API = 'doc_generatedApi',
  
  // Template Rendering
  TEMPLATE_RENDERED = 'template_rendered',
  TEMPLATE_COPIED = 'template_copied',
  
  // Package Management
  PACKAGE_INSTALLATION_FAILED = 'package_installationFailed',
  PACKAGE_INSTALL_BUILD_TOOLS = 'package_installBuildTools',
  PACKAGE_RETRY_OR_SKIP = 'package_retryOrSkip',
  PACKAGE_RESOLVING_VERSION = 'package_resolvingVersion',
  PACKAGE_FAILED_RESOLVE_LATEST = 'package_failedResolveLatest',
  PACKAGE_FAILED_RESOLVE_STABLE = 'package_failedResolveStable',
  
  // Plugin System
  PLUGIN_REGISTERING = 'plugin_registering',
  PLUGIN_HOOK_FAILED = 'plugin_hookFailed',
  
  // Dry Run
  DRY_RUN_HEADER = 'dryRun_header',
  DRY_RUN_SUMMARY = 'dryRun_summary',
  DRY_RUN_FILES_TO_CREATE = 'dryRun_filesToCreate',
  DRY_RUN_FILES_TO_MODIFY = 'dryRun_filesToModify',
  DRY_RUN_FILES_TO_DELETE = 'dryRun_filesToDelete',
  DRY_RUN_COMMANDS_TO_RUN = 'dryRun_commandsToRun',
  DRY_RUN_ENCOUNTERED_ERROR = 'dryRun_encounteredError',
  DRY_RUN_ACTIONS = 'dryRun_actions',
  
  // Diff Viewer
  DIFF_CHANGES_SUMMARY = 'diff_changesSummary',
  DIFF_FILES_ADDED = 'diff_filesAdded',
  DIFF_FILES_MODIFIED = 'diff_filesModified',
  DIFF_FILES_DELETED = 'diff_filesDeleted',
  DIFF_TRUNCATED = 'diff_truncated',
  DIFF_BEFORE = 'diff_before',
  DIFF_AFTER = 'diff_after',
  
  // Command Execution
  COMMAND_FAILED = 'command_failed',
  COMMAND_REBUILDING_NATIVE = 'command_rebuildingNative',
  COMMAND_INSTALLING_PLAYWRIGHT_BROWSERS = 'command_installingPlaywrightBrowsers',
  COMMAND_SKIPPED_PLAYWRIGHT = 'command_skippedPlaywright',
  
  // Success Messages
  SUCCESS_GENERATION_COMPLETE = 'success_generationComplete',
  SUCCESS_MONOREPO_CREATED = 'success_monorepoCreated',
  SUCCESS_VALIDATION_NO_ISSUES = 'success_validationNoIssues',
  
  // Warning Messages
  WARNING_DIRECTORY_EXISTS = 'warning_directoryExists',
  WARNING_UPDATE_ENV_FILE = 'warning_updateEnvFile',
  WARNING_UPDATE_DEVCONTAINER_ENV = 'warning_updateDevcontainerEnv',
  WARNING_VALIDATION_ERRORS = 'warning_validationErrors',
  WARNING_DRY_RUN_RERUN = 'warning_dryRunRerun',

  // Notice Messages
  NOTICE_SITE_TITLE_TAGLINE_DESCRIPTIONS = 'notice_siteTitleTaglineDescriptions',
  
  // Error Messages
  ERROR_DIRECTORY_NOT_EMPTY = 'error_directoryNotEmpty',
  ERROR_INVALID_START_STEP = 'error_invalidStartStep',
  ERROR_FATAL = 'error_fatal',
  
  // Section Headers
  SECTION_WORKSPACE_CONFIG = 'section_workspaceConfig',
  SECTION_OPTIONAL_PROJECTS = 'section_optionalProjects',
  SECTION_PACKAGE_GROUPS = 'section_packageGroups',
  SECTION_DEVCONTAINER_CONFIG = 'section_devcontainerConfig',
  SECTION_DATABASE_CONFIG = 'section_databaseConfig',
  SECTION_SECURITY_CONFIG = 'section_securityConfig',
  SECTION_EXPRESS_SUITE_PACKAGES = 'section_expressSuitePackages',
  SECTION_NEXT_STEPS = 'section_nextSteps',
  SECTION_NEXT_STEPS_UPDATE_ENV = 'section_nextStepsUpdateEnv',
  SECTION_GENERATED_PROJECTS = 'section_generatedProjects',
  SECTION_ISSUES = 'section_issues',
  SECTION_RUNNING_VALIDATION = 'section_runningValidation',
  
  // DevContainer Options
  DEVCONTAINER_SIMPLE = 'devcontainer_simple',
  DEVCONTAINER_MONGODB = 'devcontainer_mongodb',
  DEVCONTAINER_MONGODB_REPLICASET = 'devcontainer_mongodbReplicaset',
}
