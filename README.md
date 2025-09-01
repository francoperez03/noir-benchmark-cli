# 🚀 NoirJS Benchmark CLI

> **Professional-grade benchmarking tool for NoirJS + Barretenberg zero-knowledge proof generation**

Una herramienta CLI con experiencia visual de clase mundial para medir y optimizar el rendimiento de generación de pruebas ZK usando NoirJS y Barretenberg.

![Benchmark CLI Demo](https://img.shields.io/badge/CLI-Visual%20Experience-blue?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Architecture-Clean%20Architecture-green?style=for-the-badge)
![Zero Knowledge](https://img.shields.io/badge/ZK-Noir%20%2B%20Barretenberg-purple?style=for-the-badge)

## ✨ Características Destacadas

- 🎨 **Experiencia Visual Rica**: Diagramas ASCII profesionales basados en principios de Don Norman
- 🏗️ **Clean Architecture**: Separación de capas con Domain-Driven Design
- ⚡ **Benchmarking Real**: Integración completa con NoirJS y UltraHonk backend
- 📊 **Pipeline Visual**: Diagrama de flujo que muestra el proceso completo
- 🎯 **Focus en lo Importante**: Destaca que Proof Generation es 80-85% del tiempo de ejecución
- 📈 **Progreso en Tiempo Real**: Barras de progreso y indicadores visuales

## 🚀 Instalación y Setup

```bash
# Clonar e instalar dependencias
npm install

# Compilar TypeScript  
npm run build

# Probar instalación
npm run start -- --help
```

## 🎯 Uso

### Comandos Principales

```bash
# Benchmark básico con experiencia visual completa
npm run start benchmark --circuit simple-hash

# Benchmark con modo verbose (barras de progreso detalladas)
npm run start benchmark --circuit simple-hash --verbose

# Benchmark con múltiples runs
npm run start benchmark --circuit tree --runs 3

# Ver circuitos disponibles
npm run start list-circuits

# Ver ayuda completa
npm run start -- --help
```

### Opciones Avanzadas

```bash
# Benchmark completo con todas las opciones
npm run start benchmark \\
  --circuit simple-hash \\
  --backend UltraHonk \\
  --threads 1 \\
  --runs 3 \\
  --output benchmark-results.json \\
  --verbose
```

## 🎨 Experiencia Visual

### Modo Normal
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
⏳ 🎯 Generating proof (THE MAIN EVENT)...
[BENCH] 🎯 Proof Generation: 809ms | 13MB
⏳ Verifying proof...
[BENCH] Proof Verify: 150ms | 14MB
✅ Benchmark completed successfully

🔄 BENCHMARK PIPELINE EXECUTION FLOW

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

### Modo Verbose
Con `--verbose` obtienes barras de progreso detalladas para cada stage:

```
┌─ STAGE: 🎯 Proof Generation (THE MAIN EVENT) ──────────────────┐
│ [████████████████████████████████████████████████████████] 100% │
│ ✅ Completed in 789ms | Memory: 13MB                             │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Métricas Capturadas

### Por Stage
- **⏱️ Tiempo**: Medición precisa en milisegundos por cada etapa
- **🧠 Memoria**: Uso de memoria heap en MB
- **📈 Porcentaje**: Qué % del tiempo total usa cada stage

### Pipeline Completo
1. **Circuit Load**: Carga del circuito compilado desde JSON
2. **Backend Init**: Inicialización del sistema de pruebas UltraHonk  
3. **Witness Generation**: Ejecución del circuito con inputs
4. **🎯 Proof Generation**: **THE MAIN EVENT** - Generación de la prueba ZK (80-85% del tiempo)
5. **Proof Verify**: Verificación de la prueba generada

### Insights Clave
- **Proof Generation es el cuello de botella**: Consistentemente 80-85% del tiempo total
- **Memory footprint bajo**: ~11-14MB para circuitos simples
- **Verificación eficiente**: Solo 10-15% del tiempo total

## 🏗️ Arquitectura

Este proyecto implementa **Clean Architecture** con separación clara de responsabilidades:

### Estructura de Capas
```
src/
├── domain/              # 🔵 Capa de Dominio
│   ├── models/          #    Entidades y Value Objects
│   └── repositories/    #    Interfaces de repositorio
├── application/         # 🟢 Capa de Aplicación  
│   ├── services/        #    Servicios de aplicación
│   └── orchestrators/   #    Orquestadores de workflows
├── infrastructure/      # 🟡 Capa de Infraestructura
│   ├── circuit/         #    Repositorio de circuitos
│   ├── noir/           #    Implementación NoirJS/UltraHonk
│   └── profiling/       #    Profiling de rendimiento
├── presentation/        # 🔴 Capa de Presentación
│   └── cli/            #    Comandos CLI
└── shared/             # ⚫ Utilidades Compartidas
    ├── visual/         #    ASCII Art y elementos visuales
    ├── logger/         #    Sistema de logging avanzado
    └── errors/         #    Jerarquía de errores
```

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles completos.

## 🎨 Principios de Diseño Visual

Esta herramienta aplica los principios de **"The Design of Everyday Things"** de Don Norman:

### ✅ Principios Aplicados
1. **Visibilidad**: Estado del sistema siempre visible
2. **Feedback**: Retroalimentación inmediata en cada acción  
3. **Mapping**: Relación clara entre acciones y resultados
4. **Affordances**: Elementos que sugieren su función
5. **Constraints**: Guía visual hacia lo más importante

### 🎯 Resultado
- **Experiencia intuitiva**: Los usuarios entienden inmediatamente qué está pasando
- **Focus en lo importante**: El Stage 4 (Proof Generation) se destaca visualmente
- **Información accionable**: Las métricas guían hacia optimizaciones reales

## 🧪 Circuitos Disponibles

| Circuito | Descripción | Complejidad | Tiempo Típico |
|----------|-------------|-------------|---------------|
| `simple-hash` | Hash simple con Poseidon | Baja | ~800ms |
| `tree` | Verificación Merkle Tree | Media | ~300ms |

Agregar nuevos circuitos en `circuits/<nombre>/`:
- `target/<nombre>.json` - Circuito compilado
- `Prover.toml` - Inputs de prueba

## 📈 Casos de Uso

### 1. Optimización de Rendimiento
```bash
# Identificar bottlenecks
npm run start benchmark --circuit my-circuit --runs 5 --verbose
```

### 2. Comparación de Circuitos
```bash
# Comparar diferentes circuitos
npm run start benchmark --circuit simple-hash
npm run start benchmark --circuit tree
```

### 3. Análisis de Memoria
```bash  
# Monitorear uso de memoria
npm run start benchmark --circuit complex-circuit --verbose
```

### 4. Datos para Optimización
```bash
# Exportar resultados para análisis
npm run start benchmark --circuit my-circuit --runs 10 --output analysis.json
```

## 🔧 Desarrollo

### Scripts NPM
```bash
npm run build      # Compilar TypeScript
npm run start      # Ejecutar CLI
npm run dev        # Desarrollo con watch
npm run clean      # Limpiar dist/
```

### Estructura de Desarrollo
- **TypeScript**: Código fuente en `src/`
- **ES Modules**: Configuración moderna con imports/exports
- **Clean Architecture**: Separación clara de responsabilidades
- **Domain-Driven Design**: Modelos ricos en el dominio

## 🚀 Próximos Pasos

### 🔄 En Desarrollo
- [ ] Dashboard interactivo con blessed-contrib
- [ ] Comparaciones side-by-side entre backends
- [ ] Exportación a formatos adicionales (CSV, PNG charts)
- [ ] Circuitos más complejos (signature verification, etc.)

### 💡 Ideas Futuras  
- [ ] Integración con CI/CD para regression testing
- [ ] Web dashboard para visualización avanzada
- [ ] Benchmarking automático en diferentes entornos
- [ ] Profiling de gas costs para L2s

## 📚 Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Documentación completa de arquitectura
- [NoirJS Documentation](https://noir-lang.org/docs/reference/NoirJS/)
- [Barretenberg TypeScript](https://github.com/AztecProtocol/barretenberg/tree/master/ts)

## 🤝 Contribuir

Este proyecto está abierto a contribuciones. Por favor:

1. Fork el repositorio
2. Crea una branch para tu feature (`git checkout -b feature/amazing-feature`)
3. Sigue los principios de Clean Architecture
4. Mantén la experiencia visual consistente
5. Agrega tests si es posible
6. Commit con mensajes descriptivos
7. Push y crea un Pull Request

## 📝 Licencia

MIT License - ver [LICENSE](./LICENSE) para detalles.

---

**🎯 Focusing on what matters: Proof Generation is where the magic happens (and where 83% of your time goes).**

*Para detalles técnicos completos de la arquitectura, ver [ARCHITECTURE.md](./ARCHITECTURE.md)*