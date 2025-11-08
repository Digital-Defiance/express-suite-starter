import { PluginManager } from '../../src/core/plugin-manager';
import { Plugin } from '../../src/core/interfaces/plugin.interface';
import { GeneratorContext } from '../../src/core/interfaces';

jest.mock('../../src/cli/logger');

describe('PluginManager', () => {
  let manager: PluginManager;
  let context: GeneratorContext;

  beforeEach(() => {
    manager = new PluginManager();
    context = {
      config: {},
      state: new Map(),
      dryRun: false,
      checkpointPath: '/tmp/checkpoint.json',
    };
  });

  describe('register', () => {
    it('registers a plugin', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
      };

      manager.register(plugin);

      expect(manager.getPlugins()).toContain(plugin);
    });

    it('registers multiple plugins', () => {
      const plugin1: Plugin = { name: 'plugin1', version: '1.0.0' };
      const plugin2: Plugin = { name: 'plugin2', version: '1.0.0' };

      manager.register(plugin1);
      manager.register(plugin2);

      expect(manager.getPlugins()).toHaveLength(2);
    });
  });

  describe('getSteps', () => {
    it('returns empty array when no plugins have steps', () => {
      const plugin: Plugin = { name: 'test', version: '1.0.0' };
      manager.register(plugin);

      expect(manager.getSteps()).toEqual([]);
    });

    it('returns steps from all plugins', () => {
      const plugin1: Plugin = {
        name: 'plugin1',
        version: '1.0.0',
        steps: [
          { name: 'step1', description: 'Step 1', execute: jest.fn() },
        ],
      };
      const plugin2: Plugin = {
        name: 'plugin2',
        version: '1.0.0',
        steps: [
          { name: 'step2', description: 'Step 2', execute: jest.fn() },
        ],
      };

      manager.register(plugin1);
      manager.register(plugin2);

      expect(manager.getSteps()).toHaveLength(2);
    });
  });

  describe('executeHook', () => {
    it('executes hook on all plugins', async () => {
      const hook1 = jest.fn();
      const hook2 = jest.fn();

      const plugin1: Plugin = {
        name: 'plugin1',
        version: '1.0.0',
        hooks: { beforeGeneration: hook1 },
      };
      const plugin2: Plugin = {
        name: 'plugin2',
        version: '1.0.0',
        hooks: { beforeGeneration: hook2 },
      };

      manager.register(plugin1);
      manager.register(plugin2);

      await manager.executeHook('beforeGeneration', context);

      expect(hook1).toHaveBeenCalledWith(context);
      expect(hook2).toHaveBeenCalledWith(context);
    });

    it('continues execution if hook fails', async () => {
      const hook1 = jest.fn().mockRejectedValue(new Error('Hook failed'));
      const hook2 = jest.fn();

      const plugin1: Plugin = {
        name: 'plugin1',
        version: '1.0.0',
        hooks: { beforeGeneration: hook1 },
      };
      const plugin2: Plugin = {
        name: 'plugin2',
        version: '1.0.0',
        hooks: { beforeGeneration: hook2 },
      };

      manager.register(plugin1);
      manager.register(plugin2);

      await manager.executeHook('beforeGeneration', context);

      expect(hook2).toHaveBeenCalled();
    });

    it('skips plugins without the hook', async () => {
      const hook = jest.fn();

      const plugin1: Plugin = {
        name: 'plugin1',
        version: '1.0.0',
      };
      const plugin2: Plugin = {
        name: 'plugin2',
        version: '1.0.0',
        hooks: { beforeGeneration: hook },
      };

      manager.register(plugin1);
      manager.register(plugin2);

      await manager.executeHook('beforeGeneration', context);

      expect(hook).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTemplateVariables', () => {
    it('returns empty object when no plugins have templates', () => {
      const plugin: Plugin = { name: 'test', version: '1.0.0' };
      manager.register(plugin);

      expect(manager.getTemplateVariables(context)).toEqual({});
    });

    it('merges variables from all plugins', () => {
      const plugin1: Plugin = {
        name: 'plugin1',
        version: '1.0.0',
        templates: {
          getTemplatesDir: () => '/tmp',
          getVariables: () => ({ VAR1: 'value1' }),
        },
      };
      const plugin2: Plugin = {
        name: 'plugin2',
        version: '1.0.0',
        templates: {
          getTemplatesDir: () => '/tmp',
          getVariables: () => ({ VAR2: 'value2' }),
        },
      };

      manager.register(plugin1);
      manager.register(plugin2);

      const vars = manager.getTemplateVariables(context);

      expect(vars).toEqual({ VAR1: 'value1', VAR2: 'value2' });
    });
  });

  describe('getTemplateDirs', () => {
    it('returns empty array when no plugins have templates', () => {
      const plugin: Plugin = { name: 'test', version: '1.0.0' };
      manager.register(plugin);

      expect(manager.getTemplateDirs()).toEqual([]);
    });

    it('returns template directories from all plugins', () => {
      const plugin1: Plugin = {
        name: 'plugin1',
        version: '1.0.0',
        templates: {
          getTemplatesDir: () => '/tmp/plugin1',
        },
      };
      const plugin2: Plugin = {
        name: 'plugin2',
        version: '1.0.0',
        templates: {
          getTemplatesDir: () => '/tmp/plugin2',
        },
      };

      manager.register(plugin1);
      manager.register(plugin2);

      expect(manager.getTemplateDirs()).toEqual(['/tmp/plugin1', '/tmp/plugin2']);
    });
  });
});
