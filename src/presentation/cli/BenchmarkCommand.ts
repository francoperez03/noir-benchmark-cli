import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { BenchmarkOrchestrator, BenchmarkConfiguration } from '../../application/orchestrators/BenchmarkOrchestrator.js';
import { Logger } from '../../shared/logger/Logger.js';
import { BenchmarkError } from '../../shared/errors/BenchmarkError.js';

export interface CommandOptions {
  circuit?: string;
  backend?: string;
  threads?: string;
  runs?: string;
  output?: string;
  profile?: boolean;
  memory?: boolean;
  verbose?: boolean;
}

/**
 * Benchmark CLI Command
 */
export class BenchmarkCommand {
  constructor(
    private readonly benchmarkOrchestrator: BenchmarkOrchestrator,
    private readonly logger: Logger
  ) {}

  register(program: Command): void {
    program
      .command('benchmark')
      .description('Run a benchmark test')
      .option('-c, --circuit <name>', 'Circuit to benchmark', 'simple-hash')
      .option('-b, --backend <name>', 'Backend to use (UltraHonk|UltraPlonk)', 'UltraHonk')
      .option('-t, --threads <number>', 'Number of threads', '1')
      .option('-r, --runs <number>', 'Number of runs', '1')
      .option('-o, --output <file>', 'Output file for results')
      .option('--profile', 'Enable CPU profiling')
      .option('--memory', 'Enable memory tracking')
      .option('--verbose', 'Verbose output')
      .action(async (options: CommandOptions) => {
        try {
          await this.execute(options);
        } catch (error) {
          this.handleError(error as Error, options.verbose);
          process.exit(1);
        }
      });
  }

  private async execute(options: CommandOptions): Promise<void> {
    const config = this.parseConfiguration(options);
    
    // Set logger options
    this.logger.setVerbose(config.verbose);

    // Display beautiful banner
    this.logger.banner();

    // Display configuration with visual formatting
    this.logger.config(config.circuitName, config.backend, config.runs, config.threads);

    // Execute benchmark
    const result = await this.benchmarkOrchestrator.executeBenchmark(config);

    // Save results if requested
    if (options.output) {
      const outputPath = resolve(options.output);
      writeFileSync(outputPath, JSON.stringify(result.toJSON(), null, 2));
      this.logger.success(`💾 Results saved to: ${outputPath}`);
    }

    // Display visual summary
    this.displayVisualSummary(result);
  }

  private parseConfiguration(options: CommandOptions): BenchmarkConfiguration {
    return {
      circuitName: options.circuit || 'simple-hash',
      backend: options.backend || 'UltraHonk',
      threads: parseInt(options.threads || '1'),
      runs: parseInt(options.runs || '1'),
      verbose: options.verbose || false
    };
  }

  private displayVisualSummary(result: any): void {
    // Prepare stages data for pipeline visualization
    const stages = result.stages.map((stage: any) => ({
      name: this.getStageDisplayName(stage.name || stage.stage),
      time: Math.round(stage.timeMs),
      memory: Math.round(stage.memoryUsage.after.heapUsed / 1024 / 1024),
      percentage: parseFloat((stage.timeMs / result.totals.timeMs * 100).toFixed(1)),
      isMain: (stage.name || stage.stage) === 'proof-generate'
    }));

    // Display pipeline flow diagram
    this.logger.pipelineFlow(stages);

    // Find proof generation percentage for insight
    const proofStage = stages.find((s: any) => s.isMain);
    const proofPercentage = proofStage ? proofStage.percentage : undefined;

    // Display visual summary
    this.logger.visualSummary(
      Math.round(result.totals.timeMs),
      Math.round(result.totals.memoryPeak / 1024 / 1024),
      result.totals.proofSize,
      proofPercentage
    );
  }

  private getStageDisplayName(stageName: string): string {
    const displayNames: Record<string, string> = {
      'circuit-load': 'CIRCUIT LOAD',
      'backend-init': 'BACKEND INIT', 
      'witness-generate': 'WITNESS GENERATION',
      'proof-generate': '🎯 PROOF GENERATION',
      'proof-verify': 'PROOF VERIFY'
    };
    return displayNames[stageName] || stageName.toUpperCase();
  }

  private handleError(error: Error, verbose?: boolean): void {
    if (error instanceof BenchmarkError) {
      this.logger.error(`❌ ${error.message}`);
      if (verbose && error.cause) {
        this.logger.debug('Caused by:', error.cause.message);
        if (error.cause.stack) {
          this.logger.debug(error.cause.stack);
        }
      }
    } else {
      this.logger.error(`❌ Unexpected error: ${error.message}`);
      if (verbose && error.stack) {
        this.logger.debug(error.stack);
      }
    }
  }
}