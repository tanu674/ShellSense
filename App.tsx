import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { InteractiveTerminal } from './components/InteractiveTerminal';
import { CommandHistoryView } from './components/CommandHistoryView';
import { SafetyCenterView } from './components/SafetyCenterView';
import { LearningModeView } from './components/LearningModeView';
import { SettingsModal } from './components/SettingsModal';
import { AppSettings } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<'online' | 'local_fallback'>('online');
  const [learningInitialTopic, setLearningInitialTopic] = useState<string | undefined>(undefined);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('shellsense_settings');
      if (saved) {
        return {
          aiMode: 'cloud',
          demoMode: false,
          strictSafety: true,
          terminalFont: 'jetbrains',
          syntaxTheme: 'emerald',
          ...JSON.parse(saved)
        };
      }
    } catch (e) {
      // ignore
    }
    return {
      aiMode: 'cloud',
      demoMode: false,
      strictSafety: true,
      terminalFont: 'jetbrains',
      syntaxTheme: 'emerald'
    };
  });

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('shellsense_settings', JSON.stringify(newSettings));
    } catch (e) {
      // ignore
    }
  };

  // Check health and AI connectivity on load
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setAiStatus(data.hasGeminiKey ? 'online' : 'local_fallback');
        }
      })
      .catch(() => {
        setAiStatus('local_fallback');
      });
  }, []);

  const handleStartFromLanding = () => {
    setShowLanding(false);
    setCurrentTab('dashboard');
  };

  const handleRunDemoScenario = (scenario: number) => {
    setShowLanding(false);
    setCurrentTab('dashboard');
  };

  const handleNavigateToLearning = (topicId: string) => {
    setLearningInitialTopic(topicId);
    setCurrentTab('learning');
  };

  const handleSendPromptToDashboard = (promptText: string) => {
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#A1A1AA] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        showLanding={showLanding}
        setShowLanding={setShowLanding}
        settings={settings}
        openSettings={() => setIsSettingsOpen(true)}
        aiStatus={aiStatus}
        onRunDemoScenario={handleRunDemoScenario}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar (Hidden on landing page or mobile) */}
        {!showLanding && (
          <div className="hidden md:flex flex-col">
            <Sidebar
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              openSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        )}

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {showLanding ? (
            <LandingPage
              onStart={handleStartFromLanding}
              onRunDemo={handleRunDemoScenario}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  settings={settings}
                  onNavigateToLearning={handleNavigateToLearning}
                />
              )}

              {currentTab === 'terminal' && (
                <InteractiveTerminal settings={settings} />
              )}

              {currentTab === 'history' && (
                <CommandHistoryView settings={settings} />
              )}

              {currentTab === 'safety' && (
                <SafetyCenterView />
              )}

              {currentTab === 'learning' && (
                <LearningModeView
                  initialTopicId={learningInitialTopic}
                  onSendToDashboard={handleSendPromptToDashboard}
                  settings={settings}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {!showLanding && (
        <div className="md:hidden border-t border-[#27272A] bg-black/95 backdrop-blur-md px-2 py-2 flex items-center justify-around text-[10px] font-mono">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded ${currentTab === 'dashboard' ? 'text-emerald-400' : 'text-[#71717A]'}`}
          >
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentTab('terminal')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded ${currentTab === 'terminal' ? 'text-emerald-400' : 'text-[#71717A]'}`}
          >
            <span>Terminal</span>
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded ${currentTab === 'history' ? 'text-emerald-400' : 'text-[#71717A]'}`}
          >
            <span>History</span>
          </button>
          <button
            onClick={() => setCurrentTab('safety')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded ${currentTab === 'safety' ? 'text-emerald-400' : 'text-[#71717A]'}`}
          >
            <span>Safety</span>
          </button>
          <button
            onClick={() => setCurrentTab('learning')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded ${currentTab === 'learning' ? 'text-emerald-400' : 'text-[#71717A]'}`}
          >
            <span>Learning</span>
          </button>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
