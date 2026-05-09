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
import Weather from "./weather/Weather";
import Onboarding from "./onboarding/Onboarding";
import Account from "./account/Account";
import Tasks from "./tasks/Tasks";
import Coach from "./coach/Coach";
import Guidance from "./guidance/Guidance";

type Tab = "dashboard" | "doctor" | "tracker" | "tasks" | "coach" | "weather" | "guidance" | "account";

const Logo = () => (
  <div className="flex items-center gap-4 group">
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(45,106,79,0.2)] group-hover:scale-110 transition-transform duration-700">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D6A4F" />
            <stop offset="100%" stopColor="#FFD54F" />
          </linearGradient>
        </defs>
        <path 
          d="M50 10 C30 30 10 50 10 70 A40 40 0 0 0 90 70 C90 50 70 30 50 10" 
          fill="url(#logoGradient)" 
        />
        <path 
          d="M50 25 V85 M50 45 L70 35 M50 65 L30 55 M50 45 L30 35 M50 65 L70 55" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round" 
          fill="none"
          className="opacity-90"
        />
      </svg>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-black tracking-tighter leading-none text-deep-green group-hover:text-brand transition-colors">
        CropFree <span className="opacity-60 font-medium text-brand">AI</span>
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 mt-1">Smart Agriculture</span>
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
    <div className="h-screen w-screen flex items-center justify-center agritech-gradient agritech-overlay">
      <div className="flex flex-col items-center gap-8">
        <Logo />
        <div className="w-64 h-1.5 bg-brand-light/10 rounded-full overflow-hidden">
           <motion.div 
             initial={{ x: "-100%" }}
             animate={{ x: "100%" }}
             transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
             className="w-1/2 h-full bg-brand shadow-[0_0_15px_rgba(45,106,79,0.4)]"
           />
        </div>
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-[11px] font-black uppercase tracking-[0.6em] text-brand"
        >
          Calibrating Biosensors...
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
        <div className="flex flex-col items-center justify-center h-full p-12 text-center max-w-2xl mx-auto premium-card">
          <div className="w-24 h-24 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-8 rotate-12 shadow-inner border border-amber-500/20">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-5xl font-black mb-6 tracking-tighter text-white">Biological Access Limited</h2>
          <p className="text-slate-400 text-xl leading-relaxed mb-12">
            Your evaluation period has reached its final harvest. To maintain access to precision AI diagnostics, transition to our premium infrastructure.
          </p>
          <button 
            onClick={() => setActiveTab("account")}
            className="px-12 py-5 bg-brand text-slate-950 rounded-full font-black shadow-2xl shadow-brand/20 btn-press text-lg hover:scale-105 transition-transform"
          >
            Upgrade Protocol — $2.99/mo
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard": return <Overview />;
      case "doctor": return <CropDoctor />;
      case "tracker": return <RecoveryTracker />;
      case "tasks": return <Tasks />;
      case "coach": return <Coach />;
      case "weather": return <Weather />;
      case "account": return <Account />;
      case "guidance": return <Guidance />;
      default: return <Overview />;
    }
  };

  const FloatingLeaf = ({ delay = 0, x = "0%", y = "0%", size = 40, color = "rgba(45, 106, 79, 0.4)" }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0.1, 0.4, 0.1],
        scale: [1, 1.2, 1],
        x: [0, 50, -50, 0],
        y: [0, -30, 30, 0],
        rotate: [0, 90, 180, 270, 360]
      }}
      transition={{ 
        duration: 20 + Math.random() * 20, 
        repeat: Infinity, 
        delay,
        ease: "linear"
      }}
      style={{ left: x, top: y, position: 'absolute' }}
      className="pointer-events-none z-0"
    >
      <div 
        className="blur-3xl animate-pulse" 
        style={{ 
          width: size * 3, 
          height: size * 3, 
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)` 
        }} 
      />
      <Leaf 
        style={{ width: size, height: size, color }} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 filter drop-shadow-[0_0_15px_rgba(45,106,79,0.8)]" 
      />
    </motion.div>
  );

  return (
    <div className={`flex h-screen agritech-gradient overflow-hidden font-sans relative ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Moving Features: Neons of Leaves & Futuristic Overlays */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[radial-gradient(circle_at_top_right,_#40916c08_0%,_transparent_40%),radial-gradient(circle_at_bottom_left,_#D4A37308_0%,_transparent_40%)]">
        <FloatingLeaf x="15%" y="20%" size={120} delay={0} color="#2D6A4F20" />
        <FloatingLeaf x="85%" y="15%" size={180} delay={2} color="#40916C15" />
        <FloatingLeaf x="75%" y="80%" size={140} delay={5} color="#D4A37310" />
        <FloatingLeaf x="20%" y="75%" size={160} delay={8} color="#2D6A4F10" />
        <FloatingLeaf x="50%" y="45%" size={200} delay={4} color="#40916C08" />
        
        {/* Futuristic Scanning Lines / Overlays */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(45,106,79,0.1)_1px,_transparent_1px),linear-gradient(90deg,rgba(45,106,79,0.1)_1px,_transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <motion.div 
           animate={{ 
             backgroundPosition: ['0% 0%', '0% 100%'] 
           }}
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(transparent_0%,rgba(45,106,79,1)_50%,transparent_100%)] bg-[length:100%_400px] pointer-events-none"
        />
      </div>

      {/* Visual Overlay for Depth */}
      <div className="absolute inset-0 pointer-events-none opacity-20 agritech-overlay" />

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
          width: isMobile ? (isSidebarOpen ? "85%" : 0) : (isSidebarOpen ? 400 : 0),
          opacity: isSidebarOpen ? 1 : 0,
          x: isMobile && !isSidebarOpen ? (isRTL ? 400 : -400) : 0
        }}
        style={{ right: isRTL && isMobile ? 0 : 'auto', left: !isRTL && isMobile ? 0 : 'auto' }}
        className={`bg-white/90 backdrop-blur-3xl border-r border-brand/10 flex flex-col shadow-2xl z-[70] ${
          isMobile ? "fixed inset-y-0" : "relative"
        }`}
      >
        <div className="p-10 md:p-12 flex items-center justify-between">
          <Logo />
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-3 bg-brand/5 rounded-2xl text-deep-green">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-8 py-6 md:py-10 space-y-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                if (isMobile) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-5 px-8 py-5 rounded-[24px] transition-all duration-700 group relative overflow-hidden ${
                activeTab === item.id 
                  ? "bg-brand text-white shadow-[0_15px_35px_rgba(45,106,79,0.25)]" 
                  : "text-slate-500 hover:bg-brand/5 hover:text-deep-green"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? "text-white" : "text-brand/40"}`} />
              <span className={`font-black text-[13px] uppercase tracking-[0.3em] ${activeTab === item.id ? "translate-x-2" : ""} transition-transform`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="sidebarActive"
                  className="absolute left-0 top-4 bottom-4 w-1.5 bg-white rounded-full" 
                />
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-10 border-t border-brand/5 space-y-8">
           <div className="flex items-center gap-4">
             <button 
               onClick={toggleTheme}
               className="flex-1 p-5 bg-brand/5 rounded-2xl flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest transition-all text-deep-green border border-brand/10 hover:bg-brand/10"
             >
               {theme === 'light' ? <Moon className="w-5 h-5 text-accent" /> : <Sun className="w-5 h-5 text-accent" />}
               {theme === 'light' ? 'NIGHT NODE' : 'DAY NODE'}
             </button>
             
             <button 
               onClick={() => auth.signOut()}
               className="p-5 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-2xl border border-rose-500/10"
               title="Emergency Termination"
             >
               <LogOut className="w-5 h-5" />
             </button>
           </div>

           <div className="relative">
             <button 
               onClick={() => setShowLangMenu(!showLangMenu)}
               className="w-full p-5 bg-white border border-brand/10 rounded-2xl flex items-center justify-between text-[11px] font-black uppercase tracking-widest transition-all text-slate-500 hover:border-brand/40 shadow-sm"
             >
               <div className="flex items-center gap-4">
                 <Globe className="w-5 h-5 text-brand" />
                 <span>LOCALE</span>
               </div>
               <span className="text-deep-green">{locale.toUpperCase()}</span>
             </button>

             <AnimatePresence>
               {showLangMenu && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute bottom-full left-0 right-0 mb-4 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[100] max-h-[300px] flex flex-col backdrop-blur-3xl"
                 >
                   <div className="p-4 border-b border-white/5">
                     <input 
                       type="text" 
                       placeholder="Filter protocols..."
                       value={searchLang}
                       onChange={(e) => setSearchLang(e.target.value)}
                       className="w-full p-3 bg-white/5 rounded-xl text-[10px] font-bold text-white focus:ring-1 focus:ring-brand outline-none"
                     />
                   </div>
                   <div className="overflow-y-auto custom-scrollbar p-2">
                     {filteredLanguages.map((l) => (
                       <button
                         key={l.code}
                         onClick={() => {
                           setLocale(l.code);
                           setShowLangMenu(false);
                         }}
                         className={`w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-colors rounded-xl mb-1 ${
                           locale === l.code 
                             ? 'bg-brand text-slate-950' 
                             : 'text-slate-500 hover:bg-white/5 hover:text-white'
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
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-3xl px-6 md:px-16 py-6 md:py-12 flex items-center justify-between border-b border-brand/5">
          <div className="flex items-center gap-8 md:gap-12">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-4 bg-brand/5 text-brand hover:bg-brand hover:text-white rounded-2xl border border-brand/10 transition-all btn-press group"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-brand uppercase tracking-[0.6em] hidden md:block mb-2">Protocol Interface</span>
              <h1 className="text-3xl md:text-6xl font-black text-deep-green tracking-tighter leading-none capitalize">
                {t(activeTab)}.
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6 md:gap-12">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[15px] font-black text-deep-green tracking-tight">{profile?.fullName}</span>
              <span className="text-[10px] font-black text-brand-light uppercase tracking-[0.4em] mt-1">{profile?.subscriptionStatus} NODE</span>
            </div>
            <div 
              onClick={() => setActiveTab("account")}
              className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-brand to-accent p-[3px] rounded-[32px] cursor-pointer hover:rotate-6 transition-all duration-700 group shadow-lg"
            >
               <div className="w-full h-full bg-white rounded-[29px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xl md:text-3xl font-black text-brand relative z-10">
                    {profile?.fullName[0]}
                  </span>
               </div>
            </div>
          </div>
        </header>

        <div className="px-6 md:px-16 pb-32 md:pb-20 pt-12 flex-1 relative z-10 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 border-t border-brand/10 px-10 py-6 flex items-center justify-between backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
            {[
              { id: "dashboard", icon: Activity, label: "Core" },
              { id: "doctor", icon: Search, label: "Scan" },
              { id: "tracker", icon: Leaf, label: "Bio" },
              { id: "tasks", icon: ListChecks, label: "Intel" },
              { id: "account", icon: User, label: "Node" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`flex flex-col items-center gap-2 transition-all relative ${
                  activeTab === item.id ? "text-brand" : "text-slate-400"
                }`}
              >
                <item.icon className={`w-7 h-7 ${activeTab === item.id ? "drop-shadow-[0_0_12px_rgba(45,106,79,0.3)]" : ""}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {item.label}
                </span>
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="mobileNavActive"
                    className="absolute -top-3 w-10 h-1.5 bg-brand rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>
        )}
      </main>
    </div>
  );
}
