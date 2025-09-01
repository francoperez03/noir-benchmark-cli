import { CircuitService } from '../services/CircuitService.js';
import { ProofService } from '../services/ProofService.js';
import { BenchmarkResult, BenchmarkStage, BenchmarkTotals, BenchmarkMetadata, MemoryUsage } from '../../domain/models/index.js';
import { PerformanceProfiler, StageResult } from '../../infrastructure/profiling/PerformanceProfiler.js';
import { Logger } from '../../shared/logger/Logger.js';

export interface BenchmarkConfiguration {
  circuitName: string;
  backend: string;
  runs: number;
  threads: number;
  verbose: boolean;
}

/**
 * Benchmark Orchestrator
 * Coordinates the entire benchmark execution flow
 */
export class BenchmarkOrchestrator {
  constructor(
    private readonly circuitService: CircuitService,
    private readonly proofService: ProofService,
    private readonly performanceProfiler: PerformanceProfiler,
    private readonly logger: Logger
  ) {}

  async executeBenchmark(config: BenchmarkConfiguration): Promise<BenchmarkResult> {
    const allResults: BenchmarkResult[] = [];

    try {
      // Start profiling if needed
      if (config.verbose) {
        this.performanceProfiler.startObserving();
      }

      // Execute multiple runs
      for (let i = 0; i < config.runs; i++) {
        if (config.runs > 1) {
          this.logger.info(`📊 Run ${i + 1}/${config.runs}`);
        }
        
        const runResult = await this.executeSingleRun(config);
        allResults.push(runResult);
        
        // Small delay between runs for memory cleanup
        if (i < config.runs - 1) {
          await this.sleep(100);
        }
      }

      // Return aggregated result
      const finalResult = this.aggregateResults(allResults, config);
      this.logger.status('complete', 'Benchmark completed successfully');
      
      return finalResult;

    } catch (error) {
      this.logger.status('error', `Benchmark failed: ${(error as Error).message}`);
      throw error;
    } finally {
      this.performanceProfiler.stopObserving();
      await this.proofService.cleanup();
    }
  }

