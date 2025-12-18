import React, { useState } from 'react';
import { MOCK_STOCKS } from '../constants';
import { Stock } from '../types';
import { Star, ChevronRight, LayoutGrid, List, Search, ArrowUpDown, TrendingUp, DollarSign, Cpu, Zap, Coins } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface WatchlistProps {
  onSelectStock: (stock: Stock) => void;
}

type SortOption = 'price' | 'change' | 'name';
type SectorFilter = 'All' | 'Tech' | 'EV' | 'Crypto' | 'Consumer';

const Watchlist: React.FC<WatchlistProps> = ({ onSelectStock }) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('change');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeSector, setActiveSector] = useState<SectorFilter>('All');

  // Helper to "fake" sectors based on mock data symbols for demo purposes
  const getSector = (symbol: string) => {
      if (['AAPL', 'NVDA', 'GOOGL'].includes(symbol)) return 'Tech';
      if (['TSLA', 'RIVN'].includes(symbol)) return 'EV';
      if (['BTC', 'ETH'].includes(symbol)) return 'Crypto';
      return 'Consumer';
  };

  // Logic: Filter -> Sort
  const filteredStocks = [...MOCK_STOCKS]
    .filter(s => {
        const matchesSearch = s.symbol.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase());
        const matchesSector = activeSector === 'All' || getSector(s.symbol) === activeSector;
        return matchesSearch && matchesSector;
    })
    .sort((a, b) => {
        let valA: any = a[sortOption === 'name' ? 'symbol' : sortOption === 'price' ? 'price' : 'changePercent'];
        let valB: any = b[sortOption === 'name' ? 'symbol' : sortOption === 'price' ? 'price' : 'changePercent'];
        
        // Handle numeric comparison vs string comparison
        if (typeof valA === 'string') {
             return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

  const handleSort = (option: SortOption) => {
      if (sortOption === option) {
          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortOption(option);
          setSortDirection('desc'); // Default to high-to-low for new metric
      }
  };

  // Generate fake sparkline data seeded by stock change to look realistic
  const getSparkData = (stock: Stock) => {
      const isPositive = stock.change >= 0;
      let prev = 50;
      return Array.from({length: 20}, (_, i) => {
          const trend = isPositive ? 1 : -1;
          const noise = Math.random() * 10 - 5;
          prev = prev + trend + noise;
          return { value: prev };
      });
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Watchlist</h2>
                <p className="text-slate-400">Tracking {filteredStocks.length} assets</p>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
                + Add Asset
            </button>
        </div>
        
        {/* Search & Main Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search assets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* Sort Group */}
            <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto shrink-0">
                 <button 
                    onClick={() => handleSort('change')}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${sortOption === 'change' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <TrendingUp size={14} className="mr-2" />
                    Performance
                    {sortOption === 'change' && <ArrowUpDown size={12} className="ml-1 opacity-50" />}
                </button>
                <button 
                    onClick={() => handleSort('price')}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${sortOption === 'price' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <DollarSign size={14} className="mr-2" />
                    Price
                     {sortOption === 'price' && <ArrowUpDown size={12} className="ml-1 opacity-50" />}
                </button>
            </div>

            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <List size={20} />
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <LayoutGrid size={20} />
                </button>
            </div>
        </div>

        {/* Sector Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Tech', 'EV', 'Crypto', 'Consumer'].map((sector) => (
                <button
                    key={sector}
                    onClick={() => setActiveSector(sector as SectorFilter)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                        activeSector === sector 
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' 
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                >
                    {sector === 'Tech' && <Cpu size={14} className="inline mr-1.5 mb-0.5" />}
                    {sector === 'EV' && <Zap size={14} className="inline mr-1.5 mb-0.5" />}
                    {sector === 'Crypto' && <Coins size={14} className="inline mr-1.5 mb-0.5" />}
                    {sector}
                </button>
            ))}
        </div>
      </header>

      {viewMode === 'list' ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-slate-800">
                {filteredStocks.map((stock) => (
                    <div 
                        key={stock.symbol}
                        className="p-4 md:p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors group cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300"
                        onClick={() => onSelectStock(stock)}
                    >
                        <div className="flex items-center gap-4 min-w-[180px]">
                            <div className="text-yellow-500">
                                <Star fill="currentColor" size={20} />
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                                {stock.symbol[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{stock.symbol}</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-slate-400 text-sm">{stock.name}</p>
                                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 border border-slate-700">{getSector(stock.symbol)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-1 justify-end items-center gap-4 md:gap-12">
                            {/* Recharts Sparkline */}
                            <div className="hidden md:block w-32 h-12">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={getSparkData(stock)}>
                                        <Line 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke={stock.change >= 0 ? '#10b981' : '#f43f5e'} 
                                            strokeWidth={2} 
                                            dot={false} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="text-right min-w-[100px]">
                                <p className="font-mono font-bold text-white">${stock.price.toFixed(2)}</p>
                                <span className={`text-sm font-medium px-2 py-0.5 rounded ${stock.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                                </span>
                            </div>
                            
                            <div className="text-slate-600 group-hover:text-white transition-colors">
                                <ChevronRight />
                            </div>
                        </div>
                    </div>
                ))}
                {filteredStocks.length === 0 && (
                     <div className="p-10 text-center text-slate-500">
                         No assets found matching "{search}"
                     </div>
                )}
            </div>
        </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStocks.map((stock) => (
                  <div 
                    key={stock.symbol}
                    onClick={() => onSelectStock(stock)}
                    className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-600 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden group animate-in zoom-in-95 duration-300"
                  >
                      {/* Gradient Background Effect */}
                      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10 transition-opacity group-hover:opacity-40 ${stock.change >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                      <div className="flex justify-between items-start mb-6">
                          <div className="flex gap-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-xl border border-slate-700">
                                  {stock.symbol[0]}
                              </div>
                              <div>
                                  <h3 className="font-bold text-white text-xl">{stock.symbol}</h3>
                                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">{getSector(stock.symbol)}</span>
                              </div>
                          </div>
                          <div className="text-yellow-500">
                                <Star fill="currentColor" size={20} />
                           </div>
                      </div>
                      
                      {/* Mini Sparkline in Grid Card */}
                      <div className="h-12 w-full mb-4 opacity-70">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getSparkData(stock)}>
                                    <Line 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke={stock.change >= 0 ? '#10b981' : '#f43f5e'} 
                                        strokeWidth={2} 
                                        dot={false} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                      </div>

                      <div className="flex items-end justify-between border-t border-slate-800 pt-4">
                          <div>
                              <p className="text-sm text-slate-500 mb-1">Price</p>
                              <p className="font-mono font-bold text-white text-lg">${stock.price.toFixed(2)}</p>
                          </div>
                           <div className="text-right">
                              <p className="text-sm text-slate-500 mb-1">24h Change</p>
                              <p className={`font-medium ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                              </p>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default Watchlist;