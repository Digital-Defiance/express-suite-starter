import { ProjectConfigBuilder } from '../../src/core/project-config-builder';

describe('ProjectConfigBuilder', () => {
  it('builds core projects by default', () => {
    const projects = ProjectConfigBuilder.build('test', '@test', {});
    
    expect(projects).toHaveLength(3);
    expect(projects.find(p => p.type === 'lib')).toBeDefined();
    expect(projects.find(p => p.type === 'react')).toBeDefined();
    expect(projects.find(p => p.type === 'api')).toBeDefined();
  });

  it('includes react-lib when requested', () => {
    const projects = ProjectConfigBuilder.build('test', '@test', {
      includeReactLib: true,
    });
    
    const reactLib = projects.find(p => p.type === 'react-lib');
    expect(reactLib).toBeDefined();
    expect(reactLib?.name).toBe('test-react-lib');
    expect(reactLib?.importPath).toBe('@test/react-lib');
  });

  it('includes api-lib when requested', () => {
    const projects = ProjectConfigBuilder.build('test', '@test', {
      includeApiLib: true,
    });
    
    const apiLib = projects.find(p => p.type === 'api-lib');
    expect(apiLib).toBeDefined();
    expect(apiLib?.name).toBe('test-api-lib');
  });

  it('includes all optional projects', () => {
    const projects = ProjectConfigBuilder.build('test', '@test', {
      includeReactLib: true,
      includeApiLib: true,
      includeE2e: true,
      includeInitUserDb: true,
      includeTestUtils: true,
    });
    
    expect(projects.length).toBeGreaterThan(3);
    expect(projects.find(p => p.type === 'react-lib')).toBeDefined();
    expect(projects.find(p => p.type === 'api-lib')).toBeDefined();
    expect(projects.find(p => p.type === 'inituserdb')).toBeDefined();
    expect(projects.find(p => p.type === 'test-utils')).toBeDefined();
  });

  it('all projects are enabled by default', () => {
    const projects = ProjectConfigBuilder.build('test', '@test', {
      includeReactLib: true,
    });
    
    projects.forEach(project => {
      expect(project.enabled).toBe(true);
    });
  });
});
