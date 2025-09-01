import { Circuit } from '../models/index.js';

/**
 * Circuit Repository Interface
 * Defines contract for loading and managing circuits
 */
export interface CircuitRepository {
  /**
   * Load a circuit by name
   */
  load(circuitName: string): Promise<Circuit>;

  /**
   * List available circuits
   */
  listAvailable(): Promise<string[]>;

  /**
   * Check if a circuit exists
   */
  exists(circuitName: string): Promise<boolean>;

  /**
   * Get circuit inputs for testing
   */
  getTestInputs(circuitName: string): Promise<Record<string, any>>;
}