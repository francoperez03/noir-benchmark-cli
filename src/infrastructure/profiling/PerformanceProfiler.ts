import { performance, PerformanceObserver } from 'perf_hooks';

export interface PerformanceMeasurement {
  name: string;
  duration: number;
  startTime: number;
  timestamp?: string;
}

export interface StageResult<T = any> {
  stage: string;
  timeMs: number;
  memoryBefore: NodeJS.MemoryUsage;
  memoryAfter: NodeJS.MemoryUsage;
  memoryDelta: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  result: T;
}

/**
 * Performance Profiler for measuring execution times
 */
export class PerformanceProfiler {
  private measurements: PerformanceMeasurement[] = [];
  private observer: PerformanceObserver | null = null;
  private isObserving: boolean = false;

  startObserving(): void {
    if (this.isObserving) return;

    this.observer = new PerformanceObserver((items) => {
      items.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          this.measurements.push({
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    this.observer.observe({ entryTypes: ['measure'] });
    this.isObserving = true;
  }

  stopObserving(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.isObserving = false;
    }
  }

  async timeStage<T>(stageName: string, asyncFn: () => Promise<T>): Promise<StageResult<T>> {
    const startMark = `${stageName}-start`;
    const endMark = `${stageName}-end`;
    
    const memoryBefore = process.memoryUsage();
    const startTime = performance.now();
    
    // Mark start
    performance.mark(startMark);

    try {
      const result = await asyncFn();
      
      const endTime = performance.now();
      const memoryAfter = process.memoryUsage();
      
      // Mark end and measure
      performance.mark(endMark);
      performance.measure(stageName, startMark, endMark);

      const memoryDelta = {
        heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
        heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
        external: memoryAfter.external - memoryBefore.external,
        rss: memoryAfter.rss - memoryBefore.rss
      };

      return {
        stage: stageName,
        timeMs: endTime - startTime,
        memoryBefore,
        memoryAfter,
        memoryDelta,
        result
      };
    } catch (error) {
      const endTime = performance.now();
      process.memoryUsage(); // Store to variable to avoid unused warning
      
      // Still mark end for consistency
      performance.mark(endMark);
      performance.measure(stageName, startMark, endMark);
      
      throw new Error(`Stage ${stageName} failed after ${endTime - startTime}ms: ${(error as Error).message}`);
    }
  }

  getMeasurements(): PerformanceMeasurement[] {
    return [...this.measurements];
  }

  clearMeasurements(): void {
    this.measurements = [];
    performance.clearMarks();
    performance.clearMeasures();
  }

  generateSummary() {
    const measurements = this.getMeasurements();
    
    if (measurements.length === 0) {
      return { totalTime: 0, stages: [], averages: {} };
    }

    const totalTime = measurements.reduce((sum, m) => sum + m.duration, 0);
    
    // Group by stage name for averages
    const stageGroups = measurements.reduce((groups: Record<string, number[]>, m) => {
      if (!groups[m.name]) {
        groups[m.name] = [];
      }
      groups[m.name].push(m.duration);
      return groups;
    }, {});

    const averages = Object.keys(stageGroups).reduce((avgs: Record<string, {avg: number; min: number; max: number; count: number}>, stageName) => {
      const times = stageGroups[stageName];
      avgs[stageName] = {
        avg: times.reduce((sum, t) => sum + t, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        count: times.length
      };
      return avgs;
    }, {});

    return {
      totalTime,
      stages: measurements,
      averages
    };
  }
}