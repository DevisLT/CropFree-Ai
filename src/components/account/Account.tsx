import React, { useState } from "react";
import { motion } from "motion/react";
import { CreditCard, Smartphone, CheckCircle, ArrowRight, ShieldCheck, Clock, User, Terminal, Layout, Globe } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { differenceInDays, parseISO } from "date-fns";
import { useLanguage } from "../../contexts/LanguageContext";
import toast from "react-hot-toast";
import LocalizationAuditHub from "./LocalizationAuditHub";

export default function Account() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const trialDaysLeft = profile ? differenceInDays(parseISO(profile.trialEndDate), new Date()) : 0;
  const isTrialExpired = trialDaysLeft <= 0 && profile?.subscriptionStatus === "trial";

  const handleSubscribe = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      toast.success(t('toast_secure_payment') || "This would initiate a secure payment protocol in a production environment.");
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 font-sans text-left space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Profile Column */}
        <div className="lg:col-span-1 space-y-16">
          <div className="premium-card p-16 text-center rounded-[64px] border border-white bg-white/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-32 h-32 bg-brand/5 blur-[40px] pointer-events-none" />
             <div className="w-40 h-40 bg-deep-green text-white rounded-[56px] flex items-center justify-center mx-auto mb-12 text-6xl font-black shadow-2xl group-hover:scale-110 transition-transform duration-1000 border-4 border-white">
                {profile?.fullName ? profile.fullName[0] : <User className="w-16 h-16" />}
             </div>
             <h3 className="text-4xl font-black text-deep-green tracking-tighter">{profile?.fullName}</h3>
             <p className="text-sm font-bold text-slate-400 mt-4 mb-14 uppercase tracking-[0.4em]">{profile?.email}</p>
             
             <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-8">
                  <span className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-300 block">{t('biological_status')}</span>
                  <div className={`px-12 py-4 rounded-full text-[12px] font-black uppercase tracking-[0.3em] shadow-xl border-2 ${isTrialExpired ? 'bg-rose-500 text-white border-rose-600' : 'bg-brand text-white border-brand-dark'}`}>
                     {profile?.subscriptionStatus === "trial" ? t('trial_plan') : t('supreme_plan')}
                  </div>
             </div>
          </div>

          <div className="premium-card p-12 md:p-16 rounded-[48px] bg-white/40 border border-white shadow-2xl backdrop-blur-3xl">
              <div className="flex items-center gap-6 mb-12">
                 <Layout className="w-6 h-6 text-brand" />
                 <h4 className="text-[12px] font-black uppercase tracking-[0.6em] text-deep-green">{t('interface_protocols')}</h4>
              </div>
              <div className="space-y-6">
                {[
                  { label: t('language'), value: t('locale') === 'rw' ? 'Ikinyarwanda' : 'English', icon: Globe },
                  { label: t('station_region'), value: t('global_ke'), icon: Globe }
                ].map((item, i) => (
                  <div key={i} className="w-full flex items-center justify-between p-8 bg-white/60 hover:bg-white rounded-[32px] transition-all duration-700 font-black text-xs uppercase tracking-widest text-slate-400 border border-slate-100 hover:border-brand shadow-sm">
                      <div className="flex items-center gap-6">
                        <item.icon className="w-5 h-5 opacity-40 text-brand" />
                        {item.label}
                      </div>
                      <span className="text-brand flex items-center gap-4 text-xs font-bold leading-none">
                        {item.value}
                      </span>
                  </div>
                ))}
              </div>
          </div>
        </div>

        {/* Subscription Column */}
        <div className="lg:col-span-2">
            <div className="premium-card p-6 md:p-24 bg-deep-green text-white relative overflow-hidden rounded-[80px] border border-white/5 shadow-2xl group">
               <div className="absolute top-0 right-0 w-[90%] h-full bg-brand/5 blur-[150px] pointer-events-none transition-all duration-[4s] group-hover:bg-brand/10" />
               
               <div className="relative z-10">
                 <div className="flex items-center gap-6 mb-10">
                    <div className="h-[2px] w-16 bg-brand/30" />
                    <span className="text-[12px] font-black uppercase tracking-[0.7em] text-brand">{t('strategic_aug')}</span>
                 </div>
                 <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-black mb-12 tracking-tighter leading-none drop-shadow-xl uppercase">{t('supreme_tier')}</h2>
                 <p className="text-white/60 mb-20 max-w-2xl text-xl md:text-2xl font-medium leading-relaxed">
                   {t('supreme_tier_desc')}
                 </p>

                 <div className="flex items-baseline gap-8 mb-24">
                    <span className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white drop-shadow-2xl">$2.99</span>
                    <div className="flex flex-col">
                       <span className="text-slate-400 font-black uppercase tracking-[0.5em] text-sm md:text-lg">{t('per_binary_cycle') || "per binary cycle"}</span>
                       <span className="text-brand font-black text-xs uppercase tracking-[0.3em] mt-2 shadow-glow">{t('limited_access') || "Limited Access."}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 bg-white/5 p-12 rounded-[64px] border border-white/5 backdrop-blur-3xl shadow-inner text-left">
                    <FeatureItem text={t('feature_unlimited_scans')} />
                    <FeatureItem text={t('feature_realtime_sync')} />
                    <FeatureItem text={t('feature_expert_uplink')} />
                    <FeatureItem text={t('feature_atmospheric')} />
                 </div>

                 <div className="space-y-12 mb-20">
                    <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white/30 block mb-6 px-4">{t('currency_strategy')}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                       <button 
                          onClick={() => setPaymentMethod("card")}
                          type="button"
                          className={`p-12 rounded-[40px] border-4 flex items-center justify-center gap-8 transition-all duration-1000 relative overflow-hidden group ${
                            paymentMethod === 'card' ? 'border-brand bg-brand text-deep-green shadow-2xl' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'
                          }`}
                       >
                          <CreditCard className={`w-12 h-12 ${paymentMethod === 'card' ? 'text-deep-green' : 'text-white/10'}`} />
                          <span className="font-black text-sm uppercase tracking-[0.5em]">{t('global_credit')}</span>
                       </button>
                       <button 
                          onClick={() => setPaymentMethod("momo")}
                          type="button"
                          className={`p-12 rounded-[40px] border-4 flex items-center justify-center gap-8 transition-all duration-1000 relative overflow-hidden group ${
                            paymentMethod === 'momo' ? 'border-brand bg-brand text-deep-green shadow-2xl' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'
                          }`}
                       >
                          <Smartphone className={`w-12 h-12 ${paymentMethod === 'momo' ? 'text-deep-green' : 'text-white/10'}`} />
                          <span className="font-black text-sm uppercase tracking-[0.5em]">{t('mobile_logic')}</span>
                       </button>
                    </div>
                 </div>

                 <button 
                   onClick={handleSubscribe}
                   disabled={isProcessing}
                   type="button"
                   className="w-full py-12 bg-white text-deep-green rounded-full font-black text-sm md:text-xl uppercase tracking-[0.5em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-10 group relative overflow-hidden border-4 border-white hover:border-brand"
                 >
                   <div className="absolute inset-0 bg-brand opacity-0 group-hover:opacity-10 transition-opacity" />
                   {isProcessing ? t('sub_processing_btn') : t('init_sub_btn')} 
                   {!isProcessing && <ArrowRight className="w-10 h-10 group-hover:translate-x-6 transition-all duration-1000 group-hover:scale-125 text-brand" />}
                 </button>
                 
                 <div className="mt-20 flex items-center justify-center gap-12 sm:gap-24">
                    <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.6em] text-white/20">
                       <ShieldCheck className="w-8 h-8 text-brand/30" /> {t('node_secured')}
                    </div>
                    <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.6em] text-white/20">
                       <Clock className="w-8 h-8 text-brand/30" /> {t('twentyfour_seven_terminal')}
                    </div>
                 </div>
               </div>
            </div>
            
            {isTrialExpired && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-16 p-16 bg-rose-500/5 rounded-[64px] border-4 border-rose-500/20 flex flex-col md:flex-row items-center md:items-start gap-12 shadow-2xl backdrop-blur-3xl text-left"
              >
                  <div className="w-28 h-28 bg-rose-500/10 rounded-[40px] flex items-center justify-center flex-shrink-0 border-4 border-rose-500/20 animate-pulse shadow-xl">
                    <Terminal className="w-14 h-14 text-rose-500" />
                  </div>
                  <div className="text-center md:text-left">
                     <h5 className="text-white font-black text-4xl lg:text-6xl tracking-tighter mb-6 uppercase leading-none">{t('neural_link_severed')}</h5>
                     <p className="text-white/40 text-xl lg:text-2xl font-medium leading-relaxed max-w-4xl">
                       {t('trial_expired_desc_full')}
                     </p>
                  </div>
              </motion.div>
            )}
        </div>
      </div>

      {/* Localization QA Quality Compliance Auditor Hub */}
      <LocalizationAuditHub />
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-8 group cursor-default text-left">
      <div className="w-10 h-10 rounded-[18px] bg-brand/10 flex items-center justify-center border-2 border-brand/20 group-hover:bg-brand group-hover:scale-125 transition-all duration-700">
         <CheckCircle className="w-6 h-6 text-brand group-hover:text-deep-green transition-colors" />
      </div>
      <span className="text-xl md:text-2xl font-black text-white/40 group-hover:text-white transition-all duration-700 tracking-tight">{text}</span>
    </div>
  );
}
