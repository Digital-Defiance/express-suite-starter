import { Logger } from '../cli/logger';
import * as fs from 'fs';

export interface FileDiff {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  before?: string;
  after?: string;
}

export class DiffViewer {
  static showDiff(diff: FileDiff): void {
    Logger.section(`${this.getIcon(diff.type)} ${diff.path}`);

    if (diff.type === 'added' && diff.after) {
      this.showAddition(diff.after);
    } else if (diff.type === 'deleted' && diff.before) {
      this.showDeletion(diff.before);
    } else if (diff.type === 'modified' && diff.before && diff.after) {
      this.showModification(diff.before, diff.after);
    }
  }

  private static getIcon(type: FileDiff['type']): string {
    return { added: '+', modified: '~', deleted: '-' }[type];
  }

  private static showAddition(content: string): void {
    const lines = content.split('\n').slice(0, 10);
    lines.forEach(line => {
      console.log(Logger.code(`+ ${line}`));
    });
    if (content.split('\n').length > 10) {
      Logger.dim('  ... (truncated)');
    }
  }

  private static showDeletion(content: string): void {
    const lines = content.split('\n').slice(0, 10);
    lines.forEach(line => {
      Logger.error(`- ${line}`);
    });
    if (content.split('\n').length > 10) {
      Logger.dim('  ... (truncated)');
    }
  }

  private static showModification(before: string, after: string): void {
    const beforeLines = before.split('\n').slice(0, 5);
    const afterLines = after.split('\n').slice(0, 5);

    Logger.dim('  Before:');
    beforeLines.forEach(line => Logger.error(`  - ${line}`));
    
    Logger.dim('  After:');
    afterLines.forEach(line => console.log(Logger.code(`  + ${line}`)));
    
    if (before.split('\n').length > 5 || after.split('\n').length > 5) {
      Logger.dim('  ... (truncated)');
    }
  }

  static showSummary(diffs: FileDiff[]): void {
    const added = diffs.filter(d => d.type === 'added').length;
    const modified = diffs.filter(d => d.type === 'modified').length;
    const deleted = diffs.filter(d => d.type === 'deleted').length;

    Logger.header('Changes Summary');
    Logger.success(`${added} files added`);
    Logger.info(`${modified} files modified`);
    Logger.warning(`${deleted} files deleted`);
  }
}
