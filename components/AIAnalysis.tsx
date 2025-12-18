import React, { useState, useRef, useEffect } from 'react';
import { Mic, Video, MapPin, Play, StopCircle, Loader2, MessageSquare, Send, Sparkles, Key } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { generateMarketRecapVideo, findNearbyBrokers, sendChatResponse } from '../services/geminiService';

// --- Live API Helpers ---
function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  // Simplified PCM encoding for brevity in this context
  const u8 = new Uint8Array(int16.buffer);
  let binary = '';
  const len = u8.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(u8[i]);
  const b64 = btoa(binary);

  return {
    data: b64,
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


const AIAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'video' | 'maps'>('chat');
  
  // --- Chat State ---
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
      { role: 'model', text: "Hello! I'm your AI Market Assistant. I can help you analyze trends, explain financial terms, or find data. How can I help you today?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Voice State ---
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [status, setStatus] = useState("Ready to connect");
  const sessionRef = useRef<any>(null); // To store sessionPromise implicitly if needed
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // --- Video State ---
  const [videoPrompt, setVideoPrompt] = useState("A cinematic chart showing stock market growth with futuristic neon green lines.");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // --- Maps State ---
  const [brokers, setBrokers] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  useEffect(() => {
      if (activeTab === 'chat') {
          scrollToBottom();
      }
  }, [messages, activeTab]);

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Handlers ---

  const handleSendMessage = async () => {
      if (!inputMessage.trim()) return;
      
      const userMsg = inputMessage;
      setInputMessage('');
      setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setIsChatLoading(true);

      // Convert format for Gemini SDK history if needed, for now just passing history as is to service
      // The service expects { role: string; parts: { text: string }[] }[]
      const historyForApi = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      const responseText = await sendChatResponse(historyForApi, userMsg);
      
      setMessages(prev => [...prev, { role: 'model', text: responseText || "Error getting response." }]);
      setIsChatLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
      }
  };

  const startLiveSession = async () => {
    setIsLiveActive(true);
    setStatus("Connecting...");
    
    try {
        const apiKey = process.env.API_KEY;
        // Check for undefined string literal
        if (!apiKey || apiKey === 'undefined' || apiKey === '') {
             throw new Error("No API Key");
        }

        const ai = new GoogleGenAI({ apiKey });
        let nextStartTime = 0;
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        audioContextRef.current = inputAudioContext;
        
        const outputNode = outputAudioContext.createGain();
        outputNode.connect(outputAudioContext.destination);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    setStatus("Connected - Listening...");
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                     const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                     if (base64Audio) {
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                     }
                },
                onclose: () => {
                    setStatus("Disconnected");
                    setIsLiveActive(false);
                },
                onerror: (e) => {
                    console.error("Live API Error:", e);
                    setStatus("Connection Interrupted");
                    setIsLiveActive(false);
                }
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
            }
        });
        sessionRef.current = sessionPromise;
    } catch (e) {
        console.warn("Live API unavailable or no key. Starting Demo Mode.", e);
        setStatus("Connected (Demo Mode)");
        // Fallback simulation for visual feedback
        setTimeout(() => setStatus("Listening... (Simulated)"), 1500);
    }
  };

  const stopLiveSession = () => {
    // 1. Stop all tracks in the media stream (Important for releasing microphone)
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }

    // 2. Close AudioContext
    if (audioContextRef.current) {
        try {
            audioContextRef.current.close();
        } catch (e) { console.error(e); }
        audioContextRef.current = null;
    }

    setIsLiveActive(false);
    setStatus("Stopped");
  };

  const handleConfigureKey = async () => {
     if (typeof window !== 'undefined' && (window as any).aistudio) {
         try {
             await (window as any).aistudio.openSelectKey();
         } catch (e) {
             console.error(e);
         }
     } else {
         alert("API Key configuration is managed via your environment variables in this mode.");
     }
  };

  const handleGenerateVideo = async () => {
      setIsVideoLoading(true);
      setVideoUrl(null);
      try {
          const url = await generateMarketRecapVideo(videoPrompt);
          setVideoUrl(url);
      } catch (e) {
          console.error(e);
          alert("Video generation failed. Falling back to demo.");
      } finally {
          setIsVideoLoading(false);
      }
  };

  const handleFindBrokers = () => {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
          const { chunks } = await findNearbyBrokers(pos.coords.latitude, pos.coords.longitude);
          setBrokers(chunks);
          setIsLocating(false);
      }, async (err) => {
          // If geolocation fails, still fetch mock data via service
          console.log("Geolocation failed, fetching default/mock");
          const { chunks } = await findNearbyBrokers(0, 0); 
          setBrokers(chunks);
          setIsLocating(false);
      });
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 h-full flex flex-col">
      <div className="shrink-0">
        <h2 className="text-3xl font-bold text-white mb-2">AI Innovation Hub</h2>
        <p className="text-slate-400 mb-6">Experimental features powered by Gemini 2.5 & 3.0</p>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-800 pb-1 overflow-x-auto">
            <button 
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'chat' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}
            >
                <MessageSquare size={18} /> Assistant
            </button>
            <button 
                onClick={() => setActiveTab('voice')}
                className={`px-4 py-2 font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'voice' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
                <Mic size={18} /> Live Analyst
            </button>
            <button 
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'video' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400 hover:text-white'}`}
            >
                <Video size={18} /> Veo Market Recap
            </button>
            <button 
                onClick={() => setActiveTab('maps')}
                className={`px-4 py-2 font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'maps' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
            >
                <MapPin size={18} /> Broker Locator
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 p-6 relative overflow-hidden flex flex-col min-h-[500px]">
        
        {/* CHAT TAB */}
        {activeTab === 'chat' && (
            <div className="flex flex-col h-full absolute inset-0">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                            }`}>
                                {msg.role === 'model' && (
                                    <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                        <Sparkles size={12} /> Gemini Assistant
                                    </div>
                                )}
                                {/* Render newlines as breaks */}
                                <div className="leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                                    {msg.text.replace(/\*\*/g, '')}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 border border-slate-700">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150" />
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-300" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <input 
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about market trends, specific stocks, or financial concepts..."
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isChatLoading}
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* VOICE TAB */}
        {activeTab === 'voice' && (
            <div className="text-center flex flex-col items-center justify-center h-full space-y-8">
                <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isLiveActive ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                    {/* Ripple Effect for Demo/Active state */}
                    {isLiveActive && (
                        <>
                            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/50 animate-[ping_2s_ease-in-out_infinite]" />
                            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-[ping_2s_ease-in-out_infinite_0.5s]" />
                        </>
                    )}
                    <Mic size={48} className={isLiveActive ? "text-emerald-500 relative z-10" : "text-slate-500 relative z-10"} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Gemini Live Analyst</h3>
                    <p className="text-slate-400">{status}</p>
                </div>
                {!isLiveActive ? (
                    <button onClick={startLiveSession} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 flex items-center gap-2">
                        <Play size={20} fill="currentColor" /> Start Conversation
                    </button>
                ) : (
                    <button onClick={stopLiveSession} className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold shadow-lg shadow-rose-500/20 transition-all hover:scale-105 flex items-center gap-2">
                        <StopCircle size={20} fill="currentColor" /> End Session
                    </button>
                )}
            </div>
        )}

        {/* VIDEO TAB */}
        {activeTab === 'video' && (
            <div className="space-y-6">
                 {/* Optional Key Config Button for Clarity */}
                 <div className="flex justify-end">
                    <button onClick={handleConfigureKey} className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-400 transition-colors">
                        <Key size={12} /> Configure API Key
                    </button>
                 </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Video Prompt (Veo 3.1)</label>
                    <textarea 
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white h-24 focus:ring-2 focus:ring-purple-500 outline-none" 
                    />
                </div>
                <button 
                    onClick={handleGenerateVideo}
                    disabled={isVideoLoading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                    {isVideoLoading ? <Loader2 className="animate-spin" /> : <Video />}
                    {isVideoLoading ? "Generating Video..." : "Generate Video"}
                </button>
                
                {videoUrl && (
                    <div className="mt-6 space-y-2">
                        <div className="rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black">
                            <video src={videoUrl} controls className="w-full h-full object-contain" autoPlay loop />
                        </div>
                        <p className="text-center text-emerald-400 text-sm font-medium">✨ Demo Video Generated Successfully</p>
                    </div>
                )}
                <div className="text-xs text-slate-500 text-center space-y-1">
                    <p>Requires a paid API key with access to Veo models.</p>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Billing Information</a>
                </div>
            </div>
        )}

        {/* MAPS TAB */}
        {activeTab === 'maps' && (
             <div className="space-y-6">
                 <div className="text-center">
                     <h3 className="text-lg font-bold text-white mb-4">Find Investment Firms Nearby</h3>
                     <button 
                        onClick={handleFindBrokers}
                        disabled={isLocating}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                     >
                         {isLocating ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
                         Use My Location
                     </button>
                 </div>
                 
                 <div className="grid gap-4">
                     {brokers.map((chunk, i) => (
                         chunk.maps?.uri && (
                            <a 
                                key={i} 
                                href={chunk.maps.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group"
                            >
                                <div className="p-3 bg-blue-500/10 rounded-lg mr-4 group-hover:bg-blue-500/20">
                                    <MapPin className="text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">{chunk.maps.title}</h4>
                                    <p className="text-sm text-slate-400">View on Google Maps</p>
                                </div>
                            </a>
                         )
                     ))}
                     {brokers.length === 0 && !isLocating && (
                         <p className="text-center text-slate-500 py-10">No locations loaded yet.</p>
                     )}
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;