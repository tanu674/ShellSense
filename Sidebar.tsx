import React from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  History, 
  ShieldAlert, 
  BookOpen, 
  Settings, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  openSettings
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'history', label: 'Command History', icon: History },
    { id: 'safety', label: 'Safety Center', icon: ShieldAlert },
    { id: 'learning', label: 'Learning Mode', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings, isAction: true },
  ];

  return (
    <aside className="w-64 border-r border-[#27272A] bg-[#09090B] flex flex-col justify-between h-full shrink-0">
      <div className="flex flex-col">
        {/* Navigation Category */}
        <div className="p-4 space-y-1">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    if (item.isAction) {
                      openSettings();
                    } else {
                      setCurrentTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-[#18181B] text-white border border-[#27272A]'
                      : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-white border border-transparent'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-[#71717A]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Safe by Design Status Indicator at Bottom */}
      <div className="p-6 border-t border-[#27272A] mt-auto">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Safe by Design</span>
        </div>
        <div className="text-[11px] text-[#71717A] font-mono">Active Shield v2.4.1</div>
      </div>
    </aside>
  );
};
