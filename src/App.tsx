import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ChatInferenceView } from './components/ChatInferenceView';
import { RooflineTelemetryView } from './components/RooflineTelemetryView';
import { LayerArchitectureView } from './components/LayerArchitectureView';
import { ApiConsoleView } from './components/ApiConsoleView';
import { BenchmarkHistoryView } from './components/BenchmarkHistoryView';
import { AndroidDeviceShell } from './components/AndroidDeviceShell';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(false);
  const [isRunningInference, setIsRunningInference] = useState<boolean>(false);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <ChatInferenceView
            isRunning={isRunningInference}
            setIsRunning={setIsRunningInference}
          />
        );
      case 'roofline':
        return <RooflineTelemetryView />;
      case 'architecture':
        return <LayerArchitectureView />;
      case 'api':
        return <ApiConsoleView />;
      case 'benchmarks':
        return <BenchmarkHistoryView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDeviceFrame={isDeviceFrame}
        setIsDeviceFrame={setIsDeviceFrame}
        isRunningInference={isRunningInference}
      />

      <main className="flex-1">
        {isDeviceFrame ? (
          <AndroidDeviceShell activeModelName="Bonsai-2-27B NPU">
            {renderActiveTabContent()}
          </AndroidDeviceShell>
        ) : (
          renderActiveTabContent()
        )}
      </main>
    </div>
  );
};

export default App;
