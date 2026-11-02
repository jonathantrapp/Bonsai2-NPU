import React from 'react';
import { Cpu, Zap, Activity, Layers, Terminal, Sparkles, Smartphone, Monitor, ShieldCheck, Database } from 'lucide-react';
import { BONSAI_MODEL_SPECS } from '../data/modelArchitecture';

export type ActiveTab = 'chat' | 'roofline' | 'architecture' | 'api' | 'benchmarks';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDeviceFrame: boolean;
  setIsDeviceFrame: (val: boolean) => void;
  isRunningInference: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDeviceFrame,
  setIsDeviceFrame,
  isRunningInference
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0c101a]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top System Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRunningInference ? 'bg-cyan-400' : 'bg-emerald-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunningInference ? 'bg-cyan-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="font-semibold text-slate-200">Bonsai-2-27B NPU</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
              1-Bit / Ternary
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              SM8750 (Snapdragon 8 Elite)
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-purple-300">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              Hexagon v79 HTP (1024-bit HVX)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <div className="hidden md:flex items-center gap-2 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>SMMU: <strong className="text-slate-200">3.14 GB</strong></span>
            <span className="text-slate-600">•</span>
            <span>Ring: <strong className="text-slate-200">194 MB</strong></span>
          </div>

          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Rootless FastRPC</span>
          </div>

          <button
            onClick={() => setIsDeviceFrame(!isDeviceFrame)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
              isDeviceFrame
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 glow-cyan'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Toggle between Mobile OnePlus 13 Frame and Desktop Workstation"
          >
            {isDeviceFrame ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>OnePlus 13 View</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span>Workstation View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto">
        <nav className="flex space-x-1 py-1.5">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Inference REPL</span>
          </button>

          <button
            onClick={() => setActiveTab('roofline')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'roofline'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Silicon Roofline</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>64-Layer Hybrid</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'api'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>OpenAI Server & ADB</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'benchmarks'
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Optimization History</span>
          </button>
        </nav>

        <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="text-emerald-400 font-semibold">{BONSAI_MODEL_SPECS.mtp4EffectiveTokPerSec} tok/s</span>
          <span className="text-slate-600">•</span>
          <span>{BONSAI_MODEL_SPECS.parameters}</span>
        </div>
      </div>
    </header>
  );
};
