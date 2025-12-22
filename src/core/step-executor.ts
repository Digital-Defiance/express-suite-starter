import { Logger } from '../cli/logger';
import * as fs from 'fs';
import * as path from 'path';
import { Step } from './interfaces/step.interface';
import { GeneratorContext } from './interfaces/generator-context.interface';
import { Checkpoint } from './interfaces/checkpoint.interface';
import { PluginManager } from './plugin-manager';
import { getStarterTranslation } from '../i18n';
import { StarterStringKey } from '../i18n/starter-string-key';

export class StepExecutor {
  private steps: Step[] = [];
  private executedSteps: string[] = [];
  private pluginManager: PluginManager;

  constructor(pluginManager?: PluginManager) {
    this.pluginManager = pluginManager || new PluginManager();
  }

  addStep(step: Step): void {
    this.steps.push(step);
  }

  async execute(context: GeneratorContext, startAt?: string): Promise<void> {
    // Add plugin steps before main steps
    const pluginSteps = this.pluginManager.getSteps();
    const mainSteps = [...this.steps];
    this.steps = [...pluginSteps, ...mainSteps];

    const startIndex = startAt ? this.steps.findIndex(s => s.name === startAt) : 0;
    
    if (startIndex === -1) {
      throw new Error(getStarterTranslation(StarterStringKey.ERROR_INVALID_START_STEP, { step: startAt || '' }));
    }

    Logger.header(getStarterTranslation(StarterStringKey.GENERATION_STARTING, { count: this.steps.length - startIndex }));

    // Before generation hook
    await this.pluginManager.executeHook('beforeGeneration', context);

    for (let i = startIndex; i < this.steps.length; i++) {
      const step = this.steps[i];
      
      if (step.skip?.(context)) {
        Logger.dim(getStarterTranslation(StarterStringKey.STEP_SKIPPING, { description: step.description }));
        continue;
      }

      try {
        // Before step hook
        await this.pluginManager.executeHook('beforeStep', context, step.name);
        
        Logger.step(i + 1, this.steps.length, step.description);
        await step.execute(context);
        this.executedSteps.push(step.name);
        await this.saveCheckpoint(context);
        Logger.success(getStarterTranslation(StarterStringKey.STEP_COMPLETED, { description: step.description }));
        
        // After step hook
        await this.pluginManager.executeHook('afterStep', context, step.name);
      } catch (error) {
        Logger.error(getStarterTranslation(StarterStringKey.STEP_FAILED, { description: step.description }));
        
        // Error hook
        await this.pluginManager.executeHook('onError', context, error);
        
        throw error;
      }
    }

    // After generation hook
    await this.pluginManager.executeHook('afterGeneration', context);

    Logger.header(getStarterTranslation(StarterStringKey.GENERATION_COMPLETE));
  }

  async rollback(context: GeneratorContext): Promise<void> {
    Logger.warning(getStarterTranslation(StarterStringKey.GENERATION_ROLLBACK));
    
    for (let i = this.executedSteps.length - 1; i >= 0; i--) {
      const stepName = this.executedSteps[i];
      const step = this.steps.find(s => s.name === stepName);
      
      if (step?.rollback) {
        try {
          Logger.info(`Rolling back: ${step.description}`);
          await step.rollback(context);
        } catch (_error) {
          Logger.error(getStarterTranslation(StarterStringKey.GENERATION_ROLLBACK_FAILED, { description: step.description }));
        }
      }
    }
  }

  private async saveCheckpoint(context: GeneratorContext): Promise<void> {
    const checkpoint: Checkpoint = {
      executedSteps: this.executedSteps,
      state: Array.from(context.state.entries()),
      timestamp: new Date().toISOString(),
    };

    fs.mkdirSync(path.dirname(context.checkpointPath), { recursive: true });
    fs.writeFileSync(context.checkpointPath, JSON.stringify(checkpoint, null, 2), 'utf-8');
  }

  async restoreCheckpoint(checkpointPath: string): Promise<{ executedSteps: string[]; state: Map<string, any> }> {
    if (!fs.existsSync(checkpointPath)) {
      return { executedSteps: [], state: new Map() };
    }

    const checkpoint: Checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
    return {
      executedSteps: checkpoint.executedSteps,
      state: new Map(checkpoint.state),
    };
  }

  getStepNames(): string[] {
    return this.steps.map(s => s.name);
  }
}
