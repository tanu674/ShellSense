export interface VirtualFile {
  name: string;
  type: 'file' | 'dir';
  size: number;
  permissions: string;
  owner: string;
  group: string;
  modified: string;
  content?: string;
  children?: Record<string, VirtualFile>;
}

export class LinuxSandbox {
  private root: VirtualFile;
  private currentPath: string = '/home/user';
  private processList: { pid: number; user: string; cpu: number; mem: number; command: string }[];
  private commandLog: string[] = [];

  constructor() {
    this.root = this.createDefaultFilesystem();
    this.processList = this.createDefaultProcesses();
  }

  public reset() {
    this.root = this.createDefaultFilesystem();
    this.currentPath = '/home/user';
    this.processList = this.createDefaultProcesses();
    this.commandLog = [];
  }

  private createDefaultFilesystem(): VirtualFile {
    return {
      name: '',
      type: 'dir',
      size: 4096,
      permissions: 'drwxr-xr-x',
      owner: 'root',
      group: 'root',
      modified: 'Aug 19 00:00',
      children: {
        'home': {
          name: 'home',
          type: 'dir',
          size: 4096,
          permissions: 'drwxr-xr-x',
          owner: 'root',
          group: 'root',
          modified: 'Aug 19 00:01',
          children: {
            'user': {
              name: 'user',
              type: 'dir',
              size: 4096,
              permissions: 'drwxr-xr-x',
              owner: 'user',
              group: 'user',
              modified: 'Aug 19 01:00',
              children: {
                'projects': {
                  name: 'projects',
                  type: 'dir',
                  size: 4096,
                  permissions: 'drwxr-xr-x',
                  owner: 'user',
                  group: 'user',
                  modified: 'Aug 19 01:10',
                  children: {
                    'shellsense': {
                      name: 'shellsense',
                      type: 'dir',
                      size: 4096,
                      permissions: 'drwxr-xr-x',
                      owner: 'user',
                      group: 'user',
                      modified: 'Aug 19 01:12',
                      children: {
                        'main.py': {
                          name: 'main.py',
                          type: 'file',
                          size: 14200,
                          permissions: '-rw-r--r--',
                          owner: 'user',
                          group: 'user',
                          modified: 'Aug 19 01:15',
                          content: '# ShellSense AI Engine v1.0\nimport os\nimport sys\n\ndef run():\n    print("Starting secure shell listener...")\n\nif __name__ == "__main__":\n    run()'
                        },
                        'analyzer.py': {
                          name: 'analyzer.py',
                          type: 'file',
                          size: 28400,
                          permissions: '-rw-r--r--',
                          owner: 'user',
                          group: 'user',
                          modified: 'Aug 19 01:18',
                          content: '# Safety & AST analyzer\ndef check_safety(cmd):\n    return {"risk": "LOW"}'
                        },
                        'requirements.txt': {
                          name: 'requirements.txt',
                          type: 'file',
                          size: 320,
                          permissions: '-rw-r--r--',
                          owner: 'user',
                          group: 'user',
                          modified: 'Aug 19 01:05',
                          content: 'google-genai>=2.4.0\nfastapi>=0.100.0\nuvicorn>=0.23.0'
                        }
                      }
                    }
                  }
                },
                'documents': {
                  name: 'documents',
                  type: 'dir',
                  size: 4096,
                  permissions: 'drwxr-xr-x',
                  owner: 'user',
                  group: 'user',
                  modified: 'Aug 19 00:45',
                  children: {
                    'architecture_notes.md': {
                      name: 'architecture_notes.md',
                      type: 'file',
                      size: 2450,
                      permissions: '-rw-r--r--',
                      owner: 'user',
                      group: 'user',
                      modified: 'Aug 19 00:50',
                      content: '# ShellSense Safety Architecture\n- Pre-execution AST verification\n- Multi-tier human-in-the-loop authorization\n- Sandboxed simulated execution'
                    },
                    'dataset_samples.csv': {
                      name: 'dataset_samples.csv',
                      type: 'file',
                      size: 11400000, // 11.4 MB (large file for test)
                      permissions: '-rw-r--r--',
                      owner: 'user',
                      group: 'user',
                      modified: 'Aug 19 01:02',
                      content: 'id,timestamp,command,risk\n1,1724050000,ls -la,LOW\n2,1724050010,mkdir project,MEDIUM'
                    }
                  }
                },
                'logs': {
                  name: 'logs',
                  type: 'dir',
                  size: 4096,
                  permissions: 'drwxr-xr-x',
                  owner: 'user',
                  group: 'user',
                  modified: 'Aug 19 01:20',
                  children: {
                    'app.log': {
                      name: 'app.log',
                      type: 'file',
                      size: 18500,
                      permissions: '-rw-r--r--',
                      owner: 'user',
                      group: 'user',
                      modified: 'Aug 19 01:22',
                      content: '[2026-08-19 01:20:00] INFO: Kernel initialized\n[2026-08-19 01:21:15] INFO: Safety subsystem online\n[2026-08-19 01:22:04] WARN: High memory threshold approaching'
                    },
                    'audit.log': {
                      name: 'audit.log',
                      type: 'file',
                      size: 4200,
                      permissions: '-rw-r-----',
                      owner: 'user',
                      group: 'user',
                      modified: 'Aug 19 01:23',
                      content: 'AUTH_SUCCESS user=user ip=127.0.0.1 port=3000\nEXEC_CHECK cmd="ls -la" risk=LOW'
                    },
                    'temp_crash.log': {
                      name: 'temp_crash.log',
                      type: 'file',
                      size: 980,
                      permissions: '-rw-r--r--',
                      owner: 'user',
                      group: 'user',
                      modified: 'Aug 18 23:40',
                      content: 'DEBUG: Test process exited with status 0'
                    }
                  }
                },
                'README.md': {
                  name: 'README.md',
                  type: 'file',
                  size: 1240,
                  permissions: '-rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  modified: 'Aug 19 01:00',
                  content: '# Welcome to ShellSense Linux Sandbox\nThis is a safe, stateful simulated Linux environment running Ubuntu 24.04 LTS.\nCommands executed here will not affect your real system.'
                },
                'data.csv': {
                  name: 'data.csv',
                  type: 'file',
                  size: 45000,
                  permissions: '-rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  modified: 'Aug 19 00:30',
                  content: 'metric,value\ncpu_usage,14.2\nmem_usage,42.8\ndisk_free_gb,148.5'
                }
              }
            }
          }
        },
        'var': {
          name: 'var',
          type: 'dir',
          size: 4096,
          permissions: 'drwxr-xr-x',
          owner: 'root',
          group: 'root',
          modified: 'Aug 19 00:00',
          children: {
            'log': {
              name: 'log',
              type: 'dir',
              size: 4096,
              permissions: 'drwxr-xr-x',
              owner: 'root',
              group: 'root',
              modified: 'Aug 19 00:00',
              children: {
                'syslog': {
                  name: 'syslog',
                  type: 'file',
                  size: 89200,
                  permissions: '-rw-r-----',
                  owner: 'syslog',
                  group: 'adm',
                  modified: 'Aug 19 01:25',
                  content: 'kernel: [    0.000000] Linux version 6.8.0-generic (buildd@linux)\nsystemd[1]: Started ShellSense Virtual Sandbox Subsystem.'
                }
              }
            }
          }
        }
      }
    };
  }

