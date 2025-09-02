# 🏗️ Architecture Documentation

> **Clean Architecture implementation for NoirJS Benchmark CLI**

This document describes the complete architecture of the NoirJS Benchmark CLI, implementing Clean Architecture and Domain-Driven Design principles to create a maintainable, testable and scalable system.

## 📋 Table of Contents

- [Overview](#overview)
- [Architectural Principles](#architectural-principles)
- [Layer Structure](#layer-structure)
- [Domain Layer](#domain-layer)
- [Application Layer](#application-layer)
- [Infrastructure Layer](#infrastructure-layer)
- [Presentation Layer](#presentation-layer)
- [Shared Layer](#shared-layer)
- [Data Flow](#data-flow)
- [Implemented Patterns](#implemented-patterns)
- [Architectural Decisions](#architectural-decisions)

## 🎯 Overview

### Architecture Goals
1. **Separation of Responsibilities**: Each layer has a specific and well-defined purpose
2. **Testability**: Easy unit testing and integration through dependency injection
3. **Maintainability**: Organized code that's easy to extend
4. **Scalability**: Architecture that allows growth without major refactoring
5. **Domain-Centric**: Business domain (ZK benchmarking) at the center

### Technology Stack
- **Language**: TypeScript (ES2022)
- **Runtime**: Node.js 18+
- **Architecture**: Clean Architecture + DDD
- **CLI Framework**: Commander.js
- **ZK Stack**: NoirJS + Barretenberg (UltraHonk)
- **Visual Experience**: ASCII Art + Chalk (colors)

## 🧱 Architectural Principles

### Clean Architecture
We implement Robert C. Martin's principles:

1. **Dependency Rule**: Dependencies point inward (toward the domain)
2. **Independence**: Each layer is independent of external frameworks
3. **Testability**: Easy testing of business rules without UI or database
4. **Framework Independence**: Domain doesn't depend on specific frameworks

### Domain-Driven Design
We apply key DDD concepts:

1. **Ubiquitous Language**: Common vocabulary between business and development
2. **Rich Domain Models**: Entities with behavior, not just data
3. **Repository Pattern**: Data access abstraction
4. **Value Objects**: Immutable objects with intrinsic validation

### SOLID Principles
- **S**ingle Responsibility: Each class has a single reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Objects replaceable by instances of subtypes
- **I**nterface Segregation: Specific interfaces better than general ones
- **D**ependency Inversion: Depend on abstractions, not concretions

## 🏛️ Layer Structure

```
src/
├── 🔵 domain/              # Domain Layer (Core Business)
│   ├── models/            #   Entities and Value Objects
│   └── repositories/      #   Repository contracts
├── 🟢 application/         # Application Layer (Use Cases)
│   ├── services/          #   Application services
│   └── orchestrators/     #   Complex workflow orchestration
├── 🟡 infrastructure/      # Infrastructure Layer (External Concerns)
│   ├── circuit/           #   Circuit repository implementation
│   ├── noir/              #   NoirJS/Barretenberg integration
│   └── profiling/         #   Performance profiling with Node.js
├── 🔴 presentation/        # Presentation Layer (User Interface)
│   └── cli/               #   CLI commands and input handling
├── ⚫ shared/              # Shared Utilities (Cross-cutting)
│   ├── visual/            #   ASCII Art and visual elements
│   ├── logger/            #   Advanced logging system
│   └── errors/            #   Domain error hierarchy
└── 📄 main.ts             # Entry Point + Dependency Injection Container
```

### Dependency Flow
```
Presentation Layer 
       ↓
Application Layer
       ↓  
Domain Layer
       ↑
Infrastructure Layer
```

**Key Rule**: Arrows always point toward the domain. Infrastructure implements interfaces defined in Domain.

## 🔵 Domain Layer

### Purpose
Contains core business logic and ZK benchmarking domain rules. This is the most important and stable layer.

### Components

The Domain Layer contains the core business entities like Circuit, BenchmarkResult, and ProofResult, along with repository interfaces that define contracts for data access without implementation details.

## 🟢 Application Layer

### Purpose
Orchestrates the system's use cases, coordinating between domain and infrastructure. Implements application-specific workflows.

### Components

Application services handle use cases like CircuitService for circuit operations and ProofService for proof generation, while orchestrators like BenchmarkOrchestrator coordinate complex multi-step workflows.

## 🟡 Infrastructure Layer

### Purpose
Implements interfaces defined in the domain, integrating with external frameworks, file systems, and third-party APIs.

### Components

Infrastructure includes FileSystemCircuitRepository for file-based circuit loading, UltraHonkProofSystemRepository for NoirJS integration, and PerformanceProfiler for Node.js-based performance measurement.

## 🔴 Presentation Layer

### Purpose
Handles user interaction, parsing CLI commands and presenting results using the visual experience.

### Components

The Presentation layer contains CLI commands like BenchmarkCommand that parse user input and coordinate with the application layer to execute benchmarks and display results.

## ⚫ Shared Layer

### Purpose
Contains cross-cutting utilities used by multiple layers, without containing specific business logic.

### Components

Shared utilities include visual elements like AsciiArt for professional ASCII diagrams, Logger for structured logging, and error hierarchies for consistent error handling.

## 🔄 Data Flow

### Complete Benchmark Command Flow

The flow starts when a user runs a benchmark command, which gets parsed by the CLI layer, orchestrated through the application layer, executed via infrastructure implementations, and results displayed through the visual system.

### Data Transformations

Data flows from file system formats to domain objects, then to external library formats, and finally back to domain objects before being transformed into visual representations.

## 🎨 Implemented Patterns

### Repository Pattern
- **Purpose**: Encapsulates data access and enables easy testing
- **Implementation**: CircuitRepository interface in domain, FileSystemCircuitRepository in infrastructure
- **Benefit**: Easy switching to databases or remote APIs

### Dependency Injection
- **Purpose**: Inversion of control and decoupling  
- **Implementation**: Manual DI container in `main.ts`
- **Benefit**: Easy testing with mocks, runtime flexibility

### Factory Pattern
- **Purpose**: Complex object creation with validation
- **Implementation**: `Circuit.fromCompiledCircuit()`, `ProofResult.failed()`
- **Benefit**: Controlled construction with domain invariants

### Strategy Pattern  
- **Purpose**: Interchangeable algorithms
- **Implementation**: `ProofSystemRepository` allows different backends
- **Benefit**: Easy support for UltraPlonk or other backends

## 🎯 Architectural Decisions

### 1. TypeScript + ES Modules
**Decision**: Use TypeScript with ES modules (not CommonJS)
**Reason**: 
- Type safety for complex domain (ZK proofs)
- ES modules is the future of JavaScript
- Better integration with modern tooling
**Trade-off**: Requires Node.js 18+ and careful configuration

### 2. Clean Architecture over MVC
**Decision**: Implement complete Clean Architecture
**Reason**:
- Clear separation of concerns
- Superior testability
- Framework independence
- Long-term scalability
**Trade-off**: More initial boilerplate, learning curve

### 3. Domain-Rich Models
**Decision**: Domain models with behavior, not just data
**Reason**:
- `Circuit.complexity()` encapsulates business logic
- `BenchmarkResult.proofGenerationPercentage()` core calculations
- Invariants validated in constructors
**Trade-off**: More code than simple DTOs

### 4. Manual Dependency Injection
**Decision**: Manual DI instead of framework (InversifyJS, etc.)
**Reason**:
- Simplicity - project not very large
- Total control over construction
- No complex magic/decorators  
**Trade-off**: More verbose, no auto-wiring

### 5. ASCII Art Visual Experience
**Decision**: Rich visual experience in console
**Reason**:
- Don Norman design principles applied
- Highlight Proof Generation as bottleneck
- Differentiation vs similar tools
**Trade-off**: More code, layout complexity

## 📊 Architecture Metrics

### Cyclomatic Complexity
- **Domain Layer**: Low - simple and clear business logic
- **Application Layer**: Medium - workflow orchestration
- **Infrastructure Layer**: Medium - external API integration  
- **Presentation Layer**: Low - mainly formatting

### Coupling
- **Afferent Coupling (Ca)**: Domain = 0, Application = Domain, etc.
- **Efferent Coupling (Ce)**: Presentation = Application + Shared, etc.
- **Instability (I)**: Ce / (Ca + Ce) - Domain most stable

## 🔮 Architecture Evolution

### Future Extensions Ready

**1. Multiple Backends**
The ProofSystemRepository interface is ready for UltraPlonk, Halo2, etc.

**2. Remote Circuit Storage**
Easy to implement RemoteCircuitRepository for API/IPFS circuit fetching.

**3. Database Results Storage**  
Add DatabaseBenchmarkRepository for persistent benchmark history.

**4. Web Dashboard**
Same domain models, different presentation layer for web interface.

---

## ✅ Conclusion

This architecture achieves:

- **🎯 Separation of Concerns**: Each layer has specific responsibility
- **🧪 Testability**: Easy unit testing with dependency injection  
- **🔧 Maintainability**: Organized and documented code
- **📈 Scalability**: Easy to add features without breaking existing ones
- **🎨 User Experience**: Exceptional visual experience with design principles
- **⚡ Performance**: Real benchmarking with actionable metrics

The result is a professional tool that not only works correctly but is maintainable, extensible, and provides an exceptional user experience for developers working with Zero-Knowledge proofs.

**The architecture puts the domain (ZK benchmarking) at the center, with all other layers serving to support and expose that core functionality elegantly and efficiently.**