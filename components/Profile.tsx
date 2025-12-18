import React from 'react';
import { User } from '../types';
import { User as UserIcon, Mail, Phone, MapPin, Calendar, Award, Trophy, TrendingUp, Shield, Star, Camera, Edit3, Share2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ProfileProps {
  user: User | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  // Mock Data for demonstration
  const joinDate = "October 2023";
  const location = "New York, USA";
  const phone = "+1 (555) 123-4567";
  
  const winRateData = [
    { name: 'Profitable', value: 65, color: '#10b981' },
    { name: 'Loss', value: 35, color: '#f43f5e' },
  ];

  const badges = [
      { id: 1, name: "Early Adopter", icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10", unlocked: true, desc: "Joined during beta" },
      { id: 2, name: "Market Mover", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", unlocked: true, desc: "$10k+ Volume traded" },
      { id: 3, name: "Risk Master", icon: Shield, color: "text-blue-400", bg: "bg-blue-400/10", unlocked: false, desc: "Maintained low risk score" },
      { id: 4, name: "Diamond Hands", icon: Award, color: "text-purple-400", bg: "bg-purple-400/10", unlocked: false, desc: "Held stock > 1 year" },
  ];

  const tradingStats = [
      { label: "Total Trades", value: user?.transactions.length || 0 },
      { label: "Win Rate", value: "65%" },
      { label: "Total Profit", value: "+$12,450", color: "text-emerald-400" },
      { label: "Risk Score", value: "Low", color: "text-blue-400" },
  ];

  if (!user) return <div className="text-white">Loading profile...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Cover Image */}
      <div className="h-48 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-t-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <button className="absolute bottom-4 right-4 p-2 bg-slate-900/50 backdrop-blur-sm rounded-full text-white hover:bg-slate-900 transition-colors border border-slate-700">
              <Camera size={20} />
          </button>
      </div>

      {/* Profile Header */}
      <div className="relative px-6 md:px-10 pb-6 -mt-16 mb-6">
          <div className="flex flex-col md:flex-row items-end md:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-slate-900 p-1.5">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold text-5xl shadow-2xl relative overflow-hidden">
                          {user.avatar ? user.avatar[0] : 'U'}
                          <div className="absolute inset-0 bg-black/10"></div>
                      </div>
                  </div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 pb-2 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                      {user.name}
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs border border-yellow-500/30 font-medium tracking-wide">
                          PRO MEMBER
                      </span>
                  </h1>
                  <p className="text-slate-400 mt-1">Senior Market Analyst • Level {user.level}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pb-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <Edit3 size={18} /> Edit Profile
                  </button>
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors border border-slate-700">
                      <Share2 size={18} />
                  </button>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-0">
          
          {/* Left Column: Info & Stats */}
          <div className="space-y-6">
              {/* Personal Info Card */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">About</h3>
                  <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                          <Mail className="text-slate-500" size={18} />
                          <div>
                              <p className="text-slate-500 text-xs">Email</p>
                              <p className="text-slate-200">{user.email}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                          <Phone className="text-slate-500" size={18} />
                          <div>
                              <p className="text-slate-500 text-xs">Phone</p>
                              <p className="text-slate-200">{phone}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                          <MapPin className="text-slate-500" size={18} />
                          <div>
                              <p className="text-slate-500 text-xs">Location</p>
                              <p className="text-slate-200">{location}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                          <Calendar className="text-slate-500" size={18} />
                          <div>
                              <p className="text-slate-500 text-xs">Member Since</p>
                              <p className="text-slate-200">{joinDate}</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Trading Stats Card */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Trading Stats</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                      {tradingStats.map((stat, i) => (
                          <div key={i} className="bg-slate-800/50 p-3 rounded-xl text-center">
                              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                              <p className={`font-bold ${stat.color || 'text-white'}`}>{stat.value}</p>
                          </div>
                      ))}
                  </div>
                  
                  <div className="h-40 w-full relative">
                      <h4 className="absolute top-0 left-0 text-xs text-slate-500 font-medium">Win/Loss Ratio</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={winRateData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {winRateData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pt-4 pointer-events-none">
                          <span className="text-xl font-bold text-emerald-400">65%</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Right Column: Gamification & Activity */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Level Progress */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
                   {/* Background Glow */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                   
                   <div className="flex justify-between items-end mb-2 relative z-10">
                       <div>
                           <h3 className="text-lg font-bold text-white flex items-center gap-2">
                               <Trophy className="text-yellow-500" size={20} /> 
                               Trader Level {user.level}
                           </h3>
                           <p className="text-slate-400 text-sm mt-1">Keep trading to earn XP and unlock exclusive features.</p>
                       </div>
                       <span className="text-2xl font-mono font-bold text-indigo-400">{user.xp} <span className="text-sm text-slate-500 font-sans font-normal">/ {user.level * 100} XP</span></span>
                   </div>
                   
                   <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden mb-2 relative z-10 border border-slate-700">
                       <div 
                           className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out relative"
                           style={{ width: `${Math.min(100, (user.xp / (user.level * 100)) * 100)}%` }}
                       >
                           <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                       </div>
                   </div>
                   <p className="text-right text-xs text-slate-500 relative z-10">{user.level * 100 - user.xp} XP to next level</p>
              </div>

              {/* Achievements Grid */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <Award className="text-orange-500" size={20} /> Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {badges.map((badge) => (
                          <div 
                              key={badge.id} 
                              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${badge.unlocked ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-900 border-slate-800 opacity-60 grayscale'}`}
                          >
                              <div className={`p-3 rounded-full shrink-0 ${badge.bg} ${badge.color}`}>
                                  <badge.icon size={24} />
                              </div>
                              <div>
                                  <h4 className="text-white font-bold text-sm">{badge.name}</h4>
                                  <p className="text-xs text-slate-500 mb-1">{badge.desc}</p>
                                  {badge.unlocked ? (
                                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Unlocked</span>
                                  ) : (
                                      <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded border border-slate-700">Locked</span>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Recent Activity (Simplified Reuse) */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
                  <div className="space-y-4">
                      {user.transactions.slice(0, 3).map((tx, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-800">
                              <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${tx.type === 'Buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                      {tx.symbol[0]}
                                  </div>
                                  <div>
                                      <p className="text-white font-bold">{tx.type} {tx.symbol}</p>
                                      <p className="text-xs text-slate-500">{tx.timestamp.toLocaleDateString()}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="text-white font-mono">{tx.quantity} shares</p>
                                  <p className="text-xs text-slate-400">@ ${tx.price.toFixed(2)}</p>
                              </div>
                          </div>
                      ))}
                      {user.transactions.length === 0 && <p className="text-slate-500 text-sm">No recent activity.</p>}
                  </div>
                  <button className="w-full mt-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">
                      View All History
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Profile;