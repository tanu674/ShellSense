export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CommandFlag {
  flag: string;
  meaning: string;
}

export interface RiskRule {
  id: string;
  pattern: RegExp;
  risk_level: RiskLevel;
  reason: string;
  is_blocked: boolean;
  requires_confirmation: boolean;
  warnings?: string[];
  safe_alternative?: string;
}

// Built-in rule catalog for Linux commands
export const SAFETY_RULES: RiskRule[] = [
  // CRITICAL / Blocked patterns
  {
    id: 'rm_root',
    pattern: /\brm\s+-[a-zA-Z]*r[a-zA-Z]*f?[a-zA-Z]*\s+[\/\~](\s|$|\*)/i,
    risk_level: 'CRITICAL',
    reason: 'Attempting to recursively force-delete root (/) or user home (~) directory.',
    is_blocked: true,
    requires_confirmation: true,
    warnings: ['This operation would permanently destroy the entire operating system or user home environment.'],
    safe_alternative: 'rm -i specific_file.txt'
  },
  {
    id: 'rm_wildcard_root',
    pattern: /\brm\s+-[a-zA-Z]*r[a-zA-Z]*\s+--no-preserve-root/i,
    risk_level: 'CRITICAL',
    reason: 'Bypassing root safety preservation flag in rm.',
    is_blocked: true,
    requires_confirmation: true,
    warnings: ['Execution blocked to prevent fatal system destruction.'],
  },
  {
    id: 'fork_bomb',
    pattern: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/,
    risk_level: 'CRITICAL',
    reason: 'Detected Linux fork bomb bash sequence.',
    is_blocked: true,
    requires_confirmation: true,
    warnings: ['A fork bomb causes total system resource exhaustion and kernel lockup.']
  },
  {
    id: 'raw_device_write',
    pattern: />\s*\/dev\/(sd[a-z]|nvme\d+n\d+|vd[a-z]|hd[a-z]|zero|null)/i,
    risk_level: 'CRITICAL',
    reason: 'Direct raw block device write redirection.',
    is_blocked: true,
    requires_confirmation: true,
    warnings: ['Writing directly to a raw disk block destroys partition tables and file systems.']
  },
  {
    id: 'mkfs_destructive',
    pattern: /\b(mkfs(\.[a-z0-9]+)?|mke2fs)\s+\/dev\//i,
    risk_level: 'CRITICAL',
    reason: 'Filesystem formatting on device.',
    is_blocked: true,
    requires_confirmation: true,
    warnings: ['Reformatting will erase all existing data on the target storage volume.']
  },
  {
    id: 'dd_device_overwrite',
    pattern: /\bdd\s+.*of=\/dev\/(sd[a-z]|nvme|vd[a-z]|hd[a-z])/i,
    risk_level: 'CRITICAL',
    reason: 'Low-level disk overwrite with dd.',
    is_blocked: true,
    requires_confirmation: true,
    warnings: ['dd can overwrite partition tables and unrecoverably corrupt data.']
  },
  {
    id: 'fdisk_parted_wipe',
    pattern: /\b(fdisk|gdisk|parted|wipefs|shred)\s+\/dev\//i,
    risk_level: 'CRITICAL',
    reason: 'Disk partitioning or permanent device shredding.',
    is_blocked: true,
    requires_confirmation: true,
    warnings: ['Partition table modification or drive wipe detected.']
  },
  {
    id: 'chmod_recursive_777_root',
    pattern: /\bchmod\s+-[a-zA-Z]*R\s+(777|0777|a\+rwx)\s+[\/]/i,
    risk_level: 'CRITICAL',
    reason: 'Setting global read/write/execute permissions on root directory tree.',
    is_blocked: true,
    requires_confirmation: true,
    warnings: ['Broad permissive chmod on root breaks Linux permission model and authentication daemon (sudo/ssh).']
  },
  {
    id: 'system_shutdown',
    pattern: /\b(shutdown\s+-h|poweroff|halt|init\s+0)\b/i,
    risk_level: 'CRITICAL',
    reason: 'Immediate system shutdown / poweroff.',
    is_blocked: false,
    requires_confirmation: true,
    warnings: ['This will terminate all running services and shut down the system.']
  },

  // HIGH risk patterns
  {
    id: 'rm_recursive',
    pattern: /\brm\s+-[a-zA-Z]*[rR]/i,
    risk_level: 'HIGH',
    reason: 'Recursive deletion of files and directories.',
    is_blocked: false,
    requires_confirmation: true,
    warnings: ['Deleted files bypass Trash and cannot be easily recovered.'],
    safe_alternative: 'trash-put directory/ or mv directory/ /tmp/backup/'
  },
  {
    id: 'rm_single',
    pattern: /\brm\s+/i,
    risk_level: 'HIGH',
    reason: 'File deletion command.',
    is_blocked: false,
    requires_confirmation: true,
    warnings: ['This will permanently delete the specified file(s).'],
    safe_alternative: 'rm -i (interactive prompt) or mv to trash'
  },
  {
    id: 'find_delete',
    pattern: /\bfind\s+.*-delete\b/i,
    risk_level: 'HIGH',
    reason: 'Batch find with automatic -delete flag.',
    is_blocked: false,
    requires_confirmation: true,
    warnings: ['Will delete all matching files immediately without prompt.'],
    safe_alternative: 'Run find without -delete first to review matching files, e.g. find . -name "*.log"'
  },
  {
    id: 'find_exec_rm',
    pattern: /\bfind\s+.*-exec\s+rm\b/i,
    risk_level: 'HIGH',
    reason: 'Find executing rm on matched files.',
    is_blocked: false,
    requires_confirmation: true,
    warnings: ['Will remove all matched search items.']
  },
  {
    id: 'pipe_to_shell',
    pattern: /\b(curl|wget|fetch)\s+.*\|\s*(bash|sh|sudo\s+bash|zsh)/i,
    risk_level: 'HIGH',
    reason: 'Piping remote web script directly into a shell interpreter.',
    is_blocked: false,
    requires_confirmation: true,
    warnings: ['Remote script execution without prior code inspection is a major security risk.'],
    safe_alternative: 'curl -O script.sh && less script.sh'
  },
  {
    id: 'chmod_recursive',
    pattern: /\bchmod\s+-[a-zA-Z]*R\b/i,
    risk_level: 'HIGH',
    reason: 'Recursive permission modification across an entire folder tree.',
    is_blocked: false,
    requires_confirmation: true,
    warnings: ['Recursive chmod affects all subfolders and files.']
  },
  {
    id: 'chown_recursive',
    pattern: /\bchown\s+-[a-zA-Z]*R\b/i,
    risk_level: 'HIGH',
    reason: 'Recursive ownership transfer across files.',
    is_blocked: false,
    requires_confirmation: true
  },
  {
    id: 'iptables_flush',
    pattern: /\b(iptables\s+-F|ufw\s+disable|nft\s+flush)\b/i,
    risk_level: 'HIGH',
    reason: 'Disabling or flushing firewall rules.',
    is_blocked: false,
    requires_confirmation: true,
    warnings: ['This removes network packet filtering protections.']
  },
  {
    id: 'reboot_command',
    pattern: /\b(reboot|init\s+6)\b/i,
    risk_level: 'HIGH',
    reason: 'System reboot request.',
    is_blocked: false,
    requires_confirmation: true
  },
  {
    id: 'truncate_write',
    pattern: />\s*(\/etc\/|\/boot\/|\/usr\/|\/bin\/|\/sbin\/)/i,
    risk_level: 'HIGH',
    reason: 'Overwriting critical system configuration or binary files.',
    is_blocked: false,
    requires_confirmation: true
  },

  // MEDIUM risk patterns
  {
    id: 'move_rename',
    pattern: /\bmv\s+/i,
    risk_level: 'MEDIUM',
    reason: 'Moving or renaming files/directories.',
    is_blocked: false,
    requires_confirmation: true,
    warnings: ['Existing destination files might be overwritten if not using -n or -i.']
  },
  {
    id: 'copy_files',
    pattern: /\bcp\s+/i,
    risk_level: 'MEDIUM',
    reason: 'Copying files or directories.',
    is_blocked: false,
    requires_confirmation: false
  },
  {
    id: 'create_directory',
    pattern: /\bmkdir\s+/i,
    risk_level: 'MEDIUM',
    reason: 'Creating new directory structure.',
    is_blocked: false,
    requires_confirmation: false
  },
  {
    id: 'touch_file',
    pattern: /\btouch\s+/i,
    risk_level: 'MEDIUM',
    reason: 'Creating new empty file or updating timestamp.',
    is_blocked: false,
    requires_confirmation: false
  },
  {
    id: 'sed_inplace',
    pattern: /\bsed\s+-[a-zA-Z]*i/i,
    risk_level: 'MEDIUM',
    reason: 'Modifying file contents in-place with sed.',
    is_blocked: false,
    requires_confirmation: true,
    warnings: ['Edits files directly without preserving separate originals unless a backup suffix is specified.']
  },
  {
    id: 'kill_process',
    pattern: /\b(kill|pkill|killall)\s+/i,
    risk_level: 'MEDIUM',
    reason: 'Terminating active operating system processes.',
    is_blocked: false,
    requires_confirmation: true,
    warnings: ['Terminating a process might cause unsaved in-memory state loss.']
  },
  {
    id: 'systemctl_service',
    pattern: /\bsystemctl\s+(stop|restart|reload|disable|mask)\b/i,
    risk_level: 'MEDIUM',
    reason: 'Changing state of system service daemons.',
    is_blocked: false,
    requires_confirmation: true
  },
  {
    id: 'package_manager_install',
    pattern: /\b(apt(-get)?|yum|dnf|pacman|apk|brew)\s+(install|remove|purge|update|upgrade)\b/i,
    risk_level: 'MEDIUM',
    reason: 'Installing, updating or modifying software packages.',
    is_blocked: false,
    requires_confirmation: true
  },
  {
    id: 'tar_extract',
    pattern: /\btar\s+.*-[a-zA-Z]*x/i,
    risk_level: 'MEDIUM',
    reason: 'Extracting archive files into working directory.',
    is_blocked: false,
    requires_confirmation: false
  },
  {
    id: 'git_destructive',
    pattern: /\bgit\s+(reset\s+--hard|clean\s+-f|checkout\s+\.|branch\s+-D)\b/i,
    risk_level: 'MEDIUM',
    reason: 'Destructive git operations that discard uncommitted or branch changes.',
    is_blocked: false,
    requires_confirmation: true
  }
];

