import chalk from 'chalk';

export class Logger {
  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  static error(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  static warning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  static step(step: number, total: number, message: string): void {
    console.log(chalk.cyan(`[${step}/${total}]`), message);
  }

  static command(cmd: string): void {
    console.log(chalk.gray('$'), chalk.white(cmd));
  }

  static header(message: string): void {
    console.log('\n' + chalk.bold.cyan(message));
    console.log(chalk.cyan('─'.repeat(message.length)));
  }

  static section(message: string): void {
    console.log('\n' + chalk.bold(message));
  }

  static dim(message: string): void {
    console.log(chalk.dim(message));
  }

  static highlight(message: string): void {
    console.log(chalk.bold.yellow(message));
  }

  static path(path: string): string {
    return chalk.cyan(path);
  }

  static code(code: string): string {
    return chalk.yellow(code);
  }
}
