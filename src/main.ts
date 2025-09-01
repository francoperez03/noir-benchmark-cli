#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

// Application Layer
import { BenchmarkOrchestrator } from './application/orchestrators/BenchmarkOrchestrator.js';
import { CircuitService } from './application/services/CircuitService.js';
import { ProofService } from './application/services/ProofService.js';

// Infrastructure Layer
import { FileSystemCircuitRepository } from './infrastructure/circuit/FileSystemCircuitRepository.js';
import { UltraHonkProofSystemRepository } from './infrastructure/noir/UltraHonkProofSystemRepository.js';
import { PerformanceProfiler } from './infrastructure/profiling/PerformanceProfiler.js';

// Presentation Layer
import { BenchmarkCommand } from './presentation/cli/BenchmarkCommand.js';

// Shared
import { Logger } from './shared/logger/Logger.js';
import { BenchmarkError } from './shared/errors/BenchmarkError.js';

/**
 * Dependency Injection Container
 */
class Container {
  private logger: Logger;
  private circuitRepository: FileSystemCircuitRepository;
  private proofSystemRepository: UltraHonkProofSystemRepository;
  private performanceProfiler: PerformanceProfiler;
  private circuitService: CircuitService;
  private proofService: ProofService;
  private benchmarkOrchestrator: BenchmarkOrchestrator;
  private benchmarkCommand: BenchmarkCommand;

  constructor() {
    // Infrastructure
    this.logger = new Logger();
    this.circuitRepository = new FileSystemCircuitRepository();
    this.proofSystemRepository = new UltraHonkProofSystemRepository();
    this.performanceProfiler = new PerformanceProfiler();

    // Application Services
    this.circuitService = new CircuitService(this.circuitRepository, this.logger);
    this.proofService = new ProofService(this.proofSystemRepository, this.logger);

    // Application Orchestrator
    this.benchmarkOrchestrator = new BenchmarkOrchestrator(
      this.circuitService,
      this.proofService,
      this.performanceProfiler,
      this.logger
    );

    // Presentation
    this.benchmarkCommand = new BenchmarkCommand(this.benchmarkOrchestrator, this.logger);
  }

  getBenchmarkCommand(): BenchmarkCommand {
    return this.benchmarkCommand;
  }

  getCircuitService(): CircuitService {
    return this.circuitService;
  }

  getLogger(): Logger {
    return this.logger;
  }
}

/**
 * Main CLI Application
 */
async function main() {
  const container = new Container();
  const logger = container.getLogger();
  const circuitService = container.getCircuitService();
  const benchmarkCommand = container.getBenchmarkCommand();

  const program = new Command();
  
  program
    .name('noir-benchmark')
    .description('Benchmarking and profiling tool for NoirJS + Barretenberg')
    .version('0.1.0');

  // Register commands
  benchmarkCommand.register(program);

  // List circuits command
  program
    .command('list-circuits')
    .description('List available circuits')
    .action(async () => {
      try {
        logger.info('📋 Available Circuits');
        const circuits = await circuitService.listAvailableCircuits();
        
        if (circuits.length === 0) {
          logger.warn('No circuits found. Run setup first.');
          return;
        }

        circuits.forEach(circuit => {
          logger.info(`  ${chalk.green('•')} ${circuit}`);
        });
      } catch (error) {
        logger.error('❌ Failed to list circuits:', (error as Error).message);
        process.exit(1);
      }
    });

  // Setup command (placeholder)
  program
    .command('setup')
    .description('Setup circuits and dependencies')
    .action(async () => {
      logger.info('🔧 Setting up circuits and dependencies...');
      logger.info('✅ Setup completed');
    });

  // Handle unknown commands
  program.on('command:*', () => {
    logger.error(`Unknown command: ${chalk.red(program.args.join(' '))}`);
    logger.info('Run with --help to see available commands');
    process.exit(1);
  });

  // Show help if no command provided
  if (process.argv.length <= 2) {
    program.help();
  }

  // Parse arguments
  try {
    await program.parseAsync();
  } catch (error) {
    if (error instanceof BenchmarkError) {
      logger.error(`❌ ${error.message}`);
      if (error.cause) {
        logger.debug('Caused by:', error.cause.message);
      }
    } else {
      logger.error(`❌ Unexpected error: ${(error as Error).message}`);
    }
    process.exit(1);
  }
}

// Run the application
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { Container };