// Common Flag dictionary for Linux commands
export const COMMON_FLAG_DICT: Record<string, Record<string, string>> = {
  find: {
    '-type f': 'Search for regular files only (excluding directories)',
    '-type d': 'Search for directories only',
    '-name': 'Filter files matching case-sensitive filename pattern',
    '-iname': 'Filter files matching case-insensitive filename pattern',
    '-size': 'Filter files matching specific size threshold (e.g. +10M = >10MB)',
    '-mtime': 'Filter files modified within specific day range',
    '-mmin': 'Filter files modified within specific minute range',
    '-maxdepth': 'Limit search directory traversal depth',
    '-exec': 'Execute specified utility command on every matched result',
    '-delete': 'Immediately delete matched files and directories',
  },
  ls: {
    '-l': 'Long listing format (permissions, ownership, size, timestamp)',
    '-a': 'Include hidden files (starting with .)',
    '-h': 'Human-readable file sizes (e.g., 1K, 234M, 2G)',
    '-t': 'Sort listing by modification time, newest first',
    '-r': 'Reverse sort order',
    '-R': 'Recursively list subdirectories',
    '-S': 'Sort files by size, largest first',
  },
  grep: {
    '-r': 'Recursively search all files under directory tree',
    '-R': 'Recursively search following symbolic links',
    '-i': 'Case-insensitive search matching',
    '-n': 'Prefix each line of output with the 1-based line number',
    '-v': 'Invert match to select non-matching lines',
    '-l': 'Print only filenames containing matches',
    '-c': 'Print only count of matching lines per file',
    '-E': 'Interpret search pattern as Extended Regular Expression (ERE)',
    '-w': 'Match only whole words',
  },
  df: {
    '-h': 'Human-readable output (GB, MB)',
    '-T': 'Print filesystem type (ext4, tmpfs, etc.)',
    '-i': 'List inode information instead of block usage',
  },
  du: {
    '-h': 'Human-readable format (e.g., 1K, 234M, 2G)',
    '-s': 'Display only a total sum for each argument',
    '-d': 'Maximum directory depth for summary (e.g., -d 1)',
    '-a': 'Write counts for all files, not just directories',
  },
  ps: {
    'aux': 'List all running processes across all users with terminal info',
    '-ef': 'Standard full-format process listing across all users',
    '--sort': 'Sort processes by specified attribute (e.g. --sort=-%mem)',
  },
  tar: {
    '-c': 'Create a new archive archive',
    '-x': 'Extract files from an archive',
    '-z': 'Compress or decompress archive using gzip',
    '-j': 'Compress or decompress archive using bzip2',
    '-v': 'Verbosely list files processed',
    '-f': 'Specify archive file name',
  },
  rm: {
    '-r': 'Recursively remove directories and their contents',
    '-f': 'Force remove without prompting for confirmation or warnings',
    '-i': 'Prompt before every file removal (interactive)',
    '-v': 'Explain what is being done (verbose)',
  },
  mkdir: {
    '-p': 'Create parent directories as needed without erroring if exists',
    '-v': 'Print a message for each created directory',
  },
  chmod: {
    '-R': 'Change files and directories recursively',
    '+x': 'Add execution permissions',
    '755': 'Owner rwx, Group and Others r-x',
    '644': 'Owner rw-, Group and Others r--',
  }
};

