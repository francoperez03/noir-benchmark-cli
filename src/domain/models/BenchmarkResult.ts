/**
 * Benchmark Result Entity
 * Represents the complete result of a benchmark execution
 */
export class BenchmarkResult {
  constructor(
    public readonly circuitName: string,
    public readonly backend: string,
    public readonly stages: BenchmarkStage[],
    public readonly totals: BenchmarkTotals,
    public readonly metadata: BenchmarkMetadata,
    public readonly timestamp: Date = new Date()
  ) {
    if (stages.length === 0) {
      throw new Error('Benchmark must have at least one stage');
    }
  }

  get totalTime(): number {
    return this.totals.timeMs;
  }

  get proofGenerationTime(): number {
    const proofStage = this.stages.find(s => s.name === 'proof-generate');
    return proofStage?.timeMs ?? 0;
  }

  get proofGenerationPercentage(): number {
    return this.totalTime > 0 ? (this.proofGenerationTime / this.totalTime) * 100 : 0;
  }

  toJSON() {
    return {
      circuit: {
        name: this.circuitName,
        size: this.metadata.constraints,
        bytecodeSize: this.metadata.bytecodeSize
      },
      backend: this.backend,
      stages: this.stages.map(stage => stage.toJSON()),
      totals: this.totals,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString()
    };
  }
}

export class BenchmarkStage {
  constructor(
    public readonly name: string,
    public readonly timeMs: number,
    public readonly memoryUsage: MemoryUsage,
    public readonly success: boolean = true,
    public readonly error?: string
  ) {
    if (timeMs < 0) {
      throw new Error('Stage time cannot be negative');
    }
  }

  toJSON() {
    return {
      stage: this.name,
      timeMs: Math.round(this.timeMs * 100) / 100,
      memoryBefore: this.memoryUsage.before,
      memoryAfter: this.memoryUsage.after,
      memoryDelta: this.memoryUsage.delta,
      success: this.success,
      error: this.error
    };
  }
}

export interface BenchmarkTotals {
  timeMs: number;
  memoryPeak: number;
  proofSize: number;
  witnessSize: number;
}

export interface BenchmarkMetadata {
  constraints: number;
  bytecodeSize: number;
  threads: number;
  runs: number;
  nodeVersion: string;
  platform: string;
}

export interface MemoryUsage {
  before: NodeJS.MemoryUsage;
  after: NodeJS.MemoryUsage;
  delta: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}