import { Plugin } from './interfaces/plugin.interface';
import { GeneratorContext } from './interfaces/generator-context.interface';
import { Step } from './interfaces/step.interface';
import { Logger } from '../cli/logger';

export class PluginManager {
  private plugins: Plugin[] = [];

  register(plugin: Plugin): void {
    Logger.info(`Registering plugin: ${plugin.name} v${plugin.version}`);
    this.plugins.push(plugin);
  }

  getPlugins(): Plugin[] {
    return [...this.plugins];
  }

  getSteps(): Step[] {
    return this.plugins.flatMap(p => p.steps || []);
  }

  async executeHook(
    hookName: 'beforeGeneration' | 'afterGeneration' | 'beforeStep' | 'afterStep' | 'onError',
    context: GeneratorContext,
    ...args: any[]
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin.hooks?.[hookName];
      if (hook) {
        try {
          await (hook as any)(...args, context);
        } catch (error) {
          Logger.warning(`Plugin ${plugin.name} hook ${hookName} failed: ${error}`);
        }
      }
    }
  }

  getTemplateVariables(context: GeneratorContext): Record<string, any> {
    const variables: Record<string, any> = {};
    
    for (const plugin of this.plugins) {
      if (plugin.templates?.getVariables) {
        Object.assign(variables, plugin.templates.getVariables(context));
      }
    }
    
    return variables;
  }

  getTemplateDirs(): string[] {
    return this.plugins
      .filter(p => p.templates)
      .map(p => p.templates!.getTemplatesDir());
  }
}
