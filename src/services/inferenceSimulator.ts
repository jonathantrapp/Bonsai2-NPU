import { GeneratedToken, GenerationSettings } from '../types/bonsai';

interface SimulatedCompletion {
  text: string;
  tokens: string[];
}

const KNOWLEDGE_RESPONSES: Record<string, SimulatedCompletion> = {
  "The capital of France is Paris. The capital of Germany is Berlin. The capital of France is": {
    text: " Paris. The capital of Germany is Berlin. The capital of France is Paris. The capital of Germany is Berlin.",
    tokens: [" Paris", ".", " The", " capital", " of", " Germany", " is", " Berlin", ".", " The", " capital", " of", " France", " is", " Paris", ".", " The", " capital", " of", " Germany", " is", " Berlin", "."]
  },
  "Explain quantum tunneling in two sentences.": {
    text: "Quantum tunneling is a quantum mechanical phenomenon where a particle traverses a potential energy barrier that it cannot classical surmount according to Newtonian mechanics. It arises from the wave-like probability distribution of subatomic wavefunctions possessing non-zero amplitudes on the opposite boundary of the barrier.",
    tokens: ["Quantum", " tunneling", " is", " a", " quantum", " mechanical", " phenomenon", " where", " a", " particle", " traverses", " a", " potential", " energy", " barrier", " that", " it", " cannot", " classical", " surmount", " according", " to", " Newtonian", " mechanics", ".", " It", " arises", " from", " the", " wave", "-like", " probability", " distribution", " of", " subatomic", " wavefunctions", " possessing", " non", "-zero", " amplitudes", " on", " the", " opposite", " boundary", " of", " the", " barrier", "."]
  },
  "Silicon DRAM Roofline Audit": {
    text: "Single-token auto-regressive decode requires streaming 6.36 GB of model weights from DRAM to Hexagon VTCM every step. With Snapdragon 8 Elite's LPDDR5X achieving 106.7 GB/s theoretical throughput, the physical floor is 279.8 ms. Bonsai-NPU's 345 ms sustained latency reaches 81.1% of this ceiling with 0.00 ms SMMU overhead.",
    tokens: ["Single", "-token", " auto", "-regressive", " decode", " requires", " streaming", " 6.36", " GB", " of", " model", " weights", " from", " DRAM", " to", " Hexagon", " VTCM", " every", " step", ".", " With", " Snapdragon", " 8", " Elite", "'s", " LPDDR5X", " achieving", " 106.7", " GB/s", " theoretical", " throughput", ",", " the", " physical", " floor", " is", " 279.8", " ms", ".", " Bonsai", "-NPU", "'s", " 345", " ms", " sustained", " latency", " reaches", " 81.1", "%", " of", " this", " ceiling", " with", " 0.00", " ms", " SMMU", " overhead", "."]
  },
  "DeltaNet Recurrence vs GQA Attention": {
    text: "Bonsai-2-27B combines 48 Linear Attention (Gated Delta-Net) layers with 16 Full Attention (GQA) layers. Delta-Net maintains constant O(1) inference memory and linear O(N) sequence scaling via FWHT-1024 vector recurrence, while interleaved GQA layers every 4 intervals guarantee sharp associative recall across 262k contexts.",
    tokens: ["Bonsai", "-2", "-27B", " combines", " 48", " Linear", " Attention", " (", "Gated", " Delta", "-Net", ")", " layers", " with", " 16", " Full", " Attention", " (", "GQA", ")", " layers", ".", " Delta", "-Net", " maintains", " constant", " O(1)", " inference", " memory", " and", " linear", " O(N)", " sequence", " scaling", " via", " FWHT", "-1024", " vector", " recurrence", ",", " while", " interleaved", " GQA", " layers", " every", " 4", " intervals", " guarantee", " sharp", " associative", " recall", " across", " 262k", " contexts", "."]
  },
  "Qualcomm FastRPC Mutex Contention": {
    text: "Qualcomm's Linux kernel driver (adsprpc.c) serializes all DSP memory operations behind a global session mutex fl->map_mutex. Calling fastrpc_mmap to update QuRT page tables holds this lock for 30–45 ms, freezing the NPU compute thread across group transitions and causing 121.2 ms of dead stalls. Streaming via CPU memcpy completely bypasses this driver bottleneck.",
    tokens: ["Qualcomm", "'s", " Linux", " kernel", " driver", " (", "adsprpc.c", ")", " serializes", " all", " DSP", " memory", " operations", " behind", " a", " global", " session", " mutex", " fl", "->", "map_mutex", ".", " Calling", " fastrpc_mmap", " to", " update", " QuRT", " page", " tables", " holds", " this", " lock", " for", " 30", "–", "45", " ms", ",", " freezing", " the", " NPU", " compute", " thread", " across", " group", " transitions", " and", " causing", " 121.2", " ms", " of", " dead", " stalls", ".", " Streaming", " via", " CPU", " memcpy", " completely", " bypasses", " this", " driver", " bottleneck", "."]
  }
};

