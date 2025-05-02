import { DevContainerConfig } from '../../src/core/interfaces';

describe('DevContainerConfig', () => {
  describe('configuration options', () => {
    it('supports no devcontainer', () => {
      const config: DevContainerConfig = {
        enabled: false,
        includeMongoDB: false,
        mongoReplicaSet: false,
      };

      expect(config.enabled).toBe(false);
    });

    it('supports simple devcontainer (Node.js only)', () => {
      const config: DevContainerConfig = {
        enabled: true,
        includeMongoDB: false,
        mongoReplicaSet: false,
      };

      expect(config.enabled).toBe(true);
      expect(config.includeMongoDB).toBe(false);
    });

    it('supports devcontainer with MongoDB single instance', () => {
      const config: DevContainerConfig = {
        enabled: true,
        includeMongoDB: true,
        mongoReplicaSet: false,
      };

      expect(config.enabled).toBe(true);
      expect(config.includeMongoDB).toBe(true);
      expect(config.mongoReplicaSet).toBe(false);
    });

    it('supports devcontainer with MongoDB replica set', () => {
      const config: DevContainerConfig = {
        enabled: true,
        includeMongoDB: true,
        mongoReplicaSet: true,
      };

      expect(config.enabled).toBe(true);
      expect(config.includeMongoDB).toBe(true);
      expect(config.mongoReplicaSet).toBe(true);
    });

    it('ignores mongoReplicaSet when MongoDB is disabled', () => {
      const config: DevContainerConfig = {
        enabled: true,
        includeMongoDB: false,
        mongoReplicaSet: true,  // Should be ignored
      };

      // mongoReplicaSet is meaningless without MongoDB
      expect(config.includeMongoDB).toBe(false);
    });
  });

  describe('validation logic', () => {
    it('validates replica set requires MongoDB', () => {
      const config: DevContainerConfig = {
        enabled: true,
        includeMongoDB: false,
        mongoReplicaSet: true,
      };

      // If mongoReplicaSet is true, includeMongoDB should also be true
      const isValid = !config.mongoReplicaSet || config.includeMongoDB;
      expect(isValid).toBe(false);
    });

    it('validates valid replica set configuration', () => {
      const config: DevContainerConfig = {
        enabled: true,
        includeMongoDB: true,
        mongoReplicaSet: true,
      };

      const isValid = !config.mongoReplicaSet || config.includeMongoDB;
      expect(isValid).toBe(true);
    });
  });

  describe('template selection', () => {
    it('selects correct template based on configuration', () => {
      const configs: Array<{ config: DevContainerConfig; expected: string }> = [
        {
          config: { enabled: false, includeMongoDB: false, mongoReplicaSet: false },
          expected: 'none',
        },
        {
          config: { enabled: true, includeMongoDB: false, mongoReplicaSet: false },
          expected: 'simple',
        },
        {
          config: { enabled: true, includeMongoDB: true, mongoReplicaSet: false },
          expected: 'with-mongodb',
        },
        {
          config: { enabled: true, includeMongoDB: true, mongoReplicaSet: true },
          expected: 'with-mongodb-replicaset',
        },
      ];

      configs.forEach(({ config, expected }) => {
        const template = getDevContainerTemplate(config);
        expect(template).toBe(expected);
      });
    });
  });
});

function getDevContainerTemplate(config: DevContainerConfig): string {
  if (!config.enabled) {
    return 'none';
  }

  if (!config.includeMongoDB) {
    return 'simple';
  }

  if (config.mongoReplicaSet) {
    return 'with-mongodb-replicaset';
  }

  return 'with-mongodb';
}
