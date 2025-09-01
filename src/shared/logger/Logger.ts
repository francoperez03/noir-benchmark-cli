import chalk from 'chalk';
import { AsciiArt, ProgressBar } from '../visual/index.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success' | 'benchmark' | 'progress' | 'visual';

export interface LoggerOptions {
  verbose?: boolean;
  silent?: boolean;
  level?: LogLevel;
}

/**
 * Enhanced Visual Logger with ASCII art and progress indicators
 * Applies Don Norman's design principles for better user experience
 */
export class Logger {
  private verbose: boolean;
  private silent: boolean;
  private minLevel: LogLevel;

  constructor(options: LoggerOptions = {}) {
    this.verbose = options.verbose || false;
    this.silent = options.silent || false;
    this.minLevel = options.level || 'info';
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(chalk.gray('[DEBUG]'), message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(chalk.blue('[INFO]'), message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(chalk.yellow('[WARN]'), message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(chalk.red('[ERROR]'), message, ...args);
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.shouldLog('success')) {
      console.log(chalk.green('[SUCCESS]'), message, ...args);
    }
  }

  benchmark(stage: string, timeMs: number | string, memoryMB: number | string): void {
    if (this.shouldLog('benchmark')) {
      const time = chalk.cyan(`${timeMs}ms`);
      const memory = chalk.magenta(`${memoryMB}MB`);
      console.log(`${chalk.blue('[BENCH]')} ${chalk.bold(stage)}: ${time} | ${memory}`);
    }
  }

  // New visual logging methods

  /**
   * Display application banner
   */
  banner(title: string = 'NOIR BENCHMARK CLI v0.1.0', subtitle: string = 'Zero-Knowledge Proof Benchmarking'): void {
    if (this.shouldLog('visual')) {
      console.log('\n' + AsciiArt.banner(title, subtitle) + '\n');
    }
  }

  /**
   * Display benchmark configuration info
   */
  config(circuit: string, backend: string, runs: number, threads: number): void {
    if (this.shouldLog('info')) {
      const configLine = `📊 Circuit: ${chalk.bold.white(circuit)} | Backend: ${chalk.bold.white(backend)} | Runs: ${chalk.bold.white(runs)} | Threads: ${chalk.bold.white(threads)}`;
      console.log('\n' + configLine + '\n');
    }
  }

  /**
   * Display stage progress with visual indicators
   */
  stageProgress(
    stageName: string,
    percentage: number,
    timeElapsed?: number,
    memory?: number,
    isComplete: boolean = false
  ): void {
    if (this.shouldLog('progress')) {
      const progressBox = ProgressBar.stageProgress(stageName, percentage, timeElapsed, memory, isComplete);
      console.log(progressBox);
    }
  }

  /**
   * Display loading indicator
   */
  loading(message: string, spinnerFrame: number = 0): void {
    if (this.shouldLog('progress')) {
      process.stdout.write('\r' + ProgressBar.loading(message, spinnerFrame));
    }
  }

  /**
   * Clear loading line
   */
  clearLoading(): void {
    process.stdout.write('\r' + ' '.repeat(80) + '\r');
  }

  /**
   * Display benchmark pipeline flow diagram
   */
  pipelineFlow(stages: Array<{name: string, time: number, memory: number, percentage: number, isMain?: boolean}>): void {
    if (this.shouldLog('visual')) {
      console.log('\n' + AsciiArt.pipeline(stages) + '\n');
    }
  }

  /**
   * Display summary with visual formatting
   */
  visualSummary(totalTime: number, peakMemory: number, proofSize: number, mainPercentage?: number): void {
    if (this.shouldLog('visual')) {
      console.log(AsciiArt.summary(totalTime, peakMemory, proofSize, mainPercentage) + '\n');
    }
  }

  /**
   * Display status with visual indicator
   */
  status(type: 'pending' | 'running' | 'complete' | 'error', message: string): void {
    if (this.shouldLog('info')) {
      console.log(ProgressBar.status(type, message));
    }
  }

  /**
   * Display highlighted box for important information
   */
  highlight(content: string, title?: string): void {
    if (this.shouldLog('visual')) {
      console.log(AsciiArt.highlightBox(content, title));
    }
  }

  /**
   * Display regular box for grouped information
   */
  box(content: string, title?: string): void {
    if (this.shouldLog('visual')) {
      console.log(AsciiArt.box(content, title));
    }
  }

  /**
   * Display separator line
   */
  separator(char: string = '═', length: number = 95): void {
    if (this.shouldLog('visual')) {
      console.log(AsciiArt.separator(char, length));
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.silent) return false;
    if (level === 'debug' && !this.verbose) return false;
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'success', 'benchmark', 'progress', 'visual'];
    const currentIndex = levels.indexOf(level);
    const minIndex = levels.indexOf(this.minLevel);
    
    return currentIndex >= minIndex;
  }

  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }

  setSilent(silent: boolean): void {
    this.silent = silent;
  }

  isVerbose(): boolean {
    return this.verbose;
  }

  isSilent(): boolean {
    return this.silent;
  }
}