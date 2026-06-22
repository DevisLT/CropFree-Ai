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
    <div className="max-w-6xl mx-auto py-8 px-4 font-sans text-left space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Column */}
        <div className="lg:col-span-1 space-y-8">
          {/* Reduced Card: p-8 instead of p-16, rounded-[32px] for sleek footprint */}
          <div className="premium-card p-8 text-center rounded-[32px] border border-slate-100 bg-white/40 backdrop-blur-3xl shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-24 h-24 bg-brand/5 blur-[30px] pointer-events-none" />
             {/* Thinner border and compact size: w-24 h-24 instead of w-40 h-40 */}
             <div className="w-24 h-24 bg-deep-green text-white rounded-[24px] flex items-center justify-center mx-auto mb-6 text-3xl font-black shadow-lg group-hover:scale-105 transition-transform duration-700 border-2 border-white">
                {profile?.fullName ? profile.fullName[0] : <User className="w-10 h-10" />}
             </div>
             <h3 className="text-2xl font-black text-deep-green tracking-tight">{profile?.fullName}</h3>
             <p className="text-xs font-bold text-slate-400 mt-2 mb-8 uppercase tracking-[0.2em]">{profile?.email}</p>
             
             <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 block">{t('biological_status')}</span>
                  <div className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-md border-2 ${isTrialExpired ? 'bg-rose-500 text-white border-rose-600' : 'bg-brand text-white border-brand-dark'}`}>
                     {profile?.subscriptionStatus === "trial" ? t('trial_plan') : t('supreme_plan')}
                  </div>
             </div>
          </div>

          {/* Interface Protocols: compact list row layout */}
          <div className="premium-card p-6 rounded-[28px] bg-white/40 border border-slate-100 shadow-xl backdrop-blur-3xl">
              <div className="flex items-center gap-4 mb-6">
                 <Layout className="w-5 h-5 text-brand" />
                 <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-deep-green">{t('interface_protocols')}</h4>
              </div>
              <div className="space-y-4">
                {[
                  { label: t('language'), value: t('locale') === 'rw' ? 'Ikinyarwanda' : 'English', icon: Globe },
                  { label: t('station_region'), value: t('global_ke'), icon: Globe }
                ].map((item, i) => (
                  <div key={i} className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-[20px] transition-all duration-500 font-extrabold text-[11px] uppercase tracking-wider text-slate-450 border border-slate-100 hover:border-brand shadow-sm">
                      <div className="flex items-center gap-4">
                        <item.icon className="w-4 h-4 opacity-40 text-brand" />
                        {item.label}
                      </div>
                      <span className="text-brand flex items-center gap-2 text-xs font-bold leading-none">
                        {item.value}
                      </span>
                  </div>
                ))}
              </div>
          </div>
        </div>

        {/* Subscription Column */}
        <div className="lg:col-span-2">
            {/* Reduced card padding and rounded corners */}
            <div className="premium-card p-6 md:p-12 bg-deep-green text-white relative overflow-hidden rounded-[40px] border border-white/5 shadow-xl group">
               <div className="absolute top-0 right-0 w-[80%] h-full bg-brand/5 blur-[120px] pointer-events-none transition-all duration-[3s] group-hover:bg-brand/10" />
               
               <div className="relative z-10 text-left">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="h-[2px] w-12 bg-brand/30" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-brand">{t('strategic_aug')}</span>
                 </div>
                 {/* Title resized to fit beautifully: text-3xl md:text-5xl */}
                 <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-none drop-shadow-lg uppercase">{t('supreme_tier')}</h2>
                 {/* Reduced text sizes and spacing */}
                 <p className="text-white/60 mb-8 max-w-2xl text-base md:text-lg font-medium leading-relaxed">
                   {t('supreme_tier_desc')}
                 </p>

                 <div className="flex items-baseline gap-4 mb-10">
                    <span className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-xl">$2.99</span>
                    <div className="flex flex-col text-left">
                       <span className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs md:text-sm">{t('per_binary_cycle') || "per binary cycle"}</span>
                       <span className="text-brand font-black text-[10px] uppercase tracking-[0.2em] mt-1 shadow-glow">{t('limited_access') || "Limited Access."}</span>
                    </div>
                 </div>

                 {/* Fully horizontal layout: cards are horizontal styled rows and compact */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 bg-white/5 p-6 rounded-[28px] border border-white/5 backdrop-blur-3xl shadow-inner text-left">
                    <FeatureItem text={t('feature_unlimited_scans')} />
                    <FeatureItem text={t('feature_realtime_sync')} />
                    <FeatureItem text={t('feature_expert_uplink')} />
                    <FeatureItem text={t('feature_atmospheric')} />
                 </div>

                 <div className="space-y-6 mb-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 block mb-3 px-2">{t('currency_strategy')}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <button 
                          onClick={() => setPaymentMethod("card")}
                          type="button"
                          className={`p-6 rounded-[24px] border-2 flex items-center justify-center gap-4 transition-all duration-500 relative overflow-hidden group ${
                            paymentMethod === 'card' ? 'border-brand bg-brand text-deep-green shadow-xl' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/10'
                          }`}
                       >
                          <CreditCard className={`w-8 h-8 ${paymentMethod === 'card' ? 'text-deep-green' : 'text-white/10'}`} />
                          <span className="font-black text-xs uppercase tracking-[0.3em]">{t('global_credit')}</span>
                       </button>
                       <button 
                          onClick={() => setPaymentMethod("momo")}
                          type="button"
                          className={`p-6 rounded-[24px] border-2 flex items-center justify-center gap-4 transition-all duration-500 relative overflow-hidden group ${
                            paymentMethod === 'momo' ? 'border-brand bg-brand text-deep-green shadow-xl' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/10'
                          }`}
                       >
                          <Smartphone className={`w-8 h-8 ${paymentMethod === 'momo' ? 'text-deep-green' : 'text-white/10'}`} />
                          <span className="font-black text-xs uppercase tracking-[0.3em]">{t('mobile_logic')}</span>
                       </button>
                    </div>
                  </div>

                 {/* Compact button with moderate padding and crisp layout */}
                 <button 
                   onClick={handleSubscribe}
                   disabled={isProcessing}
                   type="button"
                   className="w-full py-6 bg-white text-deep-green rounded-2xl font-black text-sm md:text-base uppercase tracking-[0.3em] shadow-xl hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-4 group relative overflow-hidden border-2 border-white hover:border-brand"
                 >
                   <div className="absolute inset-0 bg-brand opacity-0 group-hover:opacity-10 transition-opacity" />
                   {isProcessing ? t('sub_processing_btn') : t('init_sub_btn')} 
                   {!isProcessing && <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-all duration-500 group-hover:scale-110 text-brand" />}
                 </button>
                 
                 <div className="mt-10 flex items-center justify-center gap-8 sm:gap-16">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                       <ShieldCheck className="w-6 h-6 text-brand/30" /> {t('node_secured')}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                       <Clock className="w-6 h-6 text-brand/30" /> {t('twentyfour_seven_terminal')}
                    </div>
                 </div>
               </div>
            </div>
            
            {isTrialExpired && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-8 bg-rose-500/5 rounded-[32px] border-2 border-rose-500/10 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl backdrop-blur-3xl text-left"
              >
                  <div className="w-16 h-16 bg-rose-500/10 rounded-[20px] flex items-center justify-center flex-shrink-0 border-2 border-rose-500/20 animate-pulse shadow-md">
                    <Terminal className="w-8 h-8 text-rose-500" />
                  </div>
                  <div className="text-center md:text-left">
                     <h5 className="text-white font-black text-2xl lg:text-3xl tracking-tight mb-3 uppercase leading-none">{t('neural_link_severed')}</h5>
                     <p className="text-white/40 text-base font-medium leading-relaxed max-w-4xl">
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
    <div className="flex items-center gap-4 group cursor-default text-left">
      <div className="w-8 h-8 rounded-[12px] bg-brand/10 flex items-center justify-center border border-brand/20 group-hover:bg-brand group-hover:scale-110 transition-all duration-500 flex-shrink-0">
         <CheckCircle className="w-4 h-4 text-brand group-hover:text-deep-green transition-colors" />
      </div>
      <span className="text-sm md:text-base font-black text-white/40 group-hover:text-white transition-all duration-500 tracking-tight">{text}</span>
    </div>
  );
}
