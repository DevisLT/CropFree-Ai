import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Leaf, Activity, TrendingUp, AlertCircle, Cloud, Thermometer, Droplets, ArrowUpRight, Search, ChevronRight } from "lucide-react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { OperationType, handleFirestoreError } from "../../lib/errorHandlers";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Overview({ onNavigate }: { onNavigate?: (tab: "dashboard" | "doctor" | "tracker" | "tasks" | "coach" | "weather" | "guidance" | "account") => void }) {
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
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <section className="relative p-8 md:p-12 rounded-2xl border border-[#EAEFED] bg-white overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-soft">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand/5 border border-brand/10 text-brand text-xs font-semibold rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-brand rounded-full" />
            <span>{t('field_overview')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
             {t('good_morning')}
          </h2>
          <p className="text-slate-500 text-base leading-relaxed mb-6">
            {t('promising_growth')}
          </p>
          
          {/* Start Button to direct to Crop Doctor */}
          <button 
            onClick={() => onNavigate && onNavigate("doctor")}
            className="px-5 py-2.5 bg-brand text-white rounded-lg font-medium text-sm transition-all hover:bg-brand-deep shadow-soft btn-press flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{t('start_crop_scan')}</span>
          </button>
        </div>
        
        {/* Quick Health Stats Mini-Widget */}
        <div className="relative z-10 p-5 bg-slate-50 border border-[#EAEFED] rounded-xl flex items-center gap-4 w-full md:w-auto min-w-[240px]">
          <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center text-brand">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">{t('diagnostic_status')}</span>
            <span className="text-sm font-bold text-slate-950">{t('biosphere_score')}</span>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <StatCard label={t('total_diagnoses')} value={stats.total} icon={Leaf} color="bg-brand/5 text-brand" description={t('crop_care')} badge={t('diagnostics_log')} />
        </div>
        <div className="md:col-span-2">
          <StatCard label={t('active_recovery')} value={stats.recovering} icon={TrendingUp} color="bg-accent/5 text-accent" description={t('recovering_robust')} badge={t('recovery_status_badge')} />
        </div>
        
        {/* New Feature Cards Section */}
        <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <FeatureCard title={t('soil_profile')} desc={t('soil_profile_desc')} icon={Search} status={t('level_excellent')} color="brand" />
           <FeatureCard title={t('pest_activity')} desc={t('pest_activity_desc')} icon={AlertCircle} status={t('low_risk')} color="brand" />
           <FeatureCard title={t('yield_forecast')} desc={t('yield_forecast_desc')} icon={TrendingUp} status={t('level_good_balance')} color="accent" />
           <FeatureCard title={t('crop_health')} desc={t('crop_health_desc')} icon={Activity} status={t('safe_status')} color="brand" />
        </div>

        <div className="md:col-span-5">
           <div className="premium-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-white rounded-xl border border-[#EAEFED]">
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('active_observations')}</span>
              <div className="flex items-baseline gap-4">
                 <span className="text-3xl md:text-5xl font-bold text-slate-900 leading-none">
                   {recentCrops.filter(c => c.status === 'Worsening').length}
                 </span>
                 <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">{t('crops_warning_signs')}</span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{t('requiring_attention')}</span>
                 </div>
              </div>
            </div>
            <div className="relative z-10 max-w-lg">
               <div className="p-4 bg-slate-50 border border-[#EAEFED] rounded-lg">
                 <p className="text-sm font-medium leading-relaxed text-slate-500 border-l-2 border-brand/50 pl-4">
                   {recentCrops.filter(c => c.status === 'Worsening').length > 0 
                     ? t('overview_stress_detected')
                     : t('overview_status_stable')}
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Intel & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-11 gap-6">
        <div className="xl:col-span-7 premium-card p-6 sm:p-8 border border-[#EAEFED] bg-white rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand mb-1 block">{t('activity_stream')}</span>
              <h3 className="text-lg font-bold text-slate-950">{t('scan_timeline')}</h3>
            </div>
            <div className="px-3 py-1.5 bg-brand/5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-brand border border-brand/10 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
               {t('realtime_uplink')}
            </div>
          </div>
          
          <div className="h-[280px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={Array.from({length: 12}, (_, i) => ({ n: i, c: Math.floor(Math.random() * 8) + 4}))}>
                   <defs>
                     <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                       <stop offset="0%" stopColor="#1F6B52" />
                       <stop offset="100%" stopColor="#C8A96B" />
                     </linearGradient>
                   </defs>
                   <Line 
                     type="monotone" 
                     dataKey="c" 
                     stroke="url(#lineGradient)" 
                     strokeWidth={2.5} 
                     dot={{ r: 4, fill: "white", stroke: "#1F6B52", strokeWidth: 1.5 }}
                     activeDot={{ r: 6, fill: "#1F6B52", strokeWidth: 2, stroke: "white" }} 
                   />
                   <XAxis hide />
                   <YAxis hide />
                   <Tooltip 
                     contentStyle={{ backgroundColor: 'white', border: '1px solid #EAEFED', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                     itemStyle={{ color: '#1F6B52', fontWeight: '500', textTransform: 'uppercase', fontSize: '11px' }}
                   />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-4 premium-card p-6 sm:p-8 bg-[#18211D] text-white relative overflow-hidden flex flex-col justify-between shadow-premium border-none rounded-xl">
           <div className="absolute top-0 right-0 w-88 h-88 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
           
           <div className="relative z-10">
             <span className="text-xs font-semibold uppercase tracking-wider text-[#C8A96B] mb-4 block">{t('kigali_weather_station')}</span>
             <div className="flex items-end gap-4 pb-6 border-b border-white/5 mb-6">
                <span className="text-5xl font-bold tracking-tight leading-none text-white">24°</span>
                <div className="flex flex-col pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96B] mb-0.5">{t('station_region')}</span>
                  <span className="text-sm font-medium text-white/80 tracking-tight">Kigali, Rwanda</span>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/40">
                    <Thermometer className="w-4 h-4 text-[#C8A96B]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{t('feels_like')}</span>
                  </div>
                  <p className="text-xl font-bold text-white">26°C</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/40">
                    <Droplets className="w-4 h-4 text-[#8FBFA8]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{t('humidity')}</span>
                  </div>
                  <p className="text-xl font-bold text-white">65%</p>
                </div>
             </div>
           </div>

           <div className="relative z-10 mt-6 p-4 bg-white/5 rounded-lg border border-white/5 backdrop-blur-sm">
              <p className="text-xs font-medium text-white/60 leading-relaxed border-l border-brand/40 pl-3">
               {t('weather_advice_warm')}
              </p>
           </div>
        </div>
      </div>

      {/* Monitoring Section */}
      <section className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">{t('live_management')}</span>
              <h3 className="text-lg font-bold text-slate-950">{t('recent_diagnostic_scans')}</h3>
            </div>
            <button onClick={() => onNavigate && onNavigate("doctor")} className="text-xs font-semibold text-slate-500 hover:text-brand transition-colors flex items-center gap-1.5 pb-1 border-b border-transparent hover:border-brand">
              {t('view_all_history')} <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentCrops.length > 0 ? recentCrops.map((crop, i) => (
              <motion.div 
                key={crop.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="premium-card p-4 group cursor-pointer border border-[#EAEFED]"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4 shadow-soft">
                  <img src={crop.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={crop.name} referrerPolicy="no-referrer" />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shadow-sm text-slate-800 border border-[#EAEFED]">
                    {crop.disease}
                  </div>
                </div>
                
                <div className="px-1">
                  <h4 className="font-bold text-base text-slate-900 mb-2 truncate">{crop.name}</h4>
                  <div className="flex items-center justify-between">
                     <span className={`text-[10.5px] font-bold uppercase tracking-wider ${
                       crop.status === 'Recovered' ? 'text-brand' : 'text-slate-400'
                     }`}>
                       {crop.status}
                     </span>
                     <div className={`w-2 h-2 rounded-full ${
                       crop.status === 'Recovered' ? 'bg-brand' : 
                       crop.status === 'Worsening' ? 'bg-rose-500' : 'bg-slate-300'
                     }`} />
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-16 text-center border-dashed border border-slate-200 bg-white rounded-xl">
                <div className="w-16 h-16 bg-brand/5 flex items-center justify-center rounded-xl mx-auto mb-4 border border-brand/10">
                  <Search className="w-6 h-6 text-brand" />
                </div>
                <h4 className="text-lg font-bold mb-2 text-slate-900">{t('no_scans_found')}</h4>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">{t('no_scans_desc')}</p>
                <button onClick={() => onNavigate && onNavigate("doctor")} className="px-5 py-2.5 bg-brand text-white rounded-lg font-medium text-xs transition-colors hover:bg-brand-deep shadow-soft">{t('start_crop_scan')}</button>
              </div>
            )}
          </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, desc, icon: Icon, status }: any) {
  const { t } = useLanguage();
  return (
    <div className="premium-card p-5 bg-white border border-[#EAEFED] rounded-xl shadow-soft relative overflow-hidden group flex flex-col justify-between">
       <div className="absolute top-5 right-5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand/5 rounded-full border border-brand/10">
             <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
             <span className="text-[8px] font-bold text-brand uppercase tracking-wider">AI</span>
          </div>
       </div>
       <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
          <Icon className="w-4 h-4 text-brand" />
       </div>
       <div>
          <h4 className="text-base font-bold text-slate-900 tracking-tight leading-tight mb-1.5">{title}</h4>
          <p className="text-xs font-semibold text-slate-400 leading-normal mb-4">{desc}</p>
          <div className="flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand-deep">
             <span>{status}</span>
             <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
       </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, description, badge }: any) {
  const { t } = useLanguage();
  return (
    <div className="premium-card p-6 bg-white rounded-xl border border-[#EAEFED] shadow-soft flex flex-col justify-between h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between mb-8 pr-1">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center border border-[#EAEFED] ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <div className="px-2.5 py-1 bg-brand/10 text-brand text-[9.5px] font-bold uppercase tracking-wider rounded-md">
            {badge}
          </div>
        )}
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">{label}</span>
        <div className="flex items-baseline gap-2 mb-3">
          <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
          <span className="text-xs font-semibold text-slate-400">{t('records')}</span>
        </div>
        <p className="text-xs font-semibold text-slate-400 leading-relaxed uppercase tracking-wider">{description}</p>
      </div>
    </div>
  );
}
