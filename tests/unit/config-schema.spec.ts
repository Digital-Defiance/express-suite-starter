import { ConfigValidator } from '../../src/core/config-schema';

describe('ConfigValidator', () => {
  describe('validateWorkspaceName', () => {
    it('accepts valid workspace names', () => {
      expect(ConfigValidator.validateWorkspaceName('my-project')).toBe(true);
      expect(ConfigValidator.validateWorkspaceName('MyProject123')).toBe(true);
    });

    it('rejects invalid workspace names', () => {
      expect(ConfigValidator.validateWorkspaceName('my_project')).toBe(false);
      expect(ConfigValidator.validateWorkspaceName('my project')).toBe(false);
      expect(ConfigValidator.validateWorkspaceName('@project')).toBe(false);
    });
  });

  describe('validatePrefix', () => {
    it('accepts valid prefixes', () => {
      expect(ConfigValidator.validatePrefix('my-project')).toBe(true);
      expect(ConfigValidator.validatePrefix('project123')).toBe(true);
    });

    it('rejects invalid prefixes', () => {
      expect(ConfigValidator.validatePrefix('MyProject')).toBe(false);
      expect(ConfigValidator.validatePrefix('my_project')).toBe(false);
    });
  });

  describe('validateNamespace', () => {
    it('accepts valid namespaces', () => {
      expect(ConfigValidator.validateNamespace('@my-project')).toBe(true);
      expect(ConfigValidator.validateNamespace('@project123')).toBe(true);
    });

    it('rejects invalid namespaces', () => {
      expect(ConfigValidator.validateNamespace('my-project')).toBe(false);
      expect(ConfigValidator.validateNamespace('@My-Project')).toBe(false);
    });
  });

  describe('validateGitRepo', () => {
    it('accepts valid git URLs', () => {
      expect(ConfigValidator.validateGitRepo('https://github.com/user/repo.git')).toBe(true);
      expect(ConfigValidator.validateGitRepo('git@github.com:user/repo.git')).toBe(true);
      expect(ConfigValidator.validateGitRepo('')).toBe(true);
    });

    it('rejects invalid git URLs', () => {
      expect(ConfigValidator.validateGitRepo('not-a-url')).toBe(false);
    });
  });

  describe('validate', () => {
    it('validates complete configuration', () => {
      const config = {
        workspace: {
          name: 'test-project',
          prefix: 'test-project',
          namespace: '@test-project',
          parentDir: '/tmp',
          gitRepo: 'https://github.com/user/repo.git',
        },
      };

      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('collects all validation errors', () => {
      const config = {
        workspace: {
          name: 'invalid_name',
          prefix: 'Invalid-Prefix',
          namespace: 'missing-at',
          parentDir: '/tmp',
          gitRepo: 'not-a-url',
        },
      };

      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
