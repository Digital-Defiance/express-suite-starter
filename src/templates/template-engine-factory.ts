import { TemplateEngine } from './interfaces/template-engine.interface';
import { MustacheEngine } from './engines/mustache-engine';
import { HandlebarsEngine } from './engines/handlebars-engine';

export function createEngine(type: 'mustache' | 'handlebars'): TemplateEngine {
  return type === 'handlebars' ? new HandlebarsEngine() : new MustacheEngine();
}
