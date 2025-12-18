
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, PieChart as PieChartIcon, Send, Download, Plus, Sparkles, AlertTriangle, ShieldAlert, Loader2, Trophy, Bell, CheckCircle, Info, AlertCircle, Clock, X } from 'lucide-react';
import { CHART_DATA, MOCK_STOCKS, ALLOCATION_DATA } from '../constants';
import { Stock, User, Notification, AppScreen, Transaction } from '../types';
import { getDashboardInsights, analyzePortfolioRisk } from '../services/geminiService';

interface DashboardProps {
  onSelectStock: (stock: Stock) => void;
  user: User | null;
  notifications?: Notification[];
  onMarkRead?: () => void;
  onNavigate: (screen: AppScreen) => void;
  onUpdateUser: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectStock, user, notifications = [], onMarkRead, onNavigate, onUpdateUser }) => {
  const [chartData, setChartData] = useState(CHART_DATA);
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [aiInsight, setAiInsight] = useState("Analyzing market sentiment...");
  const [isInsightLoading, setIsInsightLoading] = useState(true);

  // Notification Dropdown State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Portfolio Risk State
  const [riskReport, setRiskReport] = useState<string | null>(null);
  const [isRiskLoading, setIsRiskLoading] = useState(false);

  // --- Modal States ---
  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(''); // For transfer
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
              setIsNotifOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate Real Portfolio Value
  const portfolioValue = user?.portfolio.reduce((acc, item) => {
      const currentStock = MOCK_STOCKS.find(s => s.symbol === item.symbol);
      const currentPrice = currentStock ? currentStock.price : item.avgPrice;
      return acc + (currentPrice * item.quantity);
  }, 0) || 0;

  const totalBalance = (user?.balance || 0) + portfolioValue;
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
      const loadInsight = async () => {
          setIsInsightLoading(true);
          const insight = await getDashboardInsights();
          setAiInsight(insight);
          setIsInsightLoading(false);
      };
      loadInsight();
  }, []);

  const handleTimeframeChange = (timeframe: string) => {
      setActiveTimeframe(timeframe);
      const length = timeframe === '1D' ? 50 : timeframe === '1W' ? 20 : 30;
      const basePrice = 150 + Math.random() * 20;
      const newData = Array.from({ length }, (_, i) => ({
        date: timeframe === '1D' ? `10:${i < 10 ? '0' + i : i}` : `Day ${i+1}`,
        price: basePrice + Math.random() * 50 - 25,
        volume: Math.floor(Math.random() * 1000) + 500,
      }));
      setChartData(newData);
  };

  const handleCheckRisk = async () => {
      if (!user?.portfolio.length) {
          setRiskReport("Portfolio is empty. Add assets to analyze risk.");
          return;
      }
      setIsRiskLoading(true);
      setRiskReport(null);
      
      const portfolioSummary = user.portfolio.map(p => `${p.symbol}: ${p.quantity} shares`).join(", ");
      const report = await analyzePortfolioRisk(portfolioSummary);
      setRiskReport(report);
      setIsRiskLoading(false);
  };

  const handleOpenNotifs = () => {
      setIsNotifOpen(!isNotifOpen);
      if (!isNotifOpen && onMarkRead && unreadCount > 0) {
          onMarkRead();
      }
  };

  // --- Modal Logic ---
  const handleTransaction = () => {
      if (!user) return;
      const val = parseFloat(amount);
      if (isNaN(val) || val <= 0) {
          setModalMessage("Please enter a valid positive amount.");
          return;
      }
      
      if (activeModal === 'withdraw' || activeModal === 'transfer') {
          if (val > user.balance) {
              setModalMessage("Insufficient funds available.");
              return;
          }
      }

      setIsProcessing(true);
      setModalMessage(null);

      setTimeout(() => {
          let newBalance = user.balance;
          let type: 'Buy' | 'Sell' = 'Buy'; // reusing Buy/Sell types for transaction record for simplicity or extend type
          // Creating a mock transaction record. Ideally Transaction type should support 'Deposit' etc.
          // For now, we will just use the ID and Total to represent it in the history.
          
          if (activeModal === 'deposit') {
              newBalance += val;
          } else {
              newBalance -= val;
          }

          // Create a mock transaction entry
          // Note: The `type` in Transaction interface is strictly 'Buy' | 'Sell'. 
          // We are hijacking it slightly or we should update types.ts. 
          // For this specific request, let's treat Deposit as a specialized 'Buy' (Cash) visually handled.
          const newTx: Transaction = {
              id: `TX-${Date.now()}`,
              symbol: activeModal === 'deposit' ? 'DEPOSIT' : activeModal === 'withdraw' ? 'WITHDRAW' : 'TRANSFER',
              type: activeModal === 'deposit' ? 'Buy' : 'Sell', 
              quantity: 1,
              price: val,
              total: val,
              timestamp: new Date(),
              status: 'Completed'
          };

          onUpdateUser({
              ...user,
              balance: newBalance,
              transactions: [newTx, ...user.transactions]
          });

          setIsProcessing(false);
          setActiveModal(null);
          setAmount('');
          setRecipient('');
      }, 1500);
  };

  const sparklineData = Array.from({ length: 20 }, () => ({ val: Math.random() * 100 }));

  return (
    <div className="space-y-6 pb-20 relative">
      
      {/* --- MODAL OVERLAY --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                <button 
                    onClick={() => { setActiveModal(null); setAmount(''); setModalMessage(null); }}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <div className="p-6 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {activeModal === 'deposit' && <Plus className="text-emerald-400" />}
                        {activeModal === 'withdraw' && <Download className="text-rose-400" />}
                        {activeModal === 'transfer' && <Send className="text-blue-400" />}
                        {activeModal === 'deposit' ? 'Add Funds' : activeModal === 'withdraw' ? 'Withdraw Funds' : 'Transfer Funds'}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Current Balance: <span className="text-white font-mono">${user?.balance.toLocaleString()}</span>
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {activeModal === 'transfer' && (
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1 block">Recipient (Email or ID)</label>
                            <input 
                                type="text"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder="user@example.com"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-1 block">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                            <input 
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                autoFocus
                            />
                        </div>
                    </div>

                    {modalMessage && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={14} /> {modalMessage}
                        </div>
                    )}

                    <button 
                        onClick={handleTransaction}
                        disabled={isProcessing}
                        className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                            activeModal === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 
                            activeModal === 'withdraw' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' :
                            'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                        }`}
                    >
                        {isProcessing ? <Loader2 className="animate-spin" /> : (
                            activeModal === 'deposit' ? <Plus size={18} /> : 
                            activeModal === 'withdraw' ? <Download size={18} /> : <Send size={18} />
                        )}
                        {isProcessing ? 'Processing...' : 'Confirm Transaction'}
                    </button>
                </div>
            </div>
        </div>
      )}


      <header className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            <p className="text-slate-400">Welcome back, {user?.name || 'Trader'}.</p>
        </div>
        <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
                <button 
                    onClick={handleOpenNotifs}
                    className={`p-2.5 rounded-xl transition-colors relative ${isNotifOpen ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-800 animate-pulse"></span>
                    )}
                </button>

                {/* Dropdown */}
                {isNotifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Bell size={16} /> Notifications
                            </h3>
                            <span className="text-xs text-slate-500">{notifications.length} total</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center text-slate-500">
                                    <Bell className="mx-auto mb-3 opacity-20" size={32} />
                                    <p>No new notifications</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n.id} className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors flex gap-3 ${!n.read ? 'bg-slate-800/20' : ''}`}>
                                        <div className={`mt-1 p-1.5 rounded-full h-fit shrink-0 ${
                                            n.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                            n.type === 'error' ? 'bg-rose-500/10 text-rose-400' :
                                            n.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                                            'bg-blue-500/10 text-blue-400'
                                        }`}>
                                            {n.type === 'success' && <CheckCircle size={14} />}
                                            {n.type === 'error' && <AlertCircle size={14} />}
                                            {n.type === 'warning' && <AlertTriangle size={14} />}
                                            {n.type === 'info' && <Info size={14} />}
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-start w-full gap-2">
                                                <h4 className={`text-sm ${!n.read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>{n.title}</h4>
                                                {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1"></span>}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                                            <p className="text-[10px] text-slate-600 mt-2 font-mono">
                                                {n.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Gamification Level Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-bold">
                <Trophy size={14} />
                <span>Lvl {user?.level || 1}</span>
                <div className="w-16 h-2 bg-slate-800 rounded-full ml-1 overflow-hidden">
                    <div 
                        className="h-full bg-yellow-500" 
                        style={{ width: `${Math.min(100, ((user?.xp || 0) / ((user?.level || 1) * 100)) * 100)}%` }} 
                    />
                </div>
            </div>

            <div className="hidden md:block px-4 py-2 bg-slate-800 rounded-lg text-sm font-mono text-emerald-400 border border-emerald-500/20">
                Market Open • Live
            </div>
            {user?.avatar && (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-slate-800 shadow-lg">
                    {user.avatar[0]}
                </div>
            )}
        </div>
      </header>

      {/* AI Daily Insight Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-500/30 p-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 rounded-full blur-[50px] opacity-30"></div>
          <div className="relative z-10 p-4 flex items-start md:items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                  <Sparkles className="text-indigo-400" size={20} />
              </div>
              <div>
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">AI Daily Insight</h4>
                  <p className={`text-sm text-white font-medium ${isInsightLoading ? 'animate-pulse' : ''}`}>
                      {aiInsight}
                  </p>
              </div>
          </div>
      </div>

      {/* Quick Actions Row */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveModal('deposit')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 whitespace-nowrap transition-colors transform hover:-translate-y-0.5"
          >
              <Plus size={18} /> Deposit Funds
          </button>
          <button 
            onClick={() => setActiveModal('transfer')}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-700 whitespace-nowrap transition-colors hover:border-blue-500/50"
          >
              <Send size={18} /> Transfer
          </button>
          <button 
            onClick={() => setActiveModal('withdraw')}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-700 whitespace-nowrap transition-colors hover:border-rose-500/50"
          >
              <Download size={18} /> Withdraw
          </button>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Balance */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                        <Wallet size={24} />
                    </div>
                    <span className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                        +2.5% <ArrowUpRight size={14} className="ml-1" />
                    </span>
                </div>
                <h3 className="text-slate-400 text-sm font-medium">Net Worth</h3>
                <p className="text-3xl font-bold text-white mt-1 tracking-tight">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-slate-500 mt-1">Cash: ${user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                        <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="#3b82f6" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Card 2: Today's Profit */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                        <TrendingUp size={24} />
                    </div>
                    <span className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                        +$892.40
                    </span>
                </div>
                <h3 className="text-slate-400 text-sm font-medium">Daily P&L</h3>
                <p className="text-3xl font-bold text-white mt-1 tracking-tight">$1,204.50</p>
            </div>
             <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                        <Area type="monotone" dataKey="val" stroke="#10b981" fill="#10b981" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Card 3: Portfolio Health (AI Upgrade) */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group relative overflow-hidden flex flex-col">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 group-hover:bg-rose-500/20 transition-colors">
                    <ShieldAlert size={24} />
                </div>
                <span className="text-slate-500 text-xs font-medium bg-slate-800 px-2 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={10} /> AI Powered
                </span>
            </div>
            
            {!riskReport && !isRiskLoading ? (
                <>
                    <h3 className="text-slate-400 text-sm font-medium">Portfolio Health</h3>
                    <p className="text-sm text-slate-300 mt-2 mb-4">Check for concentration risk and sector exposure.</p>
                    <button 
                        onClick={handleCheckRisk}
                        className="mt-auto w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700"
                    >
                        Run Health Check
                    </button>
                </>
            ) : isRiskLoading ? (
                <div className="flex flex-col items-center justify-center flex-1">
                    <Loader2 className="animate-spin text-rose-500 mb-2" size={24} />
                    <p className="text-xs text-slate-500">Scanning portfolio...</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-1">
                    <h3 className="text-white font-bold text-sm mb-1">Risk Analysis Report</h3>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {riskReport}
                    </div>
                    <button 
                        onClick={() => setRiskReport(null)}
                        className="mt-3 w-full py-1 text-xs text-slate-500 hover:text-white"
                    >
                        Close Report
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 h-96">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Portfolio Performance</h3>
                <div className="flex bg-slate-800 rounded-lg p-1">
                    {['1D', '1W', '1M', '1Y'].map((t) => (
                        <button 
                            key={t} 
                            onClick={() => handleTimeframeChange(t)}
                            className={`px-3 py-1 text-xs font-medium rounded transition-all ${activeTimeframe === t ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={chartData}>
                <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
            </ResponsiveContainer>
        </div>

        {/* Allocation Chart */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
                <PieChartIcon className="text-slate-400" size={20} />
                <h3 className="text-lg font-semibold text-white">Allocation</h3>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
                 <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={ALLOCATION_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {ALLOCATION_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-2xl font-bold text-white">{user?.portfolio.length || 0}</span>
                     <span className="text-xs text-slate-500">Assets</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
                {ALLOCATION_DATA.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-slate-300">{item.name}</span>
                        <span className="text-sm font-mono text-slate-500 ml-auto">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Top Movers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Market Movers</h3>
                <button 
                    onClick={() => onNavigate(AppScreen.WATCHLIST)}
                    className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                    View All
                </button>
            </div>
            <div className="divide-y divide-slate-800 overflow-y-auto max-h-64">
                {MOCK_STOCKS.map((stock) => (
                    <div 
                        key={stock.symbol} 
                        onClick={() => onSelectStock(stock)}
                        className="p-4 flex items-center justify-between hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                                {stock.symbol[0]}
                            </div>
                            <div>
                                <p className="font-bold text-white">{stock.symbol}</p>
                                <p className="text-sm text-slate-400">{stock.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-mono font-medium text-white">${stock.price.toFixed(2)}</p>
                            <p className={`text-sm flex items-center justify-end ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {stock.change >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                {stock.changePercent}%
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="text-slate-400" size={20} />
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-500 text-sm border-b border-slate-800">
                            <th className="pb-3 font-medium">Asset</th>
                            <th className="pb-3 font-medium">Type</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {user?.transactions.slice(0, 5).map((tx, i) => (
                            <tr key={i} className="group hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 last:border-0">
                                <td className="py-3 font-bold text-white">{tx.symbol}</td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${tx.type === 'Buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <span className={`flex items-center gap-1 text-xs ${tx.status === 'Completed' ? 'text-slate-400' : 'text-yellow-400'}`}>
                                        {tx.status === 'Pending' && <AlertCircle size={10} />}
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="py-3 text-right font-mono text-white">${tx.total.toFixed(2)}</td>
                            </tr>
                        ))}
                        {(!user?.transactions || user.transactions.length === 0) && (
                            <tr>
                                <td colSpan={4} className="text-center py-4 text-slate-500">No transactions yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
