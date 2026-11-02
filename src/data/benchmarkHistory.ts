import { BenchmarkRecord } from '../types/bonsai';

export const BENCHMARK_HISTORY: BenchmarkRecord[] = [
  {
    id: "v0-scalar-baseline",
    name: "Scalar C++ Baseline",
    version: "V0",
    date: "2024-11",
    batchSize: 1,
    latencyPerStepMs: 52000,
    latencyPerTokenMs: 52000,
    tokensPerSec: 0.019,
    siliconFloorPct: 0.5,
    method: "Scalar C++ naive loops on ARM CPU",
    description: "Initial reference implementation without SIMD or DSP offloading. 52 seconds per single forward token step.",
    fastRpcStallMs: 0
  },
  {
    id: "v1-neon-openmp",
    name: "ARM Oryon NEON + OpenMP",
    version: "V1",
    date: "2024-12",
    batchSize: 1,
    latencyPerStepMs: 1240,
    latencyPerTokenMs: 1240,
    tokensPerSec: 0.806,
    siliconFloorPct: 22.5,
    method: "ARMv8.7 NEON Vectorization + 8-core OpenMP thread pool",
    description: "ARM Oryon CPU multi-threading with packed uint64 bitwise ternary arithmetic. Substantial improvement but CPU throttles under high thermal loads.",
    fastRpcStallMs: 0
  },
  {
    id: "v2-dsp-naive",
    name: "Hexagon v79 Offload (Naive)",
    version: "V2",
    date: "2025-01",
    batchSize: 1,
    latencyPerStepMs: 680,
    latencyPerTokenMs: 680,
    tokensPerSec: 1.47,
    siliconFloorPct: 41.1,
    method: "Hexagon FastRPC with per-layer DMA buffer allocations",
    description: "First offload to Hexagon v79 DSP. High FastRPC invocation overhead and IPC serialization on every layer boundary.",
    fastRpcStallMs: 195
  },
  {
    id: "v3-pipelined-smmu",
    name: "Pipelined SMMU (0 memcpy)",
    version: "V3",
    date: "2025-01",
    batchSize: 1,
    latencyPerStepMs: 411,
    latencyPerTokenMs: 411,
    tokensPerSec: 2.43,
    siliconFloorPct: 68.1,
    method: "4 DMA-BUF groups pre-allocated in /dev/dma_heap/system with fastrpc_mmap remapping",
    description: "Zero CPU memcpy design, but isolated Qualcomm Linux kernel driver bottleneck: adsprpc.c fl->map_mutex lock stalls added 121.2 ms per token.",
    fastRpcStallMs: 121.2
  },
  {
    id: "v4-streaming-hybrid",
    name: "Streaming Hybrid Engine",
    version: "V4 (Standard)",
    date: "2025-02",
    batchSize: 1,
    latencyPerStepMs: 345,
    latencyPerTokenMs: 345,
    tokensPerSec: 2.90,
    siliconFloorPct: 81.1,
    method: "30 static layers + LM Head (3.14 GB pinned) + 34 streaming layers (194 MB ring arena)",
    description: "Eliminated all runtime fastrpc_mmap calls. Reached 81.1% of physical silicon LPDDR5X DRAM limit (279.8 ms floor) on OnePlus 13.",
    fastRpcStallMs: 0
  },
  {
    id: "v5-mtp-turbo4",
    name: "MTP Speculative + Turbo4",
    version: "V5 (Current Apex)",
    date: "2025-02",
    batchSize: 4,
    latencyPerStepMs: 612,
    latencyPerTokenMs: 153.0,
    tokensPerSec: 6.54,
    siliconFloorPct: 177.0, // Exceeds single-token physical floor by 1.77x
    method: "Batch-4 MTP verification + fused process_slice_q2_pair + 4-bit KV TurboQuant",
    description: "Amortizes 6.36 GB weight stream across 4 candidate tokens inside 1024-bit HVX registers. Breaks single-token ceiling to reach 6.54 tok/s sustained.",
    fastRpcStallMs: 0
  }
];
