import React from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  FileCode,
  Search,
  Eye,
  Sliders
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onRunDemo: (scenario: number) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onRunDemo }) => {
  return (
    <div className="min-h-full py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wide">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Next-Generation Safe Terminal Assistant</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-mono">
            ShellSense
          </h1>
          <p className="text-2xl sm:text-3xl font-semibold text-emerald-400">
            "Speak Linux. Safely."
          </p>
        </div>

        <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
          Turn plain English into transparent, explainable, and risk-aware Linux shell commands. 
          Prevent catastrophic mistakes with multi-tier risk analysis, full flag explanations, and sandboxed execution.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onStart}
            id="landing-try-btn"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-lg shadow-emerald-950/60 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Try ShellSense</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              onStart();
              onRunDemo(1);
            }}
            id="landing-demo-btn"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-white font-semibold text-sm transition-all hover:border-[#3F3F46]"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>View Interactive Demo</span>
          </button>
        </div>
      </div>

      {/* Visual Workflow Flowchart */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#18181B] border border-[#27272A] shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono font-semibold">The Safe by Design Architecture</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Zero Direct Execution Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] mt-1">
            Every request passes through transparent safety interlocks before touching the terminal.
          </p>
        </div>

        {/* Step-by-Step Flow Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 text-center">
          {[
            { step: '1', title: 'Plain English', sub: 'Natural Request', icon: Search, color: 'text-indigo-400' },
            { step: '2', title: 'AI Generation', sub: 'Structured JSON', icon: Sparkles, color: 'text-cyan-400' },
            { step: '3', title: 'Command Preview', sub: 'Syntax Inspection', icon: FileCode, color: 'text-teal-400' },
            { step: '4', title: 'Explanation', sub: 'Flag Breakdown', icon: Eye, color: 'text-blue-400' },
            { step: '5', title: 'Risk Analysis', sub: 'Multi-Tier Engine', icon: AlertTriangle, color: 'text-amber-400' },
            { step: '6', title: 'Confirmation', sub: 'Human-in-the-Loop', icon: CheckCircle2, color: 'text-orange-400' },
            { step: '7', title: 'Safe Execution', sub: 'Isolated Sandbox', icon: Terminal, color: 'text-emerald-400' },
            { step: '8', title: 'Output', sub: 'Audit Logged', icon: ShieldCheck, color: 'text-emerald-300' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="p-3 rounded-xl bg-black border border-[#27272A] flex flex-col items-center justify-between space-y-2 hover:border-[#3F3F46] transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center">
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#71717A] uppercase">Step {item.step}</div>
                  <div className="text-xs font-semibold text-white">{item.title}</div>
                  <div className="text-[10px] text-[#71717A] leading-tight">{item.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Core Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Natural Language */}
        <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-emerald-500/30 transition-all space-y-3 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-mono">Natural Language</h3>
          <p className="text-sm text-[#71717A] leading-relaxed">
            No need to memorize convoluted Linux flags or bash arcana. Describe what you want in simple English and receive POSIX-compliant commands.
          </p>
        </div>

        {/* Card 2: Risk-Aware */}
        <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-amber-500/30 transition-all space-y-3 group">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-mono">Risk-Aware</h3>
          <p className="text-sm text-[#71717A] leading-relaxed">
            Every command undergoes deterministic AST and regex pattern checking. Destructive commands are blocked, and state-modifying actions require explicit consent.
          </p>
        </div>

        {/* Card 3: Privacy First */}
        <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-emerald-500/30 transition-all space-y-3 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-mono">Privacy First</h3>
          <p className="text-sm text-[#71717A] leading-relaxed">
            Designed to support both cloud intelligence and local offline AI execution. Keep your files, logs, and system topology strictly on your machine.
          </p>
        </div>
      </div>

      {/* Live Demo Scenarios Quick Launcher */}
      <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white font-mono">Interactive Hackathon Scenarios</h3>
            <p className="text-xs text-[#71717A]">Test different risk tiers with one click</p>
          </div>
          <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 self-start sm:self-auto">
            Ready to Demo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <button
            onClick={() => {
              onStart();
              onRunDemo(1);
            }}
            className="p-3.5 rounded-xl bg-black hover:bg-[#27272A]/40 border border-emerald-500/30 text-left space-y-1.5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">Scenario 1: Safe</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">LOW</span>
            </div>
            <p className="text-xs text-[#D4D4D8]">"Show all files in this directory"</p>
            <p className="text-[11px] text-[#71717A] font-mono">ls -la</p>
          </button>

          <button
            onClick={() => {
              onStart();
              onRunDemo(2);
            }}
            className="p-3.5 rounded-xl bg-black hover:bg-[#27272A]/40 border border-amber-500/30 text-left space-y-1.5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400">Scenario 2: Medium</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">MEDIUM</span>
            </div>
            <p className="text-xs text-[#D4D4D8]">"Create a folder called hackathon"</p>
            <p className="text-[11px] text-[#71717A] font-mono">mkdir -p hackathon</p>
          </button>

          <button
            onClick={() => {
              onStart();
              onRunDemo(3);
            }}
            className="p-3.5 rounded-xl bg-black hover:bg-[#27272A]/40 border border-red-500/30 text-left space-y-1.5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-400">Scenario 3: High</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono">HIGH</span>
            </div>
            <p className="text-xs text-[#D4D4D8]">"Delete old log files"</p>
            <p className="text-[11px] text-[#71717A] font-mono">find . -name "*.log" -delete</p>
          </button>

          <button
            onClick={() => {
              onStart();
              onRunDemo(4);
            }}
            className="p-3.5 rounded-xl bg-black hover:bg-[#27272A]/40 border border-red-500/50 text-left space-y-1.5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-500">Scenario 4: Critical</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono">BLOCKED</span>
            </div>
            <p className="text-xs text-[#D4D4D8]">"Delete everything recursively"</p>
            <p className="text-[11px] text-[#71717A] font-mono">rm -rf /</p>
          </button>
        </div>
      </div>
    </div>
  );
};
