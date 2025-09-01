// TypeScript interfaces for NoirJS and Barretenberg APIs
// Using real types from the NoirJS ecosystem

import type { CompiledCircuit } from '@noir-lang/noir_js';
import { Noir } from '@noir-lang/noir_js';
import type { ProofData } from '@aztec/bb.js';
import { UltraHonkBackend } from '@aztec/bb.js';

// Re-export main types and classes from NoirJS
export type { CompiledCircuit } from '@noir-lang/noir_js';
export type { ProofData } from '@aztec/bb.js';
export { Noir, UltraHonkBackend };

// Circuit execution inputs
export interface CircuitInputs {
  [key: string]: number | number[] | string | boolean | Uint8Array;
}

// Witness generation result
export interface WitnessResult {
  witness: Uint8Array;
}

// Proof generation result (matches ProofData from bb.js)
export interface ProofResult {
  proof: Uint8Array;
  publicInputs: Uint8Array;
}

// Verification result
export interface VerificationResult {
  verified: boolean;
}

// Circuit execution result for benchmarking
export interface CircuitExecutionResult {
  success: boolean;
  witness?: Uint8Array;
  witnessSize?: number;
  executionTimeMs?: number;
  memoryUsed?: number;
}

// Backend initialization result
export interface BackendInitResult {
  success: boolean;
  backend?: UltraHonkBackend;
  initTimeMs?: number;
  srsSize?: number;
  memoryUsed?: number;
}

// Proof generation result for benchmarking
export interface ProofGenerationResult {
  success: boolean;
  proof?: ProofData;
  proofSize?: number;
  generationTimeMs?: number;
  memoryUsed?: number;
}

// Proof verification result for benchmarking
export interface ProofVerificationResult {
  success: boolean;
  verified?: boolean;
  verificationTimeMs?: number;
  memoryUsed?: number;
}

// Circuit loading result
export interface CircuitLoadResult {
  success: boolean;
  circuit?: CompiledCircuit;
  inputs?: CircuitInputs;
  bytecodeSize?: number;
  constraintCount?: number;
  loadTimeMs?: number;
}