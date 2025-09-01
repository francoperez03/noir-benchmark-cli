import chalk from 'chalk';

/**
 * ASCII Art and Visual Utilities
 * Provides beautiful visual elements for console output
 */
export class AsciiArt {
  /**
   * Create a banner with title and subtitle
   */
  static banner(title: string, subtitle: string): string {
    const width = Math.max(title.length, subtitle.length) + 8;
    const border = '═'.repeat(width - 2);
    const titlePadding = Math.floor((width - title.length - 2) / 2);
    const subtitlePadding = Math.floor((width - subtitle.length - 2) / 2);
    
    return chalk.cyan(`╔${border}╗`) + '\n' +
           chalk.cyan('║') + ' '.repeat(titlePadding) + chalk.bold.white(title) + 
           ' '.repeat(width - title.length - titlePadding - 2) + chalk.cyan('║') + '\n' +
           chalk.cyan('║') + ' '.repeat(subtitlePadding) + chalk.gray(subtitle) + 
           ' '.repeat(width - subtitle.length - subtitlePadding - 2) + chalk.cyan('║') + '\n' +
           chalk.cyan(`╚${border}╝`);
  }

  /**
   * Create a simple box around content
   */
  static box(content: string, title?: string): string {
    const lines = content.split('\n');
    const maxWidth = Math.max(...lines.map(line => line.length));
    const width = Math.max(maxWidth + 4, title ? title.length + 4 : 0);
    
    let result = '';
    
    // Top border with optional title
    if (title) {
      const titlePadding = Math.floor((width - title.length - 4) / 2);
      result += chalk.blue('┌─ ') + chalk.bold(title) + ' ' + '─'.repeat(width - title.length - 4 - titlePadding) + chalk.blue('┐\n');
    } else {
      result += chalk.blue('┌' + '─'.repeat(width - 2) + '┐\n');
    }
    
    // Content lines
    lines.forEach(line => {
      const padding = width - line.length - 4;
      result += chalk.blue('│ ') + line + ' '.repeat(padding) + chalk.blue(' │\n');
    });
    
    // Bottom border
    result += chalk.blue('└' + '─'.repeat(width - 2) + '┘');
    
    return result;
  }

  /**
   * Create a highlighted box for important content
   */
  static highlightBox(content: string, title?: string): string {
    const lines = content.split('\n');
    const maxWidth = Math.max(...lines.map(line => line.length));
    const width = Math.max(maxWidth + 4, title ? title.length + 4 : 0);
    
    let result = '';
    
    // Top border with optional title
    if (title) {
      const titlePadding = Math.floor((width - title.length - 4) / 2);
      result += chalk.yellow('╔═ ') + chalk.bold.yellow(title) + ' ' + '═'.repeat(width - title.length - 4 - titlePadding) + chalk.yellow('╗\n');
    } else {
      result += chalk.yellow('╔' + '═'.repeat(width - 2) + '╗\n');
    }
    
    // Content lines
    lines.forEach(line => {
      const padding = width - line.length - 4;
      result += chalk.yellow('║ ') + line + ' '.repeat(padding) + chalk.yellow(' ║\n');
    });
    
    // Bottom border
    result += chalk.yellow('╚' + '═'.repeat(width - 2) + '╝');
    
    return result;
  }

