import { Noir } from '@noir-lang/noir_js';
import type { CompiledCircuit } from '@noir-lang/noir_js';
import { UltraHonkBackend } from '@aztec/bb.js';
import type { ProofData } from '@aztec/bb.js';
import { ProofSystemRepository } from '../../domain/repositories/index.js';
import { Circuit, ProofResult, Witness, FailedProofResult } from '../../domain/models/index.js';
import { ProofGenerationError, WitnessGenerationError, ProofVerificationError } from '../../shared/errors/BenchmarkError.js';

/**
 * UltraHonk Proof System Repository Implementation
 * Uses NoirJS + UltraHonk backend for proof operations
 */
export class UltraHonkProofSystemRepository implements ProofSystemRepository {
  private backend: UltraHonkBackend | null = null;
  private noir: Noir | null = null;

  async initialize(circuit: Circuit): Promise<void> {
    try {
      // Convert bytecode to string if it's Uint8Array
      const bytecodeString = Buffer.from(circuit.bytecode).toString('base64');
      
      // Create CompiledCircuit object for NoirJS
      const compiledCircuit: CompiledCircuit = {
        bytecode: bytecodeString,
        abi: circuit.abi,
        debug_symbols: '',
        file_map: {}
      };
      
      // Create Noir instance
      this.noir = new Noir(compiledCircuit);

      // Create UltraHonk backend
      this.backend = new UltraHonkBackend(bytecodeString);
    } catch (error) {
      throw new ProofGenerationError(
        'Failed to initialize UltraHonk proof system',
        error as Error
      );
    }
  }

  async generateWitness(_circuit: Circuit, inputs: Record<string, any>): Promise<Witness> {
    if (!this.noir) {
      throw new WitnessGenerationError('Proof system not initialized');
    }

    const startTime = performance.now();

    try {
      const { witness } = await this.noir.execute(inputs);
      const generationTime = performance.now() - startTime;
      
      return new Witness(witness, generationTime);
    } catch (error) {
      const generationTime = performance.now() - startTime;
      throw new WitnessGenerationError(
        `Execution failed after ${generationTime.toFixed(2)}ms: ${(error as Error).message}`,
        error as Error
      );
    }
  }

  async generateProof(witness: Witness): Promise<ProofResult> {
    if (!this.backend) {
      throw new ProofGenerationError('Backend not initialized');
    }

    const startTime = performance.now();

    try {
      const proofData: ProofData = await this.backend.generateProof(witness.data);
      const generationTime = performance.now() - startTime;
      
      // Convert string[] publicInputs to Uint8Array for domain model consistency
      const publicInputsBytes = new TextEncoder().encode(JSON.stringify(proofData.publicInputs));
      
      return new ProofResult(
        proofData.proof,
        publicInputsBytes,
        generationTime
      );
    } catch (error) {
      const generationTime = performance.now() - startTime;
      return ProofResult.failed(
        `Proof generation failed after ${generationTime.toFixed(2)}ms: ${(error as Error).message}`,
        generationTime
      ) as FailedProofResult;
    }
  }

  async verifyProof(proofResult: ProofResult): Promise<boolean> {
    if (!this.backend) {
      throw new ProofVerificationError('Backend not initialized');
    }

    if (proofResult instanceof FailedProofResult) {
      return false;
    }

    try {
      // Convert back from Uint8Array to string[] for backend API
      const publicInputsString = JSON.parse(new TextDecoder().decode(proofResult.publicInputs));
      
      const verified = await this.backend.verifyProof({
        proof: proofResult.proof,
        publicInputs: publicInputsString
      });
      
      return verified;
    } catch (error) {
      throw new ProofVerificationError(
        `Verification failed: ${(error as Error).message}`,
        error as Error
      );
    }
  }

  async cleanup(): Promise<void> {
    if (this.backend) {
      try {
        if (typeof this.backend.destroy === 'function') {
          await this.backend.destroy();
        }
      } catch (error) {
        // Ignore cleanup errors, just log them
        console.debug('Error during backend cleanup:', (error as Error).message);
      }
      this.backend = null;
    }
    this.noir = null;
  }

  getBackendInfo(): { name: string; version: string } {
    return {
      name: 'UltraHonk',
      version: '1.2.1' // Could be extracted from package.json
    };
  }
}