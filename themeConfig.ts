import { TerminalFont, SyntaxTheme } from '../types';

export interface FontOption {
  id: TerminalFont;
  name: string;
  fontFamily: string;
  description: string;
  ligatures: boolean;
}

export const TERMINAL_FONTS: FontOption[] = [
  {
    id: 'jetbrains',
    name: 'JetBrains Mono',
    fontFamily: "'JetBrains Mono', monospace",
    description: 'Crisp developer font with distinct character forms',
    ligatures: true
  },
  {
    id: 'fira',
    name: 'Fira Code',
    fontFamily: "'Fira Code', monospace",
    description: 'Beloved coding typeface with smart programming ligatures',
    ligatures: true
  },
  {
    id: 'source',
    name: 'Source Code Pro',
    fontFamily: "'Source Code Pro', monospace",
    description: 'Adobe classic engineered for high terminal legibility',
    ligatures: false
  },
  {
    id: 'ibm',
    name: 'IBM Plex Mono',
    fontFamily: "'IBM Plex Mono', monospace",
    description: 'Industrial precision designed for enterprise terminals',
    ligatures: false
  },
  {
    id: 'inconsolata',
    name: 'Inconsolata',
    fontFamily: "'Inconsolata', monospace",
    description: 'Clean humanist monospace with high horizontal rhythm',
    ligatures: false
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu Mono',
    fontFamily: "'Ubuntu Mono', monospace",
    description: 'Distinct Linux terminal heritage with rounded glyphs',
    ligatures: false
  }
];

export interface SyntaxThemeOption {
  id: SyntaxTheme;
  name: string;
  tagline: string;
  bgClass: string;
  borderClass: string;
  promptColor: string;
  commandColor: string;
  subcommandColor: string;
  flagColor: string;
  argumentColor: string;
  stringColor: string;
  operatorColor: string;
  variableColor: string;
  commentColor: string;
  previewDots: string[];
}

