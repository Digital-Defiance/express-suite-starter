export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'lint' | 'dependency' | 'security' | 'bestPractice';
  message: string;
  file?: string;
  line?: number;
  fix?: string;
}

export interface ValidationReport {
  passed: boolean;
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}
