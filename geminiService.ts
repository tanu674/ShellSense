import { GoogleGenAI, Type } from "@google/genai";
import { analyzeCommand, RiskLevel } from "./safetyEngine.ts";

export interface CommandGenerationResponse {
  command: string;
  explanation: string;
  risk_level: RiskLevel;
  risk_reason: string;
  flags: { flag: string; meaning: string }[];
  requires_confirmation: boolean;
  why_this_command?: string;
  alternatives?: { command: string; description: string }[];
  rollback_note?: string;
  is_blocked?: boolean;
  warnings?: string[];
  safe_alternatives?: string[];
  source: 'gemini' | 'local_fallback' | 'demo';
}

// Fallback intelligent pattern matcher for Local/Offline/Demo mode
const PRESET_PATTERNS: Array<{
  regex: RegExp;
  result: (prompt: string) => CommandGenerationResponse;
}> = [
  {
    regex: /show.*(all\s+)?files|list.*files|dir\b/i,
    result: () => ({
      command: 'ls -la',
      explanation: 'Lists all files and directories in the current working directory, including hidden dotfiles, with detailed permissions, file sizes, and modification dates.',
      risk_level: 'LOW',
      risk_reason: 'Read-only informational command that inspects filesystem metadata without making modifications.',
      flags: [
        { flag: '-l', meaning: 'Use long listing format displaying permissions, owners, sizes, and dates' },
        { flag: '-a', meaning: 'Include hidden files and directories starting with a dot (.)' }
      ],
      requires_confirmation: false,
      why_this_command: 'ls is the standard POSIX utility for folder inspection; -la provides the most comprehensive directory overview.',
      alternatives: [
        { command: 'ls -lh', description: 'Lists files with human-readable sizes (MB, GB)' },
        { command: 'tree -L 2', description: 'Displays directory structure in a visual tree format' }
      ],
      rollback_note: 'No rollback required (read-only).',
      source: 'local_fallback'
    })
  },
  {
    regex: /find.*(python|\.py).*(\+|larger|size|>|10mb|10m)/i,
    result: () => ({
      command: 'find . -type f -name "*.py" -size +10M',
      explanation: 'Recursively searches the current directory and all subdirectories for Python script files (.py) whose size exceeds 10 megabytes.',
      risk_level: 'LOW',
      risk_reason: 'Read-only file search operation with zero disk write or modification side-effects.',
      flags: [
        { flag: '-type f', meaning: 'Restricts search strictly to regular files, excluding directories' },
        { flag: '-name "*.py"', meaning: 'Matches filenames ending with the .py extension' },
        { flag: '-size +10M', meaning: 'Filters for files strictly larger than 10 Megabytes' }
      ],
      requires_confirmation: false,
      why_this_command: 'The find utility efficiently traverses filesystem trees with compound criteria filtering.',
      alternatives: [
        { command: 'du -ah . | grep "\\.py$"', description: 'Lists sizes of all Python files in the folder tree' }
      ],
      rollback_note: 'No rollback needed.',
      source: 'local_fallback'
    })
  },
  {
    regex: /find.*(python|\.py)|search.*(python|\.py)/i,
    result: () => ({
      command: 'find . -type f -name "*.py"',
      explanation: 'Searches the current directory tree for all Python files (.py).',
      risk_level: 'LOW',
      risk_reason: 'Read-only file search query.',
      flags: [
        { flag: '-type f', meaning: 'Matches regular files only' },
        { flag: '-name "*.py"', meaning: 'Filters by .py file extension' }
      ],
      requires_confirmation: false,
      why_this_command: 'find is the most standard and versatile file lookup tool in Linux.',
      source: 'local_fallback'
    })
  },
  {
    regex: /disk\s+usage|free\s+space|storage|check\s+disk/i,
    result: () => ({
      command: 'df -h',
      explanation: 'Displays the amount of total, used, and available disk space on all mounted filesystems in human-readable units (GB, MB).',
      risk_level: 'LOW',
      risk_reason: 'Read-only system diagnostic command.',
      flags: [
        { flag: '-h', meaning: 'Format block counts into human-readable units like MB and GB' }
      ],
      requires_confirmation: false,
      why_this_command: 'df (disk free) reads VFS partition statistics directly from the Linux kernel.',
      alternatives: [
        { command: 'du -sh *', description: 'Calculates the space consumed by each item in current directory' },
        { command: 'lsblk', description: 'Lists all storage block devices and partitions in a tree view' }
      ],
      source: 'local_fallback'
    })
  },
  {
    regex: /process.*(memory|mem|cpu|running)|which\s+process|top\s+process/i,
    result: () => ({
      command: 'ps aux --sort=-%mem | head -n 10',
      explanation: 'Lists active processes sorted by memory consumption in descending order, showing the top 10 most memory-intensive tasks.',
      risk_level: 'LOW',
      risk_reason: 'Read-only kernel process table inspection.',
      flags: [
        { flag: 'aux', meaning: 'Display all running processes across all users with terminal info' },
        { flag: '--sort=-%mem', meaning: 'Sort descending based on percentage of physical RAM used' }
      ],
      requires_confirmation: false,
      why_this_command: 'ps aux combined with sorting gives an instant snapshot of system resource bottlenecks.',
      alternatives: [
        { command: 'top', description: 'Launches real-time dynamic process manager' },
        { command: 'htop', description: 'Interactive color-coded terminal process viewer' }
      ],
      source: 'local_fallback'
    })
  },
  {
    regex: /create.*(folder|directory)\s+(called\s+|named\s+)?([a-zA-Z0-9_\-]+)/i,
    result: (p) => {
      const match = p.match(/create.*(folder|directory)\s+(called\s+|named\s+)?([a-zA-Z0-9_\-]+)/i);
      const folderName = match?.[3] || 'projects';
      return {
        command: `mkdir -p ${folderName}`,
        explanation: `Creates a new directory called '${folderName}'. If parent directories are missing, they will be created automatically without error.`,
        risk_level: 'MEDIUM',
        risk_reason: 'Modifies filesystem structure by allocating a new directory inode.',
        flags: [
          { flag: '-p', meaning: 'Create parent directories as necessary and avoid error if folder already exists' }
        ],
        requires_confirmation: false,
        why_this_command: 'mkdir is the POSIX standard directory creation utility.',
        rollback_note: `To undo, run: rmdir ${folderName}`,
        source: 'local_fallback'
      };
    }
  },
  {
    regex: /delete.*(temp|temporary|cache|\.log)\s+files?/i,
    result: () => ({
      command: 'find /tmp -type f -atime +7 -delete',
      explanation: 'Finds and permanently deletes files in /tmp that have not been accessed in over 7 days.',
      risk_level: 'HIGH',
      risk_reason: 'Permanently deletes files from disk without sending to a trash can.',
      flags: [
        { flag: '-type f', meaning: 'Targets regular files only' },
        { flag: '-atime +7', meaning: 'Filters files with access timestamp older than 7 days' },
        { flag: '-delete', meaning: 'Deletes matched files immediately during traversal' }
      ],
      requires_confirmation: true,
      why_this_command: 'Using find with an age limit avoids deleting currently active temporary lockfiles.',
      alternatives: [
        { command: 'find /tmp -type f -atime +7', description: 'Dry run: review files before deleting' }
      ],
      warnings: ['Deleted files cannot be recovered. Verify directory path carefully before confirming.'],
      rollback_note: 'Irreversible deletion unless file backup exists.',
      source: 'local_fallback'
    })
  },
  {
    regex: /delete\s+everything|rm\s+-rf\s+\/|destroy\s+system/i,
    result: () => ({
      command: 'rm -rf / --no-preserve-root',
      explanation: 'Attempts recursive forceful deletion of all files starting from the system root partition.',
      risk_level: 'CRITICAL',
      risk_reason: 'Destroys the entire operating system, all user data, system libraries, and bootloader configuration.',
      flags: [
        { flag: '-r', meaning: 'Recursive deletion across directory hierarchies' },
        { flag: '-f', meaning: 'Force execution, ignoring non-existent files and suppress prompts' },
        { flag: '--no-preserve-root', meaning: 'Disable built-in safety protection that guards the root directory' }
      ],
      requires_confirmation: true,
      is_blocked: true,
      why_this_command: 'Dangerous command pattern generated for demonstration of safety interlocks.',
      warnings: ['CRITICAL DANGER: Execution strictly blocked by ShellSense Safety Engine.'],
      source: 'local_fallback'
    })
  }
];

