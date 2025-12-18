import { Stock } from './types';

export const MOCK_STOCKS: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 173.50, change: 1.25, changePercent: 0.72, volume: '52M', marketCap: '2.7T', description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories." },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 205.60, change: -3.40, changePercent: -1.63, volume: '105M', marketCap: '650B', description: "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems." },
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 875.20, change: 15.30, changePercent: 1.78, volume: '45M', marketCap: '2.1T', description: "NVIDIA Corporation focuses on personal computer graphics, graphics processing units, and artificial intelligence." },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.10, change: 0.50, changePercent: 0.35, volume: '22M', marketCap: '1.8T', description: "Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America." },
  { symbol: 'AMZN', name: 'Amazon.com', price: 178.15, change: -0.90, changePercent: -0.50, volume: '33M', marketCap: '1.85T', description: "Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally." },
];

export const CHART_DATA = Array.from({ length: 50 }, (_, i) => ({
  date: `10:${i < 10 ? '0' + i : i}`,
  price: 150 + Math.random() * 50 - 25,
  volume: Math.floor(Math.random() * 1000) + 500,
}));

export const ALLOCATION_DATA = [
  { name: 'Tech', value: 45, color: '#10b981' },
  { name: 'EV', value: 25, color: '#3b82f6' },
  { name: 'Crypto', value: 15, color: '#8b5cf6' },
  { name: 'Cash', value: 15, color: '#64748b' },
];

export const ORDER_BOOK_BIDS = Array.from({ length: 5 }, (_, i) => ({
  price: 173.50 - (i * 0.05),
  size: Math.floor(Math.random() * 500) + 100,
  total: 0 // calculated in component
}));

export const ORDER_BOOK_ASKS = Array.from({ length: 5 }, (_, i) => ({
  price: 173.50 + ((i + 1) * 0.05),
  size: Math.floor(Math.random() * 500) + 100,
  total: 0 // calculated in component
}));
