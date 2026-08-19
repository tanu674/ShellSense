import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { generateCommandWithAI } from './server/geminiService.ts';
import { analyzeCommand } from './server/safetyEngine.ts';
import { defaultSandbox } from './server/sandbox.ts';
import { HistoryItem, SafetyStats, LearningTopic } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Audit & History Store
const historyStore: HistoryItem[] = [
  {
    id: 'hist-1',
    prompt: 'Show all files in the current directory',
    command: 'ls -la',
    explanation: 'Lists all files and directories with long details including hidden files.',
    risk_level: 'LOW',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    executed: true,
    execution_status: 'success',
    execution_result: {
      success: true,
      command: 'ls -la',
      stdout: `total 24\ndrwxr-xr-x  5 user user 4096 Aug 19 01:00 .\ndrwxr-xr-x  3 root root 4096 Aug 19 00:01 ..\ndrwxr-xr-x  3 user user 4096 Aug 19 01:10 projects/\ndrwxr-xr-x  2 user user 4096 Aug 19 00:45 documents/\ndrwxr-xr-x  2 user user 4096 Aug 19 01:20 logs/\n-rw-r--r--  1 user user 1240 Aug 19 01:00 README.md\n-rw-r--r--  1 user user 45000 Aug 19 00:30 data.csv`,
      stderr: '',
      exitCode: 0,
      executionTimeMs: 14,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    source: 'demo'
  },
  {
    id: 'hist-2',
    prompt: 'Find all Python files larger than 10MB',
    command: 'find . -type f -name "*.py" -size +10M',
    explanation: 'Searches for regular Python files with size exceeding 10MB.',
    risk_level: 'LOW',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    executed: true,
    execution_status: 'success',
    execution_result: {
      success: true,
      command: 'find . -type f -name "*.py" -size +10M',
      stdout: `./documents/dataset_samples.csv (11.4 MB)`,
      stderr: '',
      exitCode: 0,
      executionTimeMs: 22,
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    source: 'demo'
  }
];

// In-memory safety metrics accumulator
const safetyStats: SafetyStats = {
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
};

// Learning Mode Topics
const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'find',
    name: 'find',
    category: 'file_management',
    summary: 'Traverse filesystem hierarchies to locate files and directories matching conditions.',
    syntax: 'find [path] [options] [expression]',
    commonFlags: [
      { flag: '-type f', meaning: 'Restrict search strictly to regular files' },
      { flag: '-name "*.ext"', meaning: 'Pattern match on filename (case sensitive)' },
      { flag: '-size +10M', meaning: 'Filter items larger than 10 Megabytes' },
      { flag: '-mtime -1', meaning: 'Files modified less than 24 hours ago' },
      { flag: '-delete', meaning: 'Delete matching files (HIGH RISK)' }
    ],
    examples: [
      {
        prompt: 'Find Python files in project',
        command: 'find . -name "*.py"',
        description: 'Searches subdirectories for Python scripts',
        risk: 'LOW'
      },
      {
        prompt: 'Find large files over 100MB',
        command: 'find /var/log -type f -size +100M',
        description: 'Finds oversized log files in system log partition',
        risk: 'LOW'
      },
      {
        prompt: 'Delete temporary backup files',
        command: 'find . -name "*.bak" -delete',
        description: 'Deletes all backup files immediately',
        risk: 'HIGH'
      }
    ],
    pitfalls: [
      'Using -delete without testing the search criteria first can accidentally wipe needed files.',
      'Wildcards like *.py must be enclosed in quotes to prevent premature shell expansion.'
    ]
  },
  {
    id: 'grep',
    name: 'grep',
    category: 'text_processing',
    summary: 'Search plain-text datasets for lines matching a regular expression.',
    syntax: 'grep [options] PATTERN [FILE...]',
    commonFlags: [
      { flag: '-r, --recursive', meaning: 'Recursively search subdirectories' },
      { flag: '-i, --ignore-case', meaning: 'Ignore case distinctions in patterns' },
      { flag: '-n, --line-number', meaning: 'Prefix each output line with line number' },
      { flag: '-v, --invert-match', meaning: 'Select non-matching lines' },
      { flag: '-l, --files-with-matches', meaning: 'Print only names of FILEs with matches' }
    ],
    examples: [
      {
        prompt: 'Search for errors in log files',
        command: 'grep -ri "error" /var/log/',
        description: 'Case-insensitive recursive scan for error messages',
        risk: 'LOW'
      },
      {
        prompt: 'Find TODO comments in code',
        command: 'grep -rn "TODO" src/',
        description: 'Finds TODO comments with exact file line numbers',
        risk: 'LOW'
      }
    ],
    pitfalls: [
      'Searching binary files without -I can produce messy terminal control characters.',
      'Grepping massive log files without limiting search depth can cause high CPU load.'
    ]
  },
  {
    id: 'chmod',
    name: 'chmod',
    category: 'permissions',
    summary: 'Change file mode bits (read, write, execute access permissions).',
    syntax: 'chmod [options] MODE FILE...',
    commonFlags: [
      { flag: '-R, --recursive', meaning: 'Change files and directories recursively' },
      { flag: '+x', meaning: 'Make target executable for all users' },
      { flag: '755', meaning: 'rwxr-xr-x (Owner full, group/others read and execute)' },
      { flag: '644', meaning: 'rw-r--r-- (Owner read/write, group/others read only)' },
      { flag: '777', meaning: 'rwxrwxrwx (Full permissions for everyone - HIGH RISK)' }
    ],
    examples: [
      {
        prompt: 'Make script executable',
        command: 'chmod +x deploy.sh',
        description: 'Grants execution privilege to the shell script',
        risk: 'MEDIUM'
      },
      {
        prompt: 'Secure private SSH key',
        command: 'chmod 600 ~/.ssh/id_rsa',
        description: 'Limits file access strictly to the owner',
        risk: 'MEDIUM'
      },
      {
        prompt: 'Give all permissions to web directory',
        command: 'chmod -R 777 /var/www/html',
        description: 'Permissive permission change across entire web root',
        risk: 'HIGH'
      }
    ],
    pitfalls: [
      'Avoid setting 777 permissions in production as it allows any local process to modify code.',
      'Recursive chmod on / can destroy sudoers file authentication and break SSH access.'
    ]
  },
  {
    id: 'df_du',
    name: 'df & du',
    category: 'system_monitoring',
    summary: 'Inspect disk filesystem capacity (df) and directory space consumption (du).',
    syntax: 'df -h | du -sh [dir]',
    commonFlags: [
      { flag: '-h', meaning: 'Print sizes in human-readable powers of 1024 (e.g. 1023M)' },
      { flag: '-s', meaning: 'Display only a total sum for each argument (du)' },
      { flag: '-d 1', meaning: 'Depth 1 summary for top-level directories' }
    ],
    examples: [
      {
        prompt: 'Check overall disk free space',
        command: 'df -h',
        description: 'Shows storage usage for all mounted disks',
        risk: 'LOW'
      },
      {
        prompt: 'Find largest folders in current directory',
        command: 'du -h -d 1 . | sort -hr',
        description: 'Sorts immediate subfolders by disk footprint',
        risk: 'LOW'
      }
    ],
    pitfalls: [
      'Running du on NFS or remote network mounts can cause network latency.',
      'df shows filesystem blocks while du traverses directory inodes.'
    ]
  },
  {
    id: 'ps_kill',
    name: 'ps & kill',
    category: 'system_monitoring',
    summary: 'Monitor running processes and send termination signals to unresponsive tasks.',
    syntax: 'ps aux | kill [-SIGNAL] PID',
    commonFlags: [
      { flag: 'aux', meaning: 'Display all running processes for all users' },
      { flag: '--sort=-%mem', meaning: 'Sort output descending by RAM usage' },
      { flag: '-9 (SIGKILL)', meaning: 'Force kill process immediately without cleanup' },
      { flag: '-15 (SIGTERM)', meaning: 'Polite request to terminate and close file handles' }
    ],
    examples: [
      {
        prompt: 'Find processes using most memory',
        command: 'ps aux --sort=-%mem | head -n 10',
        description: 'Lists top 10 memory-heavy processes',
        risk: 'LOW'
      },
      {
        prompt: 'Stop running process with PID 1420',
        command: 'kill -15 1420',
        description: 'Sends graceful termination signal',
        risk: 'MEDIUM'
      }
    ],
    pitfalls: [
      'Always try SIGTERM (-15) before SIGKILL (-9) to avoid database corruption or orphaned sockets.',
      'Using killall with common names might kill multiple unintended processes.'
    ]
  },
  {
    id: 'tar',
    name: 'tar',
    category: 'archiving',
    summary: 'Create, inspect, and extract tape archive files (.tar, .tar.gz, .tgz).',
    syntax: 'tar [options] [archive-file] [target-files]',
    commonFlags: [
      { flag: '-c', meaning: 'Create a new archive file' },
      { flag: '-x', meaning: 'Extract files from an existing archive' },
      { flag: '-z', meaning: 'Filter the archive through gzip compression' },
      { flag: '-v', meaning: 'Verbosely list files processed' },
      { flag: '-f', meaning: 'Specify the archive filename' }
    ],
    examples: [
      {
        prompt: 'Compress project directory into backup',
        command: 'tar -czvf project_backup.tar.gz ./projects',
        description: 'Compresses folder into gzip archive',
        risk: 'MEDIUM'
      },
      {
        prompt: 'Extract archive into current folder',
        command: 'tar -xzvf backup.tar.gz',
        description: 'Extracts archive contents to current directory',
        risk: 'MEDIUM'
      }
    ],
    pitfalls: [
      'Extracting untrusted tar archives without checking their contents can overwrite existing files.',
      'Order of flags matters: the -f flag must immediately precede the filename.'
    ]
  }
];