  private async executeSingleRun(config: BenchmarkConfiguration): Promise<BenchmarkResult> {
    const stages: BenchmarkStage[] = [];

    // Stage 1: Load Circuit
    this.logger.status('running', 'Loading circuit...');
    const loadResult = await this.performanceProfiler.timeStage('circuit-load', async () => {
      return this.circuitService.loadCircuit(config.circuitName);
    });
    stages.push(this.convertToStage(loadResult));
    
    if (config.verbose) {
      this.logger.stageProgress(
        'Circuit Loading',
        100,
        Math.round(loadResult.timeMs),
        this.formatMemoryMB(loadResult.memoryAfter.heapUsed),
        true
      );
    } else {
      this.logger.benchmark('Circuit Load', Math.round(loadResult.timeMs), this.formatMemoryMB(loadResult.memoryAfter.heapUsed));
    }

    const circuit = loadResult.result;

    // Load test inputs
    const inputs = await this.circuitService.getTestInputs(config.circuitName);

    // Stage 2: Initialize Proof System
    this.logger.status('running', 'Initializing backend...');
    const initResult = await this.performanceProfiler.timeStage('backend-init', async () => {
      await this.proofService.initialize(circuit);
      return { initialized: true };
    });
    stages.push(this.convertToStage(initResult));
    
    if (config.verbose) {
      this.logger.stageProgress(
        'Backend Initialization',
        100,
        Math.round(initResult.timeMs),
        this.formatMemoryMB(initResult.memoryAfter.heapUsed),
        true
      );
    } else {
      this.logger.benchmark('Backend Init', Math.round(initResult.timeMs), this.formatMemoryMB(initResult.memoryAfter.heapUsed));
    }

    // Stage 3: Generate Witness
    this.logger.status('running', 'Generating witness...');
    const witnessResult = await this.performanceProfiler.timeStage('witness-generate', async () => {
      return this.proofService.generateWitness(circuit, inputs);
    });
    stages.push(this.convertToStage(witnessResult));
    
    if (config.verbose) {
      this.logger.stageProgress(
        'Witness Generation',
        100,
        Math.round(witnessResult.timeMs),
        this.formatMemoryMB(witnessResult.memoryAfter.heapUsed),
        true
      );
    } else {
      this.logger.benchmark('Witness Generation', Math.round(witnessResult.timeMs), this.formatMemoryMB(witnessResult.memoryAfter.heapUsed));
    }

    const witness = witnessResult.result;

    // Stage 4: Generate Proof (THE MAIN EVENT 🎯)
    this.logger.status('running', '🎯 Generating proof (THE MAIN EVENT)...');
    const proofResult = await this.performanceProfiler.timeStage('proof-generate', async () => {
      return this.proofService.generateProof(witness);
    });
    stages.push(this.convertToStage(proofResult));
    
    if (config.verbose) {
      this.logger.stageProgress(
        '🎯 Proof Generation (THE MAIN EVENT)',
        100,
        Math.round(proofResult.timeMs),
        this.formatMemoryMB(proofResult.memoryAfter.heapUsed),
        true
      );
    } else {
      this.logger.benchmark('🎯 Proof Generation', Math.round(proofResult.timeMs), this.formatMemoryMB(proofResult.memoryAfter.heapUsed));
    }

    const proof = proofResult.result;

    // Stage 5: Verify Proof
    this.logger.status('running', 'Verifying proof...');
    const verifyResult = await this.performanceProfiler.timeStage('proof-verify', async () => {
      return this.proofService.verifyProof(proof);
    });
    stages.push(this.convertToStage(verifyResult));
    
    if (config.verbose) {
      this.logger.stageProgress(
        'Proof Verification',
        100,
        Math.round(verifyResult.timeMs),
        this.formatMemoryMB(verifyResult.memoryAfter.heapUsed),
        true
      );
    } else {
      this.logger.benchmark('Proof Verify', Math.round(verifyResult.timeMs), this.formatMemoryMB(verifyResult.memoryAfter.heapUsed));
    }

    if (!verifyResult.result) {
      throw new Error('Proof verification failed');
    }

    // Calculate totals
    const totalTime = stages.reduce((sum, stage) => sum + stage.timeMs, 0);
    const peakMemory = Math.max(...stages.map(s => s.memoryUsage.after.heapUsed));

    const totals: BenchmarkTotals = {
      timeMs: totalTime,
      memoryPeak: peakMemory,
      proofSize: proof.proofSize,
      witnessSize: witness.size
    };

    const metadata: BenchmarkMetadata = {
      constraints: circuit.constraints,
      bytecodeSize: circuit.bytecodeSize,
      threads: config.threads,
      runs: 1,
      nodeVersion: process.version,
      platform: process.platform
    };

    return new BenchmarkResult(
      config.circuitName,
      config.backend,
      stages,
      totals,
      metadata
    );
  }

  private convertToStage(stageResult: StageResult): BenchmarkStage {
    const memoryUsage: MemoryUsage = {
      before: stageResult.memoryBefore,
      after: stageResult.memoryAfter,
      delta: stageResult.memoryDelta
    };

    return new BenchmarkStage(
      stageResult.stage,
      stageResult.timeMs,
      memoryUsage,
      true
    );
  }

  private aggregateResults(results: BenchmarkResult[], config: BenchmarkConfiguration): BenchmarkResult {
    if (results.length === 1) {
      return results[0];
    }

    // Calculate averages
    const firstResult = results[0];
    const avgTotalTime = results.reduce((sum, r) => sum + r.totals.timeMs, 0) / results.length;
    const avgMemoryPeak = results.reduce((sum, r) => sum + r.totals.memoryPeak, 0) / results.length;

    // Average stage times
    const avgStages = firstResult.stages.map((stage, index) => {
      const avgTimeMs = results.reduce((sum, r) => sum + r.stages[index].timeMs, 0) / results.length;
      return new BenchmarkStage(
        stage.name,
        avgTimeMs,
        stage.memoryUsage,
        stage.success,
        stage.error
      );
    });

    const avgTotals: BenchmarkTotals = {
      timeMs: avgTotalTime,
      memoryPeak: avgMemoryPeak,
      proofSize: firstResult.totals.proofSize,
      witnessSize: firstResult.totals.witnessSize
    };

    const metadata: BenchmarkMetadata = {
      ...firstResult.metadata,
      runs: results.length
    };

    return new BenchmarkResult(
      config.circuitName,
      config.backend,
      avgStages,
      avgTotals,
      metadata
    );
  }

  private formatMemoryMB(bytes: number): number {
    return Math.round(bytes / 1024 / 1024);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}