# Bonsai-NPU: Snapdragon 8 Elite Hexagon Inference Workstation

An interactive web application and mobile runtime workstation for **Bonsai-2-27B** on Qualcomm Snapdragon silicon (Snapdragon 8 Elite / SM8750, Hexagon v79 HTP co-processor with 1024-bit HVX vectors).

## Overview

**Bonsai-NPU** provides an interactive execution environment, telemetry dashboard, and OpenAI-compatible API testing console for executing 27-billion parameter language models with 1-bit / ternary quantization on mobile hardware.

### Key Features

1. **Interactive Chat & Token Stream Engine**:
   - Real-time token streaming with simulated Hexagon HVX execution latencies
   - Live telemetry per generated step: Single-token B=1 decode (345 ms/tok, 81.1% of physical DRAM floor) vs Multi-Token Prediction (MTP 4x match at 153 ms/tok = 6.54 tok/s)
   - Sampling controls: Temperature, Top-P, Turbo4 (4-bit KV cache: 16 KiB/token), and MTP Draft speculation (1–4 drafts)
   - Curated benchmark presets for quantum tunneling, silicon roofline audit, and DeltaNet recurrence

2. **Silicon DRAM Roofline Audit**:
   - Visual audit of why 81.1% of theoretical LPDDR5X bandwidth (279.8 ms floor) represents the physical limit of mobile silicon
   - Deep-dive into Qualcomm Linux kernel FastRPC driver mutex contention (`fl->map_mutex` 121.2 ms lock stalls) vs Streaming Hybrid Engine (0 ms SMMU remapping)

3. **64-Layer Hybrid Transformer Architecture**:
   - Interactive pipeline matrix displaying all 64 layers (48 Gated Delta-Net Linear Attention + 16 Full GQA Attention)
   - SMMU memory partitioning: 30 static layers + LM Head (3.14 GB pinned) vs 34 streamed layers (194 MB ring arena)
   - 1024-bit Hexagon HVX vector register inspector for ternary packed weights (`process_slice_q2_pair`)

4. **Built-in OpenAI HTTP/SSE Server & ADB Deployment Console**:
   - Live REST API console testing `POST /v1/chat/completions` and `GET /v1/models`
   - Server-Sent Events (SSE) chunk streaming viewer
   - Ready-to-use cURL, Python (`openai`), and Android ADB shell deployment commands

5. **Optimization History**:
   - Interactive milestone progression tracing the 340x speedup from the initial 52,000 ms/token scalar C++ baseline to 6.54 tok/s apex throughput

6. **Android Device Shell**:
   - Realistic OnePlus 13 / Android mobile frame toggle with 5G status bar, thermal readings, and gesture controls

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

## Hardware Specifications

- **SoC Target**: Qualcomm Snapdragon 8 Elite (SM8750)
- **Co-Processor**: Qualcomm Hexagon v79 HTP (1024-bit HVX Vector SIMD)
- **Memory Bus**: 16 GB LPDDR5X @ 106.7 GB/s peak bandwidth
- **Quantization**: 1-bit / Ternary weights (W1/W2 SIMD packing) + 4-bit TurboQuant KV-cache