// API Endpoints

// 1. Health check
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    ai_status: hasGeminiKey ? 'online' : 'local_fallback',
    safety_engine: 'active',
    environment: 'Linux Sandbox (Ubuntu 24.04)',
    version: '1.0.0'
  });
});

// 2. Command Generation (AI + Safety pass)
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, mode, isDemo } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const generated = await generateCommandWithAI(prompt, { mode, isDemo });
    
    // Increment safety statistics
    safetyStats.totalAnalyzed++;
    safetyStats.riskDistribution[generated.risk_level]++;
    if (generated.risk_level === 'LOW') safetyStats.safeCount++;
    if (generated.risk_level === 'MEDIUM') safetyStats.mediumRiskCount++;
    if (generated.risk_level === 'HIGH') safetyStats.highRiskCount++;
    if (generated.risk_level === 'CRITICAL' || generated.is_blocked) {
      safetyStats.blockedCount++;
      safetyStats.lastBlockedCommand = generated.command;
    }

    const result = {
      ...generated,
      id: `gen-${Date.now()}`,
      original_prompt: prompt,
      timestamp: new Date().toISOString()
    };

    res.json(result);
  } catch (err: any) {
    console.error('Error generating command:', err);
    res.status(500).json({ error: err.message || 'Failed to generate command' });
  }
});

