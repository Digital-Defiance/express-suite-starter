export interface DryRunAction {
  type: 'create' | 'modify' | 'delete' | 'command';
  target: string;
  description: string;
  content?: string;
}

export interface DryRunReport {
  actions: DryRunAction[];
  summary: {
    filesCreated: number;
    filesModified: number;
    filesDeleted: number;
    commandsExecuted: number;
  };
}