export const SYNTAX_THEMES: SyntaxThemeOption[] = [
  {
    id: 'emerald',
    name: 'Matrix Emerald',
    tagline: 'Sophisticated dark terminal with vibrant emerald accents',
    bgClass: 'bg-[#09090B]',
    borderClass: 'border-[#27272A]',
    promptColor: 'text-emerald-500',
    commandColor: 'text-emerald-400 font-bold',
    subcommandColor: 'text-teal-300 font-semibold',
    flagColor: 'text-cyan-400',
    argumentColor: 'text-emerald-200',
    stringColor: 'text-amber-300',
    operatorColor: 'text-emerald-400 font-bold',
    variableColor: 'text-yellow-400',
    commentColor: 'text-[#71717A] italic',
    previewDots: ['bg-emerald-400', 'bg-cyan-400', 'bg-teal-300', 'bg-amber-300']
  },
  {
    id: 'dracula',
    name: 'Dracula Neon',
    tagline: 'High-contrast vampire palette with purple & pink neon glow',
    bgClass: 'bg-[#0b0c14]',
    borderClass: 'border-purple-900/40',
    promptColor: 'text-purple-400',
    commandColor: 'text-purple-300 font-bold',
    subcommandColor: 'text-pink-400 font-semibold',
    flagColor: 'text-cyan-300',
    argumentColor: 'text-emerald-300',
    stringColor: 'text-yellow-300',
    operatorColor: 'text-pink-400 font-bold',
    variableColor: 'text-orange-400',
    commentColor: 'text-slate-500 italic',
    previewDots: ['bg-purple-400', 'bg-pink-400', 'bg-cyan-300', 'bg-emerald-300']
  },
  {
    id: 'monokai',
    name: 'Monokai Pro',
    tagline: 'Classic code editor colors with vivid yellow, red and magenta',
    bgClass: 'bg-[#0d0d0f]',
    borderClass: 'border-[#2d2a2e]/60',
    promptColor: 'text-yellow-400',
    commandColor: 'text-yellow-400 font-bold',
    subcommandColor: 'text-emerald-400 font-semibold',
    flagColor: 'text-red-400',
    argumentColor: 'text-cyan-300',
    stringColor: 'text-amber-300',
    operatorColor: 'text-pink-400 font-bold',
    variableColor: 'text-purple-400',
    commentColor: 'text-zinc-600 italic',
    previewDots: ['bg-yellow-400', 'bg-red-400', 'bg-emerald-400', 'bg-cyan-300']
  },
  {
    id: 'nord',
    name: 'Nordic Frost',
    tagline: 'Arctic blue elegance with calm frosted pastels',
    bgClass: 'bg-[#080d14]',
    borderClass: 'border-sky-950',
    promptColor: 'text-sky-400',
    commandColor: 'text-sky-300 font-bold',
    subcommandColor: 'text-teal-300 font-semibold',
    flagColor: 'text-blue-300',
    argumentColor: 'text-slate-200',
    stringColor: 'text-teal-200',
    operatorColor: 'text-cyan-400 font-bold',
    variableColor: 'text-indigo-300',
    commentColor: 'text-slate-500 italic',
    previewDots: ['bg-sky-400', 'bg-blue-300', 'bg-teal-300', 'bg-slate-200']
  },
  {
    id: 'amber',
    name: 'Retro Amber CRT',
    tagline: 'Vintage 1980s mainframe monochrome amber glow',
    bgClass: 'bg-[#0c0800]',
    borderClass: 'border-amber-950',
    promptColor: 'text-amber-500',
    commandColor: 'text-amber-400 font-bold',
    subcommandColor: 'text-yellow-500 font-semibold',
    flagColor: 'text-orange-400',
    argumentColor: 'text-amber-200',
    stringColor: 'text-yellow-300',
    operatorColor: 'text-amber-500 font-bold',
    variableColor: 'text-orange-300',
    commentColor: 'text-amber-800 italic',
    previewDots: ['bg-amber-400', 'bg-orange-400', 'bg-yellow-300', 'bg-amber-600']
  },
  {
    id: 'tokyo',
    name: 'Tokyo Night',
    tagline: 'Electric neon lights across nighttime Neo-Tokyo',
    bgClass: 'bg-[#0a0d18]',
    borderClass: 'border-indigo-950',
    promptColor: 'text-cyan-400',
    commandColor: 'text-cyan-300 font-bold',
    subcommandColor: 'text-indigo-300 font-semibold',
    flagColor: 'text-fuchsia-400',
    argumentColor: 'text-teal-300',
    stringColor: 'text-green-300',
    operatorColor: 'text-cyan-400 font-bold',
    variableColor: 'text-violet-300',
    commentColor: 'text-slate-600 italic',
    previewDots: ['bg-cyan-300', 'bg-fuchsia-400', 'bg-teal-300', 'bg-indigo-400']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    tagline: 'High-voltage yellow & hot magenta street tech',
    bgClass: 'bg-[#08080c]',
    borderClass: 'border-yellow-900/30',
    promptColor: 'text-yellow-400',
    commandColor: 'text-yellow-300 font-bold',
    subcommandColor: 'text-lime-400 font-semibold',
    flagColor: 'text-pink-500',
    argumentColor: 'text-cyan-300',
    stringColor: 'text-lime-300',
    operatorColor: 'text-pink-400 font-bold',
    variableColor: 'text-yellow-500',
    commentColor: 'text-zinc-600 italic',
    previewDots: ['bg-yellow-300', 'bg-pink-500', 'bg-cyan-300', 'bg-lime-400']
  }
];

export function getFontFamily(fontId?: TerminalFont | string): string {
  const found = TERMINAL_FONTS.find(f => f.id === fontId);
  return found ? found.fontFamily : "'JetBrains Mono', monospace";
}

export function getSyntaxTheme(themeId?: SyntaxTheme | string): SyntaxThemeOption {
  const found = SYNTAX_THEMES.find(t => t.id === themeId);
  return found || SYNTAX_THEMES[0];
}
