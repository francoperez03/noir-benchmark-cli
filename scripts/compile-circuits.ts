#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CIRCUITS_DIR = path.join(__dirname, '../circuits');

function logger(message: string): void {
  console.log(chalk.blue('[COMPILE]'), message);
}

function error(message: string): void {
  console.error(chalk.red('[ERROR]'), message);
}

function success(message: string): void {
  console.log(chalk.green('[SUCCESS]'), message);
}

async function compileCircuit(circuitName: string): Promise<boolean> {
  const circuitPath = path.join(CIRCUITS_DIR, circuitName);
  
  if (!fs.existsSync(circuitPath)) {
    throw new Error(`Circuit directory not found: ${circuitPath}`);
  }
  
  logger(`Compiling circuit: ${circuitName}`);
  
  try {
    // Check if nargo is available
    execSync('which nargo', { stdio: 'ignore' });
  } catch (e) {
    throw new Error('nargo not found. Please install Noir toolchain first.');
  }
  
  try {
    // Change to circuit directory and compile
    process.chdir(circuitPath);
    
    // Clean previous build
    if (fs.existsSync('target')) {
      fs.rmSync('target', { recursive: true, force: true });
    }
    
    // Compile circuit
    logger(`Running: nargo compile`);
    const output = execSync('nargo compile', { encoding: 'utf8', stdio: 'pipe' });
    logger(`Compilation output: ${output.trim()}`);
    
    // Verify target directory was created
    const targetPath = path.join(circuitPath, 'target');
    if (!fs.existsSync(targetPath)) {
      throw new Error('Target directory not created after compilation');
    }
    
    // Check for circuit.json
    const circuitJsonPath = path.join(targetPath, `${circuitName}.json`);
    if (fs.existsSync(circuitJsonPath)) {
      const circuitData = JSON.parse(fs.readFileSync(circuitJsonPath, 'utf8'));
      logger(`Circuit compiled successfully. Bytecode size: ${circuitData.bytecode ? circuitData.bytecode.length : 'unknown'} bytes`);
    }
    
    success(`Circuit ${circuitName} compiled successfully`);
    return true;
    
  } catch (compilationError) {
    throw new Error(`Failed to compile ${circuitName}: ${(compilationError as Error).message}`);
  }
}

async function compileAllCircuits(): Promise<void> {
  if (!fs.existsSync(CIRCUITS_DIR)) {
    throw new Error('Circuits directory not found');
  }
  
  const circuits = fs.readdirSync(CIRCUITS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
    
  if (circuits.length === 0) {
    logger('No circuits found to compile');
    return;
  }
  
  logger(`Found ${circuits.length} circuits to compile: ${circuits.join(', ')}`);
  
  for (const circuit of circuits) {
    try {
      await compileCircuit(circuit);
    } catch (compilationError) {
      error(`Failed to compile ${circuit}: ${(compilationError as Error).message}`);
      // Continue with other circuits
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const circuitName = args[0];
  
  try {
    if (circuitName) {
      await compileCircuit(circuitName);
    } else {
      await compileAllCircuits();
    }
    success('Compilation completed');
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}