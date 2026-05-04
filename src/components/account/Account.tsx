import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, Smartphone, CheckCircle, ArrowRight, ShieldCheck, Zap, Clock, Info } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { differenceInDays, parseISO } from "date-fns";

export default function Account() {
  const { profile } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const trialDaysLeft = profile ? differenceInDays(parseISO(profile.trialEndDate), new Date()) : 0;
  const isTrialExpired = trialDaysLeft <= 0 && profile?.subscriptionStatus === "trial";

  const handleSubscribe = async () => {
    setIsProcessing(true);
    // Simulate payment flow
    setTimeout(() => {
      alert("This would initiate a Stripe or Mobile Money payment request in production.");
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="premium-card p-8 text-center">
             <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-black">
                {profile?.fullName[0]}
             </div>
             <h3 className="text-xl font-bold">{profile?.fullName}</h3>
             <p className="text-sm text-neutral-500 mb-6">{profile?.email}</p>
             <div className="pt-6 border-t border-neutral-100">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${isTrialExpired ? 'bg-red-100 text-red-600' : 'bg-brand/10 text-brand'}`}>
                   {profile?.subscriptionStatus === "trial" ? "Free Trial" : "Premium Member"}
                </span>
             </div>
          </div>

          <div className="premium-card p-6">
             <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-neutral-400">Settings</h4>
             <button className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl transition-colors font-medium text-sm">
                Language <span className="text-brand">English</span>
             </button>
             <button className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl transition-colors font-medium text-sm">
                Country <span className="text-brand">Rwanda</span>
             </button>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="md:col-span-2">
           <div className="premium-card p-10 bg-gradient-to-br from-white to-neutral-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Zap className="w-32 h-32" />
              </div>
              
              <h2 className="text-3xl font-black mb-2">Upgrade to Premium</h2>
              <p className="text-neutral-500 mb-8 max-w-sm">
                Unlock all features including unlimited scans, long-term tracking, and advanced AI coaching.
              </p>

              <div className="flex items-baseline gap-2 mb-10">
                 <span className="text-5xl font-black">$2.99</span>
                 <span className="text-neutral-400 font-bold">/ Month</span>
              </div>

              <div className="space-y-4 mb-10">
                 <FeatureItem text="Unlimited AI Crop Diagnoses" />
                 <FeatureItem text="Unlimited Recovery Tracking" />
                 <FeatureItem text="Priority AI Farming Coach Access" />
                 <FeatureItem text="Advanced Weather Intelligence" />
              </div>

              <div className="bg-white rounded-3xl p-6 border border-neutral-200 mb-10">
                 <h4 className="font-bold text-sm mb-4">Select Payment Method</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                       onClick={() => setPaymentMethod("card")}
                       className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                         paymentMethod === 'card' ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' : 'border-neutral-100 hover:border-neutral-200'
                       }`}
                    >
                       <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-brand' : 'text-neutral-400'}`} />
                       <span className="font-bold text-sm">Card</span>
                    </button>
                    <button 
                       onClick={() => setPaymentMethod("momo")}
                       className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                         paymentMethod === 'momo' ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' : 'border-neutral-100 hover:border-neutral-200'
                       }`}
                    >
                       <Smartphone className={`w-5 h-5 ${paymentMethod === 'momo' ? 'text-brand' : 'text-neutral-400'}`} />
                       <span className="font-bold text-sm">MoMo</span>
                    </button>
                 </div>
              </div>

              <button 
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full py-5 bg-brand text-white rounded-2xl font-black shadow-2xl shadow-brand/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {isProcessing ? "Processing..." : "Secure Subscribe Now"} 
                {!isProcessing && <ArrowRight className="w-5 h-5" />}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-6 opacity-40">
                 <div className="flex items-center gap-1.5 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" /> Secure Payment
                 </div>
                 <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Clock className="w-4 h-4" /> Cancel Anytime
                 </div>
              </div>
           </div>
           
           {isTrialExpired && (
             <div className="mt-8 p-6 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-4">
                <Info className="w-6 h-6 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800 font-medium">
                  Your trial has expired. Access to key diagnosis and tracking features is currently restricted. Upgrade now to restore full access.
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
         <CheckCircle className="w-3.5 h-3.5 text-success" />
      </div>
      <span className="text-sm font-medium text-neutral-700">{text}</span>
    </div>
  );
}
