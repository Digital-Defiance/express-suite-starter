import { TemplateEngine } from '../interfaces/template-engine.interface';

export class HandlebarsEngine implements TemplateEngine {
  private handlebars: any;

  constructor() {
    try {
      this.handlebars = require('handlebars');
    } catch {
      throw new Error('Handlebars not installed. Run: yarn add handlebars');
    }
  }

  render(template: string, variables: Record<string, any>): string {
    const compiled = this.handlebars.compile(template);
    return compiled(variables);
  }
}
