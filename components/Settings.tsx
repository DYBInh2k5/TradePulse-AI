import React, { useState } from 'react';
import { Moon, Bell, Shield, Eye, User as UserIcon, CreditCard, LogOut, ChevronRight, Smartphone, Award, Trophy, Star } from 'lucide-react';
import { User } from '../types';

interface SettingsProps {
    user: User | null;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);

  // Mock Badges based on Level/XP logic
  const badges = [
      { id: 1, name: "Early Adopter", icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10", unlocked: true },
      { id: 2, name: "Level 5 Trader", icon: Trophy, color: "text-purple-400", bg: "bg-purple-400/10", unlocked: (user?.level || 1) >= 5 },
      { id: 3, name: "Risk Master", icon: Shield, color: "text-blue-400", bg: "bg-blue-400/10", unlocked: false },
      { id: 4, name: "Diamond Hands", icon: Award, color: "text-emerald-400", bg: "bg-emerald-400/10", unlocked: false },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <h2 className="text-2xl font-bold text-white mb-8">Settings</h2>
      
      {/* Profile Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-slate-700">
                  {user?.avatar ? user.avatar[0] : 'U'}
              </div>
              <div>
                  <h3 className="text-xl font-bold text-white">{user?.name || 'Guest User'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 text-sm">{user?.plan || 'Free'} Plan</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400 text-sm font-bold">Lvl {user?.level || 1}</span>
                  </div>
              </div>
          </div>
          <button className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium">
              Edit Profile
          </button>
      </div>

      {/* Gamification / Achievements Section (New) */}
      <div className="mb-8">
           <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <Trophy size={20} className="text-yellow-500" /> Achievements
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {badges.map((badge) => (
                   <div key={badge.id} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${badge.unlocked ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-50 grayscale'}`}>
                       <div className={`p-3 rounded-full mb-3 ${badge.bg} ${badge.color}`}>
                           <badge.icon size={24} />
                       </div>
                       <p className="text-white font-medium text-sm">{badge.name}</p>
                       <p className="text-xs text-slate-500 mt-1">{badge.unlocked ? 'Unlocked' : 'Locked'}</p>
                   </div>
               ))}
           </div>
      </div>

      <div className="space-y-6">
        {/* Account Group */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
             <div className="p-4 bg-slate-800/50 border-b border-slate-800">
                <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Account</h3>
            </div>
            <div className="divide-y divide-slate-800/50">
                <button className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                        <UserIcon className="text-slate-400" size={20} />
                        <div className="text-left">
                            <p className="text-white font-medium">Personal Information</p>
                            <p className="text-xs text-slate-500">Email, Phone, Address</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-600" />
                </button>
                 <button className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                        <CreditCard className="text-slate-400" size={20} />
                        <div className="text-left">
                            <p className="text-white font-medium">Billing & Plan</p>
                            <p className="text-xs text-slate-500">Manage subscription</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-600" />
                </button>
            </div>
        </div>

        {/* Preferences Group */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-800/50 border-b border-slate-800">
                <h3 className="font-semibold text-white text-sm uppercase tracking-wider">App Preferences</h3>
            </div>
            <div className="divide-y divide-slate-800/50">
                <div 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Moon className="text-slate-400" size={20} />
                        <div>
                            <p className="text-white font-medium">Dark Mode</p>
                            <p className="text-xs text-slate-500">Always on</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${darkMode ? 'right-1' : 'left-1'}`} />
                    </div>
                </div>

                <div 
                    onClick={() => setNotifications(!notifications)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
                >
                     <div className="flex items-center gap-3">
                        <Bell className="text-slate-400" size={20} />
                        <div>
                            <p className="text-white font-medium">Price Alerts</p>
                            <p className="text-xs text-slate-500">Push notifications for volatility</p>
                        </div>
                    </div>
                     <div className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifications ? 'right-1' : 'left-1'}`} />
                    </div>
                </div>
                 <div 
                    onClick={() => setPrivateMode(!privateMode)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
                >
                     <div className="flex items-center gap-3">
                        <Eye className="text-slate-400" size={20} />
                        <div>
                            <p className="text-white font-medium">Private Mode</p>
                            <p className="text-xs text-slate-500">Hide balance on dashboard</p>
                        </div>
                    </div>
                     <div className={`w-12 h-6 rounded-full relative transition-colors ${privateMode ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${privateMode ? 'right-1' : 'left-1'}`} />
                    </div>
                </div>
            </div>
        </div>

        {/* Security Group */}
         <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-800/50 border-b border-slate-800">
                <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Security</h3>
            </div>
             <div className="p-4 flex items-center justify-between border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <Shield className="text-emerald-400" size={20} />
                    <div>
                        <p className="text-white font-medium">Two-Factor Authentication</p>
                        <p className="text-xs text-emerald-400">Enabled</p>
                    </div>
                </div>
                <button className="px-4 py-1.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 hover:text-white">
                    Configure
                </button>
            </div>
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Smartphone className="text-slate-400" size={20} />
                    <div>
                        <p className="text-white font-medium">Active Sessions</p>
                        <p className="text-xs text-slate-500">2 devices currently logged in</p>
                    </div>
                </div>
                <button className="text-rose-400 text-sm font-medium hover:underline">
                    Sign out all
                </button>
            </div>
        </div>
        
        <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 text-rose-500 font-bold bg-rose-500/10 rounded-xl hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
        >
            <LogOut size={20} /> Log Out
        </button>
        <p className="text-center text-slate-600 text-xs">Version 2.7.0 (Beta)</p>
      </div>
    </div>
  );
};

export default Settings;