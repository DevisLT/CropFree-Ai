import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Leaf, Activity, TrendingUp, AlertCircle, Cloud, Thermometer, Droplets, ArrowUpRight, Search, ChevronRight } from "lucide-react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { OperationType, handleFirestoreError } from "../../lib/errorHandlers";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Overview() {
  const { t, isRTL } = useLanguage();
  const [stats, setStats] = useState({ total: 0, healthy: 0, recovering: 0 });
  const [recentCrops, setRecentCrops] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      const path = "crops";
      try {
        const q = query(
          collection(db, path),
          where("userId", "==", auth.currentUser?.uid),
          orderBy("createdAt", "desc"),
          limit(4)
        );
        const snap = await getDocs(q);
        setRecentCrops(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setStats({ 
          total: snap.size, 
          healthy: snap.docs.filter(d => d.data().status === 'Recovered').length, 
          recovering: snap.docs.filter(d => d.data().status === 'Improving' || d.data().status === 'Inspecting' || d.data().status === 'Ready for Validation').length 
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path, auth);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Welcome Section */}
      <section className="relative min-h-[400px] rounded-[64px] overflow-hidden group shadow-2xl border border-white/60 bg-white/40 backdrop-blur-3xl flex">
        <div className="absolute inset-0 z-0">
           {/* Moving Natural Elements */}
           <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * 100 + "%", 
                    y: Math.random() * 100 + "%", 
                    rotate: Math.random() * 360,
                    opacity: 0 
                  }}
                  animate={{ 
                    y: ["-10%", "110%"],
                    x: ["-5%", "5%"],
                    rotate: [0, 360],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{ 
                    duration: 20 + Math.random() * 15, 
                    repeat: Infinity, 
                    delay: Math.random() * 10,
                    ease: "linear" 
                  }}
                  className="absolute"
                >
                  <Leaf className="w-32 h-32 text-brand blur-[1px]" />
                </motion.div>
              ))}
           </div>
           <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white/80 via-white/40 to-transparent z-10" />
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand/10 to-transparent z-10" />
        </div>
        
        <div className="relative z-20 w-full flex flex-col justify-center p-12 md:p-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-5 mb-8">
              <div className="w-14 h-1 flex bg-brand rounded-full" />
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-brand">{t('field_overview')}</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black heading-tight mb-10 text-deep-green drop-shadow-sm">
               {t('good_morning')}.
            </h2>
            <p className="text-slate-500 max-w-2xl text-lg md:text-2xl font-medium leading-relaxed">
              {t('promising_growth') || "Your fields are showing signs of robust development today."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10">
        <div className="md:col-span-3">
          <StatCard label={t('total_diagnoses')} value={stats.total} icon={Leaf} color="bg-brand/10 text-brand" description={t('crop_care')} badge="Core Stats" />
        </div>
        <div className="md:col-span-2">
          <StatCard label={t('active_recovery')} value={stats.recovering} icon={TrendingUp} color="bg-accent/10 text-accent" description={t('recovering_robust')} badge="AI Tracker" />
        </div>
        
        {/* New Feature Cards Section */}
        <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           <FeatureCard title="Soil Matrix" desc="Neural lithosphere analysis." icon={Search} status="Optimization Active" color="brand" />
           <FeatureCard title="Pest Radar" desc="High-res biotic surveillance." icon={AlertCircle} status="Nominal State" color="accent" />
           <FeatureCard title="Growth Logic" desc="Yield-based decision engine." icon={TrendingUp} status="Synced" color="emerald-500" />
           <FeatureCard title="Bio-Check" desc="Genetic signature audit." icon={Activity} status="Secure" color="brand" />
        </div>

        <div className="md:col-span-5">
           <div className="premium-card p-12 md:p-16 flex flex-col md:flex-row md:items-center justify-between gap-12 relative overflow-hidden group border border-white/60 bg-white/40 backdrop-blur-3xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-[120px] group-hover:bg-brand/10 transition-all duration-[2s]" />
            <div className="relative z-10">
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-400 mb-6 block">{t('health_score')}</span>
              <div className="flex items-baseline gap-8">
                 <span className="text-5xl md:text-7xl font-black text-deep-green leading-none tracking-tighter">
                   {recentCrops.filter(c => c.status === 'Worsening').length}
                 </span>
                 <div className="flex flex-col">
                    <span className="text-2xl md:text-3xl font-black text-deep-green">Observations</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Active Protocol Warnings</span>
                 </div>
              </div>
            </div>
            <div className="relative z-10 max-w-lg">
               <div className="p-8 bg-white/40 border border-white/60 rounded-[32px] backdrop-blur-md shadow-inner">
                 <p className="text-xl font-medium leading-relaxed text-slate-600 border-l-4 border-brand/40 pl-8">
                   {recentCrops.filter(c => c.status === 'Worsening').length > 0 
                     ? "Biometric stress detected in recent crops. Implementation of precision remedial sequences recommended."
                     : "Agricultural biosphere remains stable. All vegetative parameters within optimal range."}
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Intel & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-11 gap-10">
        <div className="xl:col-span-7 premium-card p-12 md:p-16 border border-white/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-16">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand mb-2 block">Diagnostic Pulse</span>
              <h3 className="text-3xl md:text-5xl font-black text-deep-green tracking-tighter">Activity Stream.</h3>
            </div>
            <div className="px-8 py-4 bg-brand/5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand border border-brand/10 flex items-center gap-4">
               <div className="w-2.5 h-2.5 bg-brand rounded-full animate-pulse shadow-[0_0_15px_#00ff88]" />
               Biosphere Uplink
            </div>
          </div>
          
          <div className="h-[360px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={Array.from({length: 12}, (_, i) => ({ n: i, c: Math.floor(Math.random() * 10) + 5}))}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2D6A4F" />
                      <stop offset="100%" stopColor="#FFD54F" />
                    </linearGradient>
                  </defs>
                  <Line 
                    type="monotone" 
                    dataKey="c" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={10} 
                    dot={{ r: 10, fill: "white", stroke: "#2D6A4F", strokeWidth: 4 }}
                    activeDot={{ r: 14, fill: "#2D6A4F", strokeWidth: 8, stroke: "white" }} 
                  />
                  <XAxis hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: '#2D6A4F', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                  />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-4 premium-card p-12 md:p-16 bg-deep-green text-white relative overflow-hidden flex flex-col justify-between shadow-2xl border-none">
           <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-[100px]" />
           <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-[120px]" />
           
           <div className="relative z-10">
             <span className="text-[11px] font-black uppercase tracking-[0.5em] text-brand mb-6 block">Planetary Environment</span>
             <div className="flex items-end gap-8 pb-16 border-b border-white/5 mb-12">
               <span className="text-6xl md:text-8xl font-black tracking-tighter leading-none drop-shadow-xl">24°</span>
               <div className="flex flex-col pb-6">
                 <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand mb-1">Station 042</span>
                 <span className="text-2xl font-black text-white/80 tracking-tight">Kigali, RW</span>
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-12">
               <div className="space-y-4">
                 <div className="flex items-center gap-4 text-white/20">
                   <Thermometer className="w-5 h-5" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Feels Like</span>
                 </div>
                 <p className="text-4xl font-black">26°C</p>
               </div>
               <div className="space-y-4">
                 <div className="flex items-center gap-4 text-white/20">
                   <Droplets className="w-5 h-5" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Humidity</span>
                 </div>
                 <p className="text-4xl font-black">65%</p>
               </div>
             </div>
           </div>

           <div className="relative z-10 mt-16 p-10 bg-white/5 rounded-[40px] border border-white/5 backdrop-blur-xl">
              <p className="text-lg font-medium text-white/60 leading-relaxed">
               "Thermal equilibrium maintained. Current infrared levels optimal for bio-synthetic cellular expansion."
              </p>
           </div>
        </div>
      </div>

      {/* Monitoring Section */}
      <section className="space-y-12">
          <div className="flex items-end justify-between px-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand block">Live Biosecurity</span>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-deep-green">Recent Diagnostics.</h3>
            </div>
            <button className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-brand transition-all pb-2 group flex items-center gap-3 border-b border-transparent hover:border-brand">
              Deep Analytics <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {recentCrops.length > 0 ? recentCrops.map((crop, i) => (
              <motion.div 
                key={crop.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="premium-card p-6 group cursor-pointer border border-white/60"
              >
                <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden mb-8 shadow-2xl">
                  <img src={crop.imageUrl} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-125" alt={crop.name} referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-green/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute top-6 left-6">
                    <div className="px-6 py-2.5 bg-white/90 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-widest border border-white shadow-2xl text-deep-green">
                      {crop.disease}
                    </div>
                  </div>
                </div>
                
                <div className="px-4 pb-4">
                  <h4 className="font-black text-3xl text-deep-green mb-3 tracking-tighter truncate">{crop.name}</h4>
                  <div className="flex items-center justify-between">
                     <span className={`text-[11px] font-black uppercase tracking-widest ${
                       crop.status === 'Recovered' ? 'text-brand' : 'text-slate-400'
                     }`}>
                       {crop.status}
                     </span>
                     <div className={`w-3.5 h-3.5 rounded-full ${
                       crop.status === 'Recovered' ? 'bg-brand shadow-[0_0_15px_#00ff88]' : 
                       crop.status === 'Worsening' ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' : 'bg-slate-200'
                     }`} />
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-48 text-center premium-card border-dashed border-2 border-slate-200 bg-white/20">
                <div className="w-28 h-28 bg-brand/5 flex items-center justify-center rounded-[40px] mx-auto mb-10 border border-brand/10 rotate-12 group-hover:rotate-0 transition-all duration-700 shadow-2xl">
                  <Search className="w-12 h-12 text-brand" />
                </div>
                <h4 className="text-4xl font-black mb-6 text-deep-green">No Genetic Records Detected.</h4>
                <p className="text-slate-500 text-xl font-medium max-w-md mx-auto mb-16 leading-relaxed">Begin your journey by initializing your first precision crop diagnosis.</p>
                <button className="px-16 py-6 bg-deep-green text-white rounded-full font-black text-xs uppercase tracking-widest btn-press shadow-[0_20px_40px_rgba(8,28,21,0.2)] hover:scale-110 active:scale-95 transition-all">Start Diagnosis</button>
              </div>
            )}
          </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, desc, icon: Icon, status, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      className="premium-card p-10 bg-white/40 border-4 border-white backdrop-blur-3xl rounded-[48px] shadow-2xl relative overflow-hidden group flex flex-col justify-between"
    >
       <div className="absolute top-0 right-0 p-8">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-brand/5 rounded-full border border-brand/10">
             <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
             <span className="text-[9px] font-black text-brand uppercase tracking-widest">AI NODE</span>
          </div>
       </div>
       <div className={`w-16 h-16 rounded-2xl bg-${color}/10 border border-${color}/20 flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform duration-700 shadow-xl`}>
          <Icon className={`w-8 h-8 text-${color}`} />
       </div>
       <div>
          <h4 className="text-3xl font-black text-deep-green tracking-tighter leading-none mb-3 uppercase">{title}</h4>
          <p className="text-sm font-bold text-slate-400 leading-tight mb-8 opacity-70">{desc}</p>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-brand-light uppercase tracking-widest">{status}</span>
             <ChevronRight className="w-4 h-4 text-brand-light opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
          </div>
       </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, color, description, badge }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="premium-card p-12 md:p-16 flex flex-col justify-between h-full group overflow-hidden relative border-4 border-white bg-white/40 backdrop-blur-3xl shadow-2xl rounded-[64px]"
    >
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand/5 rounded-full blur-[80px] group-hover:bg-brand/10 transition-all duration-1000" />
      <div className="flex items-center justify-between mb-16">
        <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-700 ${color} bg-white/60 border border-white`}>
          <Icon className="w-12 h-12 group-hover:rotate-12 transition-transform duration-700" />
        </div>
        {badge && (
          <div className="px-6 py-2 bg-brand text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-lg border-2 border-white/20">
            {badge}
          </div>
        )}
      </div>
      <div>
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-6 block">{label}</span>
        <div className="flex items-baseline gap-6 mb-6">
          <p className="text-7xl md:text-8xl font-black text-deep-green tracking-tighter leading-none">{value}</p>
          <span className="text-2xl font-black text-slate-300 tracking-tighter">Units.</span>
        </div>
        <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-[0.2em] max-w-xs">{description}</p>
      </div>
    </motion.div>
  );
}
