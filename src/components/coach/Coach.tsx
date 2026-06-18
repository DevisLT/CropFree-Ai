import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Sparkles, TrendingUp, Droplets, Wind, ArrowRight, ShieldCheck, Cpu, Send, Check } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Coach() {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "coach", text: t('coach_custom_greeting') || "Hello! I am your CropFree AI coach. Ask me any agrarian question like 'how to prevent root rot' or 'best fertilizer for Rwandan maize'!" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const insights = [
    {
      title: t('weather_planting') || "Weather & Planting",
      value: "+12.4%",
      metric: t('maize_yield_forecast') || "Maize Yield Forecast",
      description: t('weather_planting_desc') || "Current high-pressure weather in the east is perfect for soil nourishment and seed planting protocols.",
      icon: Wind,
      color: "text-brand"
    },
    {
      title: t('water_management') || "Water Management",
      value: "92/100",
      metric: t('soil_moisture_score') || "Soil Moisture Score",
      description: t('water_management_desc') || "Your watering schedules are fully matched with this week's rain forecast, saving you water and protecting roots.",
      icon: Droplets,
      color: "text-blue-500"
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "Based on our farm database, keep your soil pH near 6.5, clear older yellow leaves to prevent pests, and water weekly in the morning.";
      
      const lowerMsg = userMsg.toLowerCase();
      if (lowerMsg.includes("fertilizer") || lowerMsg.includes("maize") || lowerMsg.includes("ifumbire") || lowerMsg.includes("ibigori")) {
        replyText = t('locale') === 'rw' 
          ? "Ku bigori mu mirima y'u Rwanda, dukomeje kukugira inama yo gukoresha ifumbire y'imborera ivanze n'ifumbire mvaruganda ifite azot nkeya mu micyo 4 ya mbere."
          : "For maize on Rwandan soils, we recommend compost mulch combined with low-nitrogen bio fertilizer in the first 4 weeks.";
      } else if (lowerMsg.includes("disease") || lowerMsg.includes("rot") || lowerMsg.includes("prevent") || lowerMsg.includes("indwara") || lowerMsg.includes("kubora")) {
        replyText = t('locale') === 'rw' 
          ? "Kugira ngo wirinde imiyege cyangwa kubora kw'imizi, kagura amababi yashaje, kaba umwanya uhagije hagati y'ibimera ngo bicemo umuyaga, kandi wirinde gusuka amazi ku mababi directly."
          : "To avoid fungus or root rot, prune dead foliage, space plants properly for airflow, and avoid pouring water on leaves directly.";
      } else {
        if (t('locale') === 'rw') {
          replyText = "Genzura ubuhehere bw'ubutaka bwawe ngo bube hafi ya pH 6.5, siba amababi y'umuhondo yashaje ngo urinde ibyonnyi, kandi uhirire mu gitondo icyumweru cyose.";
        }
      }
      
      setChatMessages(prev => [...prev, { sender: "coach", text: replyText }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 px-2 font-sans text-left">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">{t('personalized_advisor')}</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t('ai_coach_title')}</h2>
          <p className="text-sm text-slate-500 font-medium max-w-xl">
            {t('coach_intro_desc')}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-brand/10 rounded-lg shadow-soft">
           <Cpu className="w-4 h-4 text-brand" />
           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">{t('coach_version')}</span>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-6">
        
        {/* Chat pane */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-[#EAEFED] rounded-xl shadow-soft overflow-hidden min-h-[400px]">
           <div className="px-5 py-4 border-b border-[#EAEFED] bg-slate-50/50 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-brand rounded-full animate-ping" />
               <span className="text-xs font-bold text-slate-850 uppercase tracking-wider">{t('coach_cabin')}</span>
             </div>
             <span className="text-[9px] font-bold text-brand uppercase bg-brand/10 px-2 py-0.5 rounded">{t('online_status')}</span>
           </div>

           {/* Messages list */}
           <div className="p-5 flex-1 space-y-4 overflow-y-auto max-h-[300px] custom-scrollbar">
             {chatMessages.map((msg, i) => (
               <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`p-3.5 rounded-xl max-w-[85%] text-xs font-medium leading-relaxed ${
                   msg.sender === 'user' 
                     ? 'bg-brand text-white rounded-br-none' 
                     : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-150'
                 }`}>
                   {msg.text}
                 </div>
               </div>
             ))}
             {isTyping && (
               <div className="flex justify-start">
                 <div className="p-3 bg-slate-100 rounded-xl rounded-bl-none border border-slate-150 flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                 </div>
               </div>
             )}
           </div>

           {/* Input bar */}
           <form onSubmit={handleSendMessage} className="p-4 border-t border-[#EAEFED] bg-slate-50/50">
             <div className="relative flex items-center">
               <input 
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 placeholder={t('ask_coach_placeholder') || "Ask your coach anything..."} 
                 className="w-full pl-3 pr-10 py-2.5 bg-white border border-[#EAEFED] rounded-lg text-xs font-semibold text-slate-850 focus:ring-1 focus:ring-brand focus:border-brand transition-all outline-none shadow-inner"
               />
               <button 
                 type="submit" 
                 className="absolute right-2 p-1.5 text-brand hover:text-brand-deep rounded-md hover:bg-slate-50 transition-colors"
               >
                 <Send className="w-3.5 h-3.5" />
               </button>
             </div>
           </form>
        </div>

        {/* Side recommendations */}
        <div className="lg:col-span-4 flex flex-col gap-4">
           
           <div className="p-5 bg-brand text-white rounded-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#8FBFA8]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8FBFA8]">{t('primary_recomm')}</span>
                 </div>
                 <h4 className="text-base font-bold tracking-tight">{t('morning_irrigation_title')}</h4>
                 <p className="text-white/80 text-xs font-semibold leading-relaxed">
                   {t('morning_irrigation_desc')}
                 </p>
              </div>
              <div className="mt-6 flex gap-2">
                 <span className="px-2 py-0.5 bg-white/10 text-white text-[9px] font-bold rounded flex items-center gap-1">
                   <Check className="w-3 h-3" /> {t('fully_synced')}
                 </span>
              </div>
           </div>

           {insights.map((insight, i) => (
             <div 
               key={i}
               className="premium-card p-5 bg-white border border-[#EAEFED] rounded-xl shadow-soft group relative overflow-hidden flex flex-col justify-between"
             >
                 <div className="absolute top-4 right-4">
                    <insight.icon className="w-4 h-4 text-slate-300 group-hover:text-brand transition-colors" />
                 </div>
                 <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{insight.title}</span>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-xl font-bold text-slate-900 leading-none">{insight.value}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{insight.metric}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed pl-2 border-l border-brand/20">
                       {insight.description}
                    </p>
                 </div>
              </div>
           ))}

        </div>

      </div>

      <div className="flex items-center justify-center pt-8">
         <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-widest text-[10px]">
            <Sparkles className="w-4 h-4 text-brand" />
            {t('advice_engine_ready')}
         </div>
      </div>
    </div>
  );
}
