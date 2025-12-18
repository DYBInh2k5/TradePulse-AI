
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  description?: string;
}

export interface NewsItem {
  title: string;
  source: string;
  time: string;
  summary: string;
  url?: string;
}

export interface PortfolioItem {
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'Buy' | 'Sell';
  price: number;
  quantity: number;
  total: number;
  timestamp: Date;
  status: 'Completed' | 'Pending';
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  balance: number;
  portfolio: PortfolioItem[];
  transactions: Transaction[];
  // Gamification
  level: number;
  xp: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export enum AppScreen {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  DETAIL = 'DETAIL',
  TRADING = 'TRADING',
  WATCHLIST = 'WATCHLIST',
  SCANNER = 'SCANNER', // New Virtual Scan Feature
  NEWS = 'NEWS',
  SETTINGS = 'SETTINGS',
  ANALYSIS = 'ANALYSIS', // The AI Hub
  PROFILE = 'PROFILE'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}