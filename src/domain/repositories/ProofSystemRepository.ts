import { Circuit } from '../models/Circuit.js';
import { ProofResult, Witness } from '../models/ProofResult.js';

/**
 * Proof System Repository Interface
 * Defines contract for proof generation and verification
 */
export interface ProofSystemRepository {
  /**
   * Initialize the proof system for a circuit
   */
  initialize(circuit: Circuit): Promise<void>;

  /**
   * Generate witness from circuit and inputs
   */
  generateWitness(circuit: Circuit, inputs: Record<string, any>): Promise<Witness>;

  /**
   * Generate proof from witness
   */
  generateProof(witness: Witness): Promise<ProofResult>;

  /**
   * Verify a proof
   */
  verifyProof(proofResult: ProofResult): Promise<boolean>;

  /**
   * Clean up resources
   */
  cleanup(): Promise<void>;

  /**
   * Get backend information
   */
  getBackendInfo(): {
    name: string;
    version: string;
  };
}