function getSimulatedTokens(prompt: string): string[] {
  for (const [key, val] of Object.entries(KNOWLEDGE_RESPONSES)) {
    if (prompt.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(prompt.toLowerCase())) {
      return val.tokens;
    }
  }

  // Fallback tokenizer simulation for custom prompts
  const clean = prompt.trim();
  const words = clean.split(/\s+/);
  const baseTokens: string[] = [];

  baseTokens.push("Bonsai", "-NPU", " executed", " forward", " pass", " on", " Snapdragon", " 8", " Elite", " (", "Hexagon", " v79", " HTP", ").", " ");
  baseTokens.push("Regarding", ` "${words.slice(0, 4).join(" ")}": `, "Ternary", " quantized", " weights", " (", "W1/W2", ")", " evaluated", " via", " 1024-bit", " HVX", " SIMD", " registers", ".");
  baseTokens.push(" 48", " DeltaNet", " linear", " recurrence", " steps", " +", " 16", " GQA", " attention", " passes", " completed", " with", " Turbo4", " 4-bit", " KV", " cache", ".");
  baseTokens.push(" Single-token", " decode", " achieved", " 345 ms", " step", " latency", " (", "81.1%", " silicon", " efficiency", ").");

  return baseTokens;
}

export async function simulateInference(
  prompt: string,
  settings: GenerationSettings,
  onToken: (token: GeneratedToken, accumulatedText: string) => void,
  onPrefillDone?: (tokensCount: number, durationMs: number) => void,
  isCancelled?: () => boolean
): Promise<{ tokens: GeneratedToken[]; totalTimeMs: number; avgTokPerSec: number }> {
  const tokenStrings = getSimulatedTokens(prompt);
  const totalToGenerate = Math.min(settings.maxTokens, tokenStrings.length);
  
  // 1. Simulate Prefill Phase (B = 4 batch prefill: ~160 ms/tok)
  const promptTokensCount = Math.max(8, prompt.split(/\s+/).length * 2);
  const prefillDurationMs = Math.round(promptTokensCount * 14.5); // ~160ms total for ~11 tokens
  
  await new Promise(r => setTimeout(r, Math.min(prefillDurationMs, 400)));
  if (onPrefillDone) {
    onPrefillDone(promptTokensCount, prefillDurationMs);
  }

  let accumulatedText = "";
  const generatedTokens: GeneratedToken[] = [];
  const startTime = Date.now();

  let tokenIdx = 0;
  let stepIndex = 0;

  while (tokenIdx < totalToGenerate) {
    if (isCancelled && isCancelled()) break;

    // Determine batch size based on MTP speculative drafts
    // Under MTP: 55% match B=4, 25% match B=2, 20% single decode B=1
    const rand = Math.random();
    let batchSize = 1;
    let mode: 'single' | 'mtp2' | 'mtp3' | 'mtp4' = 'single';
    let stepLatency = 345 + (Math.random() * 15 - 7); // ~345 ms

    if (settings.maxDrafts >= 3 && rand < 0.55 && tokenIdx + 4 <= totalToGenerate) {
      batchSize = 4;
      mode = 'mtp4';
      stepLatency = 612 + (Math.random() * 20 - 10); // 612 ms / 4 = 153 ms/tok
    } else if (settings.maxDrafts >= 2 && rand < 0.80 && tokenIdx + 2 <= totalToGenerate) {
      batchSize = 2;
      mode = 'mtp2';
      stepLatency = 407 + (Math.random() * 15 - 7); // 407 ms / 2 = 203.5 ms/tok
    } else {
      batchSize = 1;
      mode = 'single';
      stepLatency = 349 + (Math.random() * 10 - 5);
    }

    // Delay for UI visualization (scaled proportionally so user gets responsive feel while maintaining realistic stats)
    const visualDelay = Math.max(30, Math.round(stepLatency * 0.12));
    await new Promise(r => setTimeout(r, visualDelay));

    if (isCancelled && isCancelled()) break;

    for (let b = 0; b < batchSize; b++) {
      const currentWord = tokenStrings[tokenIdx];
      accumulatedText += currentWord;

      const tokenObj: GeneratedToken = {
        id: 10000 + Math.floor(Math.random() * 200000),
        text: currentWord,
        logit: Number((11.5 + Math.random() * 2.8).toFixed(3)),
        latencyMs: Math.round(stepLatency / batchSize),
        stepIndex,
        batchMode: mode,
        matchCount: batchSize,
        fastRpcCalls: 66,
        dramTransferMb: Math.round(6360 / (mode === 'mtp4' ? 4 : 1)),
        timestamp: Date.now()
      };

      generatedTokens.push(tokenObj);
      onToken(tokenObj, accumulatedText);
      tokenIdx++;
    }

    stepIndex++;
  }

  const totalTimeMs = Date.now() - startTime;
  const avgTokPerSec = generatedTokens.length > 0 
    ? Number(((generatedTokens.length / (totalTimeMs / 1000))).toFixed(2)) 
    : 0;

  return {
    tokens: generatedTokens,
    totalTimeMs,
    avgTokPerSec
  };
}
