import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, Sparkles, Plus, Mic, MessageSquare } from "lucide-react";
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
      content: t("coach_greeting") || "Good morning. I'm your digital agricultural coach. How is your field today?" 
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
      setMessages(prev => [...prev, { role: "model", content: t("coach_error") || "I encountered a minor connection issue. Shall we try that thought again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] md:h-[calc(100vh-180px)] flex flex-col glass rounded-[32px] md:rounded-[60px] shadow-2xl overflow-hidden border-white/60 relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 10 Q 50 10 50 50 T 90 90" stroke="currentColor" fill="none" />
          <path d="M90 10 Q 50 10 50 50 T 10 90" stroke="currentColor" fill="none" />
        </svg>
      </div>

      {/* Header */}
      <div className="p-4 md:p-8 md:px-10 border-b border-white/40 bg-white/40 backdrop-blur-md flex items-center justify-between">
         <div className="flex items-center gap-3 md:gap-5">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-900 rounded-2xl md:rounded-[28px] flex items-center justify-center shadow-xl rotate-3 group hover:rotate-0 transition-transform">
               <Bot className="text-emerald-400 w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
               <h3 className="font-black text-lg md:text-2xl tracking-tighter">AI AG-Expert</h3>
               <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Active</span>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-2 md:gap-3">
            <button className="hidden sm:block px-5 py-2.5 bg-white/60 hover:bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white shadow-sm btn-press">
               Export Transcript
            </button>
            <button className="p-2 md:p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl md:rounded-2xl transition-all btn-press">
               <Plus className="w-4 h-4 md:w-5 md:h-5 rotate-45" />
            </button>
         </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 scroll-smooth custom-scrollbar">
         {messages.map((msg, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className={`flex gap-3 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
           >
             <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-lg ${
               msg.role === 'user' ? 'bg-neutral-900 text-white' : 'bg-white text-brand border border-neutral-100'
             }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 md:w-6 md:h-6" /> : <Bot className="w-4 h-4 md:w-6 md:h-6" />}
             </div>
             <div className={`max-w-[85%] md:max-w-[75%] p-5 md:p-8 rounded-[24px] md:rounded-[40px] text-sm md:text-lg font-medium leading-relaxed shadow-sm ${
               msg.role === 'user' 
                 ? 'bg-neutral-900 text-white rounded-tr-none shadow-neutral-900/10' 
                 : 'bg-white text-neutral-800 rounded-tl-none border border-white shadow-brand/5'
             }`}>
                {msg.content}
                {msg.role === 'model' && (
                  <div className="mt-4 pt-4 border-t border-neutral-50 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Thought assisted by Gemini</span>
                  </div>
                )}
             </div>
           </motion.div>
         ))}
         {isTyping && (
           <div className="flex gap-4 md:gap-6">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-[20px] bg-white border border-neutral-100 text-brand flex items-center justify-center shadow-md">
                 <Bot className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
              </div>
              <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[40px] rounded-tl-none flex items-center gap-2 shadow-sm border border-white">
                 {[0, 1, 2].map(i => (
                   <motion.div 
                     key={i}
                     animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }} 
                     transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} 
                     className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-400 rounded-full" 
                   />
                 ))}
              </div>
           </div>
         )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-10 bg-white/40 backdrop-blur-md border-t border-white/40">
         <div className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-brand/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t("ask_anything")}
              className={`w-full bg-white dark:bg-neutral-900 border-2 border-white dark:border-neutral-800 rounded-2xl md:rounded-[32px] ${isRTL ? 'pr-12 md:pr-16 pl-24 md:pl-32' : 'pl-12 md:pl-16 pr-24 md:pr-32'} py-4 md:py-6 focus:outline-none focus:border-brand/20 focus:ring-[8px] md:focus:ring-[12px] focus:ring-brand/5 transition-all text-sm md:text-lg font-bold text-neutral-800 dark:text-white placeholder:text-neutral-400 shadow-2xl`}
            />
            <div className={`absolute ${isRTL ? 'right-4 md:right-6' : 'left-4 md:left-6'} top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand transition-colors`}>
               <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className={`absolute ${isRTL ? 'left-4 md:left-6' : 'right-4 md:right-6'} top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3`}>
               <button className="hidden sm:block p-3 text-neutral-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all btn-press">
                  <Mic className="w-6 h-6" />
               </button>
               <button 
                 onClick={handleSend}
                 disabled={!input.trim() || isTyping}
                 className="p-3 md:p-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl md:rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 border border-neutral-700 dark:border-white"
               >
                  <Send className={`w-4 h-4 md:w-5 md:h-5 ${isRTL ? 'rotate-180 text-brand' : 'text-emerald-400'}`} />
               </button>
            </div>
         </div>
         <p className="hidden md:block text-center mt-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Encrypted Data Transmission secured</p>
      </div>
    </div>
  );
}
