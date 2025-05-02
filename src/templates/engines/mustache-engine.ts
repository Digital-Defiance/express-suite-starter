import * as mustache from 'mustache';
import { TemplateEngine } from '../interfaces/template-engine.interface';

export class MustacheEngine implements TemplateEngine {
  render(template: string, variables: Record<string, any>): string {
    return mustache.render(template, variables);
  }
}
