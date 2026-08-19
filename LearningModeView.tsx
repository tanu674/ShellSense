import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Terminal, 
  Sparkles, 
  Layers, 
  AlertTriangle, 
  ArrowRight, 
  Copy, 
  Check, 
  Play,
  Lightbulb,
  CheckCircle2,
  FileCode
} from 'lucide-react';
import { LearningTopic, CommandFlag, RiskLevel, AppSettings } from '../types';
import { CommandHighlighter } from './CommandHighlighter';
import { getFontFamily } from '../lib/themeConfig';

interface LearningModeViewProps {
  initialTopicId?: string;
  onSendToDashboard?: (prompt: string) => void;
  settings?: AppSettings;
}

export const LearningModeView: React.FC<LearningModeViewProps> = ({
  initialTopicId,
  onSendToDashboard,
  settings
}) => {
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [interactivePrompt, setInteractivePrompt] = useState<string>('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/learning-topics')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTopics(data);
          const found = initialTopicId ? data.find(t => t.id === initialTopicId || t.name === initialTopicId) : data[0];
          setSelectedTopic(found || data[0]);
        }
      })
      .catch(err => console.error(err));
  }, [initialTopicId]);

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredTopics = topics.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-mono">Linux Command Learning Center</h2>
            <p className="text-xs text-[#71717A]">Interactive encyclopedia & flag breakdown to master Linux shell commands</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Topics List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Linux utilities..."
              className="w-full bg-[#18181B] border border-[#27272A] focus:border-emerald-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#71717A] font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            {filteredTopics.map((topic) => {
              const isSelected = selectedTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`w-full p-3.5 rounded-xl text-left border transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-md'
                      : 'bg-[#18181B] hover:bg-[#27272A]/50 border-[#27272A] text-[#A1A1AA]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm font-mono text-emerald-300">{topic.name}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black text-[#71717A] border border-[#27272A]">
                      {topic.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed font-sans">
                    {topic.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Topic Details & Try It Yourself */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTopic ? (
            <div className="space-y-6">
              {/* Main Topic Header */}
              <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-emerald-400 font-mono">
                      {selectedTopic.name}
                    </h3>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 capitalize">
                      {selectedTopic.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#D4D4D8] leading-relaxed">
                  {selectedTopic.summary}
                </p>

                {/* Syntax Box */}
                <div className="space-y-1.5 font-mono text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-[#71717A] font-semibold">Standard Syntax</span>
                  <div 
                    className="p-3 rounded-xl bg-black border border-[#27272A] text-sm font-bold"
                    style={{ fontFamily: getFontFamily(settings?.terminalFont) }}
                  >
                    <CommandHighlighter
                      command={selectedTopic.syntax}
                      font={settings?.terminalFont}
                      theme={settings?.syntaxTheme}
                      showPrompt={true}
                      textClassName="text-sm font-bold"
                    />
                  </div>
                </div>

                {/* Common Flags */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-semibold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Essential Options & Flags</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTopic.commonFlags.map((f, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-black border border-[#27272A] text-xs font-mono flex items-start gap-2">
                        <code 
                          className="text-emerald-400 font-bold shrink-0"
                          style={{ fontFamily: getFontFamily(settings?.terminalFont) }}
                        >
                          {f.flag}
                        </code>
                        <span className="text-[#71717A]">→</span>
                        <span className="text-[#D4D4D8]">{f.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practical Examples */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-mono uppercase text-[#71717A] font-semibold">Practical Use-Cases</span>
                  <div className="space-y-2">
                    {selectedTopic.examples.map((ex, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-black border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-[#D4D4D8] font-sans font-medium">"{ex.prompt}"</div>
                          <div 
                            className="block font-bold text-xs"
                            style={{ fontFamily: getFontFamily(settings?.terminalFont) }}
                          >
                            <CommandHighlighter
                              command={ex.command}
                              font={settings?.terminalFont}
                              theme={settings?.syntaxTheme}
                              showPrompt={true}
                              textClassName="text-xs font-bold"
                            />
                          </div>
                          <p className="text-[11px] text-[#71717A] font-sans">{ex.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleCopy(ex.command)}
                            className="p-1.5 rounded bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white text-xs font-mono transition-colors"
                            title="Copy command"
                          >
                            {copiedCmd === ex.command ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          {onSendToDashboard && (
                            <button
                              onClick={() => onSendToDashboard(ex.prompt)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-mono transition-all"
                            >
                              <span>Try in Assistant</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pitfalls & Gotchas */}
                {selectedTopic.pitfalls.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/50 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Common Pitfalls & Warnings</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[#D4D4D8]">
                      {selectedTopic.pitfalls.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Try It Yourself Sandbox Prompt Area */}
              <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
                <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                  <span>Try It Yourself</span>
                </div>
                <p className="text-xs text-[#71717A]">
                  Ask a question related to <span className="text-emerald-400 font-mono">{selectedTopic.name}</span> in plain English and send it to the assistant.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interactivePrompt}
                    onChange={(e) => setInteractivePrompt(e.target.value)}
                    placeholder={`e.g. How to use ${selectedTopic.name} to find files modified yesterday...`}
                    className="flex-1 bg-black border border-[#27272A] rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                  {onSendToDashboard && (
                    <button
                      onClick={() => onSendToDashboard(interactivePrompt || selectedTopic.examples[0].prompt)}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono transition-all shadow-md shadow-emerald-950/40"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Translate</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-[#71717A]">
              Select a Linux utility from the left to begin learning.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
