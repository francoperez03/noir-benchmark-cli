import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { CompiledCircuit } from '@noir-lang/noir_js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface CircuitData {
  circuit: CompiledCircuit;
  inputs: Record<string, any>;
  name: string;
  path: string;
  size: {
    bytecode: number;
    constraints: number; // Estimated from bytecode
  };
}

/**
 * Load a compiled Noir circuit from the circuits directory
 */
export async function loadCircuit(circuitName: string): Promise<CircuitData> {
  const circuitsDir = resolve(__dirname, '../../circuits');
  const circuitDir = resolve(circuitsDir, circuitName);
  const circuitJsonPath = resolve(circuitDir, 'target', `${circuitName.replace('-', '_')}.json`);
  const proverTomlPath = resolve(circuitDir, 'Prover.toml');

  // Validate files exist
  if (!existsSync(circuitJsonPath)) {
    throw new Error(`Circuit JSON not found: ${circuitJsonPath}`);
  }

  if (!existsSync(proverTomlPath)) {
    throw new Error(`Prover.toml not found: ${proverTomlPath}`);
  }

  try {
    // Load the compiled circuit
    const circuitJson = JSON.parse(readFileSync(circuitJsonPath, 'utf-8'));
    
    // Validate circuit structure
    if (!circuitJson.bytecode || !circuitJson.abi) {
      throw new Error(`Invalid circuit JSON: missing bytecode or abi in ${circuitJsonPath}`);
    }

    // Load inputs from Prover.toml
    const inputs = parseProverToml(readFileSync(proverTomlPath, 'utf-8'));

    // Calculate sizes
    const bytecodeSize = Buffer.from(circuitJson.bytecode, 'base64').length;
    
    // Estimate constraints count (rough heuristic based on bytecode size)
    const estimatedConstraints = Math.floor(bytecodeSize / 100); // Very rough estimate

    const circuitData: CircuitData = {
      circuit: circuitJson as CompiledCircuit,
      inputs,
      name: circuitName,
      path: circuitJsonPath,
      size: {
        bytecode: bytecodeSize,
        constraints: estimatedConstraints
      }
    };

    return circuitData;

  } catch (error) {
    throw new Error(`Failed to load circuit '${circuitName}': ${(error as Error).message}`);
  }
}

/**
 * Parse Prover.toml file to extract circuit inputs
 * This is a simple TOML parser for the basic array format used in Noir
 */
function parseProverToml(tomlContent: string): Record<string, any> {
  const inputs: Record<string, any> = {};
  const lines = tomlContent.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip comments and empty lines
    if (line.startsWith('#') || line === '') {
      continue;
    }
    
    // Look for variable assignments
    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) {
      continue;
    }
    
    const variableName = line.substring(0, equalIndex).trim();
    let value = line.substring(equalIndex + 1).trim();
    
    // Handle multi-line arrays
    if (value === '[') {
      const arrayValues: (number | string)[] = [];
      i++; // Move to next line
      
      while (i < lines.length) {
        const arrayLine = lines[i].trim();
        if (arrayLine === ']') {
          break;
        }
        
        // Parse comma-separated values
        const values = arrayLine.replace(/,$/, '').split(',');
        for (const val of values) {
          const trimmed = val.trim().replace(/"/g, '');
          if (trimmed !== '') {
            if (trimmed.startsWith('0x')) {
              arrayValues.push(trimmed); // Keep hex as string
            } else {
              const numValue = parseInt(trimmed);
              if (!isNaN(numValue)) {
                arrayValues.push(numValue);
              }
            }
          }
        }
        i++;
      }
      
      inputs[variableName] = arrayValues;
    } else {
      // Handle single-line values
      if (value.startsWith('[') && value.endsWith(']')) {
        // Single-line array
        const arrayContent = value.substring(1, value.length - 1);
        const arrayValues = arrayContent.split(',').map(v => {
          const trimmed = v.trim().replace(/"/g, '');
          if (trimmed.startsWith('0x')) {
            return trimmed; // Keep hex as string
          }
          const numValue = parseInt(trimmed);
          return isNaN(numValue) ? trimmed : numValue;
        });
        inputs[variableName] = arrayValues;
      } else {
        // Single value - handle hex, numbers, and strings
        value = value.replace(/"/g, ''); // Remove quotes
        if (value.startsWith('0x')) {
          // Hex value - keep as string for NoirJS
          inputs[variableName] = value;
        } else {
          const numValue = parseInt(value);
          inputs[variableName] = isNaN(numValue) ? value : numValue;
        }
      }
    }
  }
  
  return inputs;
}

/**
 * List available circuits in the circuits directory
 */
export function listAvailableCircuits(): string[] {
  try {
    const circuitsDir = resolve(__dirname, '../../circuits');
    if (!existsSync(circuitsDir)) {
      return [];
    }
    
    const { readdirSync, statSync } = require('fs');
    return readdirSync(circuitsDir)
      .filter((item: string) => {
        const fullPath = resolve(circuitsDir, item);
        return statSync(fullPath).isDirectory();
      })
      .filter((circuitName: string) => {
        // Check if the circuit has a compiled target
        const targetPath = resolve(circuitsDir, circuitName, 'target');
        return existsSync(targetPath);
      });
  } catch (error) {
    return [];
  }
}