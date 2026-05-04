import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Leaf, Activity, TrendingUp, AlertCircle, Cloud, Thermometer, Droplets, ArrowUpRight, Search } from "lucide-react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { OperationType, handleFirestoreError } from "../../lib/errorHandlers";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Overview() {
  const { t, isRTL } = useLanguage();
  const [stats, setStats] = useState({ total: 0, healthy: 0, recovering: 0 });
  const [recentCrops, setRecentCrops] = useState<any[]>([]);

  const chartData = [
    { name: t('mon'), count: 2 },
    { name: t('tue'), count: 5 },
    { name: t('wed'), count: 3 },
    { name: t('thu'), count: 8 },
    { name: t('fri'), count: 6 },
    { name: t('sat'), count: 12 },
    { name: t('sun'), count: 9 },
  ];

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
          recovering: snap.docs.filter(d => d.data().status === 'Improving').length 
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path, auth);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero Welcome Section */}
      <section className="relative min-h-[220px] md:h-72 rounded-[32px] md:rounded-[40px] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-sky-600 group-hover:scale-105 transition-transform duration-700" />
        
        <div className="relative h-full flex flex-col justify-end p-6 md:p-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/70 mb-2 md:mb-3 block underline underline-offset-8">{t('field_overview')}</span>
            <h2 className="text-3xl md:text-5xl font-black heading-tight mb-2">{t('good_morning')}</h2>
            <p className="text-white/80 max-w-lg text-sm md:text-lg font-medium">
              {t('promising_growth')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid - Mixed Sizes */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        <div className="md:col-span-2">
          <StatCard label={t('total_diagnoses')} value={stats.total} icon={Leaf} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" description={t('crop_care')} />
        </div>
        <div className="md:col-span-2">
          <StatCard label={t('active_recovery')} value={stats.recovering} icon={TrendingUp} color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" description={t('recovering_robust')} />
        </div>
        <div className="md:col-span-3">
          <div className="premium-card p-6 flex flex-col justify-between bg-neutral-900 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 rounded-full blur-3xl group-hover:bg-brand/30 transition-colors" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">{t('health_score')}</span>
              <AlertCircle className="w-5 h-5 text-error" />
            </div>
            <div className="relative z-10">
               <div className="flex items-baseline gap-3 mb-1">
                 <span className="text-4xl font-black text-rose-400">
                   {recentCrops.filter(c => c.status === 'Worsening').length}
                 </span>
                 <span className="text-sm font-bold text-neutral-400 tracking-tight">Active Warning{recentCrops.filter(c => c.status === 'Worsening').length !== 1 ? 's' : ''}</span>
               </div>
               <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                 {recentCrops.filter(c => c.status === 'Worsening').length > 0 
                   ? "Some plants are showing signs of stress. Immediate attention recommended."
                   : "All monitored sectors are currently stable. No critical interventions needed."}
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Farming Tips Marquee - Humanized */}
      <div className="bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200/50 dark:border-neutral-800 py-4 rounded-[28px] overflow-hidden flex whitespace-nowrap group">
         <motion.div 
           animate={{ x: [0, -1200] }}
           transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
           className="flex gap-16 px-8 items-center"
         >
            {[
              "💡 Expert Insight: Early detection saves up to 40% of crop loss—keep scanning daily.",
              "💧 Water Logic: Root zones stay cool after heavy rain, wait 24h before watering again.",
              "🌱 Soil Wisdom: Rotation isn't just about pests—it's about nitrogen restoration.",
              "⚠️ Regional Alert: Fall armyworm season approaching—check leaf undersides.",
              "✂️ Hygiene: Sterilize your shears between plants to stop the invisible spread.",
              "💡 Expert Insight: Early detection saves up to 40% of crop loss—keep scanning daily.",
              "💧 Water Logic: Root zones stay cool after heavy rain, wait 24h before watering again.",
              "🌱 Soil Wisdom: Rotation isn't just about pests—it's about nitrogen restoration.",
              "⚠️ Regional Alert: Fall armyworm season approaching—check leaf undersides.",
              "✂️ Hygiene: Sterilize your shears between plants to stop the invisible spread.",
            ].map((tip, i) => (
              <span key={i} className="text-xs font-black text-neutral-600 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 bg-brand rounded-full" />
                {tip}
              </span>
            ))}
         </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-11 gap-8">
        {/* Activity Chart */}
        <div className="xl:col-span-7 premium-card p-6 md:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-2 block">Analytical Pulse</span>
              <h3 className="text-xl md:text-2xl font-black tracking-tighter dark:text-white">Your Diagnostic Activity</h3>
            </div>
            <div className="w-fit flex items-center gap-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-2xl text-[10px] md:text-xs font-black ring-1 ring-emerald-100 dark:ring-emerald-800">
               <TrendingUp className="w-4 h-4" /> +12% Efficiency
            </div>
          </div>
          <div className="h-48 md:h-72">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 700 }} dy={15} reversed={isRTL} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                    itemStyle={{ fontWeight: 800, color: '#111827' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#4F46E5" 
                    strokeWidth={4} 
                    dot={false}
                    activeDot={{ r: 8, fill: "#4F46E5", strokeWidth: 4, stroke: "white" }} 
                  />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Weather Intel - Premium Dark Mode */}
        <div className="xl:col-span-4 premium-card p-6 md:p-10 bg-neutral-900 text-white relative overflow-hidden flex flex-col justify-between gap-8 md:gap-0">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
           
           <div>
             <div className="flex items-center justify-between mb-6 md:mb-10">
               <div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-1 block">Live Conditions</span>
                 <h3 className="text-xl font-black tracking-tight">Weather Outlook</h3>
               </div>
               <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                 <Cloud className="w-6 h-6 text-white" />
               </div>
             </div>
             
             <div className="flex items-baseline gap-4 mb-2">
               <span className="text-6xl md:text-8xl font-black tracking-tighter">24°</span>
               <div className="flex flex-col">
                 <span className="text-lg font-black text-white italic">Partly Cloudy</span>
                 <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Nairobi, KE</span>
               </div>
             </div>
           </div>

           <div className="space-y-8">
             <div className="grid grid-cols-2 gap-8 relative z-10">
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Feels Like</span>
                  </div>
                  <span className="text-xl font-black">26°C</span>
               </div>
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-400" />
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Humidity</span>
                  </div>
                  <span className="text-xl font-black">65%</span>
               </div>
             </div>

             <div className="p-5 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-colors cursor-pointer">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Smart Advice</span>
               </div>
               <p className="text-sm font-medium leading-relaxed text-neutral-300">
                 Atmospheric pressure is rising. Optimal window for planting rice and maize ends in 4 hours.
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* Recent Crops - Humanized Empty States & Layout */}
      <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-1 block">Patient List</span>
              <h3 className="text-xl md:text-2xl font-black tracking-tighter dark:text-white">Current Monitoring</h3>
            </div>
            <button className="w-fit px-6 py-2.5 bg-white dark:bg-neutral-900 dark:text-white hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all btn-press shadow-sm">
              View All Observations
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {recentCrops.length > 0 ? recentCrops.map((crop, i) => (
              <motion.div 
                key={crop.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-2 bg-white dark:bg-neutral-900 rounded-[32px] shadow-soft border border-neutral-100/50 dark:border-neutral-800/50 hover:shadow-premium transition-all duration-500"
              >
                <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden mb-5">
                  <img src={crop.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={crop.name} referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-4 left-4 px-4 py-1.5 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md rounded-full text-[10px] font-black text-neutral-900 dark:text-white border border-white/50 dark:border-neutral-700 shadow-xl">
                    {crop.disease}
                  </div>
                </div>
                
                <div className="px-4 pb-4">
                  <h4 className="font-black text-lg text-neutral-900 dark:text-white truncate mb-1">{crop.name}</h4>
                  <div className="flex items-center justify-between">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${
                       crop.status === 'Recovered' ? 'text-emerald-500' : 
                       crop.status === 'Worsening' ? 'text-rose-500' : 'text-sky-500'
                     }`}>
                       {crop.status}
                     </span>
                     <div className={`w-2 h-2 rounded-full ${
                       crop.status === 'Recovered' ? 'bg-emerald-500' : 
                       crop.status === 'Worsening' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-sky-500'
                     }`} />
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 px-10 text-center bg-white dark:bg-neutral-900 rounded-[40px] border-2 border-dashed border-neutral-100 dark:border-neutral-800">
                <div className="w-24 h-24 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-neutral-200 dark:text-neutral-700" />
                </div>
                <h4 className="text-xl font-black mb-2 tracking-tight dark:text-white">Your digital garden is empty</h4>
                <p className="text-neutral-500 font-medium max-w-sm mx-auto mb-8">
                  Start by using the AI Crop Doctor to scan your first plant. We'll help you track its journey to recovery.
                </p>
                <button className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-neutral-900/10 btn-press">
                  Begin First Scan
                </button>
              </div>
            )}
          </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, description }: any) {
  return (
    <div className="premium-card p-6 md:p-8 flex flex-col justify-between h-full group hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[24px] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${color}`}>
        <Icon className="w-6 h-6 md:w-8 md:h-8" />
      </div>
      <div>
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.25em] mb-2">{label}</p>
        <p className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter mb-2 leading-none">{value}</p>
        <p className="text-[10px] md:text-xs font-bold text-neutral-400 leading-tight">{description}</p>
      </div>
    </div>
  );
}

function ShieldCheck(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>; }
