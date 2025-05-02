import { HandlebarsEngine } from '../../src/templates/engines/handlebars-engine';

describe('HandlebarsEngine', () => {
  let engine: HandlebarsEngine;

  beforeEach(() => {
    engine = new HandlebarsEngine();
  });

  it('renders simple template', () => {
    const template = 'Hello {{name}}!';
    const variables = { name: 'World' };

    const result = engine.render(template, variables);

    expect(result).toBe('Hello World!');
  });

  it('renders template with conditionals', () => {
    const template = '{{#if enabled}}Enabled{{else}}Disabled{{/if}}';
    
    expect(engine.render(template, { enabled: true })).toBe('Enabled');
    expect(engine.render(template, { enabled: false })).toBe('Disabled');
  });

  it('renders template with loops', () => {
    const template = '{{#each items}}{{this}} {{/each}}';
    const variables = { items: ['a', 'b', 'c'] };

    const result = engine.render(template, variables);

    expect(result).toBe('a b c ');
  });

  it('handles missing variables', () => {
    const template = 'Hello {{name}}!';
    const variables = {};

    const result = engine.render(template, variables);

    expect(result).toBe('Hello !');
  });
});

