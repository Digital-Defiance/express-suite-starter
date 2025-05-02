import { StepExecutor } from '../../src/core/step-executor';
import { PluginManager } from '../../src/core/plugin-manager';
import { Plugin } from '../../src/core/interfaces/plugin.interface';
import { GeneratorContext } from '../../src/core/interfaces';
import * as fs from 'fs';

jest.mock('fs');
jest.mock('../../src/cli/logger');

describe('Plugin Integration', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.mkdirSync.mockImplementation(() => undefined);
    mockFs.writeFileSync.mockImplementation(() => undefined);
  });

  it('full generation with plugin', async () => {
    const pluginManager = new PluginManager();
    const executor = new StepExecutor(pluginManager);
    
    const context: GeneratorContext = {
      config: {},
      state: new Map([['monorepoPath', '/test']]),
      checkpointPath: '/tmp/checkpoint.json',
    };

    const executionLog: string[] = [];

    const loggingPlugin: Plugin = {
      name: 'logging-plugin',
      version: '1.0.0',
      hooks: {
        beforeGeneration: async () => { executionLog.push('plugin:beforeGeneration'); },
        beforeStep: async (stepName) => { executionLog.push(`plugin:beforeStep:${stepName}`); },
        afterStep: async (stepName) => { executionLog.push(`plugin:afterStep:${stepName}`); },
        afterGeneration: async () => { executionLog.push('plugin:afterGeneration'); },
      },
    };

    pluginManager.register(loggingPlugin);

    executor.addStep({
      name: 'step1',
      description: 'Step 1',
      execute: () => { executionLog.push('step1:execute'); },
    });

    executor.addStep({
      name: 'step2',
      description: 'Step 2',
      execute: () => { executionLog.push('step2:execute'); },
    });

    await executor.execute(context);

    expect(executionLog).toEqual([
      'plugin:beforeGeneration',
      'plugin:beforeStep:step1',
      'step1:execute',
      'plugin:afterStep:step1',
      'plugin:beforeStep:step2',
      'step2:execute',
      'plugin:afterStep:step2',
      'plugin:afterGeneration',
    ]);
  });

  it('plugin modifies generation flow', async () => {
    const pluginManager = new PluginManager();
    const executor = new StepExecutor(pluginManager);
    
    const context: GeneratorContext = {
      config: {},
      state: new Map(),
      checkpointPath: '/tmp/checkpoint.json',
    };

    const setupPlugin: Plugin = {
      name: 'setup-plugin',
      version: '1.0.0',
      hooks: {
        beforeGeneration: async (ctx) => {
          ctx.state.set('pluginSetup', true);
        },
      },
      steps: [
        {
          name: 'pluginCustomStep',
          description: 'Plugin custom step',
          execute: (ctx) => {
            ctx.state.set('customStepRan', true);
          },
        },
      ],
    };

    pluginManager.register(setupPlugin);

    executor.addStep({
      name: 'verifySetup',
      description: 'Verify setup',
      execute: (ctx) => {
        expect(ctx.state.get('pluginSetup')).toBe(true);
        expect(ctx.state.get('customStepRan')).toBe(true);
      },
    });

    await executor.execute(context);
  });

  it('multiple plugins work together', async () => {
    const pluginManager = new PluginManager();
    const executor = new StepExecutor(pluginManager);
    
    const context: GeneratorContext = {
      config: {},
      state: new Map(),
      checkpointPath: '/tmp/checkpoint.json',
    };

    const plugin1: Plugin = {
      name: 'plugin1',
      version: '1.0.0',
      hooks: {
        beforeGeneration: async (ctx) => {
          ctx.state.set('plugin1', 'initialized');
        },
      },
    };

    const plugin2: Plugin = {
      name: 'plugin2',
      version: '1.0.0',
      hooks: {
        beforeGeneration: async (ctx) => {
          ctx.state.set('plugin2', 'initialized');
        },
      },
    };

    pluginManager.register(plugin1);
    pluginManager.register(plugin2);

    executor.addStep({
      name: 'verify',
      description: 'Verify both plugins',
      execute: (ctx) => {
        expect(ctx.state.get('plugin1')).toBe('initialized');
        expect(ctx.state.get('plugin2')).toBe('initialized');
      },
    });

    await executor.execute(context);
  });
});
