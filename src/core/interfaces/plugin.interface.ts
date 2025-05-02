import { Step } from './step.interface';
import { GeneratorContext } from './generator-context.interface';

export interface Plugin {
  name: string;
  version: string;
  hooks?: PluginHooks;
  steps?: Step[];
  templates?: TemplateProvider;
}

export interface PluginHooks {
  beforeStep?: (stepName: string, context: GeneratorContext) => Promise<void> | void;
  afterStep?: (stepName: string, context: GeneratorContext) => Promise<void> | void;
  onError?: (error: Error, context: GeneratorContext) => Promise<void> | void;
  beforeGeneration?: (context: GeneratorContext) => Promise<void> | void;
  afterGeneration?: (context: GeneratorContext) => Promise<void> | void;
}

export interface TemplateProvider {
  getTemplatesDir(): string;
  getVariables?(context: GeneratorContext): Record<string, any>;
}
