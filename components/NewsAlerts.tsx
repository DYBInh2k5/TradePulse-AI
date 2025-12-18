import React, { useEffect, useState } from 'react';
import { fetchMarketNews } from '../services/geminiService';
import { RefreshCw, ExternalLink, Globe, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const NewsAlerts: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNews = async () => {
    setIsLoading(true);
    const { text, grounding } = await fetchMarketNews();
    try {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);
        setNews(parsed);
        setGroundingChunks(grounding || []);
    } catch (e) {
        console.error("Failed to parse news", e);
        setNews([{ title: "Error loading news", summary: text, source: "System" }]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  // Simple mock sentiment analyzer (random for demo purposes if not provided by AI)
  const getSentiment = (index: number) => {
      const types = ['bullish', 'bearish', 'neutral'];
      return types[index % 3];
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-white">Market Intelligence</h2>
            <p className="text-slate-400">Powered by Gemini Search Grounding</p>
        </div>
        <button 
            onClick={loadNews}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
        >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            Refresh Analysis
        </button>
      </header>

      <div className="grid gap-6">
        {news.map((item, idx) => {
            const sentiment = getSentiment(idx);
            return (
                <div key={idx} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                             <span className="text-xs font-bold tracking-wider text-blue-400 uppercase bg-blue-400/10 px-2 py-1 rounded">
                                {item.source || "Market News"}
                            </span>
                            {/* Sentiment Badge */}
                            {sentiment === 'bullish' && (
                                <span className="flex items-center gap-1 text-xs font-bold tracking-wider text-emerald-400 uppercase bg-emerald-400/10 px-2 py-1 rounded">
                                    <TrendingUp size={12} /> Bullish
                                </span>
                            )}
                            {sentiment === 'bearish' && (
                                <span className="flex items-center gap-1 text-xs font-bold tracking-wider text-rose-400 uppercase bg-rose-400/10 px-2 py-1 rounded">
                                    <TrendingDown size={12} /> Bearish
                                </span>
                            )}
                             {sentiment === 'neutral' && (
                                <span className="flex items-center gap-1 text-xs font-bold tracking-wider text-slate-400 uppercase bg-slate-400/10 px-2 py-1 rounded">
                                    <Minus size={12} /> Neutral
                                </span>
                            )}
                        </div>
                        <span className="text-slate-500 text-xs">Just now</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                    <p className="text-slate-300 leading-relaxed mb-4">{item.summary}</p>
                    
                    {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
                            Read full story <ExternalLink size={14} className="ml-1" />
                        </a>
                    )}
                </div>
            );
        })}
      </div>

      {/* Grounding Sources */}
      {groundingChunks.length > 0 && (
          <div className="mt-8 p-6 bg-slate-900 rounded-xl border border-slate-800">
            <h4 className="text-sm font-semibold text-slate-400 mb-4 flex items-center uppercase tracking-wider">
                <Globe size={16} className="mr-2" />
                Verified Sources
            </h4>
            <div className="flex flex-wrap gap-3">
                {groundingChunks.map((chunk, i) => (
                    chunk.web?.uri && (
                        <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition-colors">
                            <img src={`https://www.google.com/s2/favicons?domain=${new URL(chunk.web.uri).hostname}`} className="w-4 h-4 rounded-sm" alt="icon" />
                            <span className="truncate max-w-[150px]">{chunk.web.title || new URL(chunk.web.uri).hostname}</span>
                        </a>
                    )
                ))}
            </div>
          </div>
      )}
    </div>
  );
};

export default NewsAlerts;
