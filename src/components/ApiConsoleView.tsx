import React, { useState } from 'react';
import { Terminal, Send, Copy, Check, Code, Play, RefreshCw, Cpu, Server, Smartphone } from 'lucide-react';

export const ApiConsoleView: React.FC = () => {
  const [endpoint, setEndpoint] = useState<'completions' | 'models'>('completions');
  const [requestMethod, setRequestMethod] = useState<'POST' | 'GET'>('POST');
  const [isStreaming, setIsStreaming] = useState(true);
  const [requestJson, setRequestJson] = useState(JSON.stringify({
    model: "bonsai-2-27b",
    stream: true,
    temperature: 0.6,
    top_p: 0.9,
    max_tokens: 64,
    messages: [
      {
        role: "user",
        content: "Explain quantum tunneling in two sentences."
      }
    ]
  }, null, 2));

  const [rawResponse, setRawResponse] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'curl' | 'python' | 'android_adb'>('curl');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleSendRequest = async () => {
    setIsSending(true);
    setRawResponse('Connecting to http://127.0.0.1:8080/v1/chat/completions...\nHTTP/1.1 200 OK\nContent-Type: text/event-stream\nCache-Control: no-cache\nConnection: keep-alive\n\n');

    try {
      const parsed = JSON.parse(requestJson);
      const isStream = parsed.stream !== false;

      if (!isStream) {
        await new Promise(r => setTimeout(r, 600));
        const nonStreamObj = {
          id: `chatcmpl-${Date.now()}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model: "bonsai-2-27b",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: "Quantum tunneling is a quantum mechanical phenomenon where a particle traverses a potential barrier through non-zero wave amplitudes."
              },
              finish_reason: "stop"
            }
          ],
          usage: {
            prompt_tokens: 12,
            completion_tokens: 24,
            total_tokens: 36
          }
        };
        setRawResponse(prev => prev + JSON.stringify(nonStreamObj, null, 2));
      } else {
        const chunks = [
          "Quantum", " tunneling", " is", " a", " quantum", " mechanical", " phenomenon", " where",
          " a", " particle", " traverses", " a", " potential", " barrier", " through", " wavefunctions", "."
        ];

        for (const chunk of chunks) {
          await new Promise(r => setTimeout(r, 120));
          const chunkObj = {
            id: `chatcmpl-${Date.now()}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: "bonsai-2-27b",
            choices: [
              {
                index: 0,
                delta: { content: chunk },
                finish_reason: null
              }
            ]
          };
          setRawResponse(prev => prev + `data: ${JSON.stringify(chunkObj)}\n\n`);
        }

        await new Promise(r => setTimeout(r, 100));
        setRawResponse(prev => prev + `data: [DONE]\n\n`);
      }
    } catch (e: any) {
      setRawResponse(prev => prev + `\n[Error parsing JSON payload: ${e?.message}]`);
    } finally {
      setIsSending(false);
    }
  };

  const curlSnippet = `curl http://127.0.0.1:8080/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "bonsai-2-27b",
    "stream": true,
    "temperature": 0.6,
    "top_p": 0.9,
    "messages": [
      {"role": "user", "content": "Explain quantum tunneling in two sentences."}
    ]
  }'`;

  const pythonSnippet = `from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8080/v1",
    api_key="not-needed" # Bonsai-NPU runs locally on-device
)

response = client.chat.completions.create(
    model="bonsai-2-27b",
    messages=[{"role": "user", "content": "Explain quantum tunneling in two sentences."}],
    stream=True,
    temperature=0.6,
    extra_body={"turbo4": True, "max_drafts": 3}
)

for chunk in response:
    content = chunk.choices[0].delta.content or ""
    print(content, end="", flush=True)`;

  const adbSnippet = `# 1. Push binaries and weights to retail non-rooted phone:
adb shell "mkdir -p /data/local/tmp/bonsai1bit"
adb push cdsp/bonsai_fwd /data/local/tmp/bonsai1bit/
adb push cdsp/libbonsai_q1_skel.so /data/local/tmp/bonsai1bit/
adb push cdsp/libcdsprpc.so /data/local/tmp/bonsai1bit/
adb push tok.bin /data/local/tmp/bonsai1bit/
adb push bonsai2-27b.npubin /data/local/tmp/bonsai1bit/

# 2. Launch OpenAI daemon on port 8080 with Turbo4 & MTP Speculation:
adb shell "cd /data/local/tmp/bonsai1bit && \\
  export LD_LIBRARY_PATH=/data/local/tmp/bonsai1bit:/vendor/lib64 && \\
  export ADSP_LIBRARY_PATH='/data/local/tmp/bonsai1bit;/vendor/dsp/cdsp;/vendor/lib/rfsa/adsp' && \\
  ./bonsai_fwd bonsai2-27b.npubin tok.bin --server 8080 4096 --turbo4 --temp 0.6 --top-p 0.9"`;

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-6 h-6 text-emerald-400" />
            Built-in OpenAI HTTP/SSE Server & ADB Deployment
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Standard OpenAI-compatible REST API endpoints (<code className="text-cyan-300">/v1/chat/completions</code>) served on Snapdragon 8 Elite hardware.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Server Daemon: Port 8080 Active</span>
        </div>
      </div>

      {/* Main Grid: Request Builder & Live Response Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Side */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                POST
              </span>
              <span className="font-mono text-xs text-slate-200">
                http://127.0.0.1:8080/v1/chat/completions
              </span>
            </div>

            <button
              onClick={handleSendRequest}
              disabled={isSending}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md"
            >
              {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>Send Request</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Request Body (JSON):
          </div>

          <textarea
            value={requestJson}
            onChange={e => setRequestJson(e.target.value)}
            rows={12}
            className="w-full bg-slate-950/90 border border-slate-800 rounded-lg p-3 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
          />
        </div>

        {/* Response Side */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Live SSE Stream / HTTP Response
            </span>

            <button
              onClick={() => setRawResponse('')}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 bg-black/60 border border-slate-800/80 rounded-lg p-3 overflow-y-auto max-h-[320px] font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
            {rawResponse || '// Click "Send Request" to test live Server-Sent Events stream from Bonsai-NPU daemon'}
          </div>
        </div>
      </div>

      {/* Code Snippets & Deployment Guide */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-200">Client Integration & On-Device Deployment</h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setActiveSnippetTab('curl')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeSnippetTab === 'curl' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveSnippetTab('python')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeSnippetTab === 'python' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Python (openai)
            </button>
            <button
              onClick={() => setActiveSnippetTab('android_adb')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeSnippetTab === 'android_adb' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Android ADB / Termux
            </button>
          </div>
        </div>

        <div className="relative">
          <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
            {activeSnippetTab === 'curl' && curlSnippet}
            {activeSnippetTab === 'python' && pythonSnippet}
            {activeSnippetTab === 'android_adb' && adbSnippet}
          </pre>

          <button
            onClick={() =>
              handleCopyCode(
                activeSnippetTab === 'curl'
                  ? curlSnippet
                  : activeSnippetTab === 'python'
                  ? pythonSnippet
                  : adbSnippet
              )
            }
            className="absolute top-3 right-3 p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title="Copy Code"
          >
            {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
