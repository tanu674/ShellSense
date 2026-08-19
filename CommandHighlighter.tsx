import React from 'react';
import { TerminalFont, SyntaxTheme } from '../types';
import { getFontFamily, getSyntaxTheme } from '../lib/themeConfig';

interface CommandHighlighterProps {
  command: string;
  font?: TerminalFont | string;
  theme?: SyntaxTheme | string;
  showPrompt?: boolean;
  className?: string;
  textClassName?: string;
}

interface Token {
  type: 'prompt' | 'sudo' | 'command' | 'subcommand' | 'flag' | 'string' | 'variable' | 'operator' | 'argument' | 'whitespace';
  value: string;
}

const COMMON_COMMANDS = new Set([
  'ls', 'grep', 'find', 'mkdir', 'rm', 'rmdir', 'touch', 'cat', 'echo', 'chmod', 'chown',
  'systemctl', 'journalctl', 'service', 'awk', 'sed', 'cut', 'sort', 'uniq', 'wc', 'head', 'tail',
  'git', 'curl', 'wget', 'tar', 'gzip', 'gunzip', 'zip', 'unzip', 'ps', 'kill', 'pkill', 'killall',
  'df', 'du', 'top', 'htop', 'free', 'uname', 'hostname', 'ping', 'netstat', 'ss', 'ip', 'ifconfig',
  'docker', 'podman', 'kubectl', 'python', 'python3', 'node', 'npm', 'yarn', 'pnpm', 'cargo',
  'cp', 'mv', 'ln', 'pwd', 'cd', 'export', 'alias', 'source', 'bash', 'sh', 'zsh', 'ssh', 'scp',
  'rsync', 'crontab', 'whoami', 'id', 'groups', 'uptime', 'history', 'clear', 'diff', 'patch',
  'tee', 'xargs', 'which', 'whereis', 'type', 'man'
]);

const COMMON_SUBCOMMANDS = new Set([
  'status', 'start', 'stop', 'restart', 'reload', 'enable', 'disable',
  'commit', 'push', 'pull', 'clone', 'branch', 'checkout', 'switch', 'merge', 'rebase', 'stash', 'log', 'diff', 'fetch', 'remote',
  'install', 'update', 'upgrade', 'remove', 'purge', 'build', 'run', 'test', 'init', 'create', 'add',
  'compose', 'ps', 'images', 'container', 'volume', 'network', 'logs', 'exec'
]);

export function tokenizeCommand(cmd: string): Token[] {
  const tokens: Token[] = [];
  if (!cmd) return tokens;

  // Simple token regex matching whitespace, strings, flags, operators, variables, words
  const regex = /(".*?"|'.*?'|\s+|&&|\|\||>>|2>&1|[|;><&]|\$[a-zA-Z0-9_{}]+|--[a-zA-Z0-9_-]+(?:=[^\s"']*)?|-[a-zA-Z0-9]+|[^\s"';|&><]+)/g;

  let match: RegExpExecArray | null;
  let isNextCommand = true;
  let isFirstWord = true;

  while ((match = regex.exec(cmd)) !== null) {
    const raw = match[0];

    if (/^\s+$/.test(raw)) {
      tokens.push({ type: 'whitespace', value: raw });
      continue;
    }

    if (raw === '|' || raw === '&&' || raw === '||' || raw === ';' || raw === '>' || raw === '>>' || raw === '<' || raw === '2>&1' || raw === '&') {
      tokens.push({ type: 'operator', value: raw });
      isNextCommand = true;
      continue;
    }

    if (raw.startsWith('"') || raw.startsWith("'")) {
      tokens.push({ type: 'string', value: raw });
      isNextCommand = false;
      continue;
    }

    if (raw.startsWith('$')) {
      tokens.push({ type: 'variable', value: raw });
      isNextCommand = false;
      continue;
    }

    if (raw.startsWith('-')) {
      tokens.push({ type: 'flag', value: raw });
      isNextCommand = false;
      continue;
    }

    if (raw === 'sudo') {
      tokens.push({ type: 'sudo', value: raw });
      isNextCommand = true; // next word is the actual command
      continue;
    }

    if (isNextCommand || isFirstWord) {
      tokens.push({ type: 'command', value: raw });
      isNextCommand = false;
      isFirstWord = false;
      continue;
    }

    if (COMMON_SUBCOMMANDS.has(raw)) {
      tokens.push({ type: 'subcommand', value: raw });
      continue;
    }

    if (COMMON_COMMANDS.has(raw)) {
      tokens.push({ type: 'command', value: raw });
      continue;
    }

    tokens.push({ type: 'argument', value: raw });
  }

  return tokens;
}

export const CommandHighlighter: React.FC<CommandHighlighterProps> = ({
  command,
  font = 'jetbrains',
  theme = 'emerald',
  showPrompt = false,
  className = '',
  textClassName = 'text-sm'
}) => {
  const themeOpt = getSyntaxTheme(theme);
  const fontFamily = getFontFamily(font);
  const tokens = tokenizeCommand(command);

  const getTokenClass = (type: Token['type']): string => {
    switch (type) {
      case 'prompt':
        return themeOpt.promptColor;
      case 'sudo':
        return 'text-red-400 font-bold';
      case 'command':
        return themeOpt.commandColor;
      case 'subcommand':
        return themeOpt.subcommandColor;
      case 'flag':
        return themeOpt.flagColor;
      case 'string':
        return themeOpt.stringColor;
      case 'variable':
        return themeOpt.variableColor;
      case 'operator':
        return themeOpt.operatorColor;
      case 'argument':
      default:
        return themeOpt.argumentColor;
    }
  };

  return (
    <span 
      className={`inline-block whitespace-pre-wrap break-all select-text ${className} ${textClassName}`}
      style={{ fontFamily }}
    >
      {showPrompt && (
        <span className={`${themeOpt.promptColor} select-none mr-2 font-bold`}>$</span>
      )}
      {tokens.map((tok, idx) => {
        if (tok.type === 'whitespace') {
          return <span key={idx}>{tok.value}</span>;
        }
        return (
          <span key={idx} className={getTokenClass(tok.type)}>
            {tok.value}
          </span>
        );
      })}
    </span>
  );
};
