import { ProofSystemRepository } from '../../domain/repositories/index.js';
import { Circuit, ProofResult, Witness } from '../../domain/models/index.js';
import { WitnessGenerationError, ProofGenerationError, ProofVerificationError } from '../../shared/errors/BenchmarkError.js';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Proof Service - Application Service for Proof operations
 */
export class ProofService {
  constructor(
    private readonly proofSystemRepository: ProofSystemRepository,
    private readonly logger: Logger
  ) {}

  async initialize(circuit: Circuit): Promise<void> {
    this.logger.debug(`Initializing proof system for circuit: ${circuit.name}`);

    try {
      await this.proofSystemRepository.initialize(circuit);
      this.logger.debug('Proof system initialized successfully');
    } catch (error) {
      throw new ProofGenerationError('Failed to initialize proof system', error as Error);
    }
  }

  async generateWitness(circuit: Circuit, inputs: Record<string, any>): Promise<Witness> {
    this.logger.debug(`Generating witness for circuit: ${circuit.name}`);

    try {
      const witness = await this.proofSystemRepository.generateWitness(circuit, inputs);
      this.logger.debug(`Witness generated successfully: ${witness.size} bytes in ${witness.generationTimeMs}ms`);
      return witness;
    } catch (error) {
      throw new WitnessGenerationError(
        `Failed to generate witness for circuit ${circuit.name}`, 
        error as Error
      );
    }
  }

  async generateProof(witness: Witness): Promise<ProofResult> {
    this.logger.debug(`Generating proof from witness (${witness.size} bytes)`);

    try {
      const proofResult = await this.proofSystemRepository.generateProof(witness);
      this.logger.debug(`Proof generated successfully: ${proofResult.proofSize} bytes in ${proofResult.generationTimeMs}ms`);
      return proofResult;
    } catch (error) {
      throw new ProofGenerationError(
        'Failed to generate proof from witness',
        error as Error
      );
    }
  }

  async verifyProof(proofResult: ProofResult): Promise<boolean> {
    this.logger.debug(`Verifying proof (${proofResult.proofSize} bytes)`);

    try {
      const verified = await this.proofSystemRepository.verifyProof(proofResult);
      this.logger.debug(`Proof verification ${verified ? 'succeeded' : 'failed'}`);
      return verified;
    } catch (error) {
      throw new ProofVerificationError(
        'Failed to verify proof',
        error as Error
      );
    }
  }

  async cleanup(): Promise<void> {
    this.logger.debug('Cleaning up proof system resources');

    try {
      await this.proofSystemRepository.cleanup();
      this.logger.debug('Proof system cleanup completed');
    } catch (error) {
      this.logger.warn('Error during proof system cleanup:', (error as Error).message);
    }
  }

  getBackendInfo(): { name: string; version: string } {
    return this.proofSystemRepository.getBackendInfo();
  }
}