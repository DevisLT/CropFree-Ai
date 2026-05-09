import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, Sparkles, Plus, Mic, MessageSquare, Terminal, Zap, Shield } from "lucide-react";
import { aiService } from "../../services/aiService";
import { useLanguage } from "../../contexts/LanguageContext";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function AICoach() {
  const { t, locale, isRTL } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ 
      role: "model", 
      content: t("coach_greeting") || "System Online. I am your specialized neural agricultural coach. How shall we optimize your biological output today?" 
    }]);
  }, [locale]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await aiService.askCoach(userMsg, messages, locale);
      setMessages(prev => [...prev, { role: "model", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "model", content: t("coach_error") || "Neural link interrupted. Re-establish connection?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] md:h-[calc(100vh-180px)] flex flex-col premium-card rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border-white/5 relative group/shell">
      {/* Background Ambience */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] opacity-20 group-focus-within/shell:opacity-40 transition-opacity duration-1000" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] opacity-20" />
      </div>

      {/* Header */}
      <div className="p-6 md:p-10 border-b border-white/5 bg-white/5 backdrop-blur-2xl flex items-center justify-between">
         <div className="flex items-center gap-4 md:gap-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl relative border border-white/5 group-hover:scale-105 transition-transform duration-500">
               <div className="absolute inset-0 bg-brand/10 rounded-3xl animate-pulse" />
               <Bot className="text-brand w-8 h-8 md:w-10 md:h-10 relative z-10" />
            </div>
            <div>
               <div className="flex items-center gap-3 mb-1">
                 <h3 className="font-black text-xl md:text-3xl tracking-tighter text-white">Neural Coach.</h3>
                 <span className="px-3 py-1 bg-brand/10 text-brand text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-brand/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]">Elite</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Encrypted Connection Active</span>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button className="hidden sm:flex px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-white/5 text-slate-400 hover:text-white items-center gap-3">
               <Terminal className="w-4 h-4" /> Export LOG
            </button>
            <button className="w-12 h-12 md:w-14 md:h-14 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all flex items-center justify-center border border-rose-500/10 active:scale-90">
               <Plus className="w-6 h-6 rotate-45" />
            </button>
         </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-14 space-y-10 md:space-y-16 scroll-smooth custom-scrollbar bg-slate-950/20">
         {messages.map((msg, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, x: msg.role === 'user' ? 40 : -40 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
             className={`flex gap-6 md:gap-10 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
           >
             <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl relative border ${
               msg.role === 'user' 
                ? 'bg-slate-900 border-white/10 text-white' 
                : 'bg-brand text-slate-950 border-brand shadow-[0_0_30px_#00ff8840]'
             }`}>
                {msg.role === 'user' ? <User className="w-6 h-6 md:w-8 md:h-8" /> : <Zap className="w-6 h-6 md:w-8 md:h-8" />}
             </div>
             <div className={`max-w-[85%] md:max-w-[70%] p-8 md:p-12 rounded-[32px] text-base md:text-xl font-bold leading-relaxed shadow-xl relative border ${
               msg.role === 'user' 
                 ? 'bg-slate-900/90 text-white border-white/5 text-right' 
                 : 'bg-white/5 text-slate-200 border-white/5 backdrop-blur-3xl'
             }`}>
                <div className="absolute top-0 opacity-10 pointer-events-none">
                   {msg.role === 'user' ? null : <Bot className="w-20 h-20 -translate-x-12 -translate-y-12" />}
                </div>
                {msg.content}
                {msg.role === 'model' && (
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Shield className="w-4 h-4 text-brand/40" />
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Neural Response Verified</span>
                    </div>
                    <Sparkles className="w-5 h-5 text-brand animate-pulse" />
                  </div>
                )}
             </div>
           </motion.div>
         ))}
         {isTyping && (
           <div className="flex gap-6 md:gap-10">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-brand text-slate-950 flex items-center justify-center shadow-2xl relative border border-brand">
                 <Zap className="w-6 h-6 md:w-8 md:h-8 animate-pulse" />
              </div>
              <div className="bg-white/5 p-6 md:p-10 rounded-[32px] flex items-center gap-4 border border-white/5 backdrop-blur-2xl">
                 {[0, 1, 2].map(i => (
                   <motion.div 
                     key={i}
                     animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} 
                     transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} 
                     className="w-2.5 h-2.5 md:w-3 md:h-3 bg-brand rounded-full shadow-[0_0_15px_#00ff88]" 
                   />
                 ))}
                 <span className="ml-4 text-[11px] font-black text-slate-600 uppercase tracking-[0.5em]">Synthesizing thought...</span>
              </div>
           </div>
         )}
      </div>

      {/* Input Area */}
      <div className="p-8 md:p-16 bg-slate-950/40 backdrop-blur-3xl border-t border-white/5">
         <div className="max-w-5xl mx-auto relative group">
            <div className="absolute -inset-2 bg-brand/10 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t("ask_anything") || "Query Neural Interface..."}
              className={`w-full bg-white/5 border border-white/10 rounded-[32px] ${isRTL ? 'pr-16 md:pr-24 pl-32 md:pl-48' : 'pl-16 md:pl-24 pr-32 md:pr-48'} py-8 md:py-10 focus:outline-none focus:border-brand/40 focus:bg-white/10 transition-all text-lg md:text-2xl font-black text-white placeholder:text-slate-800 shadow-2xl uppercase tracking-tighter`}
            />
            <div className={`absolute ${isRTL ? 'right-6 md:right-10' : 'left-6 md:left-10'} top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand transition-colors`}>
               <MessageSquare className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div className={`absolute ${isRTL ? 'left-6 md:left-10' : 'right-6 md:right-10'} top-1/2 -translate-y-1/2 flex items-center gap-4`}>
               <button className="hidden sm:block p-4 text-slate-700 hover:text-brand transition-all active:scale-90">
                  <Mic className="w-8 h-8" />
               </button>
               <button 
                 onClick={handleSend}
                 disabled={!input.trim() || isTyping}
                 className="p-6 md:p-8 bg-brand text-slate-950 rounded-[24px] shadow-[0_0_40px_#00ff8840] hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 flex items-center justify-center relative overflow-hidden group/btn"
               >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity" />
                  <Send className={`w-6 h-6 md:w-8 md:h-8 relative z-10 ${isRTL ? 'rotate-180' : ''}`} />
               </button>
            </div>
         </div>
         <div className="flex items-center justify-center gap-4 mt-10">
            <div className="h-[1px] w-12 bg-white/5" />
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">System Architecture: Quantum Neural Net v9.4</p>
            <div className="h-[1px] w-12 bg-white/5" />
         </div>
      </div>
    </div>
  );
}
