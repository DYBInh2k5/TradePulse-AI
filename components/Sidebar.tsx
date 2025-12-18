import React from 'react';
import { AppScreen } from '../types';
import { 
  LayoutDashboard, 
  LineChart, 
  ArrowLeftRight, 
  List, 
  Newspaper, 
  Settings as SettingsIcon, 
  BrainCircuit, 
  LogOut,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  Globe,
  ScanEye
} from 'lucide-react';

interface SidebarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, isOpen, onClose, isCollapsed = false, toggleCollapse }) => {
  const navItems = [
    { id: AppScreen.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { id: AppScreen.DETAIL, icon: LineChart, label: 'Market' },
    { id: AppScreen.TRADING, icon: ArrowLeftRight, label: 'Trade' },
    { id: AppScreen.SCANNER, icon: ScanEye, label: 'Virtual Scan' }, // New Item
    { id: AppScreen.WATCHLIST, icon: List, label: 'Watchlist' },
    { id: AppScreen.NEWS, icon: Newspaper, label: 'News & Alerts' },
    { id: AppScreen.ANALYSIS, icon: BrainCircuit, label: 'AI Hub' },
    { id: AppScreen.PROFILE, icon: User, label: 'Profile' },
    { id: AppScreen.SETTINGS, icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        bg-slate-900 border-r border-slate-800 
        flex flex-col justify-between
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        <div>
          {/* Header */}
          <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-800 transition-all`}>
            {isCollapsed ? (
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                    <span className="font-bold text-white text-lg">T</span>
                </div>
            ) : (
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 shrink-0">
                        <span className="font-bold text-white text-lg">T</span>
                    </div>
                    <span className="font-bold text-xl text-emerald-400 whitespace-nowrap overflow-hidden">TradePulse</span>
                </div>
            )}
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="mt-6 px-3 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3 rounded-xl transition-all duration-200 group relative ${
                  currentScreen === item.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon size={22} strokeWidth={2} className="shrink-0" />
                {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">{item.label}</span>}
                
                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
                        {item.label}
                    </div>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div>
            {/* Collapse Toggle (Desktop Only) */}
            <div className="hidden md:flex justify-center py-2">
                <button 
                    onClick={toggleCollapse}
                    className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Market Status & Logout */}
            <div className="p-4 border-t border-slate-800 space-y-4">
                {!isCollapsed && (
                    <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800 flex items-center gap-3">
                        <div className="relative">
                            <Globe size={18} className="text-slate-500" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Market Status</p>
                            <p className="text-xs text-emerald-400 font-bold">Open (NASDAQ)</p>
                        </div>
                    </div>
                )}
                
                <button 
                    onClick={() => window.location.reload()}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start px-4'} py-3 text-slate-400 hover:text-rose-400 transition-colors`}
                    title="Sign Out"
                >
                    <LogOut size={20} className="shrink-0" />
                    {!isCollapsed && <span className="ml-3">Sign Out</span>}
                </button>
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;