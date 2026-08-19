import React from 'react';
import { 
  X, 
  Settings, 
  Cpu, 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  Terminal, 
  Sparkles, 
  Check,
  Type,
  Palette,
  Eye
} from 'lucide-react';
import { AppSettings, TerminalFont, SyntaxTheme } from '../types';
import { TERMINAL_FONTS, SYNTAX_THEMES, getFontFamily, getSyntaxTheme } from '../lib/themeConfig';
import { CommandHighlighter } from './CommandHighlighter';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const [resetSuccess, setResetSuccess] = React.useState(false);

  if (!isOpen) return null;

  const handleResetSandbox = async () => {
    try {
      await fetch('/api/sandbox/reset', { method: 'POST' });
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const currentFont = settings.terminalFont || 'jetbrains';
  const currentTheme = settings.syntaxTheme || 'emerald';

  const previewCommand = 'find /var/log -type f -name "*.log" -mtime +30 -exec rm -f {} +';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#27272A] border border-[#3F3F46] text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white font-mono text-base">Terminal & System Settings</h3>
              <p className="text-xs text-[#71717A]">Customize terminal fonts, syntax color schemes, and safety policies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs font-mono">
          {/* Live Command Preview Box */}
          <div className="p-4 rounded-xl bg-black border border-[#27272A] space-y-2">
            <div className="flex items-center justify-between text-[#71717A] text-[10px] uppercase font-bold">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Syntax & Typography Preview</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                {TERMINAL_FONTS.find(f => f.id === currentFont)?.name} &bull; {SYNTAX_THEMES.find(t => t.id === currentTheme)?.name}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-[#09090B] border border-[#27272A] overflow-x-auto">
              <CommandHighlighter
                command={previewCommand}
                font={currentFont}
                theme={currentTheme}
                showPrompt={true}
                textClassName="text-sm"
              />
            </div>
          </div>

          {/* Section: Terminal Typography (Font Selection) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white uppercase text-[11px] font-bold">
              <Type className="w-3.5 h-3.5 text-emerald-400" />
              <span>Terminal Monospace Font</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {TERMINAL_FONTS.map((f) => {
                const isSelected = currentFont === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => onUpdateSettings({ ...settings, terminalFont: f.id })}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between space-y-1.5 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm'
                        : 'bg-black border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs" style={{ fontFamily: f.fontFamily }}>
                        {f.name}
                      </span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : f.ligatures ? (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-[#27272A] text-[#71717A] font-mono">
                          Ligatures
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-[#71717A] font-sans line-clamp-2 leading-tight">
                      {f.description}
                    </p>
                    <div 
                      className="text-[11px] text-[#E4E4E7] bg-[#18181B] px-2 py-1 rounded border border-[#27272A] truncate"
                      style={{ fontFamily: f.fontFamily }}
                    >
                      $ sudo apt --yes update
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Syntax Highlighting Color Schemes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white uppercase text-[11px] font-bold">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Command Syntax Highlighting Scheme</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SYNTAX_THEMES.map((theme) => {
                const isSelected = currentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onUpdateSettings({ ...settings, syntaxTheme: theme.id })}
                    className={`p-3 rounded-xl text-left border transition-all space-y-2 ${
                      isSelected
                        ? 'bg-[#18181B] border-emerald-500 text-white ring-1 ring-emerald-500/50'
                        : 'bg-black border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {theme.previewDots.map((colorClass, dotIdx) => (
                            <span key={dotIdx} className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                          ))}
                        </div>
                        <span className="font-bold text-xs font-mono">{theme.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] text-[#71717A] font-sans leading-tight">
                      {theme.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: AI Engine & Privacy */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-white uppercase text-[11px] font-bold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Execution Engine & Privacy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cloud AI */}
              <button
                onClick={() => onUpdateSettings({ ...settings, aiMode: 'cloud' })}
                className={`p-3.5 rounded-xl text-left border transition-all space-y-1.5 ${
                  settings.aiMode === 'cloud'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-black border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold font-mono">Cloud AI (Gemini 3.7)</span>
                  </div>
                  {settings.aiMode === 'cloud' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[10px] text-[#71717A] font-sans leading-relaxed">
                  Leverages Gemini 3.7 Flash for deep, natural Linux shell reasoning.
                </p>
              </button>

              {/* Local AI */}
              <button
                onClick={() => onUpdateSettings({ ...settings, aiMode: 'local' })}
                className={`p-3.5 rounded-xl text-left border transition-all space-y-1.5 ${
                  settings.aiMode === 'local'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-black border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold font-mono">Local Offline Engine</span>
                  </div>
                  {settings.aiMode === 'local' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[10px] text-[#71717A] font-sans leading-relaxed">
                  Keeps system queries strictly local. Prepared for Ollama edge models.
                </p>
              </button>
            </div>
          </div>

          {/* Toggle options */}
          <div className="space-y-3 pt-2">
            {/* Demo Mode Toggle */}
            <div className="p-3.5 rounded-xl bg-black border border-[#27272A] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-white font-mono text-xs">Offline / Hackathon Demo Mode</span>
                <p className="text-[10px] text-[#71717A] font-sans">
                  Uses instant deterministic template responses for zero-latency presentation.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.demoMode}
                  onChange={(e) => onUpdateSettings({ ...settings, demoMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#27272A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#3F3F46] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Strict Safety Interlock */}
            <div className="p-3.5 rounded-xl bg-black border border-[#27272A] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-white font-mono text-xs">Strict Safety Interlock</span>
                <p className="text-[10px] text-[#71717A] font-sans">
                  Requires interactive checkboxes on all state mutations and completely blocks destructive patterns.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.strictSafety}
                  onChange={(e) => onUpdateSettings({ ...settings, strictSafety: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#27272A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#3F3F46] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Virtual Filesystem Sandbox Reset */}
            <div className="p-3.5 rounded-xl bg-black border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-white font-mono text-xs">Reset Sandbox Virtual Filesystem</span>
                <p className="text-[10px] text-[#71717A] font-sans">
                  Restores default directories (/home/user, /projects, /documents, /logs) and simulated processes.
                </p>
              </div>

              <button
                onClick={handleResetSandbox}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white font-mono text-xs transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>{resetSuccess ? 'Reset Complete!' : 'Reset FS State'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#27272A] bg-black/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors"
          >
            Save & Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