  private createDefaultProcesses() {
    return [
      { pid: 1, user: 'root', cpu: 0.1, mem: 0.8, command: '/sbin/init splash' },
      { pid: 842, user: 'systemd', cpu: 0.2, mem: 1.2, command: '/lib/systemd/systemd-journald' },
      { pid: 1040, user: 'root', cpu: 0.1, mem: 2.1, command: 'sshd: /usr/sbin/sshd -D' },
      { pid: 1420, user: 'user', cpu: 14.5, mem: 18.2, command: 'python3 -m app.main --workers 4' },
      { pid: 1832, user: 'user', cpu: 8.2, mem: 12.4, command: 'node /home/user/projects/server.js' },
      { pid: 2105, user: 'user', cpu: 0.0, mem: 1.5, command: 'bash /home/user' },
      { pid: 2480, user: 'postgres', cpu: 1.4, mem: 9.6, command: 'postgres: logger process' },
      { pid: 3120, user: 'user', cpu: 0.4, mem: 3.1, command: 'python3 analyzer.py' }
    ];
  }

  public execute(command: string): {
    stdout: string;
    stderr: string;
    exitCode: number;
    stateChanges?: string[];
  } {
    const startTime = Date.now();
    const trimmed = command.trim();
    this.commandLog.push(trimmed);

    // Handle pipeline or compound commands loosely
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0]?.replace(/^sudo\s+/, '') || '';
    const args = parts.slice(1);

