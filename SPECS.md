# NoirJS + Barretenberg Benchmarking CLI - Especificaciones Técnicas

## 🎯 Objetivo
Crear un CLI completo para medir y optimizar el rendimiento computacional y de memoria en el pipeline de generación de pruebas ZK usando NoirJS y bb.js (Barretenberg).

---

## 📖 Glosario y Conceptos Clave

### Terminología ZK
- **ACIR (Abstract Circuit Intermediate Representation):** Bytecode intermedio que representa las constraints del circuito Noir
- **ACVM (Abstract Circuit Virtual Machine):** VM que ejecuta ACIR y produce el witness
- **Witness:** Vector de valores de wires que satisfacen las constraints del circuito
- **SRS (Structured Reference String):** Parámetros comunes (puntos en curva, FFT) para compromisos polinomiales
- **Backend:** Esquema de prueba implementado (UltraPlonk/UltraHonk en Barretenberg)
- **Proof:** Artefacto criptográfico final verificable

### Pipeline de Generación de Pruebas
```
1. ACIR Decode: base64 → bytes → gunzip → ACIR object
2. ACVM Execute: ACIR + inputs → witness generation  
3. Backend Init: cargar SRS + configurar proving system
4. Proof Generation: witness → generate proof (UltraPlonk/UltraHonk)
5. Verification: proof + public inputs → verify
```

---

## 🏗️ Arquitectura del Sistema

### Estructura de Directorios
```
noir-benchmark-cli/
├── src/
│   ├── cli/                    # Interfaz de usuario
│   │   ├── commands.js         # Definición de comandos CLI
│   │   ├── blessed-ui.js       # Dashboard blessed (v2+)
│   │   └── simple-cli.js       # CLI básico (MVP)
│   ├── benchmarks/             # Harness de pruebas
│   │   ├── pipeline.js         # Pipeline completo de benchmarking
│   │   ├── stages.js           # Medición por etapas individuales
│   │   └── comparisons.js      # Comparaciones entre backends
│   ├── profilers/              # Sistema de medición
│   │   ├── performance.js      # perf_hooks + métricas tiempo
│   │   ├── memory.js           # process.memoryUsage() + tracking
│   │   ├── cpu.js              # CPU profiling + flamegraphs
│   │   └── gc.js               # Garbage collection monitoring
│   ├── backends/               # Wrappers para sistemas de prueba
│   │   ├── ultra-honk.js       # UltraHonk wrapper + métricas
│   │   ├── ultra-plonk.js      # UltraPlonk wrapper + métricas
│   │   └── base.js             # Backend base class
│   ├── circuits/               # Gestión de circuitos
│   │   ├── loader.js           # Carga y parseo de circuitos
│   │   ├── validator.js        # Validación de inputs
│   │   └── examples/           # Circuitos predefinidos
│   ├── reporters/              # Exportadores de métricas
│   │   ├── csv.js              # Exportación CSV
│   │   ├── json.js             # Exportación JSON estructurado
│   │   ├── flamegraph.js       # Generación flamegraphs
│   │   └── console.js          # Pretty printing para terminal
│   └── utils/                  # Utilidades y configuración
│       ├── config.js           # Configuración global
│       ├── logger.js           # Sistema de logging
│       └── helpers.js          # Funciones auxiliares
├── circuits/                   # Circuitos de ejemplo compilados
│   ├── simple-hash/            # SHA256 simple
│   ├── merkle-tree/            # Merkle tree verification
│   ├── signature-verify/       # ECDSA signature verification
│   ├── recursive-proof/        # Recursive proof verification
│   └── large-circuit/          # Circuito grande (>100k constraints)
├── config/                     # Configuraciones predefinidas
│   ├── benchmarks.json         # Configuraciones de benchmark
│   ├── circuits.json           # Metadata de circuitos
│   └── thresholds.json         # Thresholds para alertas
├── reports/                    # Salidas de métricas
│   ├── json/                   # Reportes JSON detallados
│   ├── csv/                    # Datos CSV para análisis
│   └── flamegraphs/            # CPU flamegraphs
├── scripts/                    # Scripts auxiliares
│   ├── setup.js                # Setup inicial del proyecto
│   ├── compile-circuits.js     # Compilación de circuitos
│   └── generate-test-data.js   # Generación de datos de prueba
└── docs/                       # Documentación adicional
    ├── API.md                  # Documentación API
    ├── CIRCUITS.md             # Guía de circuitos
    └── PROFILING.md            # Guía de profiling
```

---

## 🔧 APIs y Dependencias

### Dependencias Principales
```json
{
  "dependencies": {
    "@noir-lang/noir_js": "^0.31.0",
    "@noir-lang/acvm_js": "^0.31.0", 
    "@noir-lang/noirc_abi": "^0.31.0",
    "@aztec/bb.js": "latest",
    "commander": "^11.0.0",
    "blessed": "^0.1.81",
    "blessed-contrib": "^4.11.0",
    "csv-writer": "^1.6.0",
    "json2csv": "^6.1.0"
  },
  "devDependencies": {
    "nargo": "^0.31.0",
    "0x": "^5.5.0",
    "clinic": "^13.0.0"
  }
}
```

