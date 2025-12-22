import { Plugin } from '../interfaces/plugin.interface';
import { GeneratorContext } from '../interfaces/generator-context.interface';
import { Logger } from '../../cli/logger';

export const examplePlugin: Plugin = {
  name: 'example-plugin',
  version: '1.0.0',
  
  hooks: {
    beforeGeneration: async (_context: GeneratorContext) => {
      Logger.info('Example plugin: Before generation');
    },
    
    afterGeneration: async (_context: GeneratorContext) => {
      Logger.info('Example plugin: After generation');
    },
  },
  
  steps: [
    {
      name: 'exampleCustomStep',
      description: 'Example custom step from plugin',
      execute: (context: GeneratorContext) => {
        Logger.info('Executing custom step from example plugin');
        context.state.set('examplePluginRan', true);
      },
      skip: (context: GeneratorContext) => {
        return !context.state.get('enableExamplePlugin');
      },
    },
  ],
};
