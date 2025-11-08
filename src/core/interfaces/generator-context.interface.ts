export interface GeneratorContext {
  config: any;
  state: Map<string, any>;
  checkpointPath: string;
  dryRun: boolean;
}
