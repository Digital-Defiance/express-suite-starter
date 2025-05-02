export interface ProjectConfig {
  type: 'react' | 'react-lib' | 'api' | 'api-lib' | 'lib' | 'e2e' | 'inituserdb' | 'test-utils';
  name: string;
  importPath: string;
  enabled: boolean;
}
