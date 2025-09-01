// In Node.js environment, WASM modules are already initialized by default
// So we just export a no-op function for compatibility

let isInitialized = false;

/**
 * Initialize the WASM modules for NoirJS (ACVM and NoirC)
 * In Node.js, this is a no-op since modules are already initialized
 */
export async function initializeWasm(): Promise<void> {
  if (isInitialized) {
    return;
  }

  // In Node.js, the WASM modules are automatically loaded
  // No explicit initialization needed
  isInitialized = true;
}

/**
 * Check if WASM modules are initialized
 */
export function isWasmInitialized(): boolean {
  return isInitialized;
}

/**
 * Reset initialization state (mainly for testing)
 */
export function resetWasmInitialization(): void {
  isInitialized = false;
}