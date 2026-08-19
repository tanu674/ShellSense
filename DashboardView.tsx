import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Terminal as TerminalIcon, 
  Copy, 
  Check, 
  Play, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Ban, 
  Edit3, 
  HelpCircle, 
  Info, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Code2,
  Layers,
  Clock,
  Sparkle
} from 'lucide-react';
import { 
  GeneratedCommandResult, 
  ExecutionResult, 
  RiskLevel, 
  AppSettings 
} from '../types';
import { CommandHighlighter } from './CommandHighlighter';
import { getFontFamily, getSyntaxTheme } from '../lib/themeConfig';

interface DashboardViewProps {
  settings: AppSettings;
  onNavigateToLearning?: (topicId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  onNavigateToLearning
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedCommandResult | null>(null);
  
  // Inline edit state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedCommand, setEditedCommand] = useState<string>('');
  
  // Confirmation state for Medium/High/Critical
  const [hasConfirmedRisk, setHasConfirmedRisk] = useState<boolean>(false);
  
  // Execution state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  
  // Copy feedback
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);

  const examplePrompts = [
    { label: 'List all files in this directory', prompt: 'Show all files in the current directory with details and hidden files' },
    { label: 'Find large files', prompt: 'Find all files larger than 10MB in the current directory' },
    { label: 'Check disk usage', prompt: 'Check total and available disk space in human readable format' },
    { label: 'Find running Python processes', prompt: 'Show running Python processes sorted by memory usage' },
    { label: 'Create a project folder', prompt: 'Create a folder called projects/hackathon-2026' },
    { label: 'Delete temporary files', prompt: 'Delete old temporary log files in /tmp directory' },
    { label: 'Test blocked critical command', prompt: 'Delete everything recursively from root directory rm -rf /' }
  ];

  // Helper to trigger generation
  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt || prompt;
    if (!textToUse.trim()) return;

    setIsGenerating(true);
    setExecutionResult(null);
    setExecutionError(null);
    setHasConfirmedRisk(false);
    setIsEditing(false);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToUse,
          mode: settings.aiMode,
          isDemo: settings.demoMode
        })
      });

      if (!res.ok) {
        throw new Error(`Generation failed: ${res.statusText}`);
      }

      const data: GeneratedCommandResult = await res.json();
      setGeneratedResult(data);
      setEditedCommand(data.command);
    } catch (err: any) {
      console.error('Error generating command:', err);
      // Fallback in-client response for safety
      setGeneratedResult({
        original_prompt: textToUse,
        command: `find . -name "*${textToUse.slice(0, 10).trim()}*"`,
        explanation: 'Searches the current directory for files matching your query.',
        risk_level: 'LOW',
        risk_reason: 'Safe read-only search operation.',
        flags: [{ flag: '-name', meaning: 'Pattern search on filename' }],
        requires_confirmation: false,
        source: 'local_fallback'
      });
      setEditedCommand(`find . -name "*${textToUse.slice(0, 10).trim()}*"`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to re-analyze risk if command was edited
  const handleReanalyzeEdited = async () => {
    if (!editedCommand.trim()) return;
    try {
      const res = await fetch('/api/analyze-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: editedCommand })
      });
      if (res.ok) {
        const analysis = await res.json();
        if (generatedResult) {
          setGeneratedResult({
            ...generatedResult,
            command: editedCommand,
            risk_level: analysis.risk_level,
            risk_reason: analysis.risk_reason,
            requires_confirmation: analysis.requires_confirmation,
            is_blocked: analysis.is_blocked,
            flags: analysis.flags,
            warnings: analysis.warnings,
            safe_alternatives: analysis.safe_alternatives
          });
        }
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to re-analyze command:', err);
    }
  };

  // Helper to execute command
  const handleExecute = async () => {
    const activeCommand = isEditing ? editedCommand : (generatedResult?.command || '');
    if (!activeCommand) return;

    setIsExecuting(true);
    setExecutionError(null);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: activeCommand,
          prompt: generatedResult?.original_prompt || prompt,
          confirmed: hasConfirmedRisk,
          source: generatedResult?.source || 'gemini'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setExecutionError(data.error || 'Execution halted by safety interlocks.');
        setExecutionResult(null);
      } else {
        setExecutionResult(data);
        setExecutionError(null);
      }
    } catch (err: any) {
      setExecutionError(err.message || 'Network error during execution.');
    } finally {
      setIsExecuting(false);
    }
  };

  // Copy command to clipboard
  const handleCopyCommand = () => {
    const text = isEditing ? editedCommand : (generatedResult?.command || '');
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Copy terminal output
  const handleCopyOutput = () => {
    if (executionResult?.stdout) {
      navigator.clipboard.writeText(executionResult.stdout);
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  // Risk styling helper
  const getRiskBadge = (level?: RiskLevel, isBlocked?: boolean) => {
    if (isBlocked || level === 'CRITICAL') {
      return {
        bg: 'bg-red-500/20 text-red-500',
        badge: 'CRITICAL RISK',
        titleColor: 'text-red-500',
        labelColor: 'text-red-400',
        sub: 'Execution blocked or strictly guarded against filesystem damage',
        icon: Ban,
        borderCard: 'bg-[#450a0a]/20 border-2 border-red-900/50 rounded-xl p-5',
        buttonBg: 'bg-red-600 hover:bg-red-500 text-white'
      };
    }
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-red-500/20 text-red-500',
          badge: 'HIGH RISK',
          titleColor: 'text-red-500',
          labelColor: 'text-red-400',
          sub: 'Contains destructive operations that may alter or remove data from your system',
          icon: ShieldAlert,
          borderCard: 'bg-[#450a0a]/20 border-2 border-red-900/50 rounded-xl p-5',
          buttonBg: 'bg-red-600 hover:bg-red-500 text-white'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/20 text-amber-500',
          badge: 'MEDIUM RISK',
          titleColor: 'text-amber-500',
          labelColor: 'text-amber-400',
          sub: 'Modifies files or system state — review flags before execution',
          icon: AlertTriangle,
          borderCard: 'bg-[#451a03]/20 border-2 border-amber-900/50 rounded-xl p-5',
          buttonBg: 'bg-amber-500 hover:bg-amber-400 text-black'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-500',
          badge: 'LOW RISK',
          titleColor: 'text-emerald-400',
          labelColor: 'text-emerald-400',
          sub: 'Safe read-only informational query',
          icon: ShieldCheck,
          borderCard: 'bg-[#064e3b]/20 border-2 border-emerald-900/50 rounded-xl p-5',
          buttonBg: 'bg-emerald-500 hover:bg-emerald-400 text-black'
        };
    }
  };

  const riskMeta = getRiskBadge(generatedResult?.risk_level, generatedResult?.is_blocked);
  const RiskIcon = riskMeta.icon;

  const isExecutionDisabled = Boolean(
    isExecuting ||
    generatedResult?.is_blocked ||
    ((generatedResult?.risk_level === 'HIGH' || generatedResult?.risk_level === 'MEDIUM' || generatedResult?.risk_level === 'CRITICAL') && !hasConfirmedRisk)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Demo Scenario Quick Bar */}
      <div className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkle className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-white">Demo Scenarios:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const p = 'Show all files in the current directory with details and hidden files';
              setPrompt(p);
              handleGenerate(p);
            }}
            className="px-3 py-1 rounded bg-[#09090B] hover:bg-[#27272A] border border-emerald-500/30 text-emerald-300 text-xs font-mono transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>1. Safe (ls -la)</span>
          </button>

          <button
            onClick={() => {
              const p = 'Create a folder called hackathon';
              setPrompt(p);
              handleGenerate(p);
            }}
            className="px-3 py-1 rounded bg-[#09090B] hover:bg-[#27272A] border border-amber-500/30 text-amber-300 text-xs font-mono transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>2. Medium (mkdir)</span>
          </button>

          <button
            onClick={() => {
              const p = 'Delete old log files in /tmp';
              setPrompt(p);
              handleGenerate(p);
            }}
            className="px-3 py-1 rounded bg-[#09090B] hover:bg-[#27272A] border border-red-500/30 text-red-300 text-xs font-mono transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span>3. High (find -delete)</span>
          </button>

          <button
            onClick={() => {
              const p = 'Delete everything recursively from root directory rm -rf /';
              setPrompt(p);
              handleGenerate(p);
            }}
            className="px-3 py-1 rounded bg-[#09090B] hover:bg-[#27272A] border border-red-500/50 text-red-400 text-xs font-mono transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>4. Critical (rm -rf /)</span>
          </button>
        </div>
      </div>

      {/* Section 1: Main Natural Language Input Box */}
      <div className="space-y-4">
        <h2 className="text-2xl font-light text-white">
          Tell <span className="font-semibold text-emerald-400">ShellSense</span> what you want to do.
        </h2>

        {/* Input & Action Button */}
        <div className="relative group">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="Find all python files in documents larger than 5MB and delete them"
            className="w-full bg-[#18181B] border-2 border-[#27272A] group-focus-within:border-emerald-500/50 rounded-xl px-6 py-4 text-base sm:text-lg text-white font-medium outline-none transition-all pr-44 sm:pr-48"
            id="prompt-input"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !prompt.trim()}
            id="generate-command-btn"
            className="absolute right-3 top-3 bottom-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-[#27272A] disabled:text-[#71717A] text-black px-6 rounded-lg font-bold text-xs sm:text-sm transition-colors tracking-wide flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">GENERATING...</span>
              </>
            ) : (
              <span>GENERATE COMMAND</span>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          {examplePrompts.slice(0, 5).map((ex, idx) => (
            <button
              key={idx}
              id={`example-prompt-${idx}`}
              onClick={() => {
                setPrompt(ex.prompt);
                handleGenerate(ex.prompt);
              }}
              className="px-3 py-1 bg-[#18181B] text-[#71717A] text-[11px] rounded-full border border-[#27272A] cursor-pointer hover:border-[#3F3F46] hover:text-white transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Result Container */}
      {generatedResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col (8 cols): Generated Command & Explanation */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-[#18181B] rounded-xl border border-[#27272A] p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest">
                    Generated Command
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyCommand}
                      id="copy-command-btn"
                      className="px-2.5 py-1 text-[10px] bg-[#27272A] text-white rounded hover:bg-[#3F3F46] uppercase font-bold transition-colors flex items-center gap-1"
                    >
                      {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCmd ? 'COPIED' : 'COPY'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      id="edit-command-btn"
                      className={`px-2.5 py-1 text-[10px] rounded uppercase font-bold transition-colors ${
                        isEditing ? 'bg-indigo-600 text-white' : 'bg-[#27272A] text-white hover:bg-[#3F3F46]'
                      }`}
                    >
                      {isEditing ? 'DONE' : 'EDIT'}
                    </button>
                  </div>
                </div>

                {/* Terminal code block */}
                <div 
                  className="bg-[#09090B] p-4 rounded-lg border border-[#27272A] text-sm break-all"
                  style={{ fontFamily: getFontFamily(settings.terminalFont) }}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editedCommand}
                        onChange={(e) => setEditedCommand(e.target.value)}
                        style={{ fontFamily: getFontFamily(settings.terminalFont) }}
                        className="w-full bg-[#18181B] border border-emerald-500 rounded px-3 py-1.5 text-emerald-300 text-sm focus:outline-none"
                      />
                      <button
                        onClick={handleReanalyzeEdited}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs transition-colors"
                      >
                        Apply & Re-analyze Risk
                      </button>
                    </div>
                  ) : (
                    <CommandHighlighter
                      command={generatedResult.command}
                      font={settings.terminalFont}
                      theme={settings.syntaxTheme}
                      showPrompt={false}
                      textClassName="text-sm font-semibold"
                    />
                  )}
                </div>

                {/* Explanation */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest block">
                    Explanation
                  </span>
                  <p className="text-sm text-[#D4D4D8] leading-relaxed">
                    {generatedResult.explanation}
                  </p>

                  {/* Flag breakdown pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {generatedResult.flags && generatedResult.flags.length > 0 ? (
                      generatedResult.flags.map((f, idx) => (
                        <div key={idx} className="text-[12px] bg-[#09090B] p-2.5 rounded border border-[#27272A] flex items-center justify-between">
                          <span className="text-emerald-400 font-mono mr-2 font-bold">{f.flag}</span>
                          <span className="text-[#A1A1AA] text-right text-xs">{f.meaning}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[12px] bg-[#09090B] p-2.5 rounded border border-[#27272A] text-[#71717A] italic">
                        Standard POSIX execution flags applied.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col (4 cols): Risk Assessment Card */}
            <div className="lg:col-span-4 space-y-4">
              <div className={riskMeta.borderCard}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl ${riskMeta.bg}`}>
                    !
                  </div>
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${riskMeta.labelColor}`}>
                      Risk Assessment
                    </div>
                    <div className={`text-lg font-bold ${riskMeta.titleColor}`}>
                      {riskMeta.badge}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#D4D4D8]/80 mb-4 leading-relaxed">
                  {generatedResult.risk_reason || riskMeta.sub}
                </p>

                {generatedResult.is_blocked ? (
                  <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-300">
                    Execution is completely blocked for safety to prevent severe system failure.
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t border-[#27272A]/50">
                    {generatedResult.requires_confirmation && (
                      <>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={hasConfirmedRisk}
                            onChange={(e) => setHasConfirmedRisk(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-[#27272A] bg-[#09090B] text-emerald-500 focus:ring-0 focus:outline-none"
                            id="risk-confirmation-checkbox"
                          />
                          <span className="text-xs text-[#D4D4D8] leading-tight select-none">
                            I understand that this command will modify system state.
                          </span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={hasConfirmedRisk}
                            onChange={(e) => setHasConfirmedRisk(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-[#27272A] bg-[#09090B] text-emerald-500 focus:ring-0 focus:outline-none"
                          />
                          <span className="text-xs text-[#D4D4D8] leading-tight select-none">
                            I have verified the command and target paths.
                          </span>
                        </label>
                      </>
                    )}

                    <button
                      onClick={handleExecute}
                      disabled={isExecutionDisabled}
                      id="run-command-btn"
                      className={`w-full mt-4 font-bold py-3 rounded-lg text-sm uppercase tracking-wide transition-all ${
                        isExecutionDisabled
                          ? 'bg-[#27272A] text-[#71717A] opacity-60 cursor-not-allowed'
                          : `${riskMeta.buttonBg} cursor-pointer shadow-md hover:scale-[1.01]`
                      }`}
                    >
                      {isExecuting ? 'EXECUTING IN SANDBOX...' : 'RUN COMMAND'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Realistic Terminal Window */}
          <div className="bg-black border border-[#27272A] rounded-xl overflow-hidden flex flex-col shadow-2xl">
            <div className="h-8 bg-[#18181B] border-b border-[#27272A] px-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]"></div>
              </div>
              <div className="flex items-center gap-3">
                {executionResult && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    EXIT {executionResult.exitCode} ({executionResult.executionTimeMs}ms)
                  </span>
                )}
                <span className="text-[10px] text-[#71717A] font-mono tracking-widest">TTY: SHELL_SIM_01</span>
              </div>
            </div>

            <div 
              className="p-4 text-xs text-[#A1A1AA] overflow-y-auto space-y-2 min-h-[120px]"
              style={{ fontFamily: getFontFamily(settings.terminalFont) }}
            >
              {executionResult ? (
                <>
                  <div className="flex gap-2">
                    <span className="text-emerald-500 font-bold">user@shellsense:~$</span>
                    <span className="text-white font-semibold">{executionResult.command}</span>
                  </div>
                  <pre className="text-emerald-300 whitespace-pre leading-relaxed pl-2">
                    {executionResult.stdout || executionResult.stderr || '[Command executed successfully with status code 0]'}
                  </pre>
                  {executionResult.stateChanges && executionResult.stateChanges.length > 0 && (
                    <div className="text-[11px] text-[#71717A] italic pl-2">
                      State updated: {executionResult.stateChanges.join(', ')}
                    </div>
                  )}
                </>
              ) : executionError ? (
                <div className="text-red-400 p-2 bg-red-950/30 rounded border border-red-900/50">
                  {executionError}
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <span className="text-emerald-500">user@shellsense:~$</span>
                    <span className="text-white">Waiting for execution...</span>
                  </div>
                  <div className="text-[#52525B] italic">
                    [Safe Sandbox Environment: Host system protected by ShellSense kernel interlocks]
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
