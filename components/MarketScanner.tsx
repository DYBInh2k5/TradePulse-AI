
import React, { useState, useEffect, useRef } from 'react';
import { ScanEye, Radar, Target, Cpu, TrendingUp, AlertTriangle, CheckCircle, Search, Zap, Camera, X, Aperture, RefreshCw } from 'lucide-react';
import { MOCK_STOCKS } from '../constants';
import { Stock } from '../types';

interface ScannedResult {
  stock: Stock;
  score: number;
  signal: 'Buy' | 'Sell' | 'Hold';
  pattern: string;
  confidence: number;
}

const MarketScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ScannedResult[]>([]);
  const [scanType, setScanType] = useState<'technical' | 'fundamental' | 'sentiment'>('technical');
  
  // Camera State
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setIsCameraMode(true);
      // Wait a tick for the video element to be rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera access denied:", err);
      setCameraError("Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraMode(false);
  };

  const captureAndScan = () => {
    if (videoRef.current && canvasRef.current) {
      // Draw frame to canvas (simulating capture)
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        // In a real app, we would send this blob to Gemini 2.5 Flash Image
        // const dataUrl = canvasRef.current.toDataURL('image/jpeg'); 
      }
    }
    // Trigger the scan simulation
    startScan();
  };

  const startScan = () => {
    setIsScanning(true);
    setProgress(0);
    setResults([]);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          generateResults();
          return 100;
        }
        return prev + 2; // Speed of scan
      });
    }, 50);
  };

  const generateResults = () => {
    // Randomly pick 2-3 stocks from MOCK_STOCKS
    const shuffled = [...MOCK_STOCKS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    const patterns = [
        "Bullish Divergence", "Golden Cross", "Oversold RSI", "Breakout Volume", "Head & Shoulders"
    ];

    const newResults: ScannedResult[] = selected.map(stock => ({
        stock,
        score: Math.floor(Math.random() * 30) + 70, // 70-99
        signal: Math.random() > 0.5 ? 'Buy' : 'Sell',
        pattern: patterns[Math.floor(Math.random() * patterns.length)],
        confidence: Math.floor(Math.random() * 20) + 80 // 80-99%
    }));

    setResults(newResults);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <ScanEye className="text-emerald-400" size={32} />
                Virtual Market Scanner
            </h2>
            <p className="text-slate-400 mt-1">AI-Powered Pattern Recognition & Vision Analysis</p>
          </div>
          
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(['technical', 'fundamental', 'sentiment'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setScanType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        scanType === type 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                      {type} Scan
                  </button>
              ))}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Scanner HUD / Camera */}
          <div className="lg:col-span-1">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[450px]">
                  
                  {/* Decorative Grids */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none"></div>

                  {/* --- MODE SWITCHER --- */}
                  <div className="absolute top-4 right-4 z-20 flex gap-2">
                     {!isCameraMode ? (
                        <button 
                            onClick={startCamera}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors tooltip"
                            title="Open Camera"
                        >
                            <Camera size={20} />
                        </button>
                     ) : (
                        <button 
                            onClick={stopCamera}
                            className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg border border-rose-500/50 transition-colors"
                            title="Close Camera"
                        >
                            <X size={20} />
                        </button>
                     )}
                  </div>

                  {/* --- VISUALIZER AREA --- */}
                  <div className="relative w-full aspect-square max-w-[300px] mb-6 flex items-center justify-center">
                        
                        {/* CAMERA VIEW */}
                        {isCameraMode ? (
                            <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-black">
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    className="w-full h-full object-cover"
                                />
                                <canvas ref={canvasRef} className="hidden" width={640} height={480} />
                                
                                {/* Camera Overlay UI */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-400/80 rounded-tl-lg" />
                                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-400/80 rounded-tr-lg" />
                                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-400/80 rounded-bl-lg" />
                                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-400/80 rounded-br-lg" />
                                    
                                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                        <Target size={48} className="text-emerald-400" />
                                    </div>
                                    
                                    {isScanning && (
                                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-[scan_2s_linear_infinite]" />
                                    )}
                                </div>
                                <div className="absolute bottom-2 left-0 right-0 text-center">
                                    <span className="bg-black/60 text-emerald-400 text-xs px-2 py-1 rounded font-mono">LIVE FEED</span>
                                </div>
                            </div>
                        ) : (
                            /* RADAR VIEW */
                            <div className="relative w-64 h-64 rounded-full border-2 border-slate-700 flex items-center justify-center bg-slate-950 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                                <div className="absolute w-48 h-48 rounded-full border border-slate-800 opacity-50"></div>
                                <div className="absolute w-32 h-32 rounded-full border border-slate-800 opacity-50"></div>
                                <div className="absolute w-2 h-2 rounded-full bg-emerald-500"></div>

                                {isScanning && (
                                    <div className="absolute w-full h-full rounded-full animate-[spin_2s_linear_infinite] origin-center">
                                        <div className="w-1/2 h-1/2 bg-gradient-to-tl from-emerald-500/0 to-emerald-500/20 border-l border-emerald-500/50 absolute top-0 left-0 rounded-tl-full"></div>
                                    </div>
                                )}
                                
                                {!isScanning && progress === 0 && (
                                    <Radar size={48} className="text-slate-600" />
                                )}
                                
                                {!isScanning && progress === 100 && (
                                    <CheckCircle size={48} className="text-emerald-500 animate-in zoom-in" />
                                )}
                            </div>
                        )}
                  </div>

                  {/* Stats / Status */}
                  <div className="w-full space-y-4 z-10">
                      <div className="flex justify-between text-sm text-slate-400">
                          <span>Status</span>
                          <span className={isScanning ? "text-emerald-400 animate-pulse" : "text-white"}>
                              {isScanning ? "PROCESSING DATA..." : progress === 100 ? "SCAN COMPLETE" : "STANDBY"}
                          </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-75 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            style={{ width: `${progress}%` }}
                          />
                      </div>
                      
                      {cameraError ? (
                          <div className="text-xs text-rose-400 text-center bg-rose-500/10 p-2 rounded border border-rose-500/20">
                              {cameraError}
                          </div>
                      ) : (
                          <div className="flex justify-between text-xs text-slate-500 font-mono">
                              <span>MODE: {isCameraMode ? 'OPTICAL' : 'VIRTUAL'}</span>
                              <span>NET: SECURE</span>
                          </div>
                      )}
                  </div>

                  {isCameraMode ? (
                      <button
                        onClick={captureAndScan}
                        disabled={isScanning}
                        className="mt-8 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                         {isScanning ? (
                            <>Processing...</>
                         ) : (
                            <>
                                <Aperture size={20} /> Capture & Analyze
                            </>
                         )}
                      </button>
                  ) : (
                      <button
                        onClick={startScan}
                        disabled={isScanning}
                        className="mt-8 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          {isScanning ? (
                              <>Scanning...</>
                          ) : (
                              <>
                                <RefreshCw size={20} /> Initialize Scan
                              </>
                          )}
                      </button>
                  )}
              </div>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-2 space-y-6">
              {results.length === 0 && !isScanning ? (
                  <div className="h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed p-12 text-slate-500">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium">No results to display</p>
                      <p className="text-sm">Use the virtual scanner or camera to detect opportunities.</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {isScanning && (
                          <div className="text-center py-10">
                               <p className="text-emerald-400 font-mono animate-pulse">Analyzing Market Data... Please Wait</p>
                          </div>
                      )}
                      
                      {results.map((res, idx) => (
                          <div 
                            key={res.stock.symbol}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 animate-in slide-in-from-right duration-500 hover:border-emerald-500/50 transition-colors cursor-pointer group"
                            style={{ animationDelay: `${idx * 150}ms` }}
                          >
                              {/* Stock Info */}
                              <div className="flex items-center gap-4 min-w-[180px]">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${res.signal === 'Buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                      {res.stock.symbol[0]}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-white text-lg">{res.stock.symbol}</h3>
                                      <p className="text-slate-400 text-sm">{res.stock.name}</p>
                                  </div>
                              </div>

                              {/* Pattern Info */}
                              <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                      <Cpu size={14} className="text-indigo-400" />
                                      <span className="text-indigo-300 text-xs font-bold uppercase tracking-wide">AI Pattern Detected</span>
                                  </div>
                                  <p className="text-white font-medium">{res.pattern}</p>
                                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${res.confidence}%` }}></div>
                                  </div>
                                  <p className="text-right text-[10px] text-slate-500 mt-1">Confidence: {res.confidence}%</p>
                              </div>

                              {/* Action/Signal */}
                              <div className="flex flex-col items-end min-w-[120px]">
                                  <span className="text-slate-400 text-sm mb-1">Recommendation</span>
                                  <div className={`px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2 ${
                                      res.signal === 'Buy' 
                                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                      : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                  }`}>
                                      {res.signal === 'Buy' ? <Zap size={14} fill="currentColor" /> : <AlertTriangle size={14} />}
                                      STRONG {res.signal.toUpperCase()}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-2 font-mono">
                                      Target: ${(res.stock.price * (res.signal === 'Buy' ? 1.15 : 0.85)).toFixed(2)}
                                  </p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default MarketScanner;
