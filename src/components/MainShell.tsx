import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Search, Activity, ListChecks, MessageSquare, Cloud, Info, User, ChevronRight, Menu, X, Clock, LogOut, Home } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage, Locale, supportedLanguages } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { auth } from "../lib/firebase";
import { Moon, Sun, Globe } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

// Components
import Overview from "./dashboard/Overview";
import CropDoctor from "./doctor/CropDoctor";
import RecoveryTracker from "./tracker/RecoveryTracker";
import Weather from "./weather/Weather";
import Onboarding from "./onboarding/Onboarding";
import Account from "./account/Account";
import Tasks from "./tasks/Tasks";
import Coach from "./coach/Coach";
import Guidance from "./guidance/Guidance";
import FirstTimeTutorial from "./onboarding/FirstTimeTutorial";

type Tab = "dashboard" | "doctor" | "tracker" | "tasks" | "coach" | "weather" | "guidance" | "account";

const Logo = () => (
  <div className="flex items-center gap-3.5 group">
    <div className="relative w-9 h-9 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-105">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2ECC71" />
            <stop offset="100%" stopColor="#0B3D2E" />
          </linearGradient>
        </defs>
        <rect 
          x="10" 
          y="10" 
          width="80" 
          height="80" 
          rx="24" 
          fill="url(#logoGradient)" 
        />
        <path 
          d="M30 50 C30 35 40 25 50 25 C60 25 70 35 70 50 C70 65 60 75 50 75" 
          stroke="white" 
          strokeWidth="6" 
          strokeLinecap="round" 
          fill="none"
          className="opacity-95"
        />
        <circle cx="50" cy="50" r="10" fill="white" />
      </svg>
    </div>
    <div className="flex flex-col text-left">
      <span className="text-lg font-bold tracking-tight text-white group-hover:text-brand transition-colors leading-none">
        CropFree <span className="text-brand font-medium">AI</span>
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-wider text-[#2ECC71]/60 mt-0.5">Enterprise AI</span>
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
  const [showFirstTimeTutorial, setShowFirstTimeTutorial] = useState(false);

  useEffect(() => {
    if (user) {
      const isCompleted = localStorage.getItem("onboardingCompleted") === "true";
      setShowFirstTimeTutorial(!isCompleted);
    } else {
      setShowFirstTimeTutorial(false);
    }
  }, [user]);

  const languages = supportedLanguages;

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
    <div className="h-screen w-screen flex items-center justify-center agritech-gradient agritech-overlay">
      <div className="flex flex-col items-center gap-6">
        <Logo />
        <div className="w-48 h-1 bg-brand/10 rounded-full overflow-hidden">
           <motion.div 
             initial={{ x: "-100%" }}
             animate={{ x: "100%" }}
             transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
             className="w-1/2 h-full bg-brand"
           />
        </div>
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-[11px] font-medium tracking-wide text-slate-400 uppercase"
        >
          {t('loading_intelligence') || "Loading intelligence dashboard..."}
        </motion.div>
      </div>
    </div>
  );

  if (!user) return <Onboarding />;

  if (showFirstTimeTutorial) {
    return (
      <FirstTimeTutorial 
        onComplete={() => {
          localStorage.setItem("onboardingCompleted", "true");
          setShowFirstTimeTutorial(false);
        }} 
      />
    );
  }

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
        <div className="flex flex-col items-center justify-center h-full p-12 text-center max-w-2xl mx-auto premium-card">
          <div className="w-24 h-24 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-8 rotate-12 shadow-inner border border-amber-500/20">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-5xl font-black mb-6 tracking-tighter text-white">{t("trial_access_limited")}</h2>
          <p className="text-slate-400 text-xl leading-relaxed mb-12">
            {t("trial_access_limited_desc")}
          </p>
          <button 
            onClick={() => setActiveTab("account")}
            className="px-12 py-5 bg-brand text-slate-950 rounded-full font-black shadow-2xl shadow-brand/20 btn-press text-lg hover:scale-105 transition-transform"
          >
            {t("upgrade_protocol_btn")}
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard": return <Overview onNavigate={(tab) => setActiveTab(tab)} />;
      case "doctor": return <CropDoctor onNavigate={(tab) => setActiveTab(tab as any)} />;
      case "tracker": return <RecoveryTracker />;
      case "tasks": return <Tasks />;
      case "coach": return <Coach />;
      case "weather": return <Weather />;
      case "account": return <Account />;
      case "guidance": return <Guidance />;
      default: return <Overview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  const AmbientGlow = ({ delay = 0, x = "0%", y = "0%", size = 300, color = "rgba(31, 107, 82, 0.03)" }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.1, 1],
      }}
      transition={{ 
        duration: 12 + Math.random() * 8, 
        repeat: Infinity, 
        delay,
        ease: "easeInOut"
      }}
      style={{ left: x, top: y, position: 'absolute', width: size, height: size, background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      className="pointer-events-none z-0 blur-2xl"
    />
  );

  return (
    <div className={`flex h-screen agritech-gradient overflow-hidden font-sans relative ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background visual depth elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <AmbientGlow x="5%" y="10%" size={400} color="rgba(31, 107, 82, 0.04)" />
        <AmbientGlow x="75%" y="5%" size={500} color="rgba(200, 169, 107, 0.03)" />
        <AmbientGlow x="40%" y="60%" size={600} color="rgba(31, 107, 82, 0.03)" />
        
        {/* Crisp static dot grid array */}
        <div className="absolute inset-0 opacity-[0.4] agritech-overlay" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSidebarOpen(false)}
          className="absolute inset-0 bg-deep-green/40 backdrop-blur-md z-[60]"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ 
          width: isMobile ? (isSidebarOpen ? "85%" : 0) : (isSidebarOpen ? 280 : 0),
          opacity: isSidebarOpen ? 1 : 0,
          x: isMobile && !isSidebarOpen ? (isRTL ? 300 : -300) : 0
        }}
        style={{ right: isRTL && isMobile ? 0 : 'auto', left: !isRTL && isMobile ? 0 : 'auto' }}
        className={`bg-bg-sidebar border-r border-border-main backdrop-blur-2xl flex flex-col z-[70] lg:my-3 lg:ml-3 lg:rounded-2xl lg:overflow-hidden lg:border ${
          isMobile ? "fixed inset-y-0 shadow-2xl bg-bg-sidebar" : "relative shadow-2xl dark:shadow-black/80 shadow-slate-200/50"
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-border-main">
          <Logo />
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/[0.05] rounded-xl text-text-muted hover:text-text-heading transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                if (isMobile) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative cursor-pointer ${
                activeTab === item.id 
                  ? "bg-[#2ECC71]/10 text-brand font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" 
                  : "text-text-muted hover:bg-black/[0.01] dark:hover:bg-white/[0.03] hover:text-text-main"
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${activeTab === item.id ? "text-brand" : "text-text-muted/80 group-hover:text-text-main"}`} />
              <span className="text-[13.5px] font-semibold tracking-normal text-left flex-1 truncate">
                {item.label}
              </span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="sidebarActive"
                  className="absolute left-0 top-3 bottom-3 w-1 bg-brand rounded-r" 
                />
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-main space-y-2.5 bg-[#000000]/[0.01] dark:bg-[#000000]/10">
           <div className="flex items-center gap-2">
             <button 
               onClick={toggleTheme}
               className="flex-1 py-2 px-3 bg-[#000000]/[0.02] dark:bg-white/[0.03] hover:bg-[#000000]/[0.05] dark:hover:bg-white/[0.08] rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-normal transition-colors text-text-muted hover:text-text-heading border border-border-main cursor-pointer"
             >
               {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-text-muted" /> : <Sun className="w-3.5 h-3.5 text-brand" />}
               <span>{theme === 'light' ? t("dark_mode_toggle") : t("light_mode_toggle")}</span>
             </button>
             
             <button 
               onClick={() => auth.signOut()}
               className="p-2 bg-[#000000]/[0.01] dark:bg-white/[0.03] text-text-muted hover:bg-rose-500/10 hover:text-rose-500 transition-colors rounded-xl border border-border-main cursor-pointer"
               title="Sign Out"
             >
               <LogOut className="w-3.5 h-3.5" />
             </button>
           </div>

           <div className="relative">
             <button 
               onClick={() => setShowLangMenu(!showLangMenu)}
               className="w-full py-2 px-3 bg-bg-dark border border-border-main rounded-xl flex items-center justify-between text-xs font-semibold tracking-normal transition-all duration-200 text-text-muted hover:text-text-heading hover:border-[#2ECC71]/40 shadow-soft cursor-pointer"
             >
               <div className="flex items-center gap-2">
                 <Globe className="w-3.5 h-3.5 text-slate-400" />
                 <span>{t("language")}</span>
               </div>
               <span className="text-brand uppercase text-[10.5px] font-bold">{locale}</span>
             </button>

             <AnimatePresence>
               {showLangMenu && (
                 <motion.div
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 5 }}
                   className="absolute bottom-full left-0 right-0 mb-2 bg-[#0F131C]/95 border border-white/[0.06] backdrop-blur-xl rounded-xl shadow-premium overflow-hidden z-[100] max-h-[220px] flex flex-col"
                 >
                   <div className="p-2 border-b border-[#EAEFED]">
                     <input 
                       type="text" 
                       placeholder={t("filter_languages")}
                       value={searchLang}
                       onChange={(e) => setSearchLang(e.target.value)}
                       className="w-full p-2 bg-white/[0.03] border border-white/[0.05] rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
                     />
                   </div>
                   <div className="overflow-y-auto custom-scrollbar p-1.5 space-y-0.5 bg-[#0F131C]/60">
                     {filteredLanguages.map((l) => (
                       <button
                         key={l.code}
                         onClick={() => {
                           setLocale(l.code);
                           setShowLangMenu(false);
                         }}
                         className={`w-full px-3 py-1.5 text-left text-xs font-semibold transition-colors rounded-lg cursor-pointer ${
                           locale === l.code 
                             ? 'bg-brand/10 text-brand font-bold' 
                             : 'text-slate-300 hover:bg-white/[0.03] hover:text-white'
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
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col h-full bg-transparent">
        {/* Header (Adaptive) */}
        <header className="sticky top-0 z-40 bg-bg-header backdrop-blur-md px-6 md:px-8 py-4 flex items-center justify-between border-b border-border-main">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-[#000000]/[0.02] dark:bg-white/[0.03] text-text-muted hover:text-text-heading rounded-xl border border-border-main transition-all btn-press cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-muted hidden sm:block">{t("workspace")}</span>
              <span className="text-xs font-semibold text-text-muted/60 hidden sm:block">/</span>
              <h1 className="text-base font-bold text-text-heading capitalize leading-none">
                {t(activeTab)}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-text-main">{profile?.fullName}</span>
              <span className="text-[9px] font-bold text-brand uppercase tracking-wider mt-0.5">{profile?.subscriptionStatus === 'active' ? t("supreme_plan") : t("trial_plan")}</span>
            </div>
            <div 
              onClick={() => setActiveTab("account")}
              className="w-8 h-8 rounded-full bg-[#2ECC71]/10 border border-[#2ECC71]/20 flex items-center justify-center cursor-pointer hover:border-brand transition-colors"
            >
              <span className="text-xs font-bold text-brand uppercase">
                {profile?.fullName ? profile.fullName[0] : 'U'}
              </span>
            </div>
          </div>
        </header>

        <div className="px-5 md:px-8 pb-24 md:pb-12 pt-6 flex-1 relative z-10 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="max-w-7xl mx-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-header backdrop-blur-md border-t border-border-main px-6 py-3.5 flex items-center justify-between shadow-premium">
            {[
              { id: "dashboard", icon: Activity, label: t("dashboard_short") },
              { id: "doctor", icon: Search, label: t("scan_short") },
              { id: "tracker", icon: Leaf, label: t("crops_short") },
              { id: "tasks", icon: ListChecks, label: t("plan_short") },
              { id: "account", icon: User, label: t("you_short") },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === item.id ? "text-brand font-bold" : "text-text-muted"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">
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
