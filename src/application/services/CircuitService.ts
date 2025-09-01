import { CircuitRepository } from '../../domain/repositories/index.js';
import { Circuit } from '../../domain/models/index.js';
import { CircuitNotFoundError, CircuitLoadError } from '../../shared/errors/BenchmarkError.js';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Circuit Service - Application Service for Circuit operations
 */
export class CircuitService {
  constructor(
    private readonly circuitRepository: CircuitRepository,
    private readonly logger: Logger
  ) {}

  async loadCircuit(circuitName: string): Promise<Circuit> {
    this.logger.debug(`Loading circuit: ${circuitName}`);

    try {
      const exists = await this.circuitRepository.exists(circuitName);
      if (!exists) {
        throw new CircuitNotFoundError(circuitName);
      }

      const circuit = await this.circuitRepository.load(circuitName);
      this.logger.debug(`Circuit loaded successfully: ${circuit.name} (${circuit.constraints} constraints)`);
      
      return circuit;
    } catch (error) {
      if (error instanceof CircuitNotFoundError) {
        throw error;
      }
      throw new CircuitLoadError(circuitName, error as Error);
    }
  }

  async getTestInputs(circuitName: string): Promise<Record<string, any>> {
    this.logger.debug(`Loading test inputs for circuit: ${circuitName}`);

    try {
      return await this.circuitRepository.getTestInputs(circuitName);
    } catch (error) {
      throw new CircuitLoadError(`Failed to load test inputs for ${circuitName}`, error as Error);
    }
  }

  async listAvailableCircuits(): Promise<string[]> {
    this.logger.debug('Listing available circuits');

    try {
      const circuits = await this.circuitRepository.listAvailable();
      this.logger.debug(`Found ${circuits.length} available circuits`);
      return circuits;
    } catch (error) {
      throw new CircuitLoadError('Failed to list available circuits', error as Error);
    }
  }
}