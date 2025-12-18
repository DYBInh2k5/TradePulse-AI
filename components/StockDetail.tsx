import React, { useState, useEffect } from 'react';
import { Stock, User } from '../types';
import { CHART_DATA, ORDER_BOOK_BIDS as INITIAL_BIDS, ORDER_BOOK_ASKS as INITIAL_ASKS } from '../constants';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, Activity, BookOpen, Newspaper, ExternalLink, BrainCircuit, Loader2, MessageCircle, Users, BarChart3, Wallet, Scale, Target, Briefcase, TrendingUp, TrendingDown } from 'lucide-react';
import { analyzeStockDeeply, fetchMarketNews } from '../services/geminiService';

interface StockDetailProps {
  stock: Stock;
  user?: User | null;
}

const StockDetail: React.FC<StockDetailProps> = ({ stock, user }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'book' | 'news'>('overview');
  
  // Real-time Order Book Simulation State
  const [bids, setBids] = useState(INITIAL_BIDS);
  const [asks, setAsks] = useState(INITIAL_ASKS);

  // News state
  const [stockNews, setStockNews] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  // Advanced Chart Features
  const [showIndicators, setShowIndicators] = useState(false);

  // Determine User Position
  const userPosition = user?.portfolio.find(p => p.symbol === stock.symbol);
  
  // Calculate P&L if user holds stock
  let pnl = 0;
  let pnlPercent = 0;
  let totalValue = 0;
  
  if (userPosition) {
      totalValue = userPosition.quantity * stock.price;
      pnl = (stock.price - userPosition.avgPrice) * userPosition.quantity;
      pnlPercent = ((stock.price - userPosition.avgPrice) / userPosition.avgPrice) * 100;
  }

  // Simulate Order Book Activity
  useEffect(() => {
    if (activeTab !== 'book') return;

    const interval = setInterval(() => {
      // Randomize sizes and slightly shift prices to simulate live market
      setBids(prev => prev.map(bid => ({
        ...bid,
        size: Math.max(10, Math.floor(bid.size + (Math.random() * 40 - 20))), // Fluctuate size
        price: Number((bid.price + (Math.random() > 0.8 ? 0.01 : 0)).toFixed(2)) // Occasional price tick
      })));

      setAsks(prev => prev.map(ask => ({
        ...ask,
        size: Math.max(10, Math.floor(ask.size + (Math.random() * 40 - 20))),
        price: Number((ask.price + (Math.random() > 0.8 ? 0.01 : 0)).toFixed(2))
      })));
    }, 800);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleAnalyze = async () => {
    setIsLoadingAnalysis(true);
    setAnalysis(null);
    const result = await analyzeStockDeeply(stock.name);
    setAnalysis(result);
    setIsLoadingAnalysis(false);
  };

  useEffect(() => {
    if (activeTab === 'news' && stockNews.length === 0) {
        setIsLoadingNews(true);
        fetchMarketNews(`latest news about ${stock.name} ${stock.symbol} stock`).then(({ text }) => {
            try {
                 const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                 const parsed = JSON.parse(cleanText);
                 // Ensure it is an array
                 setStockNews(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
                console.error("News parse error", e);
                setStockNews([]);
            } finally {
                setIsLoadingNews(false);
            }
        });
    }
  }, [activeTab, stock.name, stockNews.length, stock.symbol]);

  // Helper to render markdown-like text
  const renderAnalysisText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Bold headers
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={index} className="text-emerald-400 font-bold mt-4 mb-2 text-lg">{line.replace(/\*\*/g, '')}</h4>;
      }
      // Bullet points
      if (line.trim().startsWith('* ')) {
        return <li key={index} className="ml-4 text-slate-300 list-disc">{line.replace('* ', '')}</li>;
      }
      // Numbered lists (simple check)
      if (/^\d+\./.test(line.trim())) {
         return <div key={index} className="ml-4 text-slate-300 mb-1 font-medium">{line}</div>;
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }
      return <p key={index} className="text-slate-300 leading-relaxed mb-1">{line.replace(/\*\*/g, '')}</p>;
    });
  };

  // Add mock indicators to chart data
  const chartDataWithIndicators = CHART_DATA.map((d, i) => ({
      ...d,
      sma: showIndicators ? d.price * (1 + Math.sin(i / 5) * 0.05) : undefined, // Fake SMA
  }));

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                {stock.symbol}
                <span className="text-sm font-normal px-2 py-1 bg-slate-800 rounded text-slate-400">NASDAQ</span>
            </h1>
            <p className="text-slate-400 text-lg">{stock.name}</p>
        </div>
        <div className="text-right">
            <h2 className="text-4xl font-mono font-bold text-white">${stock.price.toFixed(2)}</h2>
             <p className={`text-lg font-medium ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent}%)
            </p>
        </div>
      </div>

      {/* Your Position Card (Only visible if user owns stock) */}
      {userPosition && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
               {/* Background Glow */}
               <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16 pointer-events-none ${pnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
               
               <div className="flex items-center gap-2 mb-4 relative z-10">
                   <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                       <Briefcase size={20} className="text-blue-400" />
                   </div>
                   <h3 className="text-lg font-bold text-white">Your Position</h3>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                   <div>
                       <p className="text-xs text-slate-400 mb-1">Quantity</p>
                       <p className="text-xl font-mono font-bold text-white">{userPosition.quantity} <span className="text-sm text-slate-500 font-sans font-normal">shares</span></p>
                   </div>
                    <div>
                       <p className="text-xs text-slate-400 mb-1">Avg. Cost</p>
                       <p className="text-xl font-mono font-bold text-white">${userPosition.avgPrice.toFixed(2)}</p>
                   </div>
                   <div>
                       <p className="text-xs text-slate-400 mb-1">Total Value</p>
                       <p className="text-xl font-mono font-bold text-white">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                   </div>
                    <div>
                       <p className="text-xs text-slate-400 mb-1">Total P&L</p>
                       <div className={`flex items-center gap-1 font-mono font-bold text-xl ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {pnl >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                           ${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                           <span className="text-sm ml-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 bg-opacity-50">
                               {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                           </span>
                       </div>
                   </div>
               </div>
          </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-800 flex gap-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'overview' ? 'text-emerald-400 border-emerald-400' : 'text-slate-400 border-transparent hover:text-white'}`}
          >
              <Activity size={16} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('book')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'book' ? 'text-blue-400 border-blue-400' : 'text-slate-400 border-transparent hover:text-white'}`}
          >
              <BookOpen size={16} /> Order Book
          </button>
           <button 
            onClick={() => setActiveTab('news')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'news' ? 'text-indigo-400 border-indigo-400' : 'text-slate-400 border-transparent hover:text-white'}`}
          >
              <Newspaper size={16} /> News
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
              {activeTab === 'overview' && (
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-[450px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-semibold text-white">Price Action</h3>
                            {/* Indicators Toggle */}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${showIndicators ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                    <input type="checkbox" className="hidden" checked={showIndicators} onChange={() => setShowIndicators(!showIndicators)} />
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${showIndicators ? 'left-4.5' : 'left-0.5'}`} style={{ left: showIndicators ? '18px' : '2px' }} />
                                </div>
                                <span className="text-xs text-slate-400">Indicators (SMA)</span>
                            </label>
                        </div>
                        <div className="flex space-x-2">
                            {['1D', '1W', '1M', '1Y', 'ALL'].map(period => (
                                <button key={period} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${period === '1D' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                        <ComposedChart data={chartDataWithIndicators}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="date" stroke="#64748b" />
                            <YAxis yAxisId="left" stroke="#64748b" domain={['auto', 'auto']} />
                            <YAxis yAxisId="right" orientation="right" stroke="#475569" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                            />
                            <Bar yAxisId="right" dataKey="volume" fill="#3b82f6" opacity={0.3} barSize={20} />
                            <Line yAxisId="left" type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                            {showIndicators && (
                                <Line yAxisId="left" type="monotone" dataKey="sma" stroke="#fbbf24" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
              )}
              
              {activeTab === 'book' && (
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-semibold text-white">Level 2 Market Data</h3>
                         <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-xs text-emerald-400 font-medium">LIVE</span>
                         </div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-8 font-mono text-sm overflow-hidden">
                        {/* Bids Side */}
                        <div>
                            <div className="flex justify-between text-slate-500 mb-2 border-b border-slate-800 pb-2 uppercase text-xs font-bold tracking-wider">
                                <span>Size</span>
                                <span>Bid</span>
                            </div>
                            {bids.map((bid, i) => (
                                <div key={i} className="flex justify-between py-1.5 relative group cursor-default">
                                    <span className="text-white z-10 text-xs">{bid.size.toLocaleString()}</span>
                                    <span className="text-emerald-400 z-10 font-bold">{bid.price.toFixed(2)}</span>
                                    {/* Animated Bar Background */}
                                    <div 
                                        className="absolute top-0 right-0 bottom-0 bg-emerald-500/10 transition-all duration-500 ease-out rounded-l" 
                                        style={{ width: `${Math.min(100, (bid.size / 600) * 100)}%`}} 
                                    />
                                </div>
                            ))}
                        </div>
                         {/* Asks Side */}
                         <div>
                            <div className="flex justify-between text-slate-500 mb-2 border-b border-slate-800 pb-2 uppercase text-xs font-bold tracking-wider">
                                <span>Ask</span>
                                <span>Size</span>
                            </div>
                            {asks.map((ask, i) => (
                                <div key={i} className="flex justify-between py-1.5 relative cursor-default">
                                    <span className="text-rose-400 z-10 font-bold">{ask.price.toFixed(2)}</span>
                                    <span className="text-white z-10 text-xs">{ask.size.toLocaleString()}</span>
                                    {/* Animated Bar Background */}
                                    <div 
                                        className="absolute top-0 left-0 bottom-0 bg-rose-500/10 transition-all duration-500 ease-out rounded-r" 
                                        style={{ width: `${Math.min(100, (ask.size / 600) * 100)}%`}} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              )}

              {activeTab === 'news' && (
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 min-h-[400px]">
                      <div className="p-6 border-b border-slate-800">
                          <h3 className="text-lg font-semibold text-white">Related News</h3>
                      </div>
                      <div className="p-6 space-y-4">
                          {isLoadingNews ? (
                              <div className="flex justify-center items-center py-10 text-slate-500">
                                  <Loader2 className="animate-spin mr-2" />
                                  Fetching latest headlines...
                              </div>
                          ) : stockNews.length > 0 ? (
                              stockNews.map((news, i) => (
                                  <div key={i} className="pb-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 -mx-4 px-4 py-4 transition-colors rounded-lg">
                                      <div className="flex justify-between items-start mb-1">
                                          <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded font-medium">{news.source || 'Unknown'}</span>
                                      </div>
                                      <h4 className="text-white font-bold mb-1">{news.title}</h4>
                                      <p className="text-slate-400 text-sm mb-2">{news.summary}</p>
                                      {news.url && (
                                         <a href={news.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center">
                                             Read Source <ExternalLink size={10} className="ml-1" />
                                         </a>
                                      )}
                                  </div>
                              ))
                          ) : (
                              <p className="text-slate-500 text-center py-10">No recent news found for this asset.</p>
                          )}
                      </div>
                  </div>
              )}

            {/* AI Analysis Section */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-indigo-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Sparkles className="text-indigo-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Gemini Deep Analysis</h3>
                            <p className="text-xs text-indigo-300">Powered by Gemini 3 Pro (Thinking Mode)</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleAnalyze}
                        disabled={isLoadingAnalysis}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoadingAnalysis ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                Thinking...
                            </>
                        ) : (
                            <>
                                <BrainCircuit size={16} /> Analyze
                            </>
                        )}
                    </button>
                </div>
                <div className="p-6 min-h-[150px] bg-slate-900/50">
                    {analysis ? (
                        <div className="prose prose-invert max-w-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {renderAnalysisText(analysis)}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                            <div className="mb-3 p-4 rounded-full bg-slate-800/50">
                                <BrainCircuit size={32} className="opacity-50" />
                            </div>
                            <p>Click "Analyze" to generate a deep-dive report on {stock.name}.</p>
                            <p className="text-xs mt-2 text-slate-600">Uses advanced reasoning to evaluate technicals and fundamentals.</p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Sidebar Stats & Social Sentiment */}
          <div className="space-y-4">
               {/* Financial Health Meter (New Feature) */}
               <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                   <div className="flex items-center gap-2 mb-4">
                       <Scale className="text-slate-400" size={16} />
                       <h4 className="text-white text-sm font-semibold">Financial Health</h4>
                   </div>
                   <div className="relative pt-2 pb-4">
                       <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                           <div className="h-full bg-rose-500 w-[20%]" />
                           <div className="h-full bg-yellow-500 w-[40%]" />
                           <div className="h-full bg-emerald-500 w-[40%]" />
                       </div>
                       {/* Arrow Indicator */}
                       <div className="absolute top-1 left-[75%] -translate-x-1/2 flex flex-col items-center">
                           <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white mb-1" />
                           <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Healthy</span>
                       </div>
                   </div>
                   <div className="flex justify-between text-xs text-slate-500">
                       <span>Weak</span>
                       <span>Stable</span>
                       <span>Strong</span>
                   </div>
               </div>

               {/* New Social Sentiment Card */}
               <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                   <div className="flex items-center gap-2 mb-4">
                       <MessageCircle className="text-slate-400" size={16} />
                       <h4 className="text-white text-sm font-semibold">Social Sentiment</h4>
                   </div>
                   <div className="flex items-end gap-2 mb-1">
                       <span className="text-2xl font-bold text-emerald-400">72%</span>
                       <span className="text-sm text-slate-400 mb-1">Bullish</span>
                   </div>
                   <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                       <div className="h-full bg-emerald-500" style={{ width: '72%' }}></div>
                   </div>
                   <div className="space-y-3">
                       <div className="flex items-start gap-3 text-sm">
                           <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">A</div>
                           <div>
                               <p className="text-slate-300 text-xs">"Strong support at 170. Buying the dip!"</p>
                               <p className="text-slate-600 text-[10px]">2m ago</p>
                           </div>
                       </div>
                       <div className="flex items-start gap-3 text-sm">
                           <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">J</div>
                           <div>
                               <p className="text-slate-300 text-xs">"Earnings report next week will be key."</p>
                               <p className="text-slate-600 text-[10px]">15m ago</p>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Stats Grid (Redesigned) */}
               <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                   <div className="flex items-center gap-2 mb-4">
                       <BarChart3 className="text-slate-400" size={16} />
                       <h4 className="text-white text-sm font-semibold">Key Statistics</h4>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div className="p-3 bg-slate-800/50 rounded-lg">
                           <span className="text-slate-500 text-xs block mb-1">Market Cap</span>
                           <span className="text-white font-medium font-mono text-sm">{stock.marketCap}</span>
                       </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                           <span className="text-slate-500 text-xs block mb-1">Volume</span>
                           <span className="text-white font-medium font-mono text-sm">{stock.volume}</span>
                       </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                           <span className="text-slate-500 text-xs block mb-1">P/E Ratio</span>
                           <span className="text-white font-medium font-mono text-sm">24.5</span>
                       </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                           <span className="text-slate-500 text-xs block mb-1">Beta</span>
                           <span className="text-white font-medium font-mono text-sm">1.12</span>
                       </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                           <span className="text-slate-500 text-xs block mb-1">High (52W)</span>
                           <span className="text-emerald-400 font-medium font-mono text-sm">$198.23</span>
                       </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                           <span className="text-slate-500 text-xs block mb-1">Low (52W)</span>
                           <span className="text-rose-400 font-medium font-mono text-sm">$145.90</span>
                       </div>
                   </div>
               </div>
               
               <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                   <h4 className="text-slate-400 text-sm mb-4">Company Profile</h4>
                   <p className="text-slate-300 text-sm leading-relaxed mb-4">
                       {stock.description}
                   </p>
                   <div className="flex flex-wrap gap-2">
                       <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Consumer Electronics</span>
                       <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Tech</span>
                       <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Big Cap</span>
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};

export default StockDetail;