  /**
   * Create pipeline flow diagram
   */
  static pipeline(stages: Array<{name: string, time: number, memory: number, percentage: number, isMain?: boolean}>): string {
    const boxWidth = 13;
    let result = chalk.bold.cyan('🔄 BENCHMARK PIPELINE EXECUTION FLOW\n\n');
    
    // Top boxes line
    let boxesLine = '';
    let arrowsLine = '';
    let metricsLine1 = '';
    let metricsLine2 = '';
    let metricsLine3 = '';
    
    stages.forEach((stage, index) => {
      const isLast = index === stages.length - 1;
      const isMain = stage.isMain;
      
      // Box style
      const topLeft = isMain ? '╔' : '┌';
      const topRight = isMain ? '╗' : '┐';
      const bottomLeft = isMain ? '╚' : '└';
      const bottomRight = isMain ? '╝' : '┘';
      const horizontal = isMain ? '═' : '─';
      const vertical = isMain ? '║' : '│';
      
      const boxColor = isMain ? chalk.yellow : chalk.blue;
      
      // Create box
      const nameLines = stage.name.split(' ');
      const topLine = nameLines[0] || '';
      const bottomLine = nameLines[1] || '';
      
      const topPadding = Math.floor((boxWidth - topLine.length - 2) / 2);
      const bottomPadding = Math.floor((boxWidth - bottomLine.length - 2) / 2);
      
      // Box top
      boxesLine += boxColor(topLeft + horizontal.repeat(boxWidth - 2) + topRight);
      
      // Box content - line 1
      arrowsLine += boxColor(vertical) + ' '.repeat(topPadding) + (isMain ? chalk.bold.white(topLine) : topLine) + 
                   ' '.repeat(boxWidth - topLine.length - topPadding - 2) + boxColor(vertical);
      
      // Box content - line 2  
      metricsLine1 += boxColor(vertical) + ' '.repeat(bottomPadding) + (isMain ? chalk.bold.white(bottomLine) : bottomLine) + 
                      ' '.repeat(boxWidth - bottomLine.length - bottomPadding - 2) + boxColor(vertical);
      
      // Box bottom
      metricsLine2 += boxColor(bottomLeft + horizontal.repeat(boxWidth - 2) + bottomRight);
      
      // Metrics below box
      const timeStr = `${stage.time}ms`;
      
      const timePadding = Math.floor((boxWidth - timeStr.length) / 2);
      
      metricsLine3 += ' '.repeat(timePadding) + chalk.cyan(timeStr) + ' '.repeat(boxWidth - timeStr.length - timePadding);
      
      // Add arrows between boxes (but not after the last one)
      if (!isLast) {
        boxesLine += '      ';
        arrowsLine += chalk.white('─────▶');
        metricsLine1 += chalk.white('─────▶');
        metricsLine2 += '      ';
        metricsLine3 += '      ';
      }
    });
    
    result += boxesLine + '\n';
    result += arrowsLine + '\n';
    result += metricsLine1 + '\n';  
    result += metricsLine2 + '\n';
    
    // Add metrics lines
    result += '\n';
    let timeLine = '';
    let memLine = '';
    let percLine = '';
    
    stages.forEach((stage, index) => {
      const isLast = index === stages.length - 1;
      const isMain = stage.isMain;
      
      const timeStr = isMain ? chalk.cyan.bold(`${stage.time}ms`) : chalk.cyan(`${stage.time}ms`);
      const memStr = `${stage.memory}MB`;
      const percStr = isMain ? chalk.yellow.bold(`⭐ ${stage.percentage}%`) : `${stage.percentage}%`;
      
      const timeLength = stage.time.toString().length + 2; // +2 for "ms"
      const timePadding = Math.floor((boxWidth - timeLength) / 2);
      const memPadding = Math.floor((boxWidth - memStr.length) / 2);
      const percLength = isMain ? stage.percentage.toString().length + 4 : stage.percentage.toString().length + 1;
      const percPadding = Math.floor((boxWidth - percLength) / 2);
      
      timeLine += ' '.repeat(timePadding) + timeStr + ' '.repeat(boxWidth - timeLength - timePadding);
      memLine += ' '.repeat(memPadding) + chalk.green(memStr) + ' '.repeat(boxWidth - memStr.length - memPadding);
      percLine += ' '.repeat(percPadding) + percStr + ' '.repeat(boxWidth - percLength - percPadding);
      
      if (!isLast) {
        timeLine += '      ';
        memLine += '      ';
        percLine += '      ';
      }
    });
    
    result += timeLine + '\n';
    result += memLine + '\n';
    result += percLine + '\n';
    
    // Add main event highlight
    const mainStage = stages.find(s => s.isMain);
    if (mainStage) {
      result += '\n' + ' '.repeat(Math.floor((boxWidth * stages.length + 6 * (stages.length - 1) - 18) / 2)) + 
               chalk.yellow.bold('THE MAIN EVENT!') + '\n';
      result += ' '.repeat(Math.floor((boxWidth * stages.length + 6 * (stages.length - 1) - 17) / 2)) + 
               chalk.yellow('(Most Critical)') + '\n';
    }
    
    return result;
  }

  /**
   * Create a separator line
   */
  static separator(char: string = '═', length: number = 95): string {
    return chalk.gray(char.repeat(length));
  }

  /**
   * Create summary footer
   */
  static summary(totalTime: number, peakMemory: number, proofSize: number, mainPercentage?: number): string {
    let result = this.separator() + '\n\n';
    
    result += chalk.cyan('⚡ TOTAL TIME: ') + chalk.bold.white(`${totalTime}ms`) + 
              '  │  ' + chalk.green('🧠 PEAK MEMORY: ') + chalk.bold.white(`${peakMemory}MB`) + 
              '  │  ' + chalk.magenta('📦 PROOF SIZE: ') + chalk.bold.white(`${proofSize.toLocaleString()} bytes`) + '\n\n';
    
    if (mainPercentage) {
      result += chalk.yellow('🏆 PERFORMANCE INSIGHT: ') + 
                chalk.white(`Proof Generation dominates ${chalk.bold.yellow(mainPercentage + '%')} of execution time`);
    }
    
    return result;
  }
}