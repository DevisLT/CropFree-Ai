import React from "react";
import { motion } from "motion/react";
import { Shield, Bug, Activity, Droplets, Thermometer, Database, CheckCircle, ChevronRight, Microscope } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Guidance() {
  const { t } = useLanguage();

  const gridItems = [
    { label: t('pest_activity') || "Pest Activity", value: t('low_risk') || "Very Low", status: t('safe_status') || "Safe & Minimal", icon: Bug, color: "text-brand" },
    { label: t('soil_moisture_score') || "Soil Moisture", value: t('level_good_balance') || "Balanced", status: t('level_optimal') || "Optimal Water Level", icon: Droplets, color: "text-blue-500" },
    { label: t('feels_like') || "Outside Temp", value: "24°C", status: t('level_good_balance') || "Ideal For Yields", icon: Thermometer, color: "text-amber-500" },
    { label: t('efficiency_bonus') || "Compost Index", value: t('level_excellent') || "Excellent", status: t('level_good_balance') || "Rich Nutrient Mix", icon: Activity, color: "text-emerald-500" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 px-2 font-sans text-left">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">{t('expert_guidance')}</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t('guidance_title')}</h2>
          <p className="text-sm text-slate-500 font-medium max-w-xl">
            {t('guidance_intro_desc')}
          </p>
        </div>
        <div className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center flex-shrink-0">
           <Shield className="w-5 h-5 text-brand" />
        </div>
      </header>

      {/* Main Info Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Soil Profile Breakdown */}
         <div className="lg:col-span-8 space-y-4">
            <div className="premium-card p-6 bg-white border border-[#EAEFED] rounded-xl shadow-soft relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-2xl pointer-events-none" />
               
               <div className="relative z-10 space-y-5">
                  <div className="flex items-center gap-3">
                     <Microscope className="w-4 h-4 text-brand" />
                     <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{t('field_soil_quality')}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-none mb-2">{t('current_soil_profile')}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      {t('soil_profile_detail')}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                     {[
                       { label: t('nitrogen_level'), val: t('level_optimal') },
                       { label: t('soil_ph_range'), val: t('level_neutral') },
                       { label: t('potassium_ratio'), val: t('level_good_balance') },
                       { label: t('phosphorus'), val: t('level_excellent') }
                     ].map((m, i) => (
                       <div key={i} className="border-l-2 border-brand/20 pl-3">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{m.label}</span>
                           <p className="text-xs font-bold text-slate-800">{m.val}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Soil Score Card */}
         <div className="lg:col-span-4 grid grid-cols-1 gap-4">
            <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 text-white relative overflow-hidden flex flex-col justify-between">
               <div className="absolute top-0 right-0 w-24 h-24 bg-brand/20 rounded-full blur-2xl pointer-events-none" />
               <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-3 block">{t('soil_health_score')}</span>
               <div>
                  <div className="flex items-baseline gap-1 mb-1">
                     <span className="text-4xl font-extrabold tracking-tight">92</span>
                     <span className="text-xs font-bold text-[#8FBFA8]">/100</span>
                  </div>
                  <p className="text-[9px] font-bold text-[#8FBFA8] uppercase tracking-wider">
                     {t('soil_health_rating')}
                  </p>
               </div>
            </div>

            <div className="p-5 bg-white border border-[#EAEFED] rounded-xl shadow-soft flex items-center justify-between">
               <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">{t('next_checkup')}</span>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{t('june_14')}</p>
               </div>
               <div className="w-1.5 h-1.5 bg-brand rounded-full animate-ping" />
            </div>
         </div>
      </div>

      {/* Mini Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {gridItems.map((item, i) => (
            <div 
              key={i}
              className="premium-card p-4 bg-white border border-[#EAEFED] rounded-xl shadow-soft flex flex-col justify-between group"
            >
               <div className="flex items-center justify-between mb-4">
                  <div className={`w-8 h-8 rounded-lg ${item.color} bg-slate-50 flex items-center justify-center border border-slate-100`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
               </div>
               <div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight mb-1">{item.value}</h4>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">{item.status}</span>
               </div>
            </div>
         ))}
      </div>

      {/* Farmland Pest Log */}
      <section className="space-y-4 pt-2">
         <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">{t('live_monitoring_log')}</span>
            <h3 className="text-lg font-bold text-slate-950">{t('pest_surveillance')}</h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: t('aphid_spreads'), risk: t('low_risk'), area: t('sector_b4'), time: t('checked_2h_ago') },
              { name: t('stem_fungal'), risk: t('elevated_risk'), area: t('west_field'), time: t('active_live') },
              { name: t('root_insect'), risk: t('low_risk'), area: t('east_hydro'), time: t('checked_12h_ago') }
            ].map((p, i) => (
              <div key={i} className="premium-card p-5 bg-white border border-[#EAEFED] rounded-xl shadow-soft flex flex-col justify-between group relative overflow-hidden text-left">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('biomarker_status')}</span>
                       <div className={`w-2 h-2 rounded-full ${p.risk === t('elevated_risk') ? 'bg-rose-500 animate-pulse' : 'bg-brand'}`} />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 mb-1">{p.name}</h5>
                      <div className="flex items-center gap-2 text-[10.5px] text-slate-500 font-medium">
                         <span>{p.area}</span>
                         <span className="text-slate-300">|</span>
                         <span>{p.time}</span>
                      </div>
                    </div>
                 </div>
                 <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${p.risk === t('elevated_risk') ? 'text-rose-600' : 'text-brand'}`}>
                      {p.risk} {t('priority_suffix') || "Priority"}
                    </span>
                    <button type="button" className="w-6 h-6 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-center text-slate-400 hover:text-brand transition-colors">
                       <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
