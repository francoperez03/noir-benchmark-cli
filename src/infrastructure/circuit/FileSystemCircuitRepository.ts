import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CircuitRepository } from '../../domain/repositories/index.js';
import { Circuit } from '../../domain/models/index.js';
import { CircuitLoadError, CircuitNotFoundError } from '../../shared/errors/BenchmarkError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * File System Circuit Repository Implementation
 * Loads circuits from the filesystem
 */
export class FileSystemCircuitRepository implements CircuitRepository {
  private readonly circuitsDir: string;

  constructor(circuitsDir?: string) {
    this.circuitsDir = circuitsDir || resolve(__dirname, '../../../circuits');
  }

  async load(circuitName: string): Promise<Circuit> {
    const circuitDir = resolve(this.circuitsDir, circuitName);
    const circuitJsonPath = resolve(circuitDir, 'target', `${circuitName.replace('-', '_')}.json`);

    if (!existsSync(circuitJsonPath)) {
      throw new CircuitNotFoundError(circuitName);
    }

    try {
      const circuitJson = JSON.parse(readFileSync(circuitJsonPath, 'utf-8'));
      
      if (!circuitJson.bytecode || !circuitJson.abi) {
        throw new CircuitLoadError(circuitName, new Error('Invalid circuit JSON: missing bytecode or abi'));
      }

      return Circuit.fromCompiledCircuit(circuitName, circuitJson);
    } catch (error) {
      if (error instanceof CircuitNotFoundError) {
        throw error;
      }
      throw new CircuitLoadError(circuitName, error as Error);
    }
  }

  async listAvailable(): Promise<string[]> {
    if (!existsSync(this.circuitsDir)) {
      return [];
    }

    try {
      return readdirSync(this.circuitsDir)
        .filter(item => {
          const fullPath = resolve(this.circuitsDir, item);
          return statSync(fullPath).isDirectory();
        })
        .filter(circuitName => {
          const targetPath = resolve(this.circuitsDir, circuitName, 'target');
          return existsSync(targetPath);
        });
    } catch (error) {
      return [];
    }
  }

  async exists(circuitName: string): Promise<boolean> {
    const circuitDir = resolve(this.circuitsDir, circuitName);
    const circuitJsonPath = resolve(circuitDir, 'target', `${circuitName.replace('-', '_')}.json`);
    return existsSync(circuitJsonPath);
  }

  async getTestInputs(circuitName: string): Promise<Record<string, any>> {
    const circuitDir = resolve(this.circuitsDir, circuitName);
    const proverTomlPath = resolve(circuitDir, 'Prover.toml');

    if (!existsSync(proverTomlPath)) {
      throw new CircuitLoadError(circuitName, new Error('Prover.toml not found'));
    }

    try {
      const tomlContent = readFileSync(proverTomlPath, 'utf-8');
      return this.parseProverToml(tomlContent);
    } catch (error) {
      throw new CircuitLoadError(circuitName, error as Error);
    }
  }

  private parseProverToml(tomlContent: string): Record<string, any> {
    const inputs: Record<string, any> = {};
    const lines = tomlContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#') || line === '') continue;
      
      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) continue;
      
      const variableName = line.substring(0, equalIndex).trim();
      let value = line.substring(equalIndex + 1).trim();
      
      if (value === '[') {
        // Multi-line array
        const arrayValues: (number | string)[] = [];
        i++;
        
        while (i < lines.length && lines[i].trim() !== ']') {
          const arrayLine = lines[i].trim();
          const values = arrayLine.replace(/,$/, '').split(',');
          
          for (const val of values) {
            const trimmed = val.trim().replace(/"/g, '');
            if (trimmed !== '') {
              arrayValues.push(this.parseValue(trimmed));
            }
          }
          i++;
        }
        
        inputs[variableName] = arrayValues;
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Single-line array
        const arrayContent = value.substring(1, value.length - 1);
        const arrayValues = arrayContent.split(',').map(v => 
          this.parseValue(v.trim().replace(/"/g, ''))
        );
        inputs[variableName] = arrayValues;
      } else {
        // Single value
        inputs[variableName] = this.parseValue(value.replace(/"/g, ''));
      }
    }
    
    return inputs;
  }

  private parseValue(value: string): number | string {
    // Handle hex values
    if (value.startsWith('0x')) {
      return value;
    }
    
    // Handle numbers
    const numValue = parseInt(value);
    return isNaN(numValue) ? value : numValue;
  }
}