export async function generateCommandWithAI(
  prompt: string,
  options?: { mode?: 'cloud' | 'local'; isDemo?: boolean }
): Promise<CommandGenerationResponse> {
  const trimmed = prompt.trim();

  // If local mode or demo scenario matched
  if (options?.mode === 'local') {
    for (const preset of PRESET_PATTERNS) {
      if (preset.regex.test(trimmed)) {
        const res = preset.result(trimmed);
        const safety = analyzeCommand(res.command);
        return {
          ...res,
          risk_level: safety.risk_level,
          risk_reason: safety.risk_reason || res.risk_reason,
          requires_confirmation: safety.requires_confirmation || res.requires_confirmation,
          is_blocked: safety.is_blocked || res.is_blocked,
          warnings: safety.warnings,
          safe_alternatives: safety.safe_alternatives,
          source: 'local_fallback'
        };
      }
    }
  }

  // Try Gemini API if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const systemInstruction = `You are ShellSense, an expert Linux system administrator and security engineer assistant.
Convert natural language requests into precise, safe Linux/Bash commands.
Always provide a crystal-clear plain-English explanation and breakdown of each flag.
Assess the risk honestly (LOW for read-only / informational, MEDIUM for state creation or non-destructive change, HIGH for deletion or permission alteration, CRITICAL for destructive system wipe or dangerous binary operations).
Return structured JSON matching the requested schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Convert the following user request into a safe Linux shell command:
User Request: "${trimmed}"`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              command: {
                type: Type.STRING,
                description: 'The Linux bash command to execute.'
              },
              explanation: {
                type: Type.STRING,
                description: 'Simple plain-English explanation of what the command does.'
              },
              risk_level: {
                type: Type.STRING,
                description: 'Risk tier: LOW, MEDIUM, HIGH, or CRITICAL'
              },
              risk_reason: {
                type: Type.STRING,
                description: 'Why this risk tier was assigned.'
              },
              flags: {
                type: Type.ARRAY,
                description: 'Breakdown of flags and arguments.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    flag: { type: Type.STRING },
                    meaning: { type: Type.STRING }
                  },
                  required: ['flag', 'meaning']
                }
              },
              requires_confirmation: {
                type: Type.BOOLEAN,
                description: 'Whether human confirmation is required before execution.'
              },
              why_this_command: {
                type: Type.STRING,
                description: 'Brief explanation of why this specific utility and syntax was chosen.'
              },
              rollback_note: {
                type: Type.STRING,
                description: 'Guidance on how to undo or rollback this command, or warning if irreversible.'
              }
            },
            required: ['command', 'explanation', 'risk_level', 'risk_reason', 'flags', 'requires_confirmation']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      
      // CRITICAL: Always cross-verify with backend deterministic safety engine!
      const safety = analyzeCommand(parsed.command || 'echo "no command"');
      const finalRisk: RiskLevel = (safety.risk_level === 'CRITICAL' || safety.risk_level === 'HIGH') 
        ? safety.risk_level 
        : (parsed.risk_level as RiskLevel || safety.risk_level);

      return {
        command: parsed.command || 'ls -la',
        explanation: parsed.explanation || 'Inspects the directory contents.',
        risk_level: finalRisk,
        risk_reason: safety.risk_reason || parsed.risk_reason || 'Verified command safety.',
        flags: parsed.flags?.length ? parsed.flags : safety.flags,
        requires_confirmation: safety.requires_confirmation || parsed.requires_confirmation || finalRisk !== 'LOW',
        why_this_command: parsed.why_this_command || 'Standard POSIX compliant command choice.',
        rollback_note: parsed.rollback_note || 'Standard shell command.',
        is_blocked: safety.is_blocked,
        warnings: safety.warnings,
        safe_alternatives: safety.safe_alternatives,
        source: 'gemini'
      };
    } catch (err) {
      console.warn('Gemini API call encountered error, falling back to local heuristic engine:', err);
    }
  }

  // Local heuristic fallback
  for (const preset of PRESET_PATTERNS) {
    if (preset.regex.test(trimmed)) {
      const res = preset.result(trimmed);
      const safety = analyzeCommand(res.command);
      return {
        ...res,
        risk_level: safety.risk_level,
        risk_reason: safety.risk_reason || res.risk_reason,
        requires_confirmation: safety.requires_confirmation || res.requires_confirmation,
        is_blocked: safety.is_blocked || res.is_blocked,
        warnings: safety.warnings,
        safe_alternatives: safety.safe_alternatives,
        source: 'local_fallback'
      };
    }
  }

  // Dynamic generic fallback for unhandled prompts
  const fallbackCmd = `grep -ri "${trimmed.replace(/["\\]/g, '')}" .`;
  const safety = analyzeCommand(fallbackCmd);
  return {
    command: fallbackCmd,
    explanation: `Searches the current directory recursively for references to '${trimmed}'.`,
    risk_level: 'LOW',
    risk_reason: 'Read-only pattern search across files in working directory.',
    flags: [
      { flag: '-r', meaning: 'Recursively search subdirectories' },
      { flag: '-i', meaning: 'Case-insensitive search matching' }
    ],
    requires_confirmation: false,
    why_this_command: 'grep is the fastest way to search directory contents for textual keywords.',
    rollback_note: 'No rollback required (read-only search).',
    is_blocked: safety.is_blocked,
    warnings: safety.warnings,
    safe_alternatives: safety.safe_alternatives,
    source: 'local_fallback'
  };
}
