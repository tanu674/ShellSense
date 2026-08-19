export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CommandFlag {
  flag: string;
  meaning: string;
}

export interface CommandAlternative {
  command: string;
  description: string;
}

export interface GeneratedCommandResult {
  id?: string;
  original_prompt: string;
  command: string;
  explanation: string;
  risk_level: RiskLevel;
  risk_reason: string;
  flags: CommandFlag[];
  requires_confirmation: boolean;
  is_blocked?: boolean;
  why_this_command?: string;
  alternatives?: CommandAlternative[];
  rollback_note?: string;
  warnings?: string[];
  safe_alternatives?: string[];
  timestamp?: string;
  source?: 'gemini' | 'local_fallback' | 'demo';
}

export interface RiskAnalysisResult {
  command: string;
  risk_level: RiskLevel;
  risk_reason: string;
  requires_confirmation: boolean;
  is_blocked: boolean;
  flags: CommandFlag[];
  warnings: string[];
  safe_alternatives: string[];
  destructive_patterns_matched: string[];
}

export interface ExecutionResult {
  success: boolean;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  timestamp: string;
  stateChanges?: string[];
  error?: string;
  risk_level?: RiskLevel;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  command: string;
  explanation: string;
  risk_level: RiskLevel;
  timestamp: string;
  executed: boolean;
  execution_result?: ExecutionResult;
  execution_status: 'success' | 'failed' | 'blocked' | 'unexecuted' | 'cancelled';
  source: 'gemini' | 'local_fallback' | 'demo';
}

export interface SafetyStats {
  totalAnalyzed: number;
  safeCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  blockedCount: number;
  lastBlockedCommand?: string;
  riskDistribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}

export interface LearningTopic {
  id: string;
  name: string;
  category: 'file_management' | 'text_processing' | 'system_monitoring' | 'permissions' | 'networking' | 'archiving';
  summary: string;
  syntax: string;
  commonFlags: CommandFlag[];
  examples: {
    command: string;
    description: string;
    prompt: string;
    risk: RiskLevel;
  }[];
  pitfalls: string[];
}

export type TerminalFont = 'jetbrains' | 'fira' | 'source' | 'ibm' | 'inconsolata' | 'ubuntu';
export type SyntaxTheme = 'emerald' | 'dracula' | 'monokai' | 'nord' | 'amber' | 'tokyo' | 'cyberpunk';

export interface AppSettings {
  aiMode: 'cloud' | 'local';
  demoMode: boolean;
  strictSafety: boolean;
  terminalFont: TerminalFont;
  syntaxTheme: SyntaxTheme;
  theme?: string;
}
