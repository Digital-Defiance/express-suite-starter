import { MustacheEngine, createEngine } from '../../src/templates';

describe('Template Engine', () => {
  describe('MustacheEngine', () => {
    it('renders simple variables', () => {
      const engine = new MustacheEngine();
      const result = engine.render('Hello {{name}}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('renders nested variables', () => {
      const engine = new MustacheEngine();
      const result = engine.render('{{user.name}} - {{user.email}}', {
        user: { name: 'John', email: 'john@example.com' },
      });
      expect(result).toBe('John - john@example.com');
    });
  });

  describe('createEngine', () => {
    it('creates mustache engine', () => {
      const engine = createEngine('mustache');
      expect(engine).toBeInstanceOf(MustacheEngine);
    });

    it('creates handlebars engine if available', () => {
      try {
        const engine = createEngine('handlebars');
        expect(engine).toBeDefined();
      } catch (error) {
        // Handlebars not installed, skip test
        expect((error as Error).message).toContain('Handlebars not installed');
      }
    });
  });
});
