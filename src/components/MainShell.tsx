import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Search, Activity, ListChecks, MessageSquare, Cloud, Info, User, ChevronRight, Menu, X, Clock, LogOut, Home } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage, Locale } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { auth } from "../lib/firebase";
import { Moon, Sun, Globe } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

// Components
import Overview from "./dashboard/Overview";
import CropDoctor from "./doctor/CropDoctor";
import RecoveryTracker from "./tracker/RecoveryTracker";
import AICoach from "./chat/AICoach";
import Weather from "./weather/Weather";
import Onboarding from "./onboarding/Onboarding";
import Account from "./account/Account";
import Tasks from "./tasks/Tasks";
import GuidanceCenter from "./guidance/GuidanceCenter";

type Tab = "dashboard" | "doctor" | "tracker" | "tasks" | "coach" | "weather" | "guidance" | "account";

const Logo = () => (
  <div className="flex items-center gap-3 group">
    <div className="relative w-10 h-10 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm group-hover:scale-110 transition-transform duration-500">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        <path 
          d="M50 10 C30 30 10 50 10 70 A40 40 0 0 0 90 70 C90 50 70 30 50 10" 
          fill="url(#logoGradient)" 
        />
        <path 
          d="M50 25 V85 M50 45 H70 M50 65 H30 M30 50 V40 M70 60 V70" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round" 
          fill="none"
          className="opacity-80"
        />
        <circle cx="70" cy="45" r="4" fill="white" />
        <circle cx="30" cy="65" r="4" fill="white" />
        <circle cx="30" cy="40" r="4" fill="white" />
        <circle cx="70" cy="70" r="4" fill="white" />
      </svg>
    </div>
    <div className="flex flex-col">
      <span className="text-xl font-black tracking-tighter leading-none text-neutral-900 group-hover:text-brand transition-colors">
        CropFree <span className="opacity-60 font-medium italic">AI</span>
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mt-0.5">Agriculture Intelligence</span>
    </div>
  </div>
);