// 3. Safety / Risk Analysis
app.post('/api/analyze-risk', (req, res) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command string is required' });
    }

    const analysis = analyzeCommand(command);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// 4. Safe Execution Endpoint (re-verifies safety on backend before executing)
app.post('/api/execute', (req, res) => {
  try {
    const { command, prompt, confirmed, source } = req.body;
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required' });
    }

    // MANDATORY BACKEND SAFETY RE-CHECK
    const safety = analyzeCommand(command);

    // CRITICAL / Blocked check
    if (safety.is_blocked) {
      const historyEntry: HistoryItem = {
        id: `hist-${Date.now()}`,
        prompt: prompt || 'Direct execution',
        command,
        explanation: 'Execution strictly blocked by ShellSense Safety Engine.',
        risk_level: 'CRITICAL',
        timestamp: new Date().toISOString(),
        executed: false,
        execution_status: 'blocked',
        source: source || 'demo'
      };
      historyStore.unshift(historyEntry);

      return res.status(403).json({
        success: false,
        error: 'Execution blocked for safety: Potentially destructive or prohibited operation.',
        risk_level: 'CRITICAL',
        risk_reason: safety.risk_reason,
        warnings: safety.warnings
      });
    }

    // High or Medium risk confirmation requirement
    if (safety.requires_confirmation && !confirmed) {
      return res.status(400).json({
        success: false,
        error: 'Explicit human confirmation required before execution.',
        risk_level: safety.risk_level,
        risk_reason: safety.risk_reason,
        requires_confirmation: true
      });
    }

    // Execute safely in simulated Linux sandbox
    const startTime = Date.now();
    const sandboxResult = defaultSandbox.execute(command);
    const executionTimeMs = Date.now() - startTime;

    const execResult = {
      success: sandboxResult.exitCode === 0,
      command,
      stdout: sandboxResult.stdout,
      stderr: sandboxResult.stderr,
      exitCode: sandboxResult.exitCode,
      executionTimeMs,
      timestamp: new Date().toISOString(),
      stateChanges: sandboxResult.stateChanges,
      risk_level: safety.risk_level
    };

    // Save to history audit trail
    const historyEntry: HistoryItem = {
      id: `hist-${Date.now()}`,
      prompt: prompt || command,
      command,
      explanation: safety.risk_reason,
      risk_level: safety.risk_level,
      timestamp: new Date().toISOString(),
      executed: true,
      execution_status: sandboxResult.exitCode === 0 ? 'success' : 'failed',
      execution_result: execResult,
      source: source || 'gemini'
    };
    historyStore.unshift(historyEntry);

    res.json(execResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Execution error' });
  }
});

// 5. History endpoints
app.get('/api/history', (req, res) => {
  res.json(historyStore);
});

app.post('/api/history/clear', (req, res) => {
  historyStore.length = 0;
  res.json({ success: true, message: 'History cleared' });
});

// 6. Safety stats endpoint
app.get('/api/stats', (req, res) => {
  res.json(safetyStats);
});

// 7. Learning topics endpoint
app.get('/api/learning-topics', (req, res) => {
  res.json(LEARNING_TOPICS);
});

// 8. Sandbox reset endpoint
app.post('/api/sandbox/reset', (req, res) => {
  defaultSandbox.reset();
  res.json({ success: true, message: 'Sandbox environment reset to fresh state' });
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShellSense server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
