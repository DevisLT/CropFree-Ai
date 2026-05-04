import React from "react";
import { BookOpen, PlayCircle, HelpCircle, FileText, ChevronRight, Zap, Search, MessageSquare, Compass } from "lucide-react";

export default function GuidanceCenter() {
  const sections = [
    { 
      title: "Interactive Tutorials", 
      description: "Step-by-step visual guides on mastering the CropFree platform.",
      icon: PlayCircle, 
      color: "bg-sky-50 text-sky-600 shadow-sky-100",
      items: ["Your First Scan", "Setting Up Trackers", "Collaborating with Experts"]
    },
    { 
      title: "Disease Almanac", 
      description: "A comprehensive digital library of common and rare crop pathologies.",
      icon: BookOpen, 
      color: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
      items: ["Rice Pathogens", "Maize Nutrition Deficiencies", "Wheat & Grain Rust"]
    },
    { 
      title: "Scanning Precision", 
      description: "Master the art of high-fidelity agricultural photography.",
      icon: Zap, 
      color: "bg-amber-50 text-amber-600 shadow-amber-100",
      items: ["Lighting Optimization", "Focus on Symptoms", "Environmental Context"]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 md:py-12 space-y-12 md:space-y-16 px-2 md:px-0">
      <header className="flex flex-col items-center text-center px-4">
         <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 rotate-3 shadow-inner">
           <Compass className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
         </div>
         <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 md:mb-6 leading-tight">Knowledge Hub.</h2>
         <p className="text-neutral-500 text-base md:text-xl font-medium max-w-2xl leading-relaxed italic">
           "Knowledge is the first fertilizer. Explore our curated resources to empower your farming decisions with data and science."
         </p>
         
         <div className="mt-12 w-full max-w-2xl relative group">
           <div className="absolute inset-0 bg-brand/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative glass rounded-[28px] border-white/60 flex items-center p-2 shadow-2xl">
             <div className="pl-4 pr-3">
               <Search className="w-5 h-5 text-neutral-400" />
             </div>
             <input 
               type="text" 
               placeholder="Search for diseases, tips, or guides..."
               className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-neutral-800 placeholder:text-neutral-400 py-3"
             />
             <button className="bg-neutral-900 text-white px-6 py-2.5 rounded-[22px] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
               Find Answers
             </button>
           </div>
         </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        {sections.map((section, i) => (
          <div key={i} className="glass p-6 md:p-10 flex flex-col h-full rounded-[32px] md:rounded-[48px] border-white/60 shadow-xl hover:shadow-2xl hover:bg-white/80 transition-all group">
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[24px] flex items-center justify-center mb-6 md:mb-10 shadow-lg border border-white transition-transform group-hover:rotate-6 ${section.color}`}>
               <section.icon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 tracking-tighter leading-tight">{section.title}</h3>
            <p className="text-neutral-400 font-bold text-[11px] md:text-sm mb-8 md:mb-10 leading-relaxed italic">"{section.description}"</p>
            
            <div className="space-y-2 md:space-y-3 flex-1">
               {section.items.map((item, j) => (
                 <button key={j} className="w-full text-left p-3 md:p-4 hover:bg-white rounded-[16px] md:rounded-[22px] transition-all text-xs md:text-sm font-black text-neutral-600 flex items-center justify-between group/item border border-transparent hover:border-neutral-100 shadow-sm hover:shadow-md">
                    {item} <ChevronRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                 </button>
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* Support Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* FAQ Banner */}
        <div className="premium-card p-8 md:p-12 bg-neutral-900 text-white flex flex-col justify-between rounded-[32px] md:rounded-[48px] relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-48 h-48 bg-brand/10 rounded-full blur-[60px]" />
           <div className="relative z-10">
             <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-xl md:rounded-[28px] border border-white/10 flex items-center justify-center mb-8">
                 <HelpCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
             </div>
             <h4 className="text-2xl md:text-3xl font-black tracking-tight mb-4 leading-tight">Common<br />Questions.</h4>
             <p className="text-white/40 text-[11px] md:text-base font-medium mb-8 md:mb-12 italic">Billing, privacy, and technical guides.</p>
           </div>
           <button className="relative z-10 w-fit px-8 md:px-10 py-4 md:py-5 bg-white text-neutral-900 rounded-[18px] md:rounded-[24px] font-black text-[10px] md:text-sm uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl">
              Knowledge Base <FileText className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
           </button>
        </div>

        {/* AI Expert Banner */}
        <div className="premium-card p-8 md:p-12 bg-emerald-50 border-emerald-100 flex flex-col justify-between rounded-[32px] md:rounded-[48px] relative overflow-hidden group">
           <div className="absolute top-[-20%] left-[-20%] w-60 h-60 bg-emerald-100/50 rounded-full blur-[80px]" />
           <div className="relative z-10">
             <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-600 text-white rounded-xl md:rounded-[28px] shadow-lg shadow-emerald-500/20 flex items-center justify-center mb-8">
                 <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
             </div>
             <h4 className="text-2xl md:text-3xl font-black tracking-tight mb-4 leading-tight">Talk to an<br />AG-Expert.</h4>
             <p className="text-emerald-700/60 text-[11px] md:text-base font-medium mb-8 md:mb-12 italic">Ask specific questions about your soil or climate.</p>
           </div>
           <button className="relative z-10 w-fit px-8 md:px-10 py-4 md:py-5 bg-emerald-600 text-white rounded-[18px] md:rounded-[24px] font-black text-[10px] md:text-sm uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20">
              Open Expert Chat <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-emerald-300" />
           </button>
        </div>
      </div>
    </div>
  );
}