/**
 * Main deterministic command safety analysis engine.
 */
export function analyzeCommand(command: string): {
  risk_level: RiskLevel;
  risk_reason: string;
  requires_confirmation: boolean;
  is_blocked: boolean;
  flags: CommandFlag[];
  warnings: string[];
  safe_alternatives: string[];
  destructive_patterns_matched: string[];
} {
  const trimmed = command.trim();
  if (!trimmed) {
    return {
      risk_level: 'LOW',
      risk_reason: 'Empty command.',
      requires_confirmation: false,
      is_blocked: false,
      flags: [],
      warnings: [],
      safe_alternatives: [],
      destructive_patterns_matched: []
    };
  }

  let highestRisk: RiskLevel = 'LOW';
  let primaryReason = 'Safe read-only or informational command.';
  let requiresConfirmation = false;
  let isBlocked = false;
  const warnings: string[] = [];
  const safeAlternatives: string[] = [];
  const matchedRuleIds: string[] = [];

  const riskOrder: Record<RiskLevel, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  // Evaluate against rule catalog
  for (const rule of SAFETY_RULES) {
    if (rule.pattern.test(trimmed)) {
      matchedRuleIds.push(rule.id);
      if (riskOrder[rule.risk_level] > riskOrder[highestRisk]) {
        highestRisk = rule.risk_level;
        primaryReason = rule.reason;
      }
      if (rule.requires_confirmation) {
        requiresConfirmation = true;
      }
      if (rule.is_blocked) {
        isBlocked = true;
      }
      if (rule.warnings) {
        warnings.push(...rule.warnings);
      }
      if (rule.safe_alternative) {
        safeAlternatives.push(rule.safe_alternative);
      }
    }
  }

  // Extract flag meanings
  const extractedFlags: CommandFlag[] = [];
  const baseCmd = trimmed.split(/\s+/)[0]?.replace(/^sudo\s+/, '');
  
  if (baseCmd && COMMON_FLAG_DICT[baseCmd]) {
    const dict = COMMON_FLAG_DICT[baseCmd];
    for (const [flagKey, meaning] of Object.entries(dict)) {
      if (trimmed.includes(flagKey)) {
        extractedFlags.push({ flag: flagKey, meaning });
      }
    }
  } else {
    // Generic flag detection
    const flagTokens = trimmed.match(/-[a-zA-Z0-9-]+/g) || [];
    for (const token of flagTokens) {
      if (!extractedFlags.some(f => f.flag === token)) {
        extractedFlags.push({
          flag: token,
          meaning: `Option flag passed to ${baseCmd || 'command'}`
        });
      }
    }
  }

  return {
    risk_level: highestRisk,
    risk_reason: primaryReason,
    requires_confirmation: requiresConfirmation || highestRisk === 'HIGH' || highestRisk === 'CRITICAL' || highestRisk === 'MEDIUM',
    is_blocked: isBlocked,
    flags: extractedFlags,
    warnings: Array.from(new Set(warnings)),
    safe_alternatives: Array.from(new Set(safeAlternatives)),
    destructive_patterns_matched: matchedRuleIds
  };
}
