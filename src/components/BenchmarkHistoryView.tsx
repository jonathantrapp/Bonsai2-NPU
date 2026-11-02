import React from 'react';
import { Sparkles, TrendingUp, Zap, Clock, ShieldCheck, ArrowRight, Award } from 'lucide-react';
import { BENCHMARK_HISTORY } from '../data/benchmarkHistory';

export const BenchmarkHistoryView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-rose-400" />
          Optimization History: 52s Scalar C++ to 6.54 tok/s Silicon Apex
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          The step-by-step engineering progression measuring every microsecond on OnePlus 13 (Snapdragon 8 Elite / SM8750).
        </p>
      </div>

      {/* Hero Progression Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-cyan-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
            Total Speedup Factor
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-300 to-cyan-400">
            340x Faster
          </div>
          <p className="text-xs text-slate-400 mt-1">
            From 52,000 ms/token (V0 CPU) down to 153 ms/token (V5 Hexagon MTP 4x).
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-center">
            <span className="text-slate-500 block text-[10px]">V0 BASELINE</span>
            <span className="text-rose-400 font-bold">0.019 tok/s</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-center">
            <span className="text-slate-500 block text-[10px]">V4 DECODE (B=1)</span>
            <span className="text-cyan-400 font-bold">2.90 tok/s</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="bg-emerald-950/80 border border-emerald-800 rounded-lg p-3 text-center glow-emerald">
            <span className="text-emerald-400 block text-[10px]">V5 APEX (MTP B=4)</span>
            <span className="text-emerald-300 font-extrabold text-sm sm:text-base">6.54 tok/s</span>
          </div>
        </div>
      </div>

      {/* Milestone Cards Timeline */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
          Milestone Progression
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENCHMARK_HISTORY.map((record, index) => {
            const isApex = record.version.includes('V5');
            const isStandard = record.version.includes('V4');

            return (
              <div
                key={record.id}
                className={`bg-[#0b0f19] border rounded-xl p-4 flex flex-col justify-between transition-all ${
                  isApex
                    ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 to-[#0b0f19] glow-emerald'
                    : isStandard
                    ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-[#0b0f19]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300">
                      {record.version}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{record.date}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-100 mb-1">{record.name}</h4>
                  <p className="text-xs text-slate-400 leading-snug mb-3">{record.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Latency / Tok:</span>
                    <span className="font-bold text-slate-200">
                      {record.latencyPerTokenMs >= 1000
                        ? `${(record.latencyPerTokenMs / 1000).toFixed(1)} s`
                        : `${record.latencyPerTokenMs} ms`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Throughput:</span>
                    <span className={`font-bold ${isApex ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {record.tokensPerSec} tok/s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Silicon Ceiling:</span>
                    <span className="text-amber-400 font-semibold">{record.siliconFloorPct}%</span>
                  </div>
                  {record.fastRpcStallMs > 0 && (
                    <div className="flex justify-between text-rose-400 text-[11px]">
                      <span>Driver Mutex Stall:</span>
                      <span>+{record.fastRpcStallMs} ms</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
