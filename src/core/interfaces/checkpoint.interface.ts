export interface Checkpoint {
  executedSteps: string[];
  state: [string, any][];
  timestamp: string;
}
