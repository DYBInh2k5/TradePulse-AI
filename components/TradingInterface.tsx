
import React, { useState, useEffect, useRef } from 'react';
import { Stock, User } from '../types';
import { ArrowLeftRight, CheckCircle, SlidersHorizontal, AlertTriangle, AlertCircle, Calculator, Target, Shield, Info, Sparkles, Send, MessageSquare } from 'lucide-react';
import { sendChatResponse } from '../services/geminiService';

interface TradingInterfaceProps {
  stock: Stock;
  user: User | null;
  onTrade: (type: 'Buy' | 'Sell', stock: Stock, quantity: number, price: number) => boolean;
}

type OrderMode = 'market' | 'limit';

const TradingInterface: React.FC<TradingInterfaceProps> = ({ stock, user, onTrade }) => {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderMode, setOrderMode] = useState<OrderMode>('market');
  const [leverage, setLeverage] = useState(1);
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState(stock.price);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Calculator State
  const [projectedProfit, setProjectedProfit] = useState<number | null>(null);
  const [projectedLoss, setProjectedLoss] = useState<number | null>(null);

  // Chat Assistant State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([
      { role: 'model', text: "I'm here to help. Ask me about order types, fees, or market trends for this asset." }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Calculate total based on mode
  const executionPrice = orderMode === 'limit' ? limitPrice : stock.price;
  const rawTotal = quantity * executionPrice;
  const marginRequired = rawTotal / leverage;
  const fees = rawTotal * 0.001; // 0.1% fee
  
  // User Data Validation
  const userBalance = user?.balance || 0;
  const userHolding = user?.portfolio.find(p => p.symbol === stock.symbol)?.quantity || 0;
  const totalCost = marginRequired + fees;

  // Live P&L Calculation Effect
  useEffect(() => {
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);

    if (orderType === 'buy') {
        if (!isNaN(tp) && tp > executionPrice) {
            setProjectedProfit((tp - executionPrice) * quantity);
        } else {
            setProjectedProfit(null);
        }
        if (!isNaN(sl) && sl < executionPrice) {
            setProjectedLoss((executionPrice - sl) * quantity);
        } else {
            setProjectedLoss(null);
        }
    } else { // Sell
        if (!isNaN(tp) && tp < executionPrice) {
            setProjectedProfit((executionPrice - tp) * quantity);
        } else {
            setProjectedProfit(null);
        }
        if (!isNaN(sl) && sl > executionPrice) {
            setProjectedLoss((sl - executionPrice) * quantity);
        } else {
            setProjectedLoss(null);
        }
    }
  }, [stopLoss, takeProfit, quantity, executionPrice, orderType]);

  // Auto-scroll chat
  useEffect(() => {
      if (isChatOpen && chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [chatMessages, isChatOpen]);

  const handleExecute = () => {
    setErrorMsg(null);

    // Basic Validation
    if (orderType === 'buy' && totalCost > userBalance) {
        // Validation messages handled here, success handled by parent via Toast
        setErrorMsg(`Insufficient funds. Need $${totalCost.toFixed(2)}, have $${userBalance.toFixed(2)}`);
        return;
    }
    if (orderType === 'sell' && quantity > userHolding) {
        setErrorMsg(`Insufficient shares. Need ${quantity}, have ${userHolding}`);
        return;
    }

    // Call Parent Handler
    const success = onTrade(orderType === 'buy' ? 'Buy' : 'Sell', stock, quantity, executionPrice);

    if (success) {
        // Reset inputs
        setStopLoss('');
        setTakeProfit('');
    }
  };

  const handleChatSubmit = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!chatInput.trim()) return;

      const userText = chatInput;
      setChatInput('');
      setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
      setIsChatLoading(true);

      const contextIntro = `[System Context: User is trading ${stock.symbol} ($${stock.price}). Action: ${orderType.toUpperCase()} ${quantity} shares. Leverage: ${leverage}x. Order Mode: ${orderMode}.] `;
      const fullPrompt = contextIntro + userText;
      
      const historyFormatted = chatMessages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      const response = await sendChatResponse(historyFormatted, fullPrompt);
      setChatMessages(prev => [...prev, { role: 'model', text: response }]);
      setIsChatLoading(false);
  };

  // Dynamic Theme Colors
  const bgColor = orderType === 'buy' ? 'bg-emerald-500' : 'bg-rose-500';
  const textColor = orderType === 'buy' ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="max-w-2xl mx-auto pt-4 md:pt-10 pb-20">
      <div className={`rounded-3xl border overflow-hidden relative shadow-2xl transition-all duration-500 ${orderType === 'buy' ? 'border-emerald-500/20 bg-slate-900' : 'border-rose-500/20 bg-slate-900'}`}>
        
        {/* Ambient Glow */}
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent ${orderType === 'buy' ? 'via-emerald-500' : 'via-rose-500'} to-transparent opacity-50`} />

        {/* Buy/Sell Tabs */}
        <div className="flex border-b border-slate-800 relative">
            <button 
                onClick={() => setOrderType('buy')}
                className={`flex-1 py-6 font-bold text-lg transition-all duration-300 relative overflow-hidden ${orderType === 'buy' ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Buy {stock.symbol}
                {orderType === 'buy' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 shadow-[0_-2px_10px_rgba(16,185,129,0.5)]" />}
            </button>
            <button 
                onClick={() => setOrderType('sell')}
                className={`flex-1 py-6 font-bold text-lg transition-all duration-300 relative overflow-hidden ${orderType === 'sell' ? 'text-rose-400 bg-rose-500/5' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Sell {stock.symbol}
                {orderType === 'sell' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 shadow-[0_-2px_10px_rgba(244,63,94,0.5)]" />}
            </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
            {/* Market Data Header */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-slate-400 text-sm">Market Price</p>
                    <h2 className={`text-3xl font-mono font-bold ${textColor}`}>${stock.price.toFixed(2)}</h2>
                </div>
                 <div className="bg-slate-800 rounded-lg p-1 flex">
                    <button 
                        onClick={() => setOrderMode('market')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${orderMode === 'market' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Market
                    </button>
                    <button 
                         onClick={() => { setOrderMode('limit'); setLimitPrice(stock.price); }}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${orderMode === 'limit' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Limit
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                    <AlertCircle size={16} /> {errorMsg}
                </div>
            )}

            <div className="space-y-6">
                {/* Available Assets Info */}
                <div className="flex justify-between text-sm bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div>
                        <span className="text-slate-500">Available Cash</span>
                        <p className="text-white font-mono">${userBalance.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-slate-500">Available {stock.symbol}</span>
                        <p className="text-white font-mono">{userHolding}</p>
                    </div>
                </div>

                {/* Leverage Selector */}
                <div>
                     <label className="text-slate-300 font-medium mb-3 block text-sm">Leverage</label>
                     <div className="flex gap-2">
                         {[1, 2, 5, 10, 20].map(lev => (
                             <button
                                key={lev}
                                onClick={() => setLeverage(lev)}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${leverage === lev ? `${bgColor} border-transparent text-white` : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                             >
                                 {lev}x
                             </button>
                         ))}
                     </div>
                     {leverage > 5 && (
                         <div className="mt-2 flex items-center text-orange-400 text-xs gap-2 animate-in fade-in">
                             <AlertTriangle size={12} /> High risk trading enabled. Liquidation price: ${(stock.price * (1 - 1/leverage)).toFixed(2)}
                         </div>
                     )}
                </div>

                {/* Limit Price Input (Conditional) */}
                {orderMode === 'limit' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="text-slate-300 font-medium mb-2 block flex items-center gap-2">
                            <SlidersHorizontal size={16} /> Limit Price
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                            <input 
                                type="number" 
                                value={limitPrice}
                                onChange={(e) => setLimitPrice(Number(e.target.value))}
                                className={`w-full bg-slate-950 border rounded-xl py-4 pl-8 pr-4 text-white font-mono focus:ring-2 outline-none transition-all ${orderType === 'buy' ? 'focus:ring-emerald-500 border-emerald-500/30' : 'focus:ring-rose-500 border-rose-500/30'}`}
                            />
                        </div>
                    </div>
                )}

                {/* Quantity Slider & Input */}
                <div>
                    <div className="flex justify-between mb-4">
                        <label className="text-slate-300 font-medium">Quantity</label>
                        <span className="text-slate-400 text-sm">Max: 1000</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <input 
                            type="range" 
                            min="1" 
                            max="1000" 
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 ${orderType === 'buy' ? 'accent-emerald-500' : 'accent-rose-500'}`}
                        />
                        <input 
                            type="number" 
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className={`w-24 bg-slate-950 border rounded-lg py-2 px-3 text-center text-white font-mono focus:ring-1 outline-none ${orderType === 'buy' ? 'focus:ring-emerald-500 border-emerald-500/30' : 'focus:ring-rose-500 border-rose-500/30'}`}
                        />
                    </div>
                </div>

                {/* SL / TP with Live Calculator */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                                <Shield size={12} /> Stop Loss
                            </label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    placeholder="None"
                                    value={stopLoss}
                                    onChange={(e) => setStopLoss(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-6 pr-2 text-white text-sm font-mono focus:border-rose-500 outline-none focus:bg-slate-900 transition-colors"
                                />
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-rose-500 text-xs">▼</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                                <Target size={12} /> Take Profit
                            </label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    placeholder="None"
                                    value={takeProfit}
                                    onChange={(e) => setTakeProfit(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-6 pr-2 text-white text-sm font-mono focus:border-emerald-500 outline-none focus:bg-slate-900 transition-colors"
                                />
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-500 text-xs">▲</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Live Calculator Card */}
                    {(projectedProfit !== null || projectedLoss !== null) && (
                        <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 text-xs">
                             <div className="flex items-center gap-2 mb-2 text-slate-400">
                                <Calculator size={12} /> Live P&L Projection
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-slate-500 block mb-1">Max Loss (Risk)</span>
                                    {projectedLoss !== null ? (
                                        <span className="text-rose-400 font-mono font-bold">-${projectedLoss.toFixed(2)}</span>
                                    ) : (
                                        <span className="text-slate-600">--</span>
                                    )}
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-1">Potential Gain (Reward)</span>
                                    {projectedProfit !== null ? (
                                        <span className="text-emerald-400 font-mono font-bold">+${projectedProfit.toFixed(2)}</span>
                                    ) : (
                                        <span className="text-slate-600">--</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-slate-950 rounded-xl p-6 space-y-3 border border-slate-800">
                <h4 className="text-slate-200 font-semibold text-sm mb-2 flex items-center gap-2">
                    <Info size={14} /> Order Summary
                </h4>
                <div className="flex justify-between text-slate-400 text-sm">
                    <span>Order Value</span>
                    <span className="font-mono">${rawTotal.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-slate-400 text-sm">
                    <span>Estimated Cost {leverage > 1 && `(Margin ${leverage}x)`}</span>
                    <span className="text-blue-400 font-medium font-mono">${marginRequired.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-slate-400 text-sm">
                    <span>Fees (0.1%)</span>
                    <span className="text-rose-400 font-mono">${fees.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between items-end">
                    <span className="text-white font-bold text-lg">Total Amount</span>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-white block">${totalCost.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <button 
                onClick={handleExecute}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center ${
                    orderType === 'buy' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25' 
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                }`}
            >
                <ArrowLeftRight className="mr-2" size={20} />
                {orderType === 'buy' ? 'Confirm Long' : 'Confirm Short'}
            </button>

            {/* AI Assistant Toggle */}
            <div className="pt-4 border-t border-slate-800">
                <button 
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="w-full flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                >
                    <Sparkles size={16} /> 
                    {isChatOpen ? 'Hide Assistant' : 'Ask AI Trading Assistant'}
                </button>

                {isChatOpen && (
                    <div className="mt-4 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden animate-in slide-in-from-top-2">
                        <div className="h-64 overflow-y-auto p-4 space-y-3 bg-slate-900/50">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                                        msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"/>
                                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"/>
                                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-300"/>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleChatSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                            <input 
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="e.g., Is now a good time to buy?"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                            <button 
                                type="submit"
                                disabled={!chatInput.trim() || isChatLoading}
                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;
