import { StepExecutor } from './step-executor';
import { GeneratorContext } from './interfaces/generator-context.interface';
import { DryRunAction, DryRunReport } from './interfaces/dry-run.interface';
import { Logger } from '../cli/logger';
import { getStarterTranslation } from '../i18n';
import { StarterStringKey } from '../i18n/starter-string-key';

export class DryRunExecutor extends StepExecutor {
  private actions: DryRunAction[] = [];
  private isDryRun = true;

  async execute(context: GeneratorContext, startAt?: string): Promise<void> {
    Logger.header(getStarterTranslation(StarterStringKey.DRY_RUN_HEADER));
    
    // Override context to track actions instead of executing
    const dryRunContext = this.createDryRunContext(context);
    
    try {
      await super.execute(dryRunContext, startAt);
    } catch (error) {
      // In dry-run, we continue even on errors
      Logger.warning(getStarterTranslation(StarterStringKey.DRY_RUN_ENCOUNTERED_ERROR, { error: String(error) }));
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

    Logger.header(getStarterTranslation(StarterStringKey.DRY_RUN_SUMMARY));
    Logger.info(getStarterTranslation(StarterStringKey.DRY_RUN_FILES_TO_CREATE, { count: summary.filesCreated }));
    Logger.info(getStarterTranslation(StarterStringKey.DRY_RUN_FILES_TO_MODIFY, { count: summary.filesModified }));
    Logger.info(getStarterTranslation(StarterStringKey.DRY_RUN_FILES_TO_DELETE, { count: summary.filesDeleted }));
    Logger.info(getStarterTranslation(StarterStringKey.DRY_RUN_COMMANDS_TO_RUN, { count: summary.commandsExecuted }));
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
    Logger.header(getStarterTranslation(StarterStringKey.DRY_RUN_SUMMARY));
    Logger.info(getStarterTranslation(StarterStringKey.DRY_RUN_FILES_TO_CREATE, { count: report.summary.filesCreated }));
    Logger.info(getStarterTranslation(StarterStringKey.DRY_RUN_FILES_TO_MODIFY, { count: report.summary.filesModified }));
    Logger.info(getStarterTranslation(StarterStringKey.DRY_RUN_FILES_TO_DELETE, { count: report.summary.filesDeleted }));
    Logger.info(getStarterTranslation(StarterStringKey.DRY_RUN_COMMANDS_TO_RUN, { count: report.summary.commandsExecuted }));
    
    if (report.actions.length > 0) {
      Logger.section(getStarterTranslation(StarterStringKey.DRY_RUN_ACTIONS));
      report.actions.forEach(action => {
        const icon = { create: '+', modify: '~', delete: '-', command: '$' }[action.type];
        Logger.dim(`  ${icon} ${action.target}: ${action.description}`);
      });
    }
  }
}
