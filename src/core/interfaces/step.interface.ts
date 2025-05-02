import { GeneratorContext } from './generator-context.interface';

export interface Step {
  name: string;
  description: string;
  execute: (context: GeneratorContext) => Promise<void> | void;
  rollback?: (context: GeneratorContext) => Promise<void> | void;
  skip?: (context: GeneratorContext) => boolean;
}