### APIs Core de NoirJS
```javascript
// Inicialización WASM
import initNoirC from "@noir-lang/noirc_abi";
import initACVM from "@noir-lang/acvm_js";
await Promise.all([initACVM(fetch(acvm)), initNoirC(fetch(noirc))]);

// Pipeline básico
import { Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend } from '@aztec/bb.js';

const noir = new Noir(circuit);
const backend = new UltraHonkBackend(circuit.bytecode);
const { witness } = await noir.execute(inputs);
const { proof, publicInputs } = await backend.generateProof(witness);
const verified = await backend.verifyProof({ proof, publicInputs });
```

### APIs de Performance
```javascript
const { performance, PerformanceObserver } = require('perf_hooks');

// Medición por etapas
performance.mark('acir-decode-start');
// ... operación ...
performance.mark('acir-decode-end');
performance.measure('acir-decode', 'acir-decode-start', 'acir-decode-end');

// Monitoreo de memoria
const memBefore = process.memoryUsage();
// ... operación ...
const memAfter = process.memoryUsage();
```

---

## 📊 Sistema de Métricas

### Métricas Por Etapa
```typescript
interface StageMetrics {
  stage: 'acir-decode' | 'acvm-execute' | 'backend-init' | 'proof-generate' | 'proof-verify';
  timeMs: number;
  memoryBefore: NodeJS.MemoryUsage;
  memoryAfter: NodeJS.MemoryUsage;
  memoryDelta: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpu?: {
    userTime: number;
    systemTime: number;
  };
}
```

### Métricas Globales
```typescript
interface BenchmarkResult {
  circuit: {
    name: string;
    size: number; // número de constraints
    bytecodeSize: number;
  };
  backend: 'UltraHonk' | 'UltraPlonk';
  configuration: {
    threads: number;
    isWarm: boolean; // cold vs warm run
  };
  stages: StageMetrics[];
  totals: {
    timeMs: number;
    memoryPeak: number;
    proofSize: number;
    witnessSize: number;
  };
  srs: {
    loadTimeMs: number;
    sizeBytes: number;
    cached: boolean;
  };
  timestamp: string;
  environment: {
    nodeVersion: string;
    platform: string;
    cpuModel: string;
    memoryTotal: number;
  };
}
```

### Thresholds y Alertas
```json
{
  "performance_thresholds": {
    "acir_decode_max_ms": 100,
    "acvm_execute_max_ms": 1000,
    "backend_init_max_ms": 2000,
    "proof_generate_max_ms": 30000,
    "memory_peak_max_mb": 1000,
    "witness_size_max_elements": 100000
  },
  "memory_thresholds": {
    "heap_growth_max_mb": 500,
    "gc_frequency_max_per_minute": 10,
    "external_memory_max_mb": 200
  }
}
```

---

## 🧪 Circuitos de Ejemplo

### 1. Simple Hash (MVP)
```noir
// circuits/simple-hash/src/main.nr
use dep::std;

fn main(preimage: [u8; 32]) -> pub [u8; 32] {
    std::hash::sha256(preimage)
}
```
- **Constraints:** ~1,000
- **Propósito:** Baseline rápido para validar pipeline
- **Inputs:** 32 bytes random
- **Tiempo esperado:** <5 segundos

### 2. Merkle Tree Verification
```noir
// circuits/merkle-tree/src/main.nr
use dep::std;

fn main(
    leaf: [u8; 32],
    path: [[u8; 32]; 20],
    indices: [u1; 20],
    root: pub [u8; 32]
) {
    let computed_root = std::merkle::compute_merkle_root(leaf, path, indices);
    assert(computed_root == root);
}
```
- **Constraints:** ~20,000
- **Propósito:** Circuito de tamaño medio, operaciones hash intensivas
- **Tiempo esperado:** 10-30 segundos

### 3. ECDSA Signature Verification
```noir
// circuits/signature-verify/src/main.nr
use dep::std;

fn main(
    message: [u8; 32],
    signature: [u8; 64], 
    pub_key: [u8; 64]
) {
    let valid = std::ecdsa_secp256k1::verify_signature(pub_key, signature, message);
    assert(valid);
}
```
- **Constraints:** ~100,000+
- **Propósito:** Circuito computacionalmente intensivo
- **Tiempo esperado:** 1-5 minutos

### 4. Large Circuit (Stress Test)
```noir
// circuits/large-circuit/src/main.nr
fn main(inputs: [Field; 1000]) -> pub Field {
    let mut result = 0;
    for i in 0..1000 {
        result += inputs[i] * inputs[i];
        result = std::hash::pedersen([result])[0];
    }
    result
}
```
- **Constraints:** ~500,000+
- **Propósito:** Stress test para memoria y tiempo
- **Tiempo esperado:** 5-15 minutos

