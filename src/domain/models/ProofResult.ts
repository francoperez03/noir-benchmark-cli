/**
 * Proof Result Value Object
 * Represents the result of proof generation and verification
 */
export class ProofResult {
  constructor(
    public readonly proof: Uint8Array,
    public readonly publicInputs: Uint8Array,
    public readonly generationTimeMs: number,
    public readonly verified: boolean = false,
    public readonly verificationTimeMs: number = 0
  ) {
    if (proof.length === 0) {
      throw new Error('Proof cannot be empty');
    }
    if (generationTimeMs < 0) {
      throw new Error('Generation time cannot be negative');
    }
  }

  get proofSize(): number {
    return this.proof.length;
  }

  get publicInputsSize(): number {
    return this.publicInputs.length;
  }

  get isValid(): boolean {
    return this.verified && this.proof.length > 0;
  }

  static failed(error: string, generationTimeMs: number = 0): FailedProofResult {
    return new FailedProofResult(error, generationTimeMs);
  }
}

export class FailedProofResult extends ProofResult {
  constructor(
    public readonly error: string,
    generationTimeMs: number = 0
  ) {
    super(
      new Uint8Array(0),
      new Uint8Array(0),
      generationTimeMs,
      false,
      0
    );
  }

  get isValid(): boolean {
    return false;
  }
}

export class Witness {
  constructor(
    public readonly data: Uint8Array,
    public readonly generationTimeMs: number
  ) {
    if (data.length === 0) {
      throw new Error('Witness data cannot be empty');
    }
    if (generationTimeMs < 0) {
      throw new Error('Generation time cannot be negative');
    }
  }

  get size(): number {
    return this.data.length;
  }
}