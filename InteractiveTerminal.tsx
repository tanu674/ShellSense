import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  RotateCcw, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle,
  Play,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { AppSettings } from '../types';
import { CommandHighlighter } from './CommandHighlighter';
import { getFontFamily, getSyntaxTheme } from '../lib/themeConfig';

interface TerminalEntry {
  type: 'input' | 'output' | 'error' | 'warning' | 'info';
  content: string;
  timestamp: string;
  exitCode?: number;
}

interface InteractiveTerminalProps {
  settings?: AppSettings;
}

export const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({ settings }) => {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      type: 'info',
      content: 'ShellSense Interactive Linux Sandbox [Ubuntu 24.04 LTS]\nType any Linux command to test sandboxed execution. Type "help" for suggestions.',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      type: 'input',
      content: 'ls -la',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      type: 'output',
      content: `total 24\ndrwxr-xr-x  5 user user 4096 Aug 19 01:00 .\ndrwxr-xr-x  3 root root 4096 Aug 19 00:01 ..\ndrwxr-xr-x  3 user user 4096 Aug 19 01:10 projects/\ndrwxr-xr-x  2 user user 4096 Aug 19 00:45 documents/\ndrwxr-xr-x  2 user user 4096 Aug 19 01:20 logs/\n-rw-r--r--  1 user user 1240 Aug 19 01:00 README.md\n-rw-r--r--  1 user user 45000 Aug 19 00:30 data.csv`,
      timestamp: new Date().toLocaleTimeString(),
      exitCode: 0
    }
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [history, setHistory] = useState<string[]>(['ls -la']);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const handleRunCommand = async (cmdToRun?: string) => {
    const command = (cmdToRun || inputVal).trim();
    if (!command) return;

    if (command === 'clear') {
      setEntries([]);
      setInputVal('');
      return;
    }

    if (command === 'help') {
      setEntries(prev => [
        ...prev,
        { type: 'input', content: command, timestamp: new Date().toLocaleTimeString() },
        {
          type: 'info',
          content: `Supported Sandbox Commands:\n- pwd, whoami, uname -a, date, uptime, env\n- ls, ls -la, cd [dir], mkdir [dir], touch [file], rm [file]\n- cat [file], head [file], tail [file], grep [pattern]\n- find . -name "*.py", du -h, df -h, ps aux, top, free\n- tar, chmod, kill [pid], clear, reset`,
          timestamp: new Date().toLocaleTimeString(),
          exitCode: 0
        }
      ]);
      setHistory(prev => [command, ...prev]);
      setInputVal('');
      return;
    }

    setEntries(prev => [
      ...prev,
      { type: 'input', content: command, timestamp: new Date().toLocaleTimeString() }
    ]);
    setHistory(prev => [command, ...prev]);
    setInputVal('');
    setHistoryIdx(-1);
    setIsExecuting(true);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          confirmed: true, // In direct terminal mode we execute under sandbox rules
          source: 'terminal'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setEntries(prev => [
          ...prev,
          {
            type: 'error',
            content: data.error || 'Execution blocked by security policy.',
            timestamp: new Date().toLocaleTimeString(),
            exitCode: 1
          }
        ]);
      } else {
        setEntries(prev => [
          ...prev,
          {
            type: 'output',
            content: data.stdout || (data.stderr ? `[STDERR]: ${data.stderr}` : '[Command exited with status 0 (Success)]'),
            timestamp: new Date().toLocaleTimeString(),
            exitCode: data.exitCode
          }
        ]);
      }
    } catch (err: any) {
      setEntries(prev => [
        ...prev,
        {
          type: 'error',
          content: err.message || 'Execution failed',
          timestamp: new Date().toLocaleTimeString(),
          exitCode: 1
        }
      ]);
    } finally {
      setIsExecuting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRunCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIdx < history.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal('');
      }
    }
  };

  const handleResetSandbox = async () => {
    try {
      await fetch('/api/sandbox/reset', { method: 'POST' });
      setEntries([
        {
          type: 'info',
          content: 'Sandbox state and virtual filesystem reset to fresh defaults.',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TerminalIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono">Live Terminal Sandbox</h2>
            <p className="text-xs text-[#71717A]">Direct interactive bash shell backed by simulated Linux filesystem</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEntries([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white text-xs font-mono transition-colors"
            title="Clear terminal window"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleResetSandbox}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white text-xs font-mono transition-colors"
            title="Reset sandbox virtual filesystem"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reset FS</span>
          </button>
        </div>
      </div>

      {/* Terminal Canvas */}
      <div 
        onClick={() => inputRef.current?.focus()}
        style={{ fontFamily: getFontFamily(settings?.terminalFont) }}
        className="rounded-xl bg-black border border-[#27272A] shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-between"
      >
        {/* Terminal Header */}
        <div className="px-4 py-2.5 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between text-xs text-[#71717A]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3F3F46] inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#3F3F46] inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#3F3F46] inline-block"></span>
            <span className="text-white ml-2 font-semibold">user@shellsense: ~</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            TTY: SHELL_SIM_01
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[600px] flex-1 text-xs">
          {entries.map((entry, i) => {
            if (entry.type === 'input') {
              return (
                <div key={i} className="flex items-start gap-2 text-white">
                  <span className="text-emerald-500 font-bold select-none">user@shellsense:~$</span>
                  <CommandHighlighter 
                    command={entry.content} 
                    font={settings?.terminalFont}
                    theme={settings?.syntaxTheme}
                    textClassName="text-xs font-semibold"
                  />
                </div>
              );
            }
            if (entry.type === 'error') {
              return (
                <div key={i} className="p-2.5 rounded bg-red-950/30 border border-red-900/50 text-red-300 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </div>
              );
            }
            if (entry.type === 'info') {
              return (
                <div key={i} className="p-2.5 rounded bg-[#18181B] border border-[#27272A] text-cyan-300 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </div>
              );
            }
            return (
              <pre key={i} className="text-emerald-300 whitespace-pre-wrap leading-relaxed pl-4 border-l border-[#27272A]">
                {entry.content}
              </pre>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Command Line Input */}
        <div className="p-4 bg-[#18181B]/80 border-t border-[#27272A] flex items-center gap-2">
          <span className="text-emerald-500 font-bold text-xs select-none">
            user@shellsense:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            placeholder="Type a Linux command (e.g. ls -la, ps aux, df -h, cat README.md)..."
            style={{ fontFamily: getFontFamily(settings?.terminalFont) }}
            className="flex-1 bg-transparent text-emerald-300 text-xs focus:outline-none placeholder-[#71717A]"
            id="terminal-interactive-input"
          />
          {isExecuting && (
            <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      </div>

      {/* Helpful shortcuts bar */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-[#71717A] px-2 font-mono">
        <div className="flex items-center gap-3">
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-white">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-white">↓</kbd> History</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-white">Enter</kbd> Execute</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-white">clear</kbd> Clear Screen</span>
        </div>
        <span className="text-emerald-400/80">Protected by ShellSense Sandbox Kernel</span>
      </div>
    </div>
  );
};
