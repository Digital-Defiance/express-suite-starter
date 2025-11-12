import { getStarterTranslation, getStarterI18nEngine } from '../../src/i18n';
import { StarterStringKey } from '../../src/i18n/starter-string-key';

describe('i18n Translations', () => {
  beforeEach(() => {
    // Reset to English for each test
    const engine = getStarterI18nEngine();
    engine.setLanguage('en-US');
  });

  describe('Basic Translation', () => {
    it('should translate simple strings', () => {
      const result = getStarterTranslation(StarterStringKey.CLI_BANNER);
      expect(result).toBe('Express Suite Starter');
    });

    it('should translate with variables', () => {
      const result = getStarterTranslation(StarterStringKey.PROJECT_GENERATING, {
        type: 'api',
        name: 'my-api'
      });
      expect(result).toBe('Generating api: my-api');
    });

    it('should translate error messages with variables', () => {
      const result = getStarterTranslation(StarterStringKey.ERROR_DIRECTORY_NOT_EMPTY, {
        path: '/test/path'
      });
      expect(result).toBe('Directory /test/path already exists and is not empty');
    });
  });

  describe('Language Switching', () => {
    it('should switch to Spanish', () => {
      const engine = getStarterI18nEngine();
      engine.setLanguage('es');
      
      const result = getStarterTranslation(StarterStringKey.CLI_BANNER);
      expect(result).toBe('Iniciador de Express Suite');
    });

    it('should switch to French', () => {
      const engine = getStarterI18nEngine();
      engine.setLanguage('fr');
      
      const result = getStarterTranslation(StarterStringKey.CLI_BANNER);
      expect(result).toBe('Démarreur Express Suite');
    });

    it('should switch to German', () => {
      const engine = getStarterI18nEngine();
      engine.setLanguage('de');
      
      const result = getStarterTranslation(StarterStringKey.CLI_BANNER);
      expect(result).toBe('Express Suite Starter');
    });

    it('should switch to Mandarin Chinese', () => {
      const engine = getStarterI18nEngine();
      engine.setLanguage('zh-CN');
      
      const result = getStarterTranslation(StarterStringKey.CLI_BANNER);
      expect(result).toBe('Express Suite 启动器');
    });

    it('should switch to Japanese', () => {
      const engine = getStarterI18nEngine();
      engine.setLanguage('ja');
      
      const result = getStarterTranslation(StarterStringKey.CLI_BANNER);
      expect(result).toBe('Express Suite スターター');
    });

    it('should switch to Ukrainian', () => {
      const engine = getStarterI18nEngine();
      engine.setLanguage('uk');
      
      const result = getStarterTranslation(StarterStringKey.CLI_BANNER);
      expect(result).toBe('Стартер Express Suite');
    });
  });

  describe('Variable Interpolation', () => {
    it('should handle multiple variables', () => {
      const result = getStarterTranslation(StarterStringKey.PROJECT_INSTALLING_PACKAGE, {
        package: '@digitaldefiance/express-suite-react-components',
        project: 'my-react-lib'
      });
      expect(result).toBe('Installing @digitaldefiance/express-suite-react-components in my-react-lib');
    });

    it('should handle count variables', () => {
      const result = getStarterTranslation(StarterStringKey.GENERATION_STARTING, {
        count: 10
      });
      expect(result).toBe('Starting generation (10 steps)');
    });

    it('should work in Spanish with variables', () => {
      const engine = getStarterI18nEngine();
      engine.setLanguage('es');
      
      const result = getStarterTranslation(StarterStringKey.PROJECT_GENERATING, {
        type: 'api',
        name: 'mi-api'
      });
      expect(result).toBe('Generando api: mi-api');
    });

    it('should work in French with variables', () => {
      const engine = getStarterI18nEngine();
      engine.setLanguage('fr');
      
      const result = getStarterTranslation(StarterStringKey.PROJECT_GENERATING, {
        type: 'api',
        name: 'mon-api'
      });
      expect(result).toBe('Génération api : mon-api');
    });

    it('should work in German with variables', () => {
      const engine = getStarterI18nEngine();
      engine.setLanguage('de');
      
      const result = getStarterTranslation(StarterStringKey.PROJECT_GENERATING, {
        type: 'api',
        name: 'meine-api'
      });
      expect(result).toBe('Generiere api: meine-api');
    });
  });

  describe('New Translation Keys', () => {
    it('should translate devcontainer env messages', () => {
      const result1 = getStarterTranslation(StarterStringKey.ENV_CREATED_DEVCONTAINER_FROM_EXAMPLE);
      expect(result1).toBe('Created .devcontainer/.env from .env.example with MongoDB configuration');

      const result2 = getStarterTranslation(StarterStringKey.ENV_CREATED_DEVCONTAINER_MINIMAL);
      expect(result2).toBe('Created minimal .devcontainer/.env (no .env.example found)');
    });

    it('should translate next steps update env', () => {
      const result = getStarterTranslation(StarterStringKey.SECTION_NEXT_STEPS_UPDATE_ENV, {
        name: 'my-api'
      });
      expect(result).toBe('# Update my-api/.env with your settings');
    });

    it('should translate in Spanish', () => {
      const engine = getStarterI18nEngine();
      engine.setLanguage('es');
      
      const result = getStarterTranslation(StarterStringKey.ENV_CREATED_DEVCONTAINER_FROM_EXAMPLE);
      expect(result).toBe('Creado .devcontainer/.env desde .env.example con configuración de MongoDB');
    });

    it('should translate in French', () => {
      const engine = getStarterI18nEngine();
      engine.setLanguage('fr');
      
      const result = getStarterTranslation(StarterStringKey.ENV_CREATED_DEVCONTAINER_MINIMAL);
      expect(result).toBe('Créé .devcontainer/.env minimal (.env.example non trouvé)');
    });
  });

  describe('UI Flow Translations', () => {
    describe('Generation Workflow', () => {
      it('should translate complete generation flow in English', () => {
        const steps = [
          getStarterTranslation(StarterStringKey.GENERATION_STARTING, { count: 5 }),
          getStarterTranslation(StarterStringKey.STEP_CHECK_TARGET_DIR),
          getStarterTranslation(StarterStringKey.STEP_CREATE_MONOREPO),
          getStarterTranslation(StarterStringKey.STEP_GENERATE_PROJECTS),
          getStarterTranslation(StarterStringKey.GENERATION_COMPLETE),
        ];

        expect(steps[0]).toBe('Starting generation (5 steps)');
        expect(steps[1]).toBe('Checking target directory');
        expect(steps[2]).toBe('Creating Nx workspace');
        expect(steps[3]).toBe('Generating project structure');
        expect(steps[4]).toBe('Generation complete!');
      });

      it('should translate complete generation flow in Spanish', () => {
        const engine = getStarterI18nEngine();
        engine.setLanguage('es');

        const steps = [
          getStarterTranslation(StarterStringKey.GENERATION_STARTING, { count: 5 }),
          getStarterTranslation(StarterStringKey.STEP_CHECK_TARGET_DIR),
          getStarterTranslation(StarterStringKey.STEP_CREATE_MONOREPO),
          getStarterTranslation(StarterStringKey.STEP_GENERATE_PROJECTS),
          getStarterTranslation(StarterStringKey.GENERATION_COMPLETE),
        ];

        expect(steps[0]).toBe('Iniciando generación (5 pasos)');
        expect(steps[1]).toBe('Verificando directorio de destino');
        expect(steps[2]).toBe('Creando monorepo Nx');
        expect(steps[3]).toBe('Generando estructura del proyecto');
        expect(steps[4]).toBe('¡Generación completa!');
      });

      it('should translate complete generation flow in French', () => {
        const engine = getStarterI18nEngine();
        engine.setLanguage('fr');

        const steps = [
          getStarterTranslation(StarterStringKey.GENERATION_STARTING, { count: 5 }),
          getStarterTranslation(StarterStringKey.STEP_CHECK_TARGET_DIR),
          getStarterTranslation(StarterStringKey.STEP_CREATE_MONOREPO),
          getStarterTranslation(StarterStringKey.STEP_GENERATE_PROJECTS),
          getStarterTranslation(StarterStringKey.GENERATION_COMPLETE),
        ];

        expect(steps[0]).toBe('Démarrage de la génération (5 étapes)');
        expect(steps[1]).toBe('Vérification du répertoire cible');
        expect(steps[2]).toBe('Création du monorepo Nx');
        expect(steps[3]).toBe('Génération de la structure du projet');
        expect(steps[4]).toBe('Génération terminée !');
      });
    });

    describe('Error Messages', () => {
      it('should translate error scenarios in English', () => {
        const errors = [
          getStarterTranslation(StarterStringKey.ERROR_DIRECTORY_NOT_EMPTY, { path: '/test' }),
          getStarterTranslation(StarterStringKey.ERROR_INVALID_START_STEP, { step: 'invalid' }),
          getStarterTranslation(StarterStringKey.GENERATION_FAILED),
          getStarterTranslation(StarterStringKey.STEP_FAILED, { description: 'Build step' }),
        ];

        expect(errors[0]).toBe('Directory /test already exists and is not empty');
        expect(errors[1]).toBe('Invalid start step: invalid');
        expect(errors[2]).toBe('Generation failed');
        expect(errors[3]).toBe('Failed: Build step');
      });

      it('should translate error scenarios in Spanish', () => {
        const engine = getStarterI18nEngine();
        engine.setLanguage('es');

        const errors = [
          getStarterTranslation(StarterStringKey.ERROR_DIRECTORY_NOT_EMPTY, { path: '/test' }),
          getStarterTranslation(StarterStringKey.ERROR_INVALID_START_STEP, { step: 'inválido' }),
          getStarterTranslation(StarterStringKey.GENERATION_FAILED),
          getStarterTranslation(StarterStringKey.STEP_FAILED, { description: 'Paso de construcción' }),
        ];

        expect(errors[0]).toBe('El directorio /test ya existe y no está vacío');
        expect(errors[1]).toBe('Paso inicial inválido: inválido');
        expect(errors[2]).toBe('Generación fallida');
        expect(errors[3]).toBe('Fallido: Paso de construcción');
      });
    });

    describe('Validation Messages', () => {
      it('should translate validation flow in English', () => {
        const validation = [
          getStarterTranslation(StarterStringKey.VALIDATION_REPORT_HEADER),
          getStarterTranslation(StarterStringKey.VALIDATION_ERRORS, { count: 2 }),
          getStarterTranslation(StarterStringKey.VALIDATION_WARNINGS, { count: 3 }),
          getStarterTranslation(StarterStringKey.VALIDATION_PASSED),
        ];

        expect(validation[0]).toBe('Validation Report');
        expect(validation[1]).toBe('Errors: 2');
        expect(validation[2]).toBe('Warnings: 3');
        expect(validation[3]).toBe('Validation passed with no issues');
      });

      it('should translate validation flow in German', () => {
        const engine = getStarterI18nEngine();
        engine.setLanguage('de');

        const validation = [
          getStarterTranslation(StarterStringKey.VALIDATION_REPORT_HEADER),
          getStarterTranslation(StarterStringKey.VALIDATION_ERRORS, { count: 2 }),
          getStarterTranslation(StarterStringKey.VALIDATION_WARNINGS, { count: 3 }),
          getStarterTranslation(StarterStringKey.VALIDATION_PASSED),
        ];

        expect(validation[0]).toBe('Validierungsbericht');
        expect(validation[1]).toBe('Fehler: 2');
        expect(validation[2]).toBe('Warnungen: 3');
        expect(validation[3]).toBe('Validierung ohne Probleme bestanden');
      });
    });

    describe('Dry Run Mode', () => {
      it('should translate dry run messages in English', () => {
        const dryRun = [
          getStarterTranslation(StarterStringKey.DRY_RUN_HEADER),
          getStarterTranslation(StarterStringKey.DRY_RUN_FILES_TO_CREATE, { count: 10 }),
          getStarterTranslation(StarterStringKey.DRY_RUN_FILES_TO_MODIFY, { count: 5 }),
          getStarterTranslation(StarterStringKey.DRY_RUN_COMMANDS_TO_RUN, { count: 3 }),
          getStarterTranslation(StarterStringKey.WARNING_DRY_RUN_RERUN),
        ];

        expect(dryRun[0]).toBe('Dry Run Mode - No files will be created');
        expect(dryRun[1]).toBe('Files to create: 10');
        expect(dryRun[2]).toBe('Files to modify: 5');
        expect(dryRun[3]).toBe('Commands to run: 3');
        expect(dryRun[4]).toBe('Dry-run complete. Re-run without dry-run to generate.');
      });

      it('should translate dry run messages in Mandarin', () => {
        const engine = getStarterI18nEngine();
        engine.setLanguage('zh-CN');

        const dryRun = [
          getStarterTranslation(StarterStringKey.DRY_RUN_HEADER),
          getStarterTranslation(StarterStringKey.DRY_RUN_FILES_TO_CREATE, { count: 10 }),
          getStarterTranslation(StarterStringKey.DRY_RUN_FILES_TO_MODIFY, { count: 5 }),
          getStarterTranslation(StarterStringKey.DRY_RUN_COMMANDS_TO_RUN, { count: 3 }),
        ];

        expect(dryRun[0]).toBe('试运行模式 - 不会创建文件');
        expect(dryRun[1]).toBe('要创建的文件：10');
        expect(dryRun[2]).toBe('要修改的文件：5');
        expect(dryRun[3]).toBe('要运行的命令：3');
      });
    });

    describe('Package Installation', () => {
      it('should translate package messages in English', () => {
        const packages = [
          getStarterTranslation(StarterStringKey.PROJECT_INSTALLING_PACKAGE, {
            package: 'react',
            project: 'my-app'
          }),
          getStarterTranslation(StarterStringKey.PACKAGE_FAILED_RESOLVE_LATEST, {
            package: 'unknown-pkg'
          }),
          getStarterTranslation(StarterStringKey.PACKAGE_INSTALLATION_FAILED),
        ];

        expect(packages[0]).toBe('Installing react in my-app');
        expect(packages[1]).toBe("Failed to resolve latest version for unknown-pkg, using 'latest'");
        expect(packages[2]).toBe('Package installation failed.');
      });

      it('should translate package messages in Japanese', () => {
        const engine = getStarterI18nEngine();
        engine.setLanguage('ja');

        const packages = [
          getStarterTranslation(StarterStringKey.PROJECT_INSTALLING_PACKAGE, {
            package: 'react',
            project: 'my-app'
          }),
          getStarterTranslation(StarterStringKey.PACKAGE_INSTALLATION_FAILED),
        ];

        expect(packages[0]).toBe('my-app に react をインストール中');
        expect(packages[1]).toBe('パッケージのインストールに失敗しました。');
      });
    });
  });

  describe('All Translation Keys Coverage', () => {
    const languages = ['en-US', 'es', 'fr', 'de', 'zh-CN', 'ja', 'uk'];

    languages.forEach(lang => {
      it(`should have translations for all keys in ${lang}`, () => {
        const engine = getStarterI18nEngine();
        engine.setLanguage(lang);
        
        const keys = Object.values(StarterStringKey);
        
        keys.forEach(key => {
          const result = getStarterTranslation(key as StarterStringKey);
          expect(result).toBeTruthy();
          expect(result).not.toBe(key);
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Translation Consistency', () => {
    it('should maintain consistent variable names across languages', () => {
      const languages = ['en-US', 'es', 'fr', 'de'];
      const engine = getStarterI18nEngine();

      languages.forEach(lang => {
        engine.setLanguage(lang);
        const result = getStarterTranslation(StarterStringKey.PROJECT_GENERATING, {
          type: 'api',
          name: 'test'
        });
        
        // Should contain both variable values
        expect(result).toContain('api');
        expect(result).toContain('test');
      });
    });

    it('should handle missing variables gracefully', () => {
      const result = getStarterTranslation(StarterStringKey.PROJECT_GENERATING, {
        type: 'api'
        // name is missing
      } as any);
      
      // Should still return a string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
