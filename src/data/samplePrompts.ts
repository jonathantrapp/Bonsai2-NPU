export interface PromptPreset {
  id: string;
  title: string;
  category: 'benchmark' | 'science' | 'npu_architecture' | 'code';
  prompt: string;
  expectedTokens: number;
  expectedThroughput: string;
}

export const SAMPLE_PROMPTS: PromptPreset[] = [
  {
    id: "paris-capitals",
    title: "Capital Benchmark (MTP 4x Match)",
    category: "benchmark",
    prompt: "The capital of France is Paris. The capital of Germany is Berlin. The capital of France is",
    expectedTokens: 20,
    expectedThroughput: "6.01 – 6.54 tok/s (MTP 4x Multi-Token Speculation)"
  },
  {
    id: "quantum-tunneling",
    title: "Quantum Tunneling in Two Sentences",
    category: "science",
    prompt: "Explain quantum tunneling in two sentences.",
    expectedTokens: 38,
    expectedThroughput: "5.85 tok/s (Hybrid Delta-Net + GQA)"
  },
  {
    id: "roofline-math",
    title: "Silicon DRAM Roofline Audit",
    category: "npu_architecture",
    prompt: "Explain why 345 ms/token decode latency on Snapdragon 8 Elite hits 81.1% of the physical DRAM bandwidth limit.",
    expectedTokens: 64,
    expectedThroughput: "6.12 tok/s (Streaming Ring Arena + HVX)"
  },
  {
    id: "deltanet-vs-gqa",
    title: "DeltaNet Recurrence vs GQA Attention",
    category: "npu_architecture",
    prompt: "What is the structural advantage of combining 48 Linear Attention DeltaNet layers with 16 Full GQA layers in Bonsai-2-27B?",
    expectedTokens: 52,
    expectedThroughput: "6.25 tok/s (Turbo4 16 KiB/tok KV Cache)"
  },
  {
    id: "fastrpc-driver",
    title: "Qualcomm FastRPC Mutex Contention",
    category: "npu_architecture",
    prompt: "Why did dynamic fastrpc_mmap remapping stall for 121 ms inside the Linux kernel adsprpc driver?",
    expectedTokens: 45,
    expectedThroughput: "5.92 tok/s (Zero SMMU runtime remap)"
  }
];
