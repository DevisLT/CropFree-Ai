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
    <div className="space-y-12">
      {/* Hero Welcome Section */}
      <section className="relative min-h-[260px] rounded-[48px] overflow-hidden group shadow-2xl shadow-brand/10">
        <div className="absolute inset-0 bg-slate-950">
           <img 
             src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2670&auto=format&fit=crop" 
             className="w-full h-full object-cover opacity-60 md:opacity-70 group-hover:scale-110 transition-transform duration-[3s]" 
             alt="Field" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>
        
        <div className="relative h-full flex flex-col justify-end p-8 md:p-14 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand mb-4 block">{t('field_overview')}</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">{t('good_morning')}</h2>
            <p className="text-slate-300 max-w-lg text-sm md:text-xl font-medium leading-relaxed">
              {t('promising_growth') || "Your fields are showing signs of robust development today."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10">
        <div className="md:col-span-3">
          <StatCard label={t('total_diagnoses')} value={stats.total} icon={Leaf} color="bg-emerald-50 text-brand" description={t('crop_care')} />
        </div>
        <div className="md:col-span-2">
          <StatCard label={t('active_recovery')} value={stats.recovering} icon={TrendingUp} color="bg-amber-50 text-amber-600" description={t('recovering_robust')} />
        </div>
        <div className="md:col-span-5">
          <div className="premium-card p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden bg-white border-brand/20 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-[90px]" />
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 block">{t('health_score')}</span>
              <div className="flex items-baseline gap-4">
                 <span className="text-7xl font-black tracking-tighter text-slate-950">
                   {recentCrops.filter(c => c.status === 'Worsening').length}
                 </span>
                 <span className="text-xl font-black text-slate-400 tracking-tight">Active Warnings</span>
              </div>
            </div>
            <div className="relative z-10 max-w-sm">
               <p className="text-base font-medium leading-relaxed text-slate-500">
                 {recentCrops.filter(c => c.status === 'Worsening').length > 0 
                   ? "Biometric stress detected in recent observations. Remedial action protocols recommended."
                   : "Your agricultural sector is currently stable. Environmental conditions are within optimal parameters."}
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Intel & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-11 gap-10">
        <div className="xl:col-span-7 premium-card p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 block text-brand">Diagnostic Pulse</span>
              <h3 className="text-3xl font-black tracking-tighter">Activity Stream</h3>
            </div>
            <div className="px-6 py-2 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 flex items-center gap-3">
               <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
               Real-time Monitoring
            </div>
          </div>
          
          <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={Array.from({length: 7}, (_, i) => ({ n: i, c: Math.floor(Math.random() * 5) + 2}))}>
                  <Line 
                    type="monotone" 
                    dataKey="c" 
                    stroke="#059669" 
                    strokeWidth={6} 
                    dot={{ r: 6, fill: "#fff", stroke: "#059669", strokeWidth: 3 }}
                    activeDot={{ r: 10, fill: "#059669", strokeWidth: 4, stroke: "#fff" }} 
                  />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-4 premium-card p-10 bg-slate-950 text-white border-none shadow-2xl shadow-slate-900/40 relative overflow-hidden flex flex-col justify-between overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 rounded-full blur-[100px]" />
           
           <div>
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-2 block">Atmosphere</span>
             <div className="flex items-end gap-6 pb-10 border-b border-white/10 mb-8">
               <span className="text-8xl font-black tracking-tighter">24°</span>
               <div className="flex flex-col pb-4">
                 <span className="text-xs font-black uppercase tracking-[0.2em] text-brand">Nairobi, KE</span>
                 <span className="text-lg font-bold text-white/60">Cloudy</span>
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-8">
               <div className="space-y-1">
                 <div className="flex items-center gap-2 text-white/40">
                   <Thermometer className="w-3 h-3" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Feels Like</span>
                 </div>
                 <p className="text-2xl font-black">26°C</p>
               </div>
               <div className="space-y-1">
                 <div className="flex items-center gap-2 text-white/40">
                   <Droplets className="w-3 h-3" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Humidity</span>
                 </div>
                 <p className="text-2xl font-black">65%</p>
               </div>
             </div>
           </div>

           <div className="mt-12 p-6 bg-white/5 rounded-[32px] border border-white/5 backdrop-blur-sm">
              <p className="text-xs font-medium text-white/70 leading-relaxed">
               "Low pressure front approaching. Optimal sowing conditions for cereal crops expected in 18 hours."
             </p>
           </div>
        </div>
      </div>

      {/* Monitoring Section */}
      <section className="space-y-8">
          <div className="flex items-baseline justify-between px-4">
            <h3 className="text-3xl font-black tracking-tighter">Active Observations</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand border-b-2 border-transparent hover:border-brand transition-all pb-1">
              Full Inventory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {recentCrops.length > 0 ? recentCrops.map((crop, i) => (
              <motion.div 
                key={crop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="premium-card p-3 group overflow-hidden"
              >
                <div className="relative aspect-square rounded-[28px] overflow-hidden mb-6">
                  <img src={crop.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={crop.name} referrerPolicy="no-referrer" />
                  <div className="absolute top-4 left-4">
                    <span className="px-5 py-2 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white shadow-xl">
                      {crop.disease}
                    </span>
                  </div>
                </div>
                
                <div className="px-4 pb-6">
                  <h4 className="font-black text-xl text-slate-950 mb-1 truncate">{crop.name}</h4>
                  <div className="flex items-center justify-between">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${
                       crop.status === 'Recovered' ? 'text-brand' : 'text-slate-400'
                     }`}>
                       {crop.status}
                     </span>
                     <div className={`w-3 h-3 rounded-full ${
                       crop.status === 'Recovered' ? 'bg-brand' : 
                       crop.status === 'Worsening' ? 'bg-error shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-slate-200'
                     }`} />
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-24 text-center">
                <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-[32px] mx-auto mb-8 border border-slate-100 rotate-12 group-hover:rotate-0 transition-transform">
                  <Search className="w-10 h-10 text-slate-100" />
                </div>
                <h4 className="text-2xl font-black mb-2">Scanning the horizon...</h4>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10">Start your first crop diagnosis to begin building your digital harvest journal here.</p>
                <button className="px-10 py-5 bg-slate-950 text-white rounded-[24px] font-black text-xs uppercase tracking-widest btn-press">Initialize Scan</button>
              </div>
            )}
          </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, description }: any) {
  return (
    <div className="premium-card p-10 flex flex-col justify-between h-full group">
      <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center mb-10 transition-all duration-500 group-hover:bg-brand group-hover:scale-110 ${color}`}>
        <Icon className="w-10 h-10 group-hover:text-white transition-colors" />
      </div>
      <div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 block">{label}</span>
        <div className="flex items-baseline gap-4 mb-3">
          <p className="text-6xl font-black text-slate-950 tracking-tighter leading-none">{value}</p>
          <span className="text-lg font-black text-slate-300">Total</span>
        </div>
        <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest">{description}</p>
      </div>
    </div>
  );
}

function ShieldCheck(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>; }
