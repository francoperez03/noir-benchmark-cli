/**
 * Circuit Value Object
 * Represents a compiled Noir circuit with its metadata
 */
export class Circuit {
  constructor(
    public readonly name: string,
    public readonly bytecode: Uint8Array,
    public readonly abi: any,
    public readonly constraints: number,
    public readonly bytecodeSize: number
  ) {
    if (!name.trim()) {
      throw new Error('Circuit name cannot be empty');
    }
    if (bytecode.length === 0) {
      throw new Error('Circuit bytecode cannot be empty');
    }
    if (constraints < 0) {
      throw new Error('Circuit constraints must be non-negative');
    }
  }

  static fromCompiledCircuit(name: string, compiledCircuit: any): Circuit {
    const bytecode = typeof compiledCircuit.bytecode === 'string' 
      ? Buffer.from(compiledCircuit.bytecode, 'base64')
      : compiledCircuit.bytecode;
    
    const constraints = Math.floor(bytecode.length / 100); // Rough estimate
    
    return new Circuit(
      name,
      bytecode,
      compiledCircuit.abi,
      constraints,
      bytecode.length
    );
  }

  get complexity(): 'simple' | 'medium' | 'complex' {
    if (this.constraints < 100) return 'simple';
    if (this.constraints < 1000) return 'medium';
    return 'complex';
  }
}