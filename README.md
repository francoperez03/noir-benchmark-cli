# NoirJS Benchmark CLI

> **Professional-grade benchmarking tool for NoirJS + Barretenberg zero-knowledge proof generation**

A CLI tool with world-class visual experience for measuring and optimizing ZK proof generation performance using NoirJS and Barretenberg.

![Benchmark CLI Demo](https://img.shields.io/badge/CLI-Visual%20Experience-blue?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Architecture-Clean%20Architecture-green?style=for-the-badge)
![Zero Knowledge](https://img.shields.io/badge/ZK-Noir%20%2B%20Barretenberg-purple?style=for-the-badge)

## Development Roadmap

### Completed
- ✅ **MVP Complete**: CLI with visual experience and performance profiling
- ✅ **Clean Architecture**: Domain-driven design implementation  
- ✅ **NoirJS Integration**: Real benchmarking with UltraHonk backend

### Next steps
  - [ ] **Internal bb.js Process Staging & C++ Parallelism**: Break down bb.js proof generation into granular stages and investigate C++ level parallelism opportunities in polynomial operations, multi-scalar multiplications, and commitment computations
  - [ ] **CoSNARK Investigation & Reliability Study**: Research collaborative SNARKs implementation while maintaining bb.js signature compatibility, adding collaborative proving as optional endpoint parameter to drastically reduce proof costs
  - [ ] **GPU Processing for Mobile Devices**: Investigate GPU compute utilization on mobile devices (Metal/OpenCL/Vulkan) to enable ZK proof generation on smartphones and tablets

## Installation and Setup

```bash
# Clone and install dependencies
npm install

# Build TypeScript  
npm run build

# Test installation
npm run start -- --help
```

## Usage

### Main Commands

```bash
# Basic benchmark with complete visual experience
npm run start benchmark --circuit simple-hash

# Benchmark with verbose mode (detailed progress bars)
npm run start benchmark --circuit simple-hash --verbose

# Benchmark with multiple runs
npm run start benchmark --circuit tree --runs 3

# List available circuits
npm run start list-circuits

# View complete help
npm run start -- --help
```

### Advanced Options

```bash
# Complete benchmark with all options
npm run start benchmark \\
  --circuit simple-hash \\
  --backend UltraHonk \\
  --threads 1 \\
  --runs 3 \\
  --output benchmark-results.json \\
  --verbose
```

## Visual Experience

### Normal Mode
```
╔═══════════════════════════════════════╗
║       NOIR BENCHMARK CLI v0.1.0       ║
║   Zero-Knowledge Proof Benchmarking   ║
╚═══════════════════════════════════════╝

📊 Circuit: simple-hash | Backend: UltraHonk | Runs: 1 | Threads: 1

⏳ Loading circuit...
[BENCH] Circuit Load: 0ms | 11MB
⏳ Initializing backend...
[BENCH] Backend Init: 2ms | 11MB
⏳ Generating witness...
[BENCH] Witness Generation: 16ms | 12MB
⏳ Generating proof (THE MAIN EVENT)...
[BENCH] Proof Generation: 809ms | 13MB
⏳ Verifying proof...
[BENCH] Proof Verify: 150ms | 14MB
✅ Benchmark completed successfully

BENCHMARK PIPELINE EXECUTION FLOW

┌───────────┐      ┌───────────┐      ┌───────────┐      ╔═══════════╗      ┌───────────┐
│  CIRCUIT  │─────▶│  BACKEND  │─────▶│  WITNESS  │─────▶║    🎯     ║─────▶│   PROOF   │
│   LOAD    │─────▶│   INIT    │─────▶│GENERATION │─────▶║   PROOF   ║─────▶│  VERIFY   │
└───────────┘      └───────────┘      └───────────┘      ╚═══════════╝      └───────────┘

     0ms                2ms               16ms               809ms              150ms    
    11MB               11MB               12MB               13MB               14MB     
     0%                0.2%               1.6%             ⭐ 82.8%             15.4%    

                                   THE MAIN EVENT!
                                    (Most Critical)

═══════════════════════════════════════════════════════════════════════════════════════════════

⚡ TOTAL TIME: 976ms  │  🧠 PEAK MEMORY: 14MB  │  📦 PROOF SIZE: 14,592 bytes

🏆 PERFORMANCE INSIGHT: Proof Generation dominates 82.8% of execution time
```

### Verbose Mode
With `--verbose` you get detailed progress bars for each stage:

```
┌─ STAGE: 🎯 Proof Generation (THE MAIN EVENT) ──────────────────┐
│ [████████████████████████████████████████████████████████] 100% │
│ ✅ Completed in 789ms | Memory: 13MB                             │
└─────────────────────────────────────────────────────────────────┘
```

## Captured Metrics

### Per Stage
- **Time**: Precise measurement in milliseconds for each stage
- **Memory**: Heap memory usage in MB
- **Percentage**: What % of total time each stage uses

### Complete Pipeline
1. **Circuit Load**: Loading compiled circuit from JSON
2. **Backend Init**: UltraHonk proof system initialization  
3. **Witness Generation**: Circuit execution with inputs
4. **🎯 Proof Generation**: **THE MAIN EVENT** - ZK proof generation (80-85% of time)
5. **Proof Verify**: Generated proof verification

### Key Insights
- **Proof Generation is the bottleneck**: Consistently 80-85% of total time
- **Low memory footprint**: ~11-14MB for simple circuits
- **Efficient verification**: Only 10-15% of total time

## Architecture

This project implements **Clean Architecture** with clear separation of responsibilities:

### Layer Structure
```
src/
├── domain/              # 🔵 Domain Layer
│   ├── models/          #    Entities and Value Objects
│   └── repositories/    #    Repository interfaces
├── application/         # 🟢 Application Layer  
│   ├── services/        #    Application services
│   └── orchestrators/   #    Workflow orchestrators
├── infrastructure/      # 🟡 Infrastructure Layer
│   ├── circuit/         #    Circuit repository
│   ├── noir/           #    NoirJS/UltraHonk implementation
│   └── profiling/       #    Performance profiling
├── presentation/        # 🔴 Presentation Layer
│   └── cli/            #    CLI commands
└── shared/             # ⚫ Shared Utilities
    ├── visual/         #    ASCII Art and visual elements
    ├── logger/         #    Advanced logging system
    └── errors/         #    Error hierarchy
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete details.

## Available Circuits

| Circuit | Description | Complexity | Typical Time |
|---------|-------------|------------|-------------|
| `simple-hash` | Simple Poseidon hash | Low | ~800ms |
| `tree` | Merkle Tree verification | Medium | ~300ms |

Add new circuits in `circuits/<name>/`:
- `target/<name>.json` - Compiled circuit
- `Prover.toml` - Test inputs

## Use Cases

### 1. Performance Optimization
```bash
# Identify bottlenecks
npm run start benchmark --circuit my-circuit --runs 5 --verbose
```

### 2. Circuit Comparison
```bash
# Compare different circuits
npm run start benchmark --circuit simple-hash
npm run start benchmark --circuit tree
```


### Development Structure
- **TypeScript**: Source code in `src/`
- **ES Modules**: Modern configuration with imports/exports
- **Clean Architecture**: Clear separation of responsibilities
- **Domain-Driven Design**: Rich domain models

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete architecture documentation
- [NoirJS Documentation](https://noir-lang.org/docs/reference/NoirJS/)
- [Barretenberg TypeScript](https://github.com/AztecProtocol/aztec-packages/tree/next/barretenberg)



---

**Focusing on what matters: Proof Generation is where the magic happens (and where 83% of your time goes).**

*For complete technical architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md)*