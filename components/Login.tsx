import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, Zap, Globe, ChevronRight, Loader2 } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: Partial<User>) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'google' | null>(null);

  const features = [
    { icon: Zap, title: "Real-time AI Analysis", desc: "Get market insights in milliseconds powered by Gemini 2.5." },
    { icon: ShieldCheck, title: "Bank-Grade Security", desc: "Your assets are protected with enterprise-level encryption." },
    { icon: Globe, title: "Global Access", desc: "Trade across NASDAQ, NYSE, and Crypto markets instantly." }
  ];

  const [activeFeature, setActiveFeature] = useState(0);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMethod('email');
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
        onLogin({
            name: 'Alex Trader',
            email: email || 'alex@tradepulse.ai',
            avatar: 'A',
            plan: 'Pro'
        });
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setLoginMethod('google');
    setIsLoading(true);
    // Simulate Google OAuth popup delay
    setTimeout(() => {
        onLogin({
            name: 'Google User',
            email: 'user@gmail.com',
            avatar: 'G',
            plan: 'Free'
        });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
      {/* Left Side - Hero / Carousel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 border-r border-slate-800">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="font-bold text-white text-xl">T</span>
            </div>
            <span className="font-bold text-2xl text-white">TradePulse AI</span>
        </div>

        <div className="relative z-10 space-y-8">
            <div className="space-y-6">
                {features.map((feature, idx) => (
                    <div 
                        key={idx}
                        className={`transition-all duration-500 transform ${idx === activeFeature ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-4'}`}
                        onClick={() => setActiveFeature(idx)}
                    >
                        <div className="flex items-start gap-4 cursor-pointer">
                            <div className={`p-3 rounded-xl transition-colors ${idx === activeFeature ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                <feature.icon size={24} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold mb-1 ${idx === activeFeature ? 'text-white' : 'text-slate-400'}`}>{feature.title}</h3>
                                <p className="text-slate-500 max-w-sm">{feature.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="text-slate-500 text-sm">
            © 2024 TradePulse Inc. All rights reserved.
        </div>

        {/* Ambient Blobs */}
        <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
         <div className="absolute top-0 right-0 p-8">
            <button className="text-slate-400 hover:text-white font-medium text-sm">Need help?</button>
         </div>

         <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <div className="lg:hidden w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                    <TrendingUp className="text-white w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold text-white">Welcome back</h2>
                <p className="text-slate-400 mt-2">Enter your credentials to access your portfolio.</p>
            </div>

            <form className="space-y-6" onSubmit={handleEmailLogin}>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@tradepulse.ai"
                        disabled={isLoading}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 disabled:opacity-50"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <a href="#" className="text-sm text-emerald-400 hover:underline">Forgot password?</a>
                    </div>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 disabled:opacity-50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading && loginMethod === 'email' ? (
                        <>
                             <Loader2 className="mr-2 animate-spin" size={20} /> Signing In...
                        </>
                    ) : (
                        <>
                             Sign In <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </>
                    )}
                </button>
            </form>
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-950 text-slate-500">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-3 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                    {isLoading && loginMethod === 'google' ? (
                        <Loader2 className="mr-2 animate-spin text-slate-300" size={20} />
                    ) : (
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-2" alt="Google" />
                    )}
                    <span className="text-slate-300 font-medium text-sm">
                        {isLoading && loginMethod === 'google' ? 'Connecting...' : 'Google'}
                    </span>
                </button>
                <button 
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-3 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                    <img src="https://www.svgrepo.com/show/448234/apple.svg" className="w-5 h-5 mr-2 invert" alt="Apple" />
                    <span className="text-slate-300 font-medium text-sm">Apple</span>
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;