---

## 🖥️ Interfaz de Usuario

### MVP: CLI Básico
```bash
# Ejecutar benchmark simple
./noir-benchmark --circuit simple-hash --backend UltraHonk

# Comparar backends
./noir-benchmark --circuit merkle-tree --compare-backends

# Benchmark completo con reporte
./noir-benchmark --all-circuits --threads 4 --output report.json

# Profiling detallado
./noir-benchmark --circuit signature-verify --profile --flamegraph
```

### V2: Dashboard Blessed
```
┌─ NoirJS Benchmark Dashboard ─────────────────────────────────────┐
│                                                                  │
│  ┌─ Current Benchmark ─┐  ┌─ Progress ────────────────────────┐  │
│  │ Circuit: merkle-tree │  │ ████████████████████████████░░ 90% │  │
│  │ Backend: UltraHonk   │  │ Stage: Proof Generation            │  │
│  │ Threads: 4           │  │ ETA: 2.3s                          │  │
│  └──────────────────────┘  └────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Live Metrics ───────┐  ┌─ Memory Usage ────────────────────┐  │
│  │ Time: 45.2s          │  │     ███████████░░░░░░░░ 512MB      │  │
│  │ Memory: 512MB        │  │ Heap: ████████░░░░░░░░░ 256MB      │  │
│  │ CPU: 85%             │  │ WASM: ██████░░░░░░░░░░░ 128MB      │  │
│  └──────────────────────┘  └────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Stage Breakdown ────────────────────────────────────────────┐  │
│  │ ACIR Decode    [████████████████████████████████████] 0.1s   │  │
│  │ ACVM Execute   [████████████████████████████████████] 2.3s   │  │
│  │ Backend Init   [████████████████████████████████████] 1.8s   │  │
│  │ Proof Gen      [████████████████████░░░░░░░░░░░░░░░░] 42.1s  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📈 Roadmap de Desarrollo

### Fase 1: MVP (Semana 1)
- [x] SPECS.md completo
- [ ] CLI básico funcional
- [ ] Un circuito de ejemplo (simple-hash)
- [ ] Pipeline completo ACIR → Proof
- [ ] Métricas básicas (tiempo + memoria)
- [ ] Output JSON estructurado

### Fase 2: Comparaciones (Semana 2)
- [ ] Múltiples circuitos de ejemplo
- [ ] Comparación UltraHonk vs UltraPlonk
- [ ] Configuraciones de threading
- [ ] Cold vs warm run analysis
- [ ] Exportación CSV para análisis

### Fase 3: Dashboard Avanzado (Semana 3)
- [ ] Interfaz blessed interactiva
- [ ] Dashboard tiempo real
- [ ] Visualización gráfica de métricas
- [ ] Configuración persistente

### Fase 4: Profiling Avanzado (Semana 4)
- [ ] CPU flamegraphs automáticos
- [ ] GC monitoring y memory leak detection
- [ ] Browser benchmarking support
- [ ] Integración Chrome DevTools

### Fase 5: Optimización (Semana 5+)
- [ ] SRS caching strategies
- [ ] Multi-circuit batching
- [ ] Automated regression testing
- [ ] Performance regression alerts

---

## 🧪 Testing y Validación

### Test Matrix
```
Circuitos: [simple-hash, merkle-tree, signature-verify, large-circuit]
Backends: [UltraHonk, UltraPlonk]  
Threads: [1, 2, 4, 8]
Runs: [cold, warm]
Environment: [Node.js, Browser]
```

### Criterios de Éxito MVP
- ✅ Pipeline completo funcional
- ✅ Métricas precisas por etapa
- ✅ Comparación reproducible entre runs
- ✅ Output estructurado para análisis
- ✅ Documentación clara de uso

---

## 🔍 Consideraciones Técnicas

### Limitaciones Conocidas
- Barretenberg max circuit size: 2^19 gates (524,288)
- WASM memory limits en browser
- SRS initialization overhead en cold runs
- GC pauses pueden afectar métricas

### Estrategias de Optimización
- Reutilizar instancias de backend cuando sea posible
- Cache SRS entre runs del mismo tamaño
- Usar Worker threads para profiling no intrusivo
- Batch multiple circuits para throughput tests

### Seguridad y Robustez
- Validar inputs de circuitos antes de ejecución
- Timeouts configurables para evitar colgadas
- Graceful degradation si fallan backends
- Logs detallados para debugging

---

## 📚 Referencias

- [NoirJS Documentation](https://noir-lang.org/docs/reference/NoirJS/)
- [Barretenberg TypeScript](https://github.com/AztecProtocol/barretenberg/tree/master/ts)
- [ACVM Documentation](https://github.com/noir-lang/acvm-docs)
- [Node.js Performance Hooks](https://nodejs.org/api/perf_hooks.html)
- [Blessed Terminal UI](https://github.com/chjj/blessed)

---

*Este documento será actualizado conforme evolucione la implementación.*