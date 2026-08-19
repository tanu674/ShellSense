import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Ban, 
  CheckCircle2, 
  Lock, 
  Eye, 
  Terminal, 
  Layers, 
  FileText, 
  Cpu,
  Search,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SafetyStats, RiskAnalysisResult } from '../types';

export const SafetyCenterView: React.FC = () => {
  const [stats, setStats] = useState<SafetyStats>({
    totalAnalyzed: 128,
    safeCount: 96,
    mediumRiskCount: 21,
    highRiskCount: 8,
    blockedCount: 3,
    lastBlockedCommand: 'rm -rf / --no-preserve-root',
    riskDistribution: {
      LOW: 96,
      MEDIUM: 21,
      HIGH: 8,
      CRITICAL: 3
    }
  });

  const [testCommand, setTestCommand] = useState<string>('rm -rf /etc/hosts');
  const [testAnalysis, setTestAnalysis] = useState<RiskAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data) setStats(data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleTestAnalyze = async () => {
    if (!testCommand.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: testCommand })
      });
      if (res.ok) {
        const data = await res.json();
        setTestAnalysis(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const total = stats.totalAnalyzed || 1;
  const lowPct = Math.round((stats.riskDistribution.LOW / total) * 100);
  const medPct = Math.round((stats.riskDistribution.MEDIUM / total) * 100);
  const highPct = Math.round((stats.riskDistribution.HIGH / total) * 100);
  const critPct = Math.round((stats.riskDistribution.CRITICAL / total) * 100);

  const dangerPatterns = [
    { pattern: 'rm -rf / or rm -rf ~', risk: 'CRITICAL', reason: 'Destroys root filesystem or complete user directory', action: 'BLOCKED' },
    { pattern: ':(){ :|:& };:', risk: 'CRITICAL', reason: 'Linux bash fork bomb kernel resource exhaustion', action: 'BLOCKED' },
    { pattern: '> /dev/sda or dd of=/dev/nvme', risk: 'CRITICAL', reason: 'Direct disk raw block write / partition overwrite', action: 'BLOCKED' },
    { pattern: 'mkfs.ext4 /dev/sda1', risk: 'CRITICAL', reason: 'Filesystem reformat / partition wipe', action: 'BLOCKED' },
    { pattern: 'chmod -R 777 /', risk: 'CRITICAL', reason: 'Universal write permissions on root breaks Linux security', action: 'BLOCKED' },
    { pattern: 'find . -delete', risk: 'HIGH', reason: 'Automatic batch deletion without interactive check', action: 'CONFIRM REQUIRED' },
    { pattern: 'curl ... | bash', risk: 'HIGH', reason: 'Remote web script execution without audit', action: 'CONFIRM REQUIRED' },
    { pattern: 'iptables -F or ufw disable', risk: 'HIGH', reason: 'Disabling firewall packet filtering', action: 'CONFIRM REQUIRED' },
    { pattern: 'kill -9 <pid> or pkill', risk: 'MEDIUM', reason: 'Process termination with potential memory loss', action: 'CONFIRM REQUIRED' },
    { pattern: 'sed -i or truncate', risk: 'MEDIUM', reason: 'In-place file content alteration', action: 'CONFIRM REQUIRED' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Bar */}
      <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-mono">Safety & Risk Center</h2>
            <p className="text-xs text-[#71717A]">Real-time safety heuristics, metrics, and rule policies protecting the execution lifecycle</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Safety Interlocks: ACTIVE</span>
          </span>
        </div>
      </div>

      {/* Safety KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="text-[11px] font-mono text-[#71717A] uppercase">Commands Analyzed</div>
          <div className="text-2xl font-bold text-white font-mono">{stats.totalAnalyzed}</div>
          <div className="text-[10px] text-[#71717A]">100% evaluated by AST</div>
        </div>

        <div className="p-4 rounded-xl bg-[#064e3b]/20 border border-emerald-900/50 space-y-1">
          <div className="text-[11px] font-mono text-emerald-400 uppercase flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe (LOW)</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.safeCount}</div>
          <div className="text-[10px] text-emerald-400/80">{lowPct}% of total volume</div>
        </div>

        <div className="p-4 rounded-xl bg-[#451a03]/20 border border-amber-900/50 space-y-1">
          <div className="text-[11px] font-mono text-amber-400 uppercase flex items-center gap-1 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Medium Risk</span>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{stats.mediumRiskCount}</div>
          <div className="text-[10px] text-amber-400/80">{medPct}% state mutations</div>
        </div>

        <div className="p-4 rounded-xl bg-[#450a0a]/20 border border-red-900/50 space-y-1">
          <div className="text-[11px] font-mono text-red-400 uppercase flex items-center gap-1 font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>High Risk</span>
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono">{stats.highRiskCount}</div>
          <div className="text-[10px] text-red-400/80">{highPct}% guarded confirm</div>
        </div>

        <div className="p-4 rounded-xl bg-[#450a0a]/30 border border-red-900/70 space-y-1 col-span-2 lg:col-span-1">
          <div className="text-[11px] font-mono text-red-500 uppercase flex items-center gap-1 font-bold">
            <Ban className="w-3.5 h-3.5" />
            <span>Blocked</span>
          </div>
          <div className="text-2xl font-bold text-red-500 font-mono">{stats.blockedCount}</div>
          <div className="text-[10px] text-red-400/80">{critPct}% prevented damage</div>
        </div>
      </div>

      {/* Visual Risk Distribution Bar */}
      <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-white uppercase tracking-wide">Risk Distribution Breakdown</span>
          <span className="text-[#71717A]">{stats.totalAnalyzed} Total Commands Logged</span>
        </div>

        {/* Segmented Bar */}
        <div className="w-full h-4 rounded-full bg-black border border-[#27272A] overflow-hidden flex">
          <div style={{ width: `${lowPct}%` }} className="bg-emerald-500 h-full transition-all" title={`Safe: ${lowPct}%`}></div>
          <div style={{ width: `${medPct}%` }} className="bg-amber-500 h-full transition-all" title={`Medium: ${medPct}%`}></div>
          <div style={{ width: `${highPct}%` }} className="bg-red-500 h-full transition-all" title={`High: ${highPct}%`}></div>
          <div style={{ width: `${critPct}%` }} className="bg-red-700 h-full transition-all" title={`Critical: ${critPct}%`}></div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <span className="text-[#A1A1AA]">LOW ({lowPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
            <span className="text-[#A1A1AA]">MEDIUM ({medPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
            <span className="text-[#A1A1AA]">HIGH ({highPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-700"></span>
            <span className="text-[#A1A1AA]">CRITICAL ({critPct}%)</span>
          </div>
        </div>
      </div>

      {/* Real-time Safety Tester Tool */}
      <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Interactive Rule Engine Tester
            </h3>
          </div>
          <p className="text-xs text-[#71717A]">
            Type any raw bash command to test how the ShellSense safety engine parses flags and assigns risk tiers.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={testCommand}
            onChange={(e) => setTestCommand(e.target.value)}
            placeholder="e.g. rm -rf /var/log or chmod -R 777 /"
            className="flex-1 bg-black border border-[#27272A] rounded-xl px-4 py-2.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={handleTestAnalyze}
            disabled={isAnalyzing || !testCommand.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-[#27272A] text-black font-bold text-xs font-mono transition-all"
          >
            {isAnalyzing ? 'Testing...' : 'Test Safety'}
          </button>
        </div>

        {testAnalysis && (
          <div className="p-4 rounded-xl bg-black border border-[#27272A] space-y-3 font-mono text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#71717A]">Assigned Risk:</span>
                <span className={`px-2.5 py-0.5 rounded font-bold ${
                  testAnalysis.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  testAnalysis.risk_level === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  testAnalysis.risk_level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {testAnalysis.risk_level}
                </span>
                {testAnalysis.is_blocked && (
                  <span className="px-2 py-0.5 rounded bg-red-500/30 text-red-300 border border-red-500/50 font-bold">
                    BLOCKED
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#71717A]">
                Requires Confirmation: {testAnalysis.requires_confirmation ? 'YES' : 'NO'}
              </span>
            </div>

            <div className="text-[#D4D4D8]">
              <span className="text-[#71717A]">Reason: </span>
              {testAnalysis.risk_reason}
            </div>

            {testAnalysis.warnings.length > 0 && (
              <div className="text-red-300 space-y-1">
                {testAnalysis.warnings.map((w, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Why ShellSense is Safe Section */}
      <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono font-semibold">Security Principles</span>
          <h3 className="text-lg font-bold text-white mt-1">
            Why ShellSense is Safe
          </h3>
          <p className="text-xs text-[#71717A]">
            Engineered from first principles to prevent hallucinated, dangerous, or malicious commands from causing damage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {[
            {
              title: 'Risk-Tiered Confirmation',
              desc: 'Commands are categorized into Low, Medium, High, and Critical. Non-read-only tasks require explicit human review.',
              icon: ShieldAlert,
              color: 'text-amber-400'
            },
            {
              title: 'Command Preview Before Run',
              desc: 'Never blindly executes shell scripts. Users always see syntax, flag explanations, and affected paths beforehand.',
              icon: Eye,
              color: 'text-cyan-400'
            },
            {
              title: 'Destructive Command Detection',
              desc: 'Blocklists and AST heuristics detect rm -rf /, partition writes, fork bombs, and raw device access.',
              icon: Ban,
              color: 'text-red-400'
            },
            {
              title: 'Explainable Commands',
              desc: 'Breaks down every single option flag into plain English so users understand exactly what the computer will do.',
              icon: FileText,
              color: 'text-teal-400'
            },
            {
              title: 'Sandboxed Virtual Execution',
              desc: 'All execution runs in an isolated Linux sandbox environment. Host files and critical OS assets remain untouched.',
              icon: Terminal,
              color: 'text-emerald-400'
            },
            {
              title: 'Zero Automatic Execution',
              desc: 'The AI model has no direct execution privileges. The frontend and backend act as independent verification barriers.',
              icon: Lock,
              color: 'text-indigo-400'
            }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-black border border-[#27272A] space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                  <span className="font-bold text-white font-mono">{card.title}</span>
                </div>
                <p className="text-[#A1A1AA] leading-relaxed font-sans">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dangerous Patterns Catalog */}
      <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            Guardrail Pattern Catalog
          </h3>
          <span className="text-xs text-[#71717A] font-mono">{dangerPatterns.length} Active Rules</span>
        </div>

        <div className="divide-y divide-[#27272A] rounded-xl bg-black border border-[#27272A] overflow-hidden font-mono text-xs">
          {dangerPatterns.map((pat, idx) => (
            <div key={idx} className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="text-emerald-300 font-bold">{pat.pattern}</div>
                <div className="text-[#A1A1AA] font-sans text-[11px]">{pat.reason}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  pat.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  pat.risk === 'HIGH' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {pat.risk}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#27272A] text-[#A1A1AA] text-[10px]">
                  {pat.action}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