    // Command Dispatch
    switch (cmd) {
      case 'pwd':
        return { stdout: this.currentPath, stderr: '', exitCode: 0 };

      case 'whoami':
        return { stdout: 'user', stderr: '', exitCode: 0 };

      case 'uname':
        if (args.includes('-a')) {
          return {
            stdout: 'Linux shell-sandbox 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC Wed Aug 19 01:00:00 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux',
            stderr: '',
            exitCode: 0
          };
        }
        return { stdout: 'Linux', stderr: '', exitCode: 0 };

      case 'ls':
        return this.handleLs(trimmed, args);

      case 'cd':
        return this.handleCd(args[0]);

      case 'mkdir':
        return this.handleMkdir(args);

      case 'touch':
        return this.handleTouch(args);

      case 'rm':
        return this.handleRm(trimmed, args);

      case 'cat':
        return this.handleCat(args);

      case 'head':
        return this.handleHead(args);

      case 'tail':
        return this.handleTail(args);

      case 'grep':
        return this.handleGrep(trimmed, args);

      case 'find':
        return this.handleFind(trimmed, args);

      case 'df':
        return {
          stdout: `Filesystem      Size  Used Avail Use% Mounted on
udev            7.8G     0  7.8G   0% /dev
tmpfs           1.6G  1.8M  1.6G   1% /run
/dev/nvme0n1p2  240G   86G  142G  38% /
tmpfs           7.9G   16K  7.9G   1% /dev/shm
/dev/nvme0n1p1  511M  6.1M  505M   2% /boot/efi`,
          stderr: '',
          exitCode: 0
        };

      case 'du':
        return this.handleDu(trimmed, args);

      case 'ps':
        return this.handlePs(trimmed, args);

      case 'top':
      case 'htop':
        return {
          stdout: `top - 01:25:30 up 14 days,  3:42,  1 user,  load average: 0.35, 0.42, 0.38
Tasks: 142 total,   2 running, 140 sleeping,   0 stopped,   0 zombie
%Cpu(s):  6.2 us,  1.8 sy,  0.0 ni, 91.5 id,  0.4 wa,  0.0 hi,  0.1 si,  0.0 st
MiB Mem :  16012.4 total,   4820.1 free,   7210.3 used,   3982.0 buff/cache
MiB Swap:   4096.0 total,   4096.0 free,      0.0 used.   8802.1 avail Mem 

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1420 user      20   0  845212 182300  42100 R  14.5  18.2   2:14.20 python3
 1832 user      20   0  624890 124500  38900 S   8.2  12.4   1:05.42 node
 2480 postgres  20   0  392104  96120  28400 S   1.4   9.6   0:45.18 postgres
 3120 user      20   0  184200  31200  12400 S   0.4   3.1   0:08.92 python3
 1040 root      20   0   18420   2100   1800 S   0.1   2.1   0:01.12 sshd`,
          stderr: '',
          exitCode: 0
        };

      case 'free':
        return {
          stdout: `               total        used        free      shared  buff/cache   available
Mem:        16396700     7383347     4935782       16384     4077571     9013353
Swap:        4194304           0     4194304`,
          stderr: '',
          exitCode: 0
        };

      case 'echo':
        return {
          stdout: args.join(' ').replace(/^["']|["']$/g, ''),
          stderr: '',
          exitCode: 0
        };

      case 'date':
        return { stdout: new Date().toUTCString(), stderr: '', exitCode: 0 };

      case 'uptime':
        return { stdout: ' 01:25:40 up 14 days, 3:42,  1 user,  load average: 0.35, 0.42, 0.38', stderr: '', exitCode: 0 };

      case 'history':
        return {
          stdout: this.commandLog.map((c, i) => `  ${i + 1}  ${c}`).join('\n') || '  1  pwd\n  2  ls -la',
          stderr: '',
          exitCode: 0
        };

      case 'which':
        return {
          stdout: `/usr/bin/${args[0] || 'bash'}`,
          stderr: '',
          exitCode: 0
        };

      case 'env':
        return {
          stdout: `USER=user
HOME=/home/user
SHELL=/bin/bash
TERM=xterm-256color
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/user/.local/bin
LANG=en_US.UTF-8
SHELLSENSE_ENV=sandbox-ubuntu-24.04`,
          stderr: '',
          exitCode: 0
        };

      case 'clear':
        return { stdout: '\x1Bc', stderr: '', exitCode: 0 };

      case 'tar':
        return {
          stdout: 'tar: archive operation completed safely in simulated environment.',
          stderr: '',
          exitCode: 0,
          stateChanges: ['Archive archive.tar.gz created in working directory']
        };

      case 'chmod':
      case 'chown':
        return {
          stdout: '',
          stderr: '',
          exitCode: 0,
          stateChanges: [`Permissions updated on target for ${args.join(' ')}`]
        };

      case 'kill':
      case 'pkill':
        const targetPid = args.find(a => /^\d+$/.test(a));
        if (targetPid) {
          const num = parseInt(targetPid, 10);
          this.processList = this.processList.filter(p => p.pid !== num);
          return {
            stdout: '',
            stderr: '',
            exitCode: 0,
            stateChanges: [`Process PID ${num} terminated`]
          };
        }
        return { stdout: '', stderr: '', exitCode: 0, stateChanges: ['Process signal sent'] };

      default:
        // Generic fallback for commands not directly simulated in full detail
        return {
          stdout: `[ShellSense Sandbox Execution]
Command '${trimmed}' executed successfully in simulated environment.
Exit Code: 0 (OK)
Target: ${this.currentPath}`,
          stderr: '',
          exitCode: 0
        };
    }
  }

  private handleLs(raw: string, args: string[]): { stdout: string; stderr: string; exitCode: number } {
    const isLong = raw.includes('-l') || raw.includes('-la') || raw.includes('-al');
    const isAll = raw.includes('-a') || raw.includes('-la') || raw.includes('-al');

    const targetDir = this.resolvePath(this.currentPath);
    if (!targetDir || !targetDir.children) {
      return { stdout: '', stderr: 'ls: cannot access directory: No such file or directory', exitCode: 2 };
    }

    const items = Object.values(targetDir.children);

    if (isLong) {
      const lines: string[] = [`total ${items.length * 4}`];
      if (isAll) {
        lines.push(`drwxr-xr-x  5 user user 4096 Aug 19 01:00 .`);
        lines.push(`drwxr-xr-x  3 root root 4096 Aug 19 00:01 ..`);
      }
      for (const item of items) {
        if (!isAll && item.name.startsWith('.')) continue;
        const sizeStr = item.size > 1000000 ? `${(item.size / (1024 * 1024)).toFixed(1)}M` : `${item.size}`;
        lines.push(`${item.permissions.padEnd(10)}  ${item.type === 'dir' ? '3' : '1'} ${item.owner.padEnd(5)} ${item.group.padEnd(5)} ${sizeStr.padStart(6)} ${item.modified} ${item.name}${item.type === 'dir' ? '/' : ''}`);
      }
      return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
    } else {
      const names = items
        .filter(item => isAll || !item.name.startsWith('.'))
        .map(item => item.type === 'dir' ? `${item.name}/` : item.name);
      return { stdout: names.join('  '), stderr: '', exitCode: 0 };
    }
  }

  private handleCd(target?: string): { stdout: string; stderr: string; exitCode: number } {
    if (!target || target === '~' || target === '') {
      this.currentPath = '/home/user';
      return { stdout: '', stderr: '', exitCode: 0 };
    }
    if (target === '..') {
      if (this.currentPath !== '/') {
        const segs = this.currentPath.split('/').filter(Boolean);
        segs.pop();
        this.currentPath = '/' + segs.join('/');
      }
      return { stdout: '', stderr: '', exitCode: 0 };
    }
    const newPath = target.startsWith('/') ? target : `${this.currentPath}/${target}`.replace(/\/+/g, '/');
    const dir = this.resolvePath(newPath);
    if (dir && dir.type === 'dir') {
      this.currentPath = newPath;
      return { stdout: '', stderr: '', exitCode: 0 };
    }
    return { stdout: '', stderr: `cd: ${target}: No such file or directory`, exitCode: 1 };
  }

  private handleMkdir(args: string[]): { stdout: string; stderr: string; exitCode: number; stateChanges?: string[] } {
    const dirName = args.filter(a => !a.startsWith('-'))[0];
    if (!dirName) {
      return { stdout: '', stderr: 'mkdir: missing operand', exitCode: 1 };
    }
    const current = this.resolvePath(this.currentPath);
    if (current && current.children) {
      current.children[dirName] = {
        name: dirName,
        type: 'dir',
        size: 4096,
        permissions: 'drwxr-xr-x',
        owner: 'user',
        group: 'user',
        modified: 'Aug 19 01:26',
        children: {}
      };
      return {
        stdout: '',
        stderr: '',
        exitCode: 0,
        stateChanges: [`Created directory: ${this.currentPath}/${dirName}`]
      };
    }
    return { stdout: '', stderr: 'mkdir: cannot create directory: permission denied', exitCode: 1 };
  }

  private handleTouch(args: string[]): { stdout: string; stderr: string; exitCode: number; stateChanges?: string[] } {
    const fileName = args.filter(a => !a.startsWith('-'))[0];
    if (!fileName) {
      return { stdout: '', stderr: 'touch: missing file operand', exitCode: 1 };
    }
    const current = this.resolvePath(this.currentPath);
    if (current && current.children) {
      current.children[fileName] = {
        name: fileName,
        type: 'file',
        size: 0,
        permissions: '-rw-r--r--',
        owner: 'user',
        group: 'user',
        modified: 'Aug 19 01:26',
        content: ''
      };
      return {
        stdout: '',
        stderr: '',
        exitCode: 0,
        stateChanges: [`Created/updated file: ${this.currentPath}/${fileName}`]
      };
    }
    return { stdout: '', stderr: 'touch: cannot touch: No such file or directory', exitCode: 1 };
  }

  private handleRm(raw: string, args: string[]): { stdout: string; stderr: string; exitCode: number; stateChanges?: string[] } {
    const target = args.filter(a => !a.startsWith('-'))[0];
    if (!target) {
      return { stdout: '', stderr: 'rm: missing operand', exitCode: 1 };
    }
    const current = this.resolvePath(this.currentPath);
    if (current && current.children && current.children[target]) {
      delete current.children[target];
      return {
        stdout: '',
        stderr: '',
        exitCode: 0,
        stateChanges: [`Deleted ${this.currentPath}/${target}`]
      };
    }
    return { stdout: '', stderr: `rm: cannot remove '${target}': No such file or directory`, exitCode: 1 };
  }

  private handleCat(args: string[]): { stdout: string; stderr: string; exitCode: number } {
    const target = args.filter(a => !a.startsWith('-'))[0];
    if (!target) {
      return { stdout: '', stderr: 'cat: missing operand', exitCode: 1 };
    }
    const current = this.resolvePath(this.currentPath);
    if (current && current.children && current.children[target]) {
      const file = current.children[target];
      if (file.type === 'dir') {
        return { stdout: '', stderr: `cat: ${target}: Is a directory`, exitCode: 1 };
      }
      return { stdout: file.content || `[Binary or Empty File: ${file.size} bytes]`, stderr: '', exitCode: 0 };
    }
    return { stdout: '', stderr: `cat: ${target}: No such file or directory`, exitCode: 1 };
  }

  private handleHead(args: string[]): { stdout: string; stderr: string; exitCode: number } {
    const target = args.filter(a => !a.startsWith('-') && !/^\d+$/.test(a))[0];
    if (!target) return { stdout: '', stderr: 'head: missing operand', exitCode: 1 };
    const current = this.resolvePath(this.currentPath);
    if (current?.children?.[target]) {
      const lines = (current.children[target].content || '').split('\n').slice(0, 10);
      return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
    }
    return { stdout: '', stderr: `head: cannot open '${target}' for reading: No such file or directory`, exitCode: 1 };
  }

  private handleTail(args: string[]): { stdout: string; stderr: string; exitCode: number } {
    const target = args.filter(a => !a.startsWith('-') && !/^\d+$/.test(a))[0];
    if (!target) return { stdout: '', stderr: 'tail: missing operand', exitCode: 1 };
    const current = this.resolvePath(this.currentPath);
    if (current?.children?.[target]) {
      const lines = (current.children[target].content || '').split('\n');
      return { stdout: lines.slice(-10).join('\n'), stderr: '', exitCode: 0 };
    }
    return { stdout: '', stderr: `tail: cannot open '${target}' for reading: No such file or directory`, exitCode: 1 };
  }

  private handleGrep(raw: string, args: string[]): { stdout: string; stderr: string; exitCode: number } {
    const pattern = args.find(a => !a.startsWith('-'))?.replace(/^["']|["']$/g, '') || 'ERROR';
    return {
      stdout: `./projects/shellsense/main.py:4:def run():\n./documents/architecture_notes.md:2:- Multi-tier human-in-the-loop authorization\n./logs/app.log:2:[2026-08-19 01:21:15] INFO: Safety subsystem online`,
      stderr: '',
      exitCode: 0
    };
  }

  private handleFind(raw: string, args: string[]): { stdout: string; stderr: string; exitCode: number } {
    if (raw.includes('.py')) {
      return {
        stdout: `./projects/shellsense/main.py\n./projects/shellsense/analyzer.py`,
        stderr: '',
        exitCode: 0
      };
    }
    if (raw.includes('.log')) {
      return {
        stdout: `./logs/app.log\n./logs/audit.log\n./logs/temp_crash.log`,
        stderr: '',
        exitCode: 0
      };
    }
    if (raw.includes('+10M') || raw.includes('size')) {
      return {
        stdout: `./documents/dataset_samples.csv (11.4 MB)`,
        stderr: '',
        exitCode: 0
      };
    }
    return {
      stdout: `.\n./projects\n./projects/shellsense\n./projects/shellsense/main.py\n./projects/shellsense/analyzer.py\n./projects/shellsense/requirements.txt\n./documents\n./documents/architecture_notes.md\n./documents/dataset_samples.csv\n./logs\n./logs/app.log\n./logs/audit.log\n./logs/temp_crash.log\n./README.md\n./data.csv`,
      stderr: '',
      exitCode: 0
    };
  }

  private handleDu(raw: string, args: string[]): { stdout: string; stderr: string; exitCode: number } {
    return {
      stdout: `48K\t./projects/shellsense\n52K\t./projects\n11.5M\t./documents\n24K\t./logs\n12.1M\t.`,
      stderr: '',
      exitCode: 0
    };
  }

  private handlePs(raw: string, args: string[]): { stdout: string; stderr: string; exitCode: number } {
    if (raw.includes('python') || raw.includes('grep python')) {
      return {
        stdout: `user      1420 14.5 18.2  845212 182300 ?        Sl   01:05   2:14 python3 -m app.main --workers 4\nuser      3120  0.4  3.1  184200  31200 ?        S    01:20   0:08 python3 analyzer.py`,
        stderr: '',
        exitCode: 0
      };
    }
    if (raw.includes('--sort=-%mem') || raw.includes('mem')) {
      return {
        stdout: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
user      1420 14.5 18.2 845212 182300 ?       Sl   01:05   2:14 python3 -m app.main
user      1832  8.2 12.4 624890 124500 ?       S    01:08   1:05 node server.js
postgres  2480  1.4  9.6 392104  96120 ?       S    01:02   0:45 postgres
user      3120  0.4  3.1 184200  31200 ?       S    01:20   0:08 python3 analyzer.py`,
        stderr: '',
        exitCode: 0
      };
    }
    const lines = ['PID TTY          TIME CMD'];
    for (const p of this.processList) {
      lines.push(`${String(p.pid).padStart(5)} pts/0    00:00:${String(Math.floor(p.cpu)).padStart(2, '0')} ${p.command.split(' ')[0]}`);
    }
    return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
  }

  private resolvePath(targetPath: string): VirtualFile | null {
    const parts = targetPath.split('/').filter(Boolean);
    let curr: VirtualFile = this.root;
    for (const part of parts) {
      if (!curr.children || !curr.children[part]) {
        return null;
      }
      curr = curr.children[part];
    }
    return curr;
  }
}

// Export singleton instance for server session
export const defaultSandbox = new LinuxSandbox();
