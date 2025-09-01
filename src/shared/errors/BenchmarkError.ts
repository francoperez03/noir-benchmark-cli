/**
 * Base Benchmark Error
 */
export abstract class BenchmarkError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Circuit related errors
 */
export class CircuitError extends BenchmarkError {
  constructor(message: string, cause?: Error) {
    super(message, 'CIRCUIT_ERROR', cause);
  }
}

export class CircuitNotFoundError extends CircuitError {
  constructor(circuitName: string, cause?: Error) {
    super(`Circuit '${circuitName}' not found`, cause);
  }
}

export class CircuitLoadError extends CircuitError {
  constructor(circuitName: string, cause?: Error) {
    super(`Failed to load circuit '${circuitName}'`, cause);
  }
}

/**
 * Proof system related errors
 */
export class ProofSystemError extends BenchmarkError {
  constructor(message: string, cause?: Error) {
    super(message, 'PROOF_SYSTEM_ERROR', cause);
  }
}

export class WitnessGenerationError extends ProofSystemError {
  constructor(message: string, cause?: Error) {
    super(`Witness generation failed: ${message}`, cause);
  }
}

export class ProofGenerationError extends ProofSystemError {
  constructor(message: string, cause?: Error) {
    super(`Proof generation failed: ${message}`, cause);
  }
}

export class ProofVerificationError extends ProofSystemError {
  constructor(message: string, cause?: Error) {
    super(`Proof verification failed: ${message}`, cause);
  }
}

/**
 * Configuration and validation errors
 */
export class ConfigurationError extends BenchmarkError {
  constructor(message: string, cause?: Error) {
    super(message, 'CONFIGURATION_ERROR', cause);
  }
}

export class ValidationError extends BenchmarkError {
  constructor(message: string, cause?: Error) {
    super(message, 'VALIDATION_ERROR', cause);
  }
}