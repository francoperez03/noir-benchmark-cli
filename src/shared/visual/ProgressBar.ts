import chalk from 'chalk';

/**
 * Progress Bar and Visual Indicators
 * Provides progress visualization for console output
 */
export class ProgressBar {
  /**
   * Create a progress bar
   */
  static bar(
    percentage: number, 
    width: number = 50, 
    completed: string = '█', 
    incomplete: string = '░',
    showPercentage: boolean = true
  ): string {
    const completedWidth = Math.floor((percentage / 100) * width);
    const incompleteWidth = width - completedWidth;
    
    const completedBar = chalk.green(completed.repeat(completedWidth));
    const incompleteBar = chalk.gray(incomplete.repeat(incompleteWidth));
    
    let result = `[${completedBar}${incompleteBar}]`;
    
    if (showPercentage) {
      result += ` ${chalk.bold.white(percentage.toFixed(0))}%`;
    }
    
    return result;
  }

  /**
   * Create a progress bar with stage information
   */
  static stageProgress(
    stageName: string, 
    percentage: number, 
    timeElapsed?: number, 
    memory?: number,
    isComplete: boolean = false
  ): string {
    const title = `STAGE: ${stageName}`;
    const bar = this.bar(percentage, 56, '█', '░', true);
    
    let status = '';
    if (isComplete) {
      status = chalk.green('✅ Completed');
      if (timeElapsed) status += ` in ${chalk.cyan(timeElapsed + 'ms')}`;
    } else {
      status = chalk.yellow('⏳ Running...');
      if (timeElapsed) status += ` ${chalk.cyan(timeElapsed + 'ms')} elapsed`;
    }
    
    if (memory) {
      status += ` | Memory: ${chalk.magenta(memory + 'MB')}`;
      if (!isComplete) status += chalk.green(' ↗️');
    }
    
    const content = `${bar}\n${status}`;
    
    return this.createBox(content, title);
  }

  /**
   * Create spinner animation frames
   */
  static spinner(): string[] {
    return ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  }

  /**
   * Create loading indicator with spinner
   */
  static loading(message: string, spinnerFrame: number = 0): string {
    const frames = this.spinner();
    const frame = frames[spinnerFrame % frames.length];
    return chalk.yellow(frame) + ' ' + chalk.white(message);
  }

  /**
   * Create status indicator
   */
  static status(type: 'pending' | 'running' | 'complete' | 'error', message: string): string {
    const icons = {
      pending: chalk.gray('⏸️'),
      running: chalk.yellow('⏳'),
      complete: chalk.green('✅'), 
      error: chalk.red('❌')
    };
    
    const colors = {
      pending: chalk.gray,
      running: chalk.yellow,
      complete: chalk.green,
      error: chalk.red
    };
    
    return `${icons[type]} ${colors[type](message)}`;
  }

  /**
   * Create time indicator with elapsed time visualization
   */
  static timeIndicator(elapsedMs: number, estimatedTotalMs?: number): string {
    const elapsed = elapsedMs.toFixed(0);
    
    if (estimatedTotalMs && estimatedTotalMs > 0) {
      const percentage = Math.min((elapsedMs / estimatedTotalMs) * 100, 100);
      const bar = this.bar(percentage, 20, '▓', '░', false);
      return `${chalk.cyan('⏱️')} ${bar} ${chalk.white(elapsed)}ms`;
    }
    
    return `${chalk.cyan('⏱️')} ${chalk.white(elapsed)}ms`;
  }

  /**
   * Create memory usage visualization
   */
  static memoryIndicator(currentMB: number, peakMB?: number): string {
    let result = `${chalk.green('🧠')} ${chalk.white(currentMB)}MB`;
    
    if (peakMB && currentMB > peakMB * 0.8) {
      result += chalk.yellow(' ⚠️');
    }
    
    if (peakMB) {
      result += chalk.gray(` (peak: ${peakMB}MB)`);
    }
    
    return result;
  }

  /**
   * Helper to create a box around content
   */
  private static createBox(content: string, title?: string): string {
    const lines = content.split('\n');
    const maxWidth = Math.max(...lines.map(line => this.stripAnsi(line).length));
    const width = Math.max(maxWidth + 4, title ? title.length + 6 : 0);
    
    let result = '';
    
    // Top border with optional title
    if (title) {
      const titlePadding = width - title.length - 6;
      result += chalk.blue('┌─ ') + chalk.bold(title) + ' ' + '─'.repeat(titlePadding) + chalk.blue('┐\n');
    } else {
      result += chalk.blue('┌' + '─'.repeat(width - 2) + '┐\n');
    }
    
    // Content lines
    lines.forEach(line => {
      const lineLength = this.stripAnsi(line).length;
      const padding = width - lineLength - 4;
      result += chalk.blue('│ ') + line + ' '.repeat(padding) + chalk.blue(' │\n');
    });
    
    // Bottom border
    result += chalk.blue('└' + '─'.repeat(width - 2) + '┘');
    
    return result;
  }

  /**
   * Helper to strip ANSI color codes for length calculation
   */
  private static stripAnsi(str: string): string {
    return str.replace(/\u001b\[.*?m/g, '');
  }
}