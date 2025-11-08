import { StepExecutor } from '../../src/core/step-executor';
import { PluginManager } from '../../src/core/plugin-manager';
import { Plugin } from '../../src/core/interfaces/plugin.interface';
import { GeneratorContext } from '../../src/core/interfaces';
import * as fs from 'fs';

jest.mock('fs');
jest.mock('../../src/cli/logger');

describe('StepExecutor with Plugins', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  let pluginManager: PluginManager;
  let executor: StepExecutor;
  let context: GeneratorContext;

  beforeEach(() => {
    jest.clearAllMocks();
    pluginManager = new PluginManager();
    executor = new StepExecutor(pluginManager);
    context = {
      config: {},
      state: new Map(),
      dryRun: false,
      checkpointPath: '/tmp/checkpoint.json',
    };
    mockFs.mkdirSync.mockImplementation(() => undefined);
    mockFs.writeFileSync.mockImplementation(() => undefined);
  });

  describe('plugin step injection', () => {
    it('executes plugin steps along with regular steps', async () => {
      const regularStepFn = jest.fn();
      const pluginStepFn = jest.fn();

      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        steps: [
          {
            name: 'pluginStep',
            description: 'Plugin step',
            execute: pluginStepFn,
          },
        ],
      };

      pluginManager.register(plugin);

      executor.addStep({
        name: 'regularStep',
        description: 'Regular step',
        execute: regularStepFn,
      });

      await executor.execute(context);

      expect(regularStepFn).toHaveBeenCalled();
      expect(pluginStepFn).toHaveBeenCalled();
    });

    it('executes multiple plugin steps', async () => {
      const plugin1StepFn = jest.fn();
      const plugin2StepFn = jest.fn();

      const plugin1: Plugin = {
        name: 'plugin1',
        version: '1.0.0',
        steps: [{ name: 'step1', description: 'Step 1', execute: plugin1StepFn }],
      };

      const plugin2: Plugin = {
        name: 'plugin2',
        version: '1.0.0',
        steps: [{ name: 'step2', description: 'Step 2', execute: plugin2StepFn }],
      };

      pluginManager.register(plugin1);
      pluginManager.register(plugin2);

      await executor.execute(context);

      expect(plugin1StepFn).toHaveBeenCalled();
      expect(plugin2StepFn).toHaveBeenCalled();
    });
  });

  describe('plugin hooks', () => {
    it('calls beforeGeneration hook', async () => {
      const beforeGenHook = jest.fn();

      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        hooks: {
          beforeGeneration: beforeGenHook,
        },
      };

      pluginManager.register(plugin);

      await executor.execute(context);

      expect(beforeGenHook).toHaveBeenCalledWith(context);
    });

    it('calls afterGeneration hook', async () => {
      const afterGenHook = jest.fn();

      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        hooks: {
          afterGeneration: afterGenHook,
        },
      };

      pluginManager.register(plugin);

      await executor.execute(context);

      expect(afterGenHook).toHaveBeenCalledWith(context);
    });

    it('calls beforeStep and afterStep hooks', async () => {
      const beforeStepHook = jest.fn();
      const afterStepHook = jest.fn();

      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        hooks: {
          beforeStep: beforeStepHook,
          afterStep: afterStepHook,
        },
      };

      pluginManager.register(plugin);

      executor.addStep({
        name: 'testStep',
        description: 'Test step',
        execute: jest.fn(),
      });

      await executor.execute(context);

      expect(beforeStepHook).toHaveBeenCalledWith('testStep', context);
      expect(afterStepHook).toHaveBeenCalledWith('testStep', context);
    });

    it('calls onError hook when step fails', async () => {
      const onErrorHook = jest.fn();
      const error = new Error('Step failed');

      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        hooks: {
          onError: onErrorHook,
        },
      };

      pluginManager.register(plugin);

      executor.addStep({
        name: 'failingStep',
        description: 'Failing step',
        execute: () => {
          throw error;
        },
      });

      await expect(executor.execute(context)).rejects.toThrow();

      expect(onErrorHook).toHaveBeenCalledWith(error, context);
    });

    it('calls hooks in correct order', async () => {
      const callOrder: string[] = [];

      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        hooks: {
          beforeGeneration: async () => { callOrder.push('beforeGeneration'); },
          beforeStep: async () => { callOrder.push('beforeStep'); },
          afterStep: async () => { callOrder.push('afterStep'); },
          afterGeneration: async () => { callOrder.push('afterGeneration'); },
        },
      };

      pluginManager.register(plugin);

      executor.addStep({
        name: 'testStep',
        description: 'Test step',
        execute: () => { callOrder.push('execute'); },
      });

      await executor.execute(context);

      expect(callOrder).toEqual([
        'beforeGeneration',
        'beforeStep',
        'execute',
        'afterStep',
        'afterGeneration',
      ]);
    });
  });

  describe('plugin integration', () => {
    it('allows plugins to modify context', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        hooks: {
          beforeGeneration: async (ctx) => {
            ctx.state.set('pluginData', 'modified');
          },
        },
      };

      pluginManager.register(plugin);

      executor.addStep({
        name: 'checkContext',
        description: 'Check context',
        execute: (ctx) => {
          expect(ctx.state.get('pluginData')).toBe('modified');
        },
      });

      await executor.execute(context);
    });

    it('plugin steps can access context state', async () => {
      context.state.set('testData', 'value');

      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        steps: [
          {
            name: 'pluginStep',
            description: 'Plugin step',
            execute: (ctx) => {
              expect(ctx.state.get('testData')).toBe('value');
            },
          },
        ],
      };

      pluginManager.register(plugin);

      await executor.execute(context);
    });

    it('plugin steps respect skip conditions', async () => {
      const pluginStepFn = jest.fn();

      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        steps: [
          {
            name: 'skippedStep',
            description: 'Skipped step',
            execute: pluginStepFn,
            skip: () => true,
          },
        ],
      };

      pluginManager.register(plugin);

      await executor.execute(context);

      expect(pluginStepFn).not.toHaveBeenCalled();
    });
  });

  describe('multiple plugins interaction', () => {
    it('executes hooks from all plugins', async () => {
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

      pluginManager.register(plugin1);
      pluginManager.register(plugin2);

      await executor.execute(context);

      expect(hook1).toHaveBeenCalled();
      expect(hook2).toHaveBeenCalled();
    });

    it('continues execution if one plugin hook fails', async () => {
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

      pluginManager.register(plugin1);
      pluginManager.register(plugin2);

      await executor.execute(context);

      expect(hook2).toHaveBeenCalled();
    });
  });
});
