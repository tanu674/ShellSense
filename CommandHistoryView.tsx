import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Ban, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ExternalLink,
  RotateCw
} from 'lucide-react';
import { HistoryItem, RiskLevel, AppSettings } from '../types';
import { HistoryDetailModal } from './HistoryDetailModal';
import { CommandHighlighter } from './CommandHighlighter';
import { getFontFamily } from '../lib/themeConfig';

interface CommandHistoryViewProps {
  settings?: AppSettings;
}

export const CommandHistoryView: React.FC<CommandHistoryViewProps> = ({ settings }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all command audit history?')) return;
    try {
      await fetch('/api/history/clear', { method: 'POST' });
      setHistoryItems([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const filteredItems = historyItems.filter(item => {
    const matchesSearch = 
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRisk = riskFilter === 'ALL' || item.risk_level === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const getRiskIcon = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return <Ban className="w-3.5 h-3.5 text-rose-400" />;
      case 'HIGH':
        return <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'LOW':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="p-4 sm:p-6 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-mono">Command Audit History</h2>
            <p className="text-xs text-[#71717A]">Immutable log of generated commands, risk assessments, and execution results</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="p-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white transition-colors"
            title="Refresh history"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleClearHistory}
            disabled={historyItems.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-mono disabled:opacity-50 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Audit</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands, requests, or explanations..."
            className="w-full bg-[#18181B] border border-[#27272A] focus:border-emerald-500/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#71717A] font-mono focus:outline-none"
          />
        </div>

        {/* Risk Filter dropdown */}
        <div className="relative">
          <Filter className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full bg-[#18181B] border border-[#27272A] focus:border-emerald-500/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none appearance-none cursor-pointer"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="LOW">LOW Risk Only</option>
            <option value="MEDIUM">MEDIUM Risk Only</option>
            <option value="HIGH">HIGH Risk Only</option>
            <option value="CRITICAL">CRITICAL / Blocked Only</option>
          </select>
        </div>
      </div>

      {/* History Items List / Table */}
      <div className="rounded-xl bg-black border border-[#27272A] shadow-xl overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="w-10 h-10 text-[#3F3F46] mx-auto" />
            <p className="text-[#A1A1AA] text-sm">No command history records found.</p>
            <p className="text-[#71717A] text-xs">Run commands from the Dashboard or Terminal to record audit history.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#27272A] font-mono text-xs">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-4 sm:p-4.5 hover:bg-[#18181B] cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left: Request & Command */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 ${getRiskColor(item.risk_level)}`}>
                      {getRiskIcon(item.risk_level)}
                      <span>{item.risk_level}</span>
                    </span>

                    <span className="text-[11px] text-[#71717A]">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>

                    <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase font-semibold ${
                      item.execution_status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      item.execution_status === 'blocked' ? 'bg-red-500/10 text-red-400' : 'bg-[#27272A] text-[#71717A]'
                    }`}>
                      {item.execution_status}
                    </span>
                  </div>

                  <div className="text-[#D4D4D8] font-sans font-medium text-xs truncate">
                    "{item.prompt}"
                  </div>

                  <div 
                    className="text-emerald-400 font-bold text-xs truncate flex items-center gap-1"
                    style={{ fontFamily: getFontFamily(settings?.terminalFont) }}
                  >
                    <CommandHighlighter
                      command={item.command}
                      font={settings?.terminalFont}
                      theme={settings?.syntaxTheme}
                      showPrompt={true}
                      textClassName="text-xs"
                    />
                  </div>
                </div>

                {/* Right: Action info */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-[#71717A] group-hover:text-emerald-400 flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History Detail Inspection Modal */}
      <HistoryDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        settings={settings}
      />
    </div>
  );
};
