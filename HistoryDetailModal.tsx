import React from 'react';
import { 
  X, 
  Terminal, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Ban, 
  CheckCircle2, 
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { HistoryItem, RiskLevel, AppSettings } from '../types';
import { CommandHighlighter } from './CommandHighlighter';
import { getFontFamily } from '../lib/themeConfig';

interface HistoryDetailModalProps {
  item: HistoryItem | null;
  onClose: () => void;
  settings?: AppSettings;
}

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ item, onClose, settings }) => {
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return { bg: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Ban, text: 'CRITICAL RISK' };
      case 'HIGH':
        return { bg: 'bg-red-500/20 text-red-400 border-red-500/30', icon: ShieldAlert, text: 'HIGH RISK' };
      case 'MEDIUM':
        return { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: AlertTriangle, text: 'MEDIUM RISK' };
      case 'LOW':
      default:
        return { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: ShieldCheck, text: 'LOW RISK' };
    }
  };

  const riskInfo = getRiskBadge(item.risk_level);
  const RiskIcon = riskInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${riskInfo.bg}`}>
              <RiskIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white font-mono text-base">Command Audit Details</h3>
              <p className="text-xs text-[#71717A]">Recorded on {new Date(item.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Request */}
          <div className="space-y-1.5">
            <span className="text-[#71717A] uppercase text-[10px] font-semibold">User Request</span>
            <div className="p-3 rounded-xl bg-black border border-[#27272A] text-white text-sm font-sans">
              "{item.prompt}"
            </div>
          </div>

          {/* Generated Command */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 uppercase text-[10px] font-semibold">Generated Shell Command</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-[#71717A] hover:text-white"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div 
              className="p-3 rounded-xl bg-black border border-[#27272A] text-sm break-all font-bold"
              style={{ fontFamily: getFontFamily(settings?.terminalFont) }}
            >
              <CommandHighlighter
                command={item.command}
                font={settings?.terminalFont}
                theme={settings?.syntaxTheme}
                showPrompt={true}
                textClassName="text-sm font-semibold"
              />
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <span className="text-[#71717A] uppercase text-[10px] font-semibold">Plain-English Explanation</span>
            <div className="p-3 rounded-xl bg-black border border-[#27272A] text-[#D4D4D8] leading-relaxed font-sans text-xs">
              {item.explanation}
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="p-4 rounded-xl bg-black border border-[#27272A] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#71717A] uppercase text-[10px] font-semibold">Safety Engine Verification</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${riskInfo.bg}`}>
                {riskInfo.text}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] font-sans">
              {item.risk_reason || 'Safe informational POSIX command execution.'}
            </p>
          </div>

          {/* Execution Result */}
          {item.execution_result && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#71717A] uppercase text-[10px] font-semibold">Execution Output (Exit Code {item.execution_result.exitCode})</span>
                <span className="text-[10px] text-[#71717A]">{item.execution_result.executionTimeMs}ms execution time</span>
              </div>
              <pre 
                className="p-3 rounded-xl bg-black border border-[#27272A] text-emerald-300 whitespace-pre-wrap text-xs overflow-x-auto"
                style={{ fontFamily: getFontFamily(settings?.terminalFont) }}
              >
                {item.execution_result.stdout || item.execution_result.stderr || '(No output recorded)'}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#27272A] bg-black/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-mono transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
