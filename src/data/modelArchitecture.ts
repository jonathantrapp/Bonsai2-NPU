import { LayerMetadata } from '../types/bonsai';

export const BONSAI_MODEL_SPECS = {
  name: "Ternary-Bonsai-2-27B",
  architecture: "Prism Hadamard Qwen-3.5 (Hybrid Linear + GQA)",
  parameters: "27.2 Billion",
  quantization: "1-Bit / Ternary Weights (W1/W2 SIMD packing)",
  vocabSize: 248320,
  hiddenSize: 5120,
  intermediateSize: 17408,
  numLayers: 64,
  linearLayersCount: 48,
  fullAttentionLayersCount: 16,
  staticSmmuLayers: 30,
  streamedRingLayers: 34,
  staticSmmuFootprintMb: 3142, // ~3.14 GB
  streamingRingArenaMb: 194,   // 194 MB
  totalModelWeightSizeMb: 6740, // 6.74 GB packed
  contextWindowMax: 262144,
  turbo4KvFootprintKbPerToken: 16, // 16 KiB/tok vs 64 KiB/tok FP16
  socTarget: "Qualcomm Snapdragon 8 Elite (SM8750)",
  coprocessor: "Hexagon v79 HTP (1024-bit HVX Vector)",
  lpddr5xTheoreticalLimitGbs: 106.7,
  theoreticalSiliconFloorMs: 279.8,
  sustainedSingleDecodeMs: 345.0,
  siliconEfficiencySingleDecode: 81.1,
  mtp4VerificationMs: 612.0,
  mtp4EffectiveTokPerSec: 6.54
};

// Generate metadata for all 64 layers based on `config.json` interval of 4
export const BONSAI_LAYERS: LayerMetadata[] = Array.from({ length: 64 }, (_, idx) => {
  // In config.json: full_attention_interval = 4 (indices 3, 7, 11, 15, ..., 63 are full_attention)
  const isFullAttention = (idx + 1) % 4 === 0;
  const isStatic = idx < 30; // 30 static layers in SMMU, 34 streamed in ring arena

  return {
    index: idx,
    type: isFullAttention ? 'full_attention' : 'linear_attention',
    subType: isFullAttention ? 'GQA SwiGLU' : 'Delta-Net',
    headDim: isFullAttention ? 256 : 128,
    numHeads: isFullAttention ? 24 : 48,
    weightSizeMb: isFullAttention ? 94.3 : 94.4,
    executionMode: isStatic ? 'static_smmu' : 'streamed_ring',
    dspComputeMs: isFullAttention ? 3.90 : 4.28,
    hvxKernels: isFullAttention
      ? ['qnn_mha_gqa', 'fused_swiglu_mlp', 'neox_rope', 'rmsnorm_v79']
      : ['gated_deltanet_hvx', 'fwht_1024_simd', 'rank1_inverse_rollback', 'decay_qkv_gate']
  };
});
