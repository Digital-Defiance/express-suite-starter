import { StepExecutor } from './step-executor';
import { GeneratorContext } from './interfaces/generator-context.interface';
import { DryRunAction, DryRunReport } from './interfaces/dry-run.interface';
import { Logger } from '../cli/logger';

export class DryRunExecutor extends StepExecutor {
  private actions: DryRunAction[] = [];
  private isDryRun = true;

  async execute(context: GeneratorContext, startAt?: string): Promise<void> {
    Logger.header('Dry Run Mode - No files will be created');
    
    // Override context to track actions instead of executing
    const dryRunContext = this.createDryRunContext(context);
    
    try {
      await super.execute(dryRunContext, startAt);
    } catch (error) {
      // In dry-run, we continue even on errors
      Logger.warning(`Dry run encountered error: ${error}`);
    }

    this.generateReport();
  }

  private createDryRunContext(context: GeneratorContext): GeneratorContext {
    return {
      ...context,
      state: new Map([
        ...context.state.entries(),
        ['dryRun', true],
        ['dryRunActions', this.actions],
      ]),
    };
  }

  recordAction(action: DryRunAction): void {
    this.actions.push(action);
    this.logAction(action);
  }

  private logAction(action: DryRunAction): void {
    const icon = {
      create: '+',
      modify: '~',
      delete: '-',
      command: '$',
    }[action.type];

    Logger.dim(`  ${icon} ${action.description}`);
  }

  private generateReport(): void {
    const summary = {
      filesCreated: this.actions.filter(a => a.type === 'create').length,
      filesModified: this.actions.filter(a => a.type === 'modify').length,
      filesDeleted: this.actions.filter(a => a.type === 'delete').length,
      commandsExecuted: this.actions.filter(a => a.type === 'command').length,
    };

    Logger.header('Dry Run Summary');
    Logger.info(`Files to create: ${summary.filesCreated}`);
    Logger.info(`Files to modify: ${summary.filesModified}`);
    Logger.info(`Files to delete: ${summary.filesDeleted}`);
    Logger.info(`Commands to run: ${summary.commandsExecuted}`);
  }

  getReport(): DryRunReport {
    const summary = {
      filesCreated: this.actions.filter(a => a.type === 'create').length,
      filesModified: this.actions.filter(a => a.type === 'modify').length,
      filesDeleted: this.actions.filter(a => a.type === 'delete').length,
      commandsExecuted: this.actions.filter(a => a.type === 'command').length,
    };

    return { actions: this.actions, summary };
  }

  static printReport(report: DryRunReport): void {
    Logger.header('Dry Run Summary');
    Logger.info(`Files to create: ${report.summary.filesCreated}`);
    Logger.info(`Files to modify: ${report.summary.filesModified}`);
    Logger.info(`Files to delete: ${report.summary.filesDeleted}`);
    Logger.info(`Commands to run: ${report.summary.commandsExecuted}`);
    
    if (report.actions.length > 0) {
      Logger.section('Actions:');
      report.actions.forEach(action => {
        const icon = { create: '+', modify: '~', delete: '-', command: '$' }[action.type];
        Logger.dim(`  ${icon} ${action.target}: ${action.description}`);
      });
    }
  }
}
