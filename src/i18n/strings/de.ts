import { StarterStringKey } from '../starter-string-key';

export const deTranslations: Record<StarterStringKey, string> = {
  [StarterStringKey.STARTER_TITLE]: 'Node Express Suite Starter',
  [StarterStringKey.STARTER_SUBTITLE]: 'Ehemals Projekt Albatross',
  [StarterStringKey.STARTER_DESCRIPTION]:
    'Node Express Suite Starter generiert ein NX Monorepo MERN-Stack mit React-App, Express-API, gemeinsamen Bibliotheken, @digitaldefiance/node-express-suite und @digitaldefiance/express-suite-react-components Integration.',
  [StarterStringKey.CLI_BANNER]: 'Express Suite Starter',
  [StarterStringKey.CLI_FATAL_ERROR]: 'Schwerwiegender Fehler',
  [StarterStringKey.CLI_CANCELLED]:
    'Abgebrochen. Bitte installieren Sie die erforderlichen Tools und versuchen Sie es erneut.',
  [StarterStringKey.CLI_INSTALL_REQUIRED_TOOLS]:
    'Bitte installieren Sie die erforderlichen Tools und versuchen Sie es erneut',
  [StarterStringKey.SYSTEM_CHECK_HEADER]: 'Systemprüfung',
  [StarterStringKey.SYSTEM_CHECK_PASSED]: 'Systemprüfung bestanden',
  [StarterStringKey.SYSTEM_CHECK_CONTINUE_ANYWAY]:
    'Trotzdem fortfahren? (Installation kann fehlschlagen)',
  [StarterStringKey.SYSTEM_CHECK_MISSING_TOOLS]:
    'Fehlende erforderliche Build-Tools:',
  [StarterStringKey.SYSTEM_CHECK_OPTIONAL_TOOLS]:
    'Optionale Tools nicht gefunden:',
  [StarterStringKey.SYSTEM_CHECK_INSTALL_INSTRUCTIONS]:
    'Installationsanweisungen:',
  [StarterStringKey.PROMPT_WORKSPACE_NAME]:
    'Geben Sie den Workspace-Namen ein:',
  [StarterStringKey.PROMPT_PROJECT_PREFIX]: 'Geben Sie das Projekt-Präfix ein:',
  [StarterStringKey.PROMPT_NPM_NAMESPACE]: 'Geben Sie den npm-Namespace ein:',
  [StarterStringKey.PROMPT_PARENT_DIRECTORY]:
    'Geben Sie das übergeordnete Verzeichnis ein:',
  [StarterStringKey.PROMPT_GIT_REPO]:
    'Geben Sie die Git-Repository-URL ein (optional):',
  [StarterStringKey.PROMPT_HOSTNAME]:
    'Geben Sie den Hostnamen ein, der für die Produktion verwendet wird:',
  [StarterStringKey.PROMPT_DRY_RUN]:
    'Im Testmodus ausführen (Vorschau ohne Dateierstellung)?',
  [StarterStringKey.PROMPT_INCLUDE_E2E]: 'E2E-Tests einschließen?',
  [StarterStringKey.PROMPT_SELECT_PACKAGE_GROUPS]:
    'Wählen Sie optionale Paketgruppen:',
  [StarterStringKey.PROMPT_ENABLE_DOC_GENERATION]:
    'Dokumentation generieren (README, ARCHITECTURE, API-Docs)?',
  [StarterStringKey.PROMPT_SETUP_DEVCONTAINER]:
    'DevContainer-Konfiguration einrichten?',
  [StarterStringKey.PROMPT_DEVCONTAINER_CONFIG]: 'DevContainer-Konfiguration:',
  [StarterStringKey.PROMPT_MONGO_PASSWORD]:
    'Geben Sie das MongoDB-Root-Passwort ein:',
  [StarterStringKey.PROMPT_USE_IN_MEMORY_DB]:
    'In-Memory-Datenbank für Entwicklung verwenden?',
  [StarterStringKey.PROMPT_DEV_DATABASE_NAME]:
    'Geben Sie den Namen der In-Memory-Datenbank ein:',
  [StarterStringKey.PROMPT_GENERATE_SECRET]: '{name} generieren?',
  [StarterStringKey.PROMPT_ENTER_SECRET]:
    'Geben Sie {name} ein (64-Zeichen-Hex-String):',
  [StarterStringKey.PROMPT_CREATE_INITIAL_COMMIT]:
    'Initialen Git-Commit erstellen?',
  [StarterStringKey.PROMPT_PUSH_TO_REMOTE]: 'Zum Remote-Repository pushen?',
  [StarterStringKey.PROMPT_INSTALL_PLAYWRIGHT]:
    'Playwright-Browser installieren? (Erforderlich für E2E-Tests)',
  [StarterStringKey.PROMPT_SITE_TITLE]: 'Geben Sie den Seitentitel ein:',
  [StarterStringKey.PROMPT_SITE_DESCRIPTION]:
    'Geben Sie die Seitenbeschreibung ein:',
  [StarterStringKey.PROMPT_SITE_TAGLINE]: 'Geben Sie den Slogan ein:',
  [StarterStringKey.VALIDATION_INVALID_WORKSPACE_NAME]:
    'Ungültiger Workspace-Name (nur Buchstaben, Zahlen, Bindestriche)',
  [StarterStringKey.VALIDATION_INVALID_PREFIX]:
    'Ungültiges Präfix (nur Kleinbuchstaben, Zahlen, Bindestriche)',
  [StarterStringKey.VALIDATION_INVALID_NAMESPACE]:
    'Ungültiger Namespace (muss mit @ beginnen)',
  [StarterStringKey.VALIDATION_INVALID_GIT_REPO]:
    'Ungültige Git-Repository-URL',
  [StarterStringKey.VALIDATION_INVALID_HOSTNAME]: 'Ungültiges Hostname-Format',
  [StarterStringKey.VALIDATION_PASSWORD_REQUIRED]: 'Passwort erforderlich',
  [StarterStringKey.VALIDATION_DATABASE_NAME_REQUIRED]:
    'Datenbankname darf nicht leer sein',
  [StarterStringKey.VALIDATION_MUST_BE_HEX_64]:
    'Muss ein 64-Zeichen-Hex-String sein',
  [StarterStringKey.VALIDATION_PACKAGE_JSON_NOT_FOUND]:
    'package.json nicht gefunden',
  [StarterStringKey.VALIDATION_PACKAGE_JSON_INVALID]: 'Ungültige package.json',
  [StarterStringKey.VALIDATION_PACKAGE_JSON_MISSING_NAME]:
    'package.json fehlt Name-Feld',
  [StarterStringKey.VALIDATION_PACKAGE_JSON_MISSING_VERSION]:
    'package.json fehlt Version-Feld',
  [StarterStringKey.VALIDATION_PACKAGE_JSON_NO_SCRIPTS]:
    'package.json hat keine Skripte definiert',
  [StarterStringKey.VALIDATION_REACT_VERSION_MISMATCH]:
    'React-Versionsinkompatibilität mit @types/react',
  [StarterStringKey.VALIDATION_REACT_DOM_REQUIRED]:
    'react-dom ist bei Verwendung von react erforderlich',
  [StarterStringKey.VALIDATION_GITIGNORE_NOT_FOUND]:
    '.gitignore-Datei nicht gefunden',
  [StarterStringKey.VALIDATION_README_NOT_FOUND]: 'README.md nicht gefunden',
  [StarterStringKey.VALIDATION_LICENSE_NOT_FOUND]:
    'LICENSE-Datei nicht gefunden',
  [StarterStringKey.VALIDATION_PASSED]: 'Validierung ohne Probleme bestanden',
  [StarterStringKey.VALIDATION_PASSED_WITH_WARNINGS]:
    'Validierung bestanden (mit Warnungen)',
  [StarterStringKey.VALIDATION_FAILED]: 'Validierung fehlgeschlagen',
  [StarterStringKey.VALIDATION_REPORT_HEADER]: 'Validierungsbericht',
  [StarterStringKey.VALIDATION_ERRORS]: 'Fehler: {count}',
  [StarterStringKey.VALIDATION_WARNINGS]: 'Warnungen: {count}',
  [StarterStringKey.VALIDATION_INFO]: 'Info: {count}',
  [StarterStringKey.VALIDATION_FIX]: 'Behebung: {fix}',
  [StarterStringKey.STEP_CHECK_TARGET_DIR]: 'Zielverzeichnis wird überprüft',
  [StarterStringKey.STEP_CREATE_MONOREPO]: 'Nx Monorepo wird erstellt',
  [StarterStringKey.STEP_UPDATE_TSCONFIG_BASE]:
    'TypeScript-Basiskonfiguration wird aktualisiert',
  [StarterStringKey.STEP_SETUP_GIT_ORIGIN]: 'Git-Remote wird eingerichtet',
  [StarterStringKey.STEP_YARN_BERRY_SETUP]: 'Yarn Berry wird konfiguriert',
  [StarterStringKey.STEP_ADD_PACKAGE_RESOLUTIONS]: 'Paketauflösungen werden hinzugefügt',
  [StarterStringKey.PACKAGE_RESOLUTIONS_ADDED]: 'Paketauflösungen hinzugefügt für @noble/curves, @noble/hashes und @scure/bip32',
  [StarterStringKey.STEP_ADD_NX_PLUGINS]: 'Nx-Plugins werden installiert',
  [StarterStringKey.STEP_ADD_YARN_PACKAGES]:
    'Abhängigkeiten werden installiert',
  [StarterStringKey.STEP_GENERATE_PROJECTS]: 'Projektstruktur wird generiert',
  [StarterStringKey.STEP_INSTALL_REACT_COMPONENTS]:
    'React-Komponenten-Paket wird installiert',
  [StarterStringKey.STEP_RENDER_TEMPLATES]:
    'Konfigurationsvorlagen werden gerendert',
  [StarterStringKey.STEP_COPY_SCAFFOLDING]: 'Gerüstdateien werden kopiert',
  [StarterStringKey.STEP_GENERATE_LICENSE]: 'LICENSE-Datei wird generiert',
  [StarterStringKey.STEP_ADD_SCRIPTS]:
    'package.json-Skripte werden hinzugefügt',
  [StarterStringKey.STEP_GENERATE_DOCUMENTATION]:
    'Dokumentation wird generiert',
  [StarterStringKey.STEP_SETUP_ENVIRONMENT]:
    'Umgebungsdateien werden eingerichtet',
  [StarterStringKey.STEP_REBUILD_NATIVE_MODULES]:
    'Native Module werden kompiliert',
  [StarterStringKey.STEP_VALIDATE_GENERATION]:
    'Generiertes Projekt wird validiert',
  [StarterStringKey.STEP_INITIAL_COMMIT]: 'Initialer Commit wird erstellt',
  [StarterStringKey.STEP_INSTALL_PLAYWRIGHT]:
    'Playwright-Browser werden installiert',
  [StarterStringKey.STEP_SKIPPING]: 'Überspringe: {description}',
  [StarterStringKey.STEP_COMPLETED]: 'Abgeschlossen: {description}',
  [StarterStringKey.STEP_FAILED]: 'Fehlgeschlagen: {description}',
  [StarterStringKey.GENERATION_STARTING]:
    'Generierung wird gestartet ({count} Schritte)',
  [StarterStringKey.GENERATION_COMPLETE]: 'Generierung abgeschlossen!',
  [StarterStringKey.GENERATION_FAILED]: 'Generierung fehlgeschlagen',
  [StarterStringKey.GENERATION_DRY_RUN_MODE]:
    'TESTMODUS - Keine Dateien werden erstellt',
  [StarterStringKey.GENERATION_DRY_RUN_COMPLETE]:
    'Testlauf abgeschlossen. Ohne Testmodus erneut ausführen zum Generieren.',
  [StarterStringKey.GENERATION_ROLLBACK]:
    'Änderungen werden rückgängig gemacht...',
  [StarterStringKey.GENERATION_ROLLBACK_FAILED]:
    'Rollback fehlgeschlagen für: {description}',
  [StarterStringKey.PROJECT_GENERATING]: 'Generiere {type}: {name}',
  [StarterStringKey.PROJECT_ADDED_TARGETS]:
    'copy-env und post-build Ziele zu {name}/project.json hinzugefügt',
  [StarterStringKey.PROJECT_INSTALLING_PACKAGE]:
    'Installiere {package} in {project}',
  [StarterStringKey.PROJECT_COPYING_DEVCONTAINER]:
    'Kopiere devcontainer-Konfiguration: {type}',
  [StarterStringKey.TSCONFIG_BASE_UPDATED]:
    'tsconfig.base.json mit esModuleInterop und allowSyntheticDefaultImports aktualisiert',
  [StarterStringKey.ENV_CREATED_WITH_SECRETS]:
    '{name}/.env mit Secrets erstellt',
  [StarterStringKey.ENV_CREATED_FROM_API]:
    '{name}/.env von {apiName}/.env erstellt',
  [StarterStringKey.ENV_CREATED_DEVCONTAINER]:
    '.devcontainer/.env mit MongoDB-Konfiguration erstellt',
  [StarterStringKey.ENV_CREATED_DEVCONTAINER_FROM_EXAMPLE]:
    '.devcontainer/.env von .env.example mit MongoDB-Konfiguration erstellt',
  [StarterStringKey.ENV_CREATED_DEVCONTAINER_MINIMAL]:
    'Minimale .devcontainer/.env erstellt (.env.example nicht gefunden)',
  [StarterStringKey.ENV_GENERATED_SECRET]: '{name} generiert',
  [StarterStringKey.DOC_GENERATED_README]: 'Generiert: README.md',
  [StarterStringKey.DOC_GENERATED_ARCHITECTURE]: 'Generiert: ARCHITECTURE.md',
  [StarterStringKey.DOC_GENERATED_API]: 'Generiert: {name}/API.md',
  [StarterStringKey.TEMPLATE_RENDERED]: 'Gerendert: {path}',
  [StarterStringKey.TEMPLATE_COPIED]: 'Kopiert: {path}',
  [StarterStringKey.PACKAGE_INSTALLATION_FAILED]:
    'Paketinstallation fehlgeschlagen.',
  [StarterStringKey.PACKAGE_INSTALL_BUILD_TOOLS]:
    'Wenn Sie "exit code 127" oben sehen, installieren Sie Build-Tools:',
  [StarterStringKey.PACKAGE_RETRY_OR_SKIP]:
    'Dann erneut versuchen oder überspringen: yarn start --start-at=addYarnPackages',
  [StarterStringKey.PACKAGE_RESOLVING_VERSION]:
    'Version für {package} wird aufgelöst',
  [StarterStringKey.PACKAGE_FAILED_RESOLVE_LATEST]:
    "Fehler beim Auflösen der neuesten Version für {package}, verwende 'latest'",
  [StarterStringKey.PACKAGE_FAILED_RESOLVE_STABLE]:
    "Fehler beim Auflösen der stabilen Version für {package}, verwende 'latest'",
  [StarterStringKey.PLUGIN_REGISTERING]:
    'Plugin wird registriert: {name} v{version}',
  [StarterStringKey.PLUGIN_HOOK_FAILED]:
    'Plugin {name} Hook {hook} fehlgeschlagen: {error}',
  [StarterStringKey.DRY_RUN_HEADER]:
    'Testmodus - Keine Dateien werden erstellt',
  [StarterStringKey.DRY_RUN_SUMMARY]: 'Testlauf-Zusammenfassung',
  [StarterStringKey.DRY_RUN_FILES_TO_CREATE]: 'Zu erstellende Dateien: {count}',
  [StarterStringKey.DRY_RUN_FILES_TO_MODIFY]: 'Zu ändernde Dateien: {count}',
  [StarterStringKey.DRY_RUN_FILES_TO_DELETE]: 'Zu löschende Dateien: {count}',
  [StarterStringKey.DRY_RUN_COMMANDS_TO_RUN]: 'Auszuführende Befehle: {count}',
  [StarterStringKey.DRY_RUN_ENCOUNTERED_ERROR]:
    'Testlauf hat Fehler festgestellt: {error}',
  [StarterStringKey.DRY_RUN_ACTIONS]: 'Aktionen:',
  [StarterStringKey.DIFF_CHANGES_SUMMARY]: 'Änderungszusammenfassung',
  [StarterStringKey.DIFF_FILES_ADDED]: '{count} Dateien hinzugefügt',
  [StarterStringKey.DIFF_FILES_MODIFIED]: '{count} Dateien geändert',
  [StarterStringKey.DIFF_FILES_DELETED]: '{count} Dateien gelöscht',
  [StarterStringKey.DIFF_TRUNCATED]: '... (gekürzt)',
  [StarterStringKey.DIFF_BEFORE]: 'Vorher:',
  [StarterStringKey.DIFF_AFTER]: 'Nachher:',
  [StarterStringKey.COMMAND_FAILED]: 'Befehl fehlgeschlagen: {command}',
  [StarterStringKey.COMMAND_REBUILDING_NATIVE]:
    'Build-Skripte werden reaktiviert und native Module kompiliert...',
  [StarterStringKey.COMMAND_INSTALLING_PLAYWRIGHT_BROWSERS]:
    'Playwright-Browser werden installiert (dies kann einige Minuten dauern)...',
  [StarterStringKey.COMMAND_SKIPPED_PLAYWRIGHT]:
    'Übersprungen. Später manuell ausführen: yarn playwright install --with-deps',
  [StarterStringKey.SUCCESS_GENERATION_COMPLETE]: 'Generierung Abgeschlossen!',
  [StarterStringKey.SUCCESS_MONOREPO_CREATED]:
    'Monorepo erstellt unter: {path}',
  [StarterStringKey.SUCCESS_VALIDATION_NO_ISSUES]:
    'Validierung ohne Probleme bestanden',
  [StarterStringKey.WARNING_DIRECTORY_EXISTS]:
    'Verzeichnis {path} existiert bereits und ist nicht leer',
  [StarterStringKey.WARNING_UPDATE_ENV_FILE]:
    'WICHTIG: Aktualisieren Sie {name}/.env mit Ihrer Konfiguration',
  [StarterStringKey.WARNING_UPDATE_DEVCONTAINER_ENV]:
    'WICHTIG: Aktualisieren Sie .devcontainer/.env mit Ihrer MongoDB-Konfiguration',
  [StarterStringKey.WARNING_VALIDATION_ERRORS]:
    'Validierung hat Fehler gefunden, aber fährt fort...',
  [StarterStringKey.WARNING_DRY_RUN_RERUN]:
    'Testlauf abgeschlossen. Ohne Testmodus erneut ausführen zum Generieren.',
  [StarterStringKey.NOTICE_SITE_TITLE_TAGLINE_DESCRIPTIONS]:
    'Generische Standard-Seitentitel, Taglines und Beschreibungen wurden für die anderen Sprachen ausgefüllt. Bearbeiten Sie die Datei i18n-setup.ts, um diese Werte anzupassen.',
  [StarterStringKey.ERROR_DIRECTORY_NOT_EMPTY]:
    'Verzeichnis {path} existiert bereits und ist nicht leer',
  [StarterStringKey.ERROR_INVALID_START_STEP]:
    'Ungültiger Startschritt: {step}',
  [StarterStringKey.ERROR_FATAL]: 'Schwerwiegender Fehler',
  [StarterStringKey.SECTION_WORKSPACE_CONFIG]: 'Workspace-Konfiguration',
  [StarterStringKey.SECTION_OPTIONAL_PROJECTS]: 'Optionale Projekte',
  [StarterStringKey.SECTION_PACKAGE_GROUPS]: 'Paketgruppen',
  [StarterStringKey.SECTION_DEVCONTAINER_CONFIG]: 'DevContainer-Konfiguration',
  [StarterStringKey.SECTION_DATABASE_CONFIG]: 'Datenbank-Konfiguration',
  [StarterStringKey.SECTION_SECURITY_CONFIG]: 'Sicherheitskonfiguration',
  [StarterStringKey.SECTION_EXPRESS_SUITE_PACKAGES]: 'Express Suite Pakete',
  [StarterStringKey.SECTION_NEXT_STEPS]: 'Nächste Schritte:',
  [StarterStringKey.SECTION_NEXT_STEPS_UPDATE_ENV]:
    '# Aktualisieren Sie {name}/.env mit Ihren Einstellungen',
  [StarterStringKey.SECTION_NEXT_STEPS_INIT_DB]: 'yarn inituserdb',
  [StarterStringKey.SECTION_NEXT_STEPS_COPY_CREDENTIALS]:
    '⚠️  Kopieren Sie den Anmeldeinformationsblock aus der obigen Ausgabe nach {name}/.env\n      Die Anmeldeinformationen umfassen ADMIN_ID, ADMIN_MNEMONIC, ADMIN_PASSWORD usw.',
  [StarterStringKey.SECTION_NEXT_STEPS_MEMORY_DB_INFO]:
    'ℹ️  Verwendung einer In-Memory-Datenbank - Benutzeranmeldeinformationen werden zur Laufzeit automatisch generiert',
  [StarterStringKey.SECTION_GENERATED_PROJECTS]: 'Generierte Projekte:',
  [StarterStringKey.SECTION_ISSUES]: 'Probleme:',
  [StarterStringKey.SECTION_RUNNING_VALIDATION]:
    'Post-Generierungs-Validierung wird ausgeführt',
  [StarterStringKey.DEVCONTAINER_SIMPLE]: 'Einfach (nur Node.js)',
  [StarterStringKey.DEVCONTAINER_MONGODB]: 'Mit MongoDB',
  [StarterStringKey.DEVCONTAINER_MONGODB_REPLICASET]: 'Mit MongoDB Replica Set',
  [StarterStringKey.SYSTEM_CHECK_UBUNTU_DEBIAN]:
    'Ubuntu/Debian: sudo apt-get install build-essential python3',
  [StarterStringKey.SYSTEM_CHECK_FEDORA_RHEL]:
    'Fedora/RHEL: sudo dnf install gcc-c++ make python3',
  [StarterStringKey.SYSTEM_CHECK_MACOS]: 'macOS: xcode-select --install',
  [StarterStringKey.SYSTEM_CHECK_WINDOWS]:
    'Windows: Visual Studio Build Tools installieren',
};
