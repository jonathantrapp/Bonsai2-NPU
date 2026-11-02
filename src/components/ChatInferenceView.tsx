import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Sparkles, RefreshCw, Sliders, Shield, Zap, Terminal as TermIcon, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatMessage, GeneratedToken, GenerationSettings } from '../types/bonsai';
import { SAMPLE_PROMPTS, PromptPreset } from '../data/samplePrompts';
import { simulateInference } from '../services/inferenceSimulator';
import { BONSAI_MODEL_SPECS } from '../data/modelArchitecture';

interface ChatInferenceViewProps {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
}

export const ChatInferenceView: React.FC<ChatInferenceViewProps> = ({
  isRunning,
  setIsRunning
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: "Bonsai-2-27B NPU Engine online.\nQualcomm Snapdragon 8 Elite (Hexagon v79 HTP) initialized.\nHybrid Engine Ready: 30 Static Layers (2.82 GiB) + Static LM Head (322 MB) + 34 Streamed Layers (Ring Arena 194 MB).\nTurboQuant / Turbo4 mode ENABLED (4-bit KV Cache: 16 KiB/token).\nEnter a prompt or select a hardware benchmark below to test.",
      timestamp: Date.now()
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [settings, setSettings] = useState<GenerationSettings>({
    temperature: 0.6,
    topP: 0.9,
    turbo4: true,
    maxDrafts: 3,
    maxTokens: 128,
    promptBoost: true,
    model: 'bonsai-2-27b'
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showNpuLog, setShowNpuLog] = useState(true);
  const [currentStepTokens, setCurrentStepTokens] = useState<GeneratedToken[]>([]);
  const [activeTelemetry, setActiveTelemetry] = useState({
    tokPerSec: 0,
    latencyPerTokMs: 0,
    fastRpcCalls: 0,
    lastBatchMode: 'single' as string,
    prefillStats: { count: 0, durationMs: 0 },
    elapsedMs: 0
  });

  const isCancelledRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStepTokens]);

  const handleRunInference = async (promptToUse?: string) => {
    const text = promptToUse || inputPrompt;
    if (!text.trim() || isRunning) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsRunning(true);
    isCancelledRef.current = false;
    setCurrentStepTokens([]);

    const assistantMsgId = `asst-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      tokens: [],
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, initialAssistantMsg]);

    try {
      const result = await simulateInference(
        text,
        settings,
        (token, accumulated) => {
          setCurrentStepTokens(prev => [...prev, token]);
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId
                ? { ...m, content: accumulated, tokens: [...(m.tokens || []), token] }
                : m
            )
          );

          setActiveTelemetry(prev => ({
            ...prev,
            tokPerSec: Number((1000 / token.latencyMs).toFixed(2)),
            latencyPerTokMs: token.latencyMs,
            fastRpcCalls: (prev.fastRpcCalls || 0) + token.fastRpcCalls,
            lastBatchMode: token.batchMode
          }));
        },
        (pCount, pDuration) => {
          setActiveTelemetry(prev => ({
            ...prev,
            prefillStats: { count: pCount, durationMs: pDuration }
          }));
        },
        () => isCancelledRef.current
      );

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? {
                ...m,
                totalTokens: result.tokens.length,
                totalTimeMs: result.totalTimeMs,
                avgTokPerSec: result.avgTokPerSec
              }
            : m
        )
      );
    } catch (err) {
      console.error("Inference simulation error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    isCancelledRef.current = true;
    setIsRunning(false);
  };

  const handlePresetSelect = (preset: PromptPreset) => {
    setInputPrompt(preset.prompt);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] max-w-7xl mx-auto px-2 sm:px-4 py-3 gap-3">
      {/* Top Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs font-mono">
        <div className="bg-[#0f1422] border border-slate-800 rounded-lg p-2 flex flex-col">
          <span className="text-slate-400 text-[10px]">CURRENT SPEED</span>
          <span className="text-cyan-400 font-bold text-sm sm:text-base">
            {activeTelemetry.tokPerSec > 0 ? `${activeTelemetry.tokPerSec} tok/s` : `${BONSAI_MODEL_SPECS.mtp4EffectiveTokPerSec} tok/s`}
          </span>
          <span className="text-[10px] text-slate-500">MTP 4x Speculative</span>
        </div>

        <div className="bg-[#0f1422] border border-slate-800 rounded-lg p-2 flex flex-col">
          <span className="text-slate-400 text-[10px]">STEP LATENCY</span>
          <span className="text-emerald-400 font-bold text-sm sm:text-base">
            {activeTelemetry.latencyPerTokMs > 0 ? `${activeTelemetry.latencyPerTokMs} ms/tok` : `153 ms/tok`}
          </span>
          <span className="text-[10px] text-slate-500">
            {activeTelemetry.lastBatchMode === 'mtp4' ? 'B=4 Verified' : 'B=1 Decode (345ms)'}
          </span>
        </div>

        <div className="bg-[#0f1422] border border-slate-800 rounded-lg p-2 flex flex-col">
          <span className="text-slate-400 text-[10px]">DRAM CEILING</span>
          <span className="text-amber-400 font-bold text-sm sm:text-base">81.1% Limit</span>
          <span className="text-[10px] text-slate-500">T_floor = 279.8ms</span>
        </div>

        <div className="bg-[#0f1422] border border-slate-800 rounded-lg p-2 flex flex-col">
          <span className="text-slate-400 text-[10px]">FASTRPC CALLS</span>
          <span className="text-purple-400 font-bold text-sm sm:text-base">66 / Step</span>
          <span className="text-[10px] text-slate-500">0 ms SMMU remap</span>
        </div>

        <div className="bg-[#0f1422] border border-slate-800 rounded-lg p-2 flex flex-col">
          <span className="text-slate-400 text-[10px]">KV CACHE (TURBO4)</span>
          <span className="text-cyan-300 font-bold text-sm sm:text-base">16 KiB / tok</span>
          <span className="text-[10px] text-slate-500">4-Bit Vectorized</span>
        </div>

        <div className="bg-[#0f1422] border border-slate-800 rounded-lg p-2 flex flex-col">
          <span className="text-slate-400 text-[10px]">BUS BOOST</span>
          <span className="text-emerald-300 font-bold text-sm sm:text-base">DDR 4761 MHz</span>
          <span className="text-[10px] text-slate-500">LLCC 1211 MHz</span>
        </div>
      </div>

      {/* Main Chat & Telemetry Split */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
        {/* Chat Conversation View */}
        <div className="flex-1 flex flex-col bg-[#0b0f19] border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
          {/* Chat Header */}
          <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <TermIcon className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">Terminal REPL / OpenAI SSE Stream</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-[11px] text-slate-400">/v1/chat/completions</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                  showSettings ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Generation Hyperparameters"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sampling</span>
              </button>

              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                title="Reset Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hyperparameters Drawer */}
          {showSettings && (
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in slide-in-from-top-2">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Temperature (--temp):</span>
                  <span className="font-mono text-cyan-400">{settings.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={settings.temperature}
                  onChange={e => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Top-P (--top-p):</span>
                  <span className="font-mono text-cyan-400">{settings.topP}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.topP}
                  onChange={e => setSettings({ ...settings, topP: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>MTP Drafts (max_drafts):</span>
                  <span className="font-mono text-emerald-400">{settings.maxDrafts}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={settings.maxDrafts}
                  onChange={e => setSettings({ ...settings, maxDrafts: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.turbo4}
                    onChange={e => setSettings({ ...settings, turbo4: e.target.checked })}
                    className="rounded accent-cyan-500 w-4 h-4"
                  />
                  <span className="text-slate-300 font-medium">Turbo4 (4-bit KV)</span>
                </label>
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                    msg.role === 'user' ? 'text-cyan-400' : 'text-emerald-400'
                  }`}>
                    {msg.role === 'user' ? 'Client / User' : 'Bonsai-2-27B (NPU)'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  {msg.role === 'assistant' && msg.content && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="text-slate-500 hover:text-slate-300 p-0.5"
                      title="Copy Output"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-600/20 text-cyan-50 border border-cyan-500/30'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-sans">{msg.content}</p>

                  {/* Assistant Telemetry footer if completed */}
                  {msg.role === 'assistant' && msg.totalTokens && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span className="text-emerald-400 font-bold">
                        {msg.avgTokPerSec} tok/s sustained
                      </span>
                      <span className="text-slate-600">•</span>
                      <span>{msg.totalTokens} tokens in {msg.totalTimeMs} ms</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-cyan-300">
                        ~{Math.round(msg.totalTimeMs! / msg.totalTokens)} ms/tok avg
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Currently generating indicator */}
            {isRunning && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono p-2 bg-cyan-950/30 border border-cyan-800/40 rounded-lg">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Hexagon v79 HVX streaming monolithic weights... (66 FastRPC calls/step)</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preset Prompts Pills */}
          <div className="px-3 py-1.5 bg-slate-900/40 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 flex-shrink-0 text-[11px]">Benchmarks:</span>
            {SAMPLE_PROMPTS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors text-[11px]"
              >
                {preset.title}
              </button>
            ))}
          </div>

          {/* Prompt Input Form */}
          <div className="p-3 bg-slate-900/80 border-t border-slate-800">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleRunInference();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                placeholder="Enter prompt for Bonsai-2-27B (Snapdragon 8 Elite Hexagon NPU)..."
                disabled={isRunning}
                className="flex-1 bg-slate-950/90 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />

              {isRunning ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Halt</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputPrompt.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-900/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute</span>
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Live Hardware & MTP Step Telemetry Log */}
        <div className="lg:w-96 flex flex-col bg-[#0b0f19] border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
          <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">Live Hardware Telemetry</span>
            </div>

            <button
              onClick={() => setShowNpuLog(!showNpuLog)}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              {showNpuLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showNpuLog && (
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-[11px] font-mono bg-black/40">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-slate-400">
                <div className="text-cyan-400 font-bold mb-1">[fwd] NPU Architecture State</div>
                <div>Static Layers: 30 (2.82 GiB SMMU)</div>
                <div>Static LM Head: 322 MB (248,320 vocab)</div>
                <div>Ring Arena: 34 Streamed Layers (194 MB)</div>
                <div>KV Cache: 4-bit TurboQuant (16 KiB/tok)</div>
              </div>

              {activeTelemetry.prefillStats.count > 0 && (
                <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/50 text-cyan-300">
                  <div className="font-bold">prefill {activeTelemetry.prefillStats.count} toks in {activeTelemetry.prefillStats.durationMs} ms</div>
                  <div className="text-slate-400">{(activeTelemetry.prefillStats.durationMs / activeTelemetry.prefillStats.count).toFixed(1)} ms/tok (6.23 tok/s)</div>
                </div>
              )}

              {currentStepTokens.slice(-8).map((tok, i) => (
                <div
                  key={`${tok.id}-${i}`}
                  className={`p-2 rounded border transition-all ${
                    tok.batchMode === 'mtp4'
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                      : tok.batchMode === 'mtp2'
                      ? 'bg-blue-950/30 border-blue-800/60 text-blue-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {tok.batchMode === 'mtp4' ? 'step [MTP 4x MATCH!]' : tok.batchMode === 'mtp2' ? 'step [MTP 2x MATCH!]' : 'step [Single-Token B=1]'}
                    </span>
                    <span className="text-[10px] text-slate-400">{tok.latencyMs} ms/tok</span>
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5 truncate">
                    tok={tok.id}("{tok.text}") • logit={tok.logit}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 flex justify-between">
                    <span>NPU_RPC=66 calls</span>
                    <span>SMMU remap=0.00ms</span>
                  </div>
                </div>
              ))}

              {currentStepTokens.length === 0 && (
                <div className="p-4 text-center text-slate-500 italic">
                  Awaiting generation step telemetry...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
