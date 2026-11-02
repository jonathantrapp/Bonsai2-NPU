import React from 'react';
import { Wifi, Battery, Signal, Zap, Cpu } from 'lucide-react';

interface AndroidDeviceShellProps {
  children: React.ReactNode;
  activeModelName?: string;
}

export const AndroidDeviceShell: React.FC<AndroidDeviceShellProps> = ({
  children,
  activeModelName = "Bonsai-2-27B NPU"
}) => {
  return (
    <div className="flex justify-center items-center py-4 px-2 min-h-[calc(100vh-120px)]">
      {/* Phone Mockup Body */}
      <div className="relative w-full max-w-[430px] h-[860px] bg-[#0c101a] border-[8px] border-slate-800 rounded-[44px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-slate-700/60">
        {/* Android Punch Hole & Status Bar */}
        <div className="h-10 bg-[#090d16] px-6 flex items-center justify-between text-[11px] text-slate-400 select-none flex-shrink-0 z-30 border-b border-slate-800/40">
          <div className="font-mono font-bold text-slate-200">12:30</div>

          {/* Camera cutout */}
          <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800/80 mx-auto" />

          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <span className="font-mono text-[9px] font-bold text-cyan-400">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Live Thermal & FastRPC Status Pill */}
        <div className="bg-slate-900/90 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-1 text-amber-400">
            <Zap className="w-3 h-3" />
            <span>Hexagon v79: 1024b HVX</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-400">
            <Cpu className="w-3 h-3" />
            <span>SM8750: 38.4°C</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto bg-[#080b11]">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="h-5 bg-[#090d16] flex items-center justify-center flex-shrink-0">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
