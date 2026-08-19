import React from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  Cpu, 
  Settings, 
  ExternalLink,
  Zap,
  PlayCircle
} from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  showLanding: boolean;
  setShowLanding: (show: boolean) => void;
  settings: AppSettings;
  openSettings: () => void;
  aiStatus: 'online' | 'local_fallback';
  onRunDemoScenario?: (scenario: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  showLanding,
  setShowLanding,
  settings,
  openSettings,
  aiStatus,
  onRunDemoScenario
}) => {
  return (
    <header className="border-b border-[#27272A] bg-[#09090B]/95 backdrop-blur-md sticky top-0 z-40 px-6 h-16 flex items-center">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowLanding(false)}
            className="flex items-center gap-3 text-left group focus:outline-none"
            id="brand-logo-btn"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center text-black font-bold text-base shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg text-white tracking-tight">ShellSense</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#18181B] text-[#71717A] border border-[#27272A]">
                  v2.4
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Status Indicators */}
        <div className="hidden md:flex items-center gap-6">
          {/* AI Status */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#71717A] uppercase font-bold tracking-tighter">Status:</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
              aiStatus === 'online'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            }`}>
              {aiStatus === 'online' ? 'AI Online' : 'Local Fallback'}
            </span>
          </div>

          {/* Safety Engine Status */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#71717A] uppercase font-bold tracking-tighter">Risk Engine:</span>
            <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Active Shield
            </span>
          </div>

          {/* Environment Badge */}
          <div className="text-[11px] text-[#71717A] bg-[#18181B] px-3 py-1 rounded border border-[#27272A] font-mono tracking-wider">
            LINUX SANDBOX
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {showLanding ? (
            <button
              onClick={() => setShowLanding(false)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors shadow-sm"
              id="open-dashboard-btn"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Launch App</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLanding(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white text-xs transition-colors"
              id="view-overview-btn"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#71717A]" />
              <span>Overview</span>
            </button>
          )}

          {/* Settings Trigger */}
          <button
            onClick={openSettings}
            className="w-8 h-8 rounded-full border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors"
            title="Configure Settings & AI Mode"
            id="header-settings-btn"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
