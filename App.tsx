
import React, { useState, useEffect } from 'react';
import { AppScreen, User, Stock, Transaction, Notification } from './types';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StockDetail from './components/StockDetail';
import TradingInterface from './components/TradingInterface';
import Watchlist from './components/Watchlist';
import NewsAlerts from './components/NewsAlerts';
import Settings from './components/Settings';
import AIAnalysis from './components/AIAnalysis';
import Profile from './components/Profile';
import MarketScanner from './components/MarketScanner';
import { MOCK_STOCKS } from './constants';
import { Menu, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [selectedStock, setSelectedStock] = useState<Stock>(MOCK_STOCKS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // UX State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // --- Notification System State ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Used to force re-render for toast animation timing
  const [tick, setTick] = useState(0); 

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
      const newNotif: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          title,
          message,
          type,
          timestamp: new Date(),
          read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllAsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // --- Simulated Market Events ---
  useEffect(() => {
      if (!isLoggedIn) return;

      // Random Market Alerts every 30-45 seconds
      const interval = setInterval(() => {
          const randomStock = MOCK_STOCKS[Math.floor(Math.random() * MOCK_STOCKS.length)];
          const events = [
              { title: "Price Surge", msg: `${randomStock.symbol} just jumped 2.5% in the last 5 minutes!`, type: 'warning' },
              { title: "Volume Alert", msg: `High trading volume detected for ${randomStock.symbol}.`, type: 'info' },
              { title: "New Analyst Rating", msg: `Goldman Sachs upgraded ${randomStock.symbol} to BUY.`, type: 'success' },
              { title: "Market Dip", msg: `${randomStock.symbol} is testing support levels. Watch out!`, type: 'error' }
          ];
          const event = events[Math.floor(Math.random() * events.length)];
          
          // 30% chance to trigger each interval to keep it not too spammy
          if (Math.random() > 0.7) {
              addNotification(event.title, event.msg, event.type as any);
          }
      }, 15000);

      return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Handle Hash Navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && Object.values(AppScreen).includes(hash as AppScreen)) {
        if (isLoggedIn || hash === AppScreen.LOGIN) {
            setCurrentScreen(hash as AppScreen);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isLoggedIn]);

  const handleLogin = (baseUser: Partial<User>) => {
    // Initialize user with mock financial data
    const fullUser: User = {
        name: baseUser.name!,
        email: baseUser.email!,
        avatar: baseUser.avatar!,
        plan: baseUser.plan!,
        balance: 50000.00, // Initial Demo Balance
        portfolio: [
            { symbol: 'AAPL', quantity: 10, avgPrice: 150.00 },
            { symbol: 'NVDA', quantity: 5, avgPrice: 800.00 }
        ],
        transactions: [
             { id: 'TX-1', symbol: 'AAPL', type: 'Buy', quantity: 10, price: 150.00, total: 1500, timestamp: new Date(), status: 'Completed' },
             { id: 'TX-2', symbol: 'NVDA', type: 'Buy', quantity: 5, price: 800.00, total: 4000, timestamp: new Date(), status: 'Completed' }
        ],
        level: 1,
        xp: 0
    };
    setUser(fullUser);
    setIsLoggedIn(true);
    setCurrentScreen(AppScreen.DASHBOARD);
    window.location.hash = AppScreen.DASHBOARD;
    addNotification("Welcome Back!", `Logged in as ${fullUser.name}`, 'success');
  };

  const handleNavigate = (screen: AppScreen) => {
    setCurrentScreen(screen);
    window.location.hash = screen;
    setIsMobileMenuOpen(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUser(updatedUser);
  };

  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock);
    handleNavigate(AppScreen.DETAIL);
  };

  // Centralized Trading Logic
  const handleTrade = (type: 'Buy' | 'Sell', stock: Stock, quantity: number, price: number) => {
      if (!user) return false;

      const totalCost = price * quantity;
      const fees = totalCost * 0.001; // 0.1% fee
      const totalWithFees = totalCost + fees;
      const totalProceeds = totalCost - fees;

      const newTransaction: Transaction = {
          id: `TX-${Date.now()}`,
          symbol: stock.symbol,
          type: type,
          price: price,
          quantity: quantity,
          total: type === 'Buy' ? totalWithFees : totalProceeds,
          timestamp: new Date(),
          status: 'Completed'
      };

      // Gamification Logic: Add XP
      let newXp = user.xp + 50; // 50 XP per trade
      let newLevel = user.level;
      if (newXp >= newLevel * 100) {
          newXp = newXp - (newLevel * 100);
          newLevel += 1;
          addNotification("Level Up!", `Congratulations! You reached Level ${newLevel}.`, 'success');
      }

      if (type === 'Buy') {
          // Check Balance
          if (user.balance < totalWithFees) {
              addNotification("Trade Failed", "Insufficient funds to execute this order.", "error");
              return false;
          }

          // Update State
          const updatedPortfolio = [...user.portfolio];
          const existingItemIndex = updatedPortfolio.findIndex(p => p.symbol === stock.symbol);

          if (existingItemIndex >= 0) {
              const item = updatedPortfolio[existingItemIndex];
              // Calculate new weighted average price
              const totalValue = (item.quantity * item.avgPrice) + totalCost;
              const totalQty = item.quantity + quantity;
              updatedPortfolio[existingItemIndex] = {
                  ...item,
                  quantity: totalQty,
                  avgPrice: totalValue / totalQty
              };
          } else {
              updatedPortfolio.push({ symbol: stock.symbol, quantity, avgPrice: price });
          }

          setUser({
              ...user,
              balance: user.balance - totalWithFees,
              portfolio: updatedPortfolio,
              transactions: [newTransaction, ...user.transactions],
              xp: newXp,
              level: newLevel
          });

      } else { // SELL
          const existingItem = user.portfolio.find(p => p.symbol === stock.symbol);
          if (!existingItem || existingItem.quantity < quantity) {
              addNotification("Trade Failed", "Insufficient shares to sell.", "error");
              return false;
          }

           // Update State
          let updatedPortfolio = [...user.portfolio];
          const itemIndex = updatedPortfolio.findIndex(p => p.symbol === stock.symbol);
          
          if (updatedPortfolio[itemIndex].quantity === quantity) {
              // Sold all
              updatedPortfolio.splice(itemIndex, 1);
          } else {
              // Sold partial
              updatedPortfolio[itemIndex] = {
                  ...updatedPortfolio[itemIndex],
                  quantity: updatedPortfolio[itemIndex].quantity - quantity
              };
          }

          setUser({
              ...user,
              balance: user.balance + totalProceeds,
              portfolio: updatedPortfolio,
              transactions: [newTransaction, ...user.transactions],
              xp: newXp,
              level: newLevel
          });
      }
      addNotification("Order Executed", `Successfully ${type === 'Buy' ? 'bought' : 'sold'} ${quantity} ${stock.symbol}`, 'success');
      return true;
  };

  if (currentScreen === AppScreen.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  // Active Toasts Filter: Created in the last 4 seconds
  const activeToasts = notifications.filter(n => (new Date().getTime() - n.timestamp.getTime()) < 4000).slice(0, 3);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
      
      {/* GLOBAL TOAST CONTAINER */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
          {activeToasts.map((notif) => (
              <div key={notif.id} className="pointer-events-auto bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl shadow-black/50 flex items-start gap-3 w-80 animate-in slide-in-from-right duration-300">
                  <div className={`mt-0.5 p-1 rounded-full ${
                      notif.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                      notif.type === 'error' ? 'bg-rose-500/20 text-rose-400' :
                      notif.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                  }`}>
                      {notif.type === 'success' && <CheckCircle size={16} />}
                      {notif.type === 'error' && <AlertCircle size={16} />}
                      {notif.type === 'warning' && <AlertTriangle size={16} />}
                      {notif.type === 'info' && <Info size={16} />}
                  </div>
                  <div>
                      <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
                  </div>
              </div>
          ))}
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white">T</span>
            </div>
            <span className="font-bold text-lg text-emerald-400">TradePulse</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400 hover:text-white">
            <Menu size={24} />
          </button>
       </div>

      <Sidebar 
        currentScreen={currentScreen} 
        onNavigate={handleNavigate} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {/* Adjust margin based on sidebar state */}
      <main className={`flex-1 overflow-y-auto p-4 md:p-8 relative pt-20 md:pt-8 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-0' : 'md:ml-0'}`}>
        <div className="max-w-7xl mx-auto h-full">
          {currentScreen === AppScreen.DASHBOARD && (
            <Dashboard 
                onSelectStock={handleSelectStock} 
                user={user} 
                notifications={notifications} 
                onMarkRead={markAllAsRead}
                onNavigate={handleNavigate}
                onUpdateUser={handleUpdateUser}
            />
          )}
          {currentScreen === AppScreen.DETAIL && <StockDetail stock={selectedStock} user={user} />}
          {currentScreen === AppScreen.TRADING && <TradingInterface stock={selectedStock} user={user} onTrade={handleTrade} />}
          {currentScreen === AppScreen.SCANNER && <MarketScanner />}
          {currentScreen === AppScreen.WATCHLIST && <Watchlist onSelectStock={handleSelectStock} />}
          {currentScreen === AppScreen.NEWS && <NewsAlerts />}
          {currentScreen === AppScreen.SETTINGS && <Settings user={user} />}
          {currentScreen === AppScreen.ANALYSIS && <AIAnalysis />}
          {currentScreen === AppScreen.PROFILE && <Profile user={user} />}
        </div>
      </main>
    </div>
  );
};

export default App;
