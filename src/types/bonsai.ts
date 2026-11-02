export interface GeneratedToken {
  id: number;
  text: string;
  logit: number;
  latencyMs: number;
  stepIndex: number;
  batchMode: 'single' | 'mtp2' | 'mtp3' | 'mtp4';
  matchCount: number;
  fastRpcCalls: number;
  dramTransferMb: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: GeneratedToken[];
  totalTokens?: number;
  totalTimeMs?: number;
  avgTokPerSec?: number;
  mtpAcceptedRatio?: number;
  timestamp: number;
}

export interface GenerationSettings {
  temperature: number;
  topP: number;
  turbo4: boolean;
  maxDrafts: number;
  maxTokens: number;
  promptBoost: boolean;
  model: string;
}

export interface HardwareTelemetry {
  ddrFreqMhz: number;
  llccFreqMhz: number;
  cpuOryonBigMhz: number;
  cpuOryonPrimeMhz: number;
  hexagonFreqMhz: number;
  thermalZoneTempC: number;
  totalVramAllocMb: number;
  staticSmmuMb: number;
  streamingArenaMb: number;
  lpddr5xBandwidthLimitGbs: number;
  effectiveBandwidthGbs: number;
  siliconEfficiencyPct: number;
}

export interface LayerMetadata {
  index: number;
  type: 'linear_attention' | 'full_attention';
  subType: 'Delta-Net' | 'GQA SwiGLU';
  headDim: number;
  numHeads: number;
  weightSizeMb: number;
  executionMode: 'static_smmu' | 'streamed_ring';
  dspComputeMs: number;
  hvxKernels: string[];
}

export interface BenchmarkRecord {
  id: string;
  name: string;
  version: string;
  date: string;
  batchSize: number;
  latencyPerStepMs: number;
  latencyPerTokenMs: number;
  tokensPerSec: number;
  siliconFloorPct: number;
  method: string;
  description: string;
  fastRpcStallMs: number;
}
