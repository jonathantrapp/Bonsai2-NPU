import React, { useState } from 'react';
import { Layers, Database, Cpu, Zap, Filter, Eye, Sparkles, Check, Info } from 'lucide-react';
import { BONSAI_LAYERS, BONSAI_MODEL_SPECS } from '../data/modelArchitecture';
import { LayerMetadata } from '../types/bonsai';

export const LayerArchitectureView: React.FC = () => {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(3); // Layer 3 is full attention GQA
  const [filterType, setFilterType] = useState<'all' | 'linear' | 'full' | 'static' | 'streamed'>('all');

  const selectedLayer = BONSAI_LAYERS[selectedLayerIndex] || BONSAI_LAYERS[0];

  const filteredLayers = BONSAI_LAYERS.filter(layer => {
    if (filterType === 'linear') return layer.type === 'linear_attention';
    if (filterType === 'full') return layer.type === 'full_attention';
    if (filterType === 'static') return layer.executionMode === 'static_smmu';
    if (filterType === 'streamed') return layer.executionMode === 'streamed_ring';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            64-Layer Hybrid Transformer & Hexagon HVX Co-Processor
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            48 Linear Attention (Gated Delta-Net) + 16 Full Attention (GQA SwiGLU) executed across SMMU static & streamed memory.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterType === 'all' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All (64)
          </button>
          <button
            onClick={() => setFilterType('linear')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterType === 'linear' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Delta-Net (48)
          </button>
          <button
            onClick={() => setFilterType('full')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterType === 'full' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GQA Full (16)
          </button>
          <button
            onClick={() => setFilterType('static')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterType === 'static' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Static SMMU (30)
          </button>
          <button
            onClick={() => setFilterType('streamed')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterType === 'streamed' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Streamed Ring (34)
          </button>
        </div>
      </div>

      {/* Architecture Partition Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0e1320] border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-cyan-400">48 DELTA-NET LINEAR ATTENTION</span>
            <span className="font-mono">Interval: 3/4</span>
          </div>
          <p className="text-xs text-slate-300">
            Maintains constant <code className="text-cyan-300">O(1)</code> inference memory footprint with linear <code className="text-cyan-300">O(N)</code> sequence scaling. Fused with FWHT-1024 vector recurrence and Neox RoPE.
          </p>
          <div className="mt-2 text-[11px] font-mono text-emerald-400">
            4.28 ms Hexagon v79 compute / layer
          </div>
        </div>

        <div className="bg-[#0e1320] border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-purple-400">16 FULL GQA ATTENTION</span>
            <span className="font-mono">Every 4th Layer</span>
          </div>
          <p className="text-xs text-slate-300">
            Anchors precise associative multi-needle recall across up to 262,144 tokens. Interleaved every 4th layer (layers 3, 7, 11, 15, ..., 63).
          </p>
          <div className="mt-2 text-[11px] font-mono text-emerald-400">
            3.90 ms Hexagon v79 compute / layer
          </div>
        </div>

        <div className="bg-[#0e1320] border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-emerald-400">TURBO4 KV CACHE QUANTIZATION</span>
            <span className="font-mono">16 KiB / tok</span>
          </div>
          <p className="text-xs text-slate-300">
            4-bit vectorized KV-cache compression reduces footprint by <strong className="text-emerald-300">75%</strong> (16 KiB/token vs 64 KiB/token FP16). 65k context consumes only 1.05 GB RAM.
          </p>
          <div className="mt-2 text-[11px] font-mono text-cyan-400">
            6.01–6.25 tok/s batched prefill throughput
          </div>
        </div>
      </div>

      {/* Main Grid: Layer Selector & Layer Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Layer Matrix (64 interactive blocks) */}
        <div className="lg:col-span-8 bg-[#0b0f19] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-200">Layer Execution Pipeline (Layers 0 - 63)</span>
            <span className="text-slate-400 text-[11px] font-mono">
              Click any layer to inspect HVX kernel details
            </span>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-8 md:grid-cols-16 gap-1.5">
            {filteredLayers.map(layer => {
              const isSelected = layer.index === selectedLayerIndex;
              const isFull = layer.type === 'full_attention';
              const isStatic = layer.executionMode === 'static_smmu';

              return (
                <button
                  key={layer.index}
                  onClick={() => setSelectedLayerIndex(layer.index)}
                  className={`h-11 rounded flex flex-col items-center justify-center text-[10px] font-mono transition-all border ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 scale-105 z-10 font-bold shadow-lg'
                      : ''
                  } ${
                    isFull
                      ? isStatic
                        ? 'bg-purple-900/60 border-purple-500/60 text-purple-200 hover:bg-purple-900'
                        : 'bg-purple-950/40 border-purple-700/40 text-purple-300 hover:bg-purple-900/60'
                      : isStatic
                      ? 'bg-cyan-950/60 border-cyan-600/50 text-cyan-200 hover:bg-cyan-900/80'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                  title={`Layer ${layer.index}: ${layer.subType} (${layer.executionMode})`}
                >
                  <span className="font-semibold leading-none">{layer.index}</span>
                  <span className="text-[8px] opacity-75 leading-none mt-1">
                    {isFull ? 'GQA' : 'DLT'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-950 border border-cyan-600/60" />
              <span>Delta-Net (Static SMMU: L0–L29)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-900 border border-purple-500/60" />
              <span>Full GQA (Static SMMU)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700" />
              <span>Delta-Net (Streamed Ring: L30–L63)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-950/60 border border-purple-700" />
              <span>Full GQA (Streamed Ring)</span>
            </div>
          </div>
        </div>

        {/* Selected Layer Details Panel */}
        <div className="lg:col-span-4 bg-[#0b0f19] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  Inspecting Layer {selectedLayer.index}
                </span>
                <h3 className="text-base font-bold text-slate-100">{selectedLayer.subType}</h3>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                selectedLayer.executionMode === 'static_smmu'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {selectedLayer.executionMode === 'static_smmu' ? 'Static SMMU (0 remap)' : 'Ring Arena (194MB)'}
              </span>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Head Dimension:</span>
                <span className="font-mono text-slate-200">{selectedLayer.headDim}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Attention Heads:</span>
                <span className="font-mono text-slate-200">{selectedLayer.numHeads} heads</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Ternary Weights Size:</span>
                <span className="font-mono text-cyan-300 font-semibold">{selectedLayer.weightSizeMb} MB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Hexagon v79 Compute:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedLayer.dspComputeMs} ms</span>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 block mb-1.5 font-medium">Hexagon HVX Vector Kernels:</span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {selectedLayer.hvxKernels.map((kernel, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300"
                    >
                      {kernel}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 1024-Bit HVX Register Note */}
          <div className="p-3 bg-purple-950/20 border border-purple-900/50 rounded-lg text-[11px] text-purple-200">
            <div className="font-bold flex items-center gap-1 mb-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>1024-Bit SIMD Register Packing</span>
            </div>
            <p className="text-slate-400 leading-snug">
              Ternary weights (-1, 0, +1) are evaluated in 128-byte HVX vectors (<code className="text-purple-300">VReg 1024b</code>) via fused <code className="text-purple-300">process_slice_q2_pair</code>, avoiding scalar dequantization penalties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