export default function MainShell() {
  const { user, profile, loading } = useAuth();
  const { locale, setLocale, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [searchLang, setSearchLang] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages: { code: Locale; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'pt', name: 'Português' },
    { code: 'es', name: 'Español' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh', name: '中文' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'am', name: 'አማርኛ' },
    { code: 'ha', name: 'Hausa' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'rw', name: 'Ikinyarwanda' },
    { code: 'sw', name: 'Kiswahili' },
    { code: 'zu', name: 'isiZulu' },
    { code: 'ig', name: 'Igbo' },
  ];

  const filteredLanguages = languages.filter(l => 
    l.name.toLowerCase().includes(searchLang.toLowerCase()) || 
    l.code.toLowerCase().includes(searchLang.toLowerCase())
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-neutral-50 grain">
      <div className="flex flex-col items-center gap-6">
        <Logo />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-xs font-bold uppercase tracking-[0.3em] text-brand"
        >
          Gathering Insights...
        </motion.div>
      </div>
    </div>
  );

  if (!user) return <Onboarding />;

  const trialDaysLeft = profile ? differenceInDays(parseISO(profile.trialEndDate), new Date()) : 0;
  const isTrialExpired = trialDaysLeft <= 0 && profile?.subscriptionStatus === "trial";

  const navItems = [
    { id: "dashboard", label: t("dashboard"), icon: Activity },
    { id: "doctor", label: t("crop_doctor"), icon: Search },
    { id: "tracker", label: t("recovery_tracker"), icon: Leaf },
    { id: "tasks", label: t("daily_tasks"), icon: ListChecks },
    { id: "coach", label: t("ai_coach"), icon: MessageSquare },
    { id: "weather", label: t("weather"), icon: Cloud },
    { id: "guidance", label: t("guidance"), icon: Info },
    { id: "account", label: t("account"), icon: User },
  ];

  const renderContent = () => {
    if (isTrialExpired && !["account", "guidance"].includes(activeTab)) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-12 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-amber-50 rounded-[40px] flex items-center justify-center mb-8 rotate-12 shadow-inner border border-amber-100">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tighter">Your journey has just begun</h2>
          <p className="text-neutral-500 text-lg leading-relaxed mb-10">
            Your 60-day trial has reached its harvest. To keep receiving AI-powered diagnostics and recovery insights, join our growing community of premium farmers.
          </p>
          <button 
            onClick={() => setActiveTab("account")}
            className="px-10 py-4 bg-brand text-white rounded-[24px] font-bold shadow-xl shadow-brand/20 btn-press text-lg"
          >
            Access Full Power — $2.99/mo
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard": return <Overview />;
      case "doctor": return <CropDoctor />;
      case "tracker": return <RecoveryTracker />;
      case "tasks": return <Tasks />;
      case "coach": return <AICoach />;
      case "weather": return <Weather />;
      case "account": return <Account />;
      case "guidance": return <GuidanceCenter />;
      default: return <Overview />;
    }
  };

  return (
    <div className={`flex h-screen bg-[#FCFAF7] dark:bg-neutral-950 overflow-hidden font-sans grain relative ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSidebarOpen(false)}
          className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm z-[60]"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ 
          width: isMobile ? (isSidebarOpen ? "85%" : 0) : (isSidebarOpen ? 280 : 0),
          opacity: isSidebarOpen ? 1 : 0,
          x: isMobile && !isSidebarOpen ? (isRTL ? 320 : -320) : 0
        }}
        style={{ right: isRTL && isMobile ? 0 : 'auto', left: !isRTL && isMobile ? 0 : 'auto' }}
        className={`bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-r dark:border-neutral-800 border-neutral-200/50 flex flex-col shadow-2xl z-[70] ${
          isMobile ? "fixed inset-y-0" : "relative"
        }`}
      >
        <div className="p-6 md:p-8 flex items-center justify-between">
          <Logo />
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-neutral-100 rounded-xl">
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 md:py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                if (isMobile) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[22px] transition-all duration-300 group ${
                activeTab === item.id 
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xl shadow-neutral-900/10" 
                  : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? "text-brand" : ""}`} />
              <span className={`font-semibold tracking-tight ${activeTab === item.id ? "translate-x-1" : ""} transition-transform`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-neutral-100/50 dark:border-neutral-800 space-y-4">
           {/* Theme and Language Controls */}
           <div className="flex items-center gap-2 mb-2">
             <button 
               onClick={toggleTheme}
               className="flex-1 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all dark:text-white"
             >
               {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
               {t(theme === 'light' ? 'dark_mode' : 'light_mode')}
             </button>
             
             <div className="relative flex-1">
               <button 
                 onClick={() => setShowLangMenu(!showLangMenu)}
                 className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all dark:text-white"
               >
                 <Globe className="w-4 h-4" />
                 {locale.toUpperCase()}
               </button>

               <AnimatePresence>
                 {showLangMenu && (
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-2xl shadow-premium overflow-hidden z-[100] max-h-[300px] flex flex-col"
                   >
                     <div className="p-2 border-b dark:border-neutral-700">
                       <input 
                         type="text" 
                         placeholder="Search..."
                         value={searchLang}
                         onChange={(e) => setSearchLang(e.target.value)}
                         className="w-full p-2 bg-neutral-50 dark:bg-neutral-900 rounded-xl text-[10px] focus:outline-none dark:text-white"
                       />
                     </div>
                     <div className="overflow-y-auto custom-scrollbar">
                       {filteredLanguages.map((l) => (
                         <button
                           key={l.code}
                           onClick={() => {
                             setLocale(l.code);
                             setShowLangMenu(false);
                           }}
                           className={`w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest transition-colors ${
                             locale === l.code 
                               ? 'bg-brand text-white' 
                               : 'hover:bg-neutral-50 dark:hover:bg-neutral-700 dark:text-neutral-400'
                           }`}
                         >
                           {l.name}
                         </button>
                       ))}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           </div>

           {profile && !isMobile && (
             <div className="bg-neutral-50/10 dark:bg-neutral-800/10 rounded-3xl p-4 border border-neutral-100 dark:border-neutral-800 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-16 h-16 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-colors" />
               <div className="flex items-center justify-between mb-2 relative">
                 <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                   {profile.subscriptionStatus === "trial" ? "Trial Progress" : "Premium Member"}
                 </span>
               </div>
               <div className="w-full bg-neutral-200/50 dark:bg-neutral-700 h-1 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.max(0, (trialDaysLeft / 60) * 100)}%` }}
                   className="h-full bg-brand"
                 />
               </div>
             </div>
           )}
           <button 
             onClick={() => auth.signOut()}
             className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-all font-bold text-sm"
           >
             <LogOut className="w-4 h-4" />
             {t("logout")}
           </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col h-full dark:bg-neutral-950">
        {/* Header (Adaptive) */}
        <header className="sticky top-0 z-40 bg-[#FCFAF7]/80 dark:bg-neutral-950/80 backdrop-blur-md px-4 md:px-10 py-4 md:py-8 flex items-center justify-between border-b border-neutral-100/50 dark:border-neutral-800">
          <div className="flex items-center gap-4 md:gap-6">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-3 bg-white dark:bg-neutral-900 dark:text-white hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 rounded-2xl shadow-soft border border-neutral-100 dark:border-neutral-800 transition-all btn-press group"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest hidden md:block">{t("navigation")}</span>
              <h1 className="text-xl md:text-3xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none capitalize">
                {t(activeTab)}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={toggleTheme}
              className="p-3 bg-white dark:bg-neutral-900 dark:text-white rounded-2xl shadow-soft border border-neutral-100 dark:border-neutral-800 transition-all btn-press group"
              title={t(theme === 'light' ? 'dark_mode' : 'light_mode')}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-brand" />}
            </button>

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-black text-neutral-900 dark:text-white">{profile?.fullName}</span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{profile?.subscriptionStatus}</span>
            </div>
            <div 
              onClick={() => setActiveTab("account")}
              className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-neutral-900 rounded-xl md:rounded-2xl shadow-soft border border-neutral-100 dark:border-neutral-800 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            >
               <div className="w-full h-full bg-brand/10 text-brand flex items-center justify-center font-black text-sm md:text-lg rounded-lg md:rounded-xl">
                 {profile?.fullName[0]}
               </div>
            </div>
          </div>
        </header>

        <div className="px-4 md:px-10 pb-24 md:pb-12 pt-6 flex-1 relative z-10 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] border-t border-neutral-100 dark:border-neutral-800 px-6 py-4 flex items-center justify-between backdrop-blur-xl">
            {[
              { id: "dashboard", icon: Activity, label: t("dashboard_short") || "Feed" },
              { id: "doctor", icon: Search, label: t("scan_short") || "Scan" },
              { id: "tracker", icon: Leaf, label: t("crops_short") || "Crops" },
              { id: "tasks", icon: ListChecks, label: t("plan_short") || "Plan" },
              { id: "account", icon: User, label: t("you_short") || "You" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`flex flex-col items-center gap-1.5 transition-all ${
                  activeTab === item.id ? "text-brand" : "text-neutral-400"
                }`}
              >
                <item.icon className={`w-6 h-6 ${activeTab === item.id ? "animate-pulse" : ""}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        )}
      </main>
    </div>
  );
}
