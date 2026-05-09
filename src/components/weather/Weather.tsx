import React, { useEffect, useState } from "react";
import { Cloud, Thermometer, Droplets, Wind, Sun, CloudRain, SunMedium, Navigation, Leaf, RefreshCcw, AlertTriangle, Terminal, Zap, Shield, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../../contexts/LanguageContext";

const getIcon = (condition: string) => {
  const cond = condition.toLowerCase();
  if (cond.includes("sunny") || cond.includes("clear")) return Sun;
  if (cond.includes("patchy rain") || cond.includes("rain") || cond.includes("mist") || cond.includes("drizzle")) return CloudRain;
  if (cond.includes("cloudy") || cond.includes("overcast")) return Cloud;
  if (cond.includes("partly cloudy")) return SunMedium;
  return Cloud;
};

export default function Weather() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/weather?city=Kigali");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch weather data");
      }
      const weatherData = await response.json();
      setData(weatherData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-12">
        <div className="w-40 h-2 bg-brand/10 rounded-full overflow-hidden">
          <motion.div 
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-1/2 h-full bg-brand shadow-[0_0_20px_#2D6A4F]"
          />
        </div>
        <p className="font-black text-brand uppercase tracking-[0.6em] text-[11px]">Synchronizing Biosphere Hub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-12 p-16 text-center bg-white/40 rounded-[64px] border border-rose-100 mx-6 shadow-2xl backdrop-blur-3xl">
        <div className="w-32 h-32 bg-rose-50 rounded-[40px] flex items-center justify-center border border-rose-100 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-rose-500 animate-pulse rounded-full" />
          <AlertTriangle className="w-16 h-16 text-rose-500 group-hover:scale-125 transition-transform" />
        </div>
        <div className="space-y-6">
          <h3 className="text-5xl font-black text-rose-500 tracking-tighter uppercase leading-none">Telemetry Link Failure.</h3>
          <p className="text-slate-400 font-bold max-w-sm mx-auto uppercase text-[12px] tracking-[0.3em] leading-relaxed">
            {error.includes("key not configured") 
              ? "Biosphere uplink authentication failed. Contact systems administrator for credential verification." 
              : error}
          </p>
        </div>
        <button 
          onClick={fetchWeather}
          className="px-16 py-8 bg-white text-deep-green border border-slate-200 rounded-full font-black text-xs uppercase tracking-widest hover:scale-110 hover:border-brand active:scale-95 transition-all shadow-2xl"
        >
          Re-initialize Data Link
        </button>
      </div>
    );
  }

  if (!data) return null;

  const current = data.current;
  const location = data.location;
  const forecastDay = data.forecast.forecastday;

  return (
    <div className="max-w-7xl mx-auto space-y-20 py-12 px-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
         <div>
            <div className="flex items-center gap-6 mb-6">
              <div className="h-[2px] w-16 bg-brand/30" />
              <span className="text-[12px] font-black uppercase tracking-[0.7em] text-brand">Satellite Bio-Data Stream</span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-deep-green leading-none drop-shadow-sm uppercase">Atmospheric.</h2>
            <p className="text-slate-500 text-lg md:text-2xl lg:text-3xl font-medium mt-10 leading-relaxed max-w-4xl">
              "Mapping thermal gradients and humidity thresholds for genetic optimization. Precision biosphere monitoring active."
            </p>
         </div>
         <div className="flex items-center gap-6 text-slate-400 font-black uppercase tracking-[0.5em] text-[11px]">
           <Terminal className="w-6 h-6 text-brand" /> STATION: 042-ALPHA
         </div>
      </header>

      {/* City Hero */}
      <div className="premium-card p-16 md:p-32 bg-deep-green text-white relative overflow-hidden shadow-2xl rounded-[80px] border border-white/5 group">
         <div className="absolute top-0 right-0 w-[90%] h-full bg-brand/10 rounded-full blur-[180px] transition-all duration-[4s] group-hover:bg-brand/20" />
         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-[150px]" />
         
         <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-24 md:gap-32">
            <div className="text-center xl:text-left">
               <div className="flex items-center justify-center xl:justify-start gap-6 text-brand mb-14 uppercase tracking-[0.6em] font-black text-sm">
                  <Navigation className="w-6 h-6 animate-bounce" />
                  {location.name} <span className="opacity-30">|</span> {location.country}
               </div>
               <div className="flex items-baseline justify-center xl:justify-start gap-8 mb-12">
                  <h2 className="text-7xl md:text-9xl lg:text-[12rem] font-black leading-none tracking-tighter drop-shadow-2xl">{Math.round(current.temp_c)}°</h2>
                  <span className="text-2xl md:text-4xl lg:text-5xl font-black text-brand leading-none">CELSIUS</span>
               </div>
               <div className="flex flex-col md:flex-row items-center justify-center xl:justify-start gap-10">
                 <div className="px-10 py-4 bg-brand text-deep-green text-sm font-black uppercase tracking-[0.4em] rounded-full shadow-2xl border-2 border-white/20">
                    {current.condition.text}
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-brand rounded-full animate-pulse shadow-[0_0_15px_#00ff88]" />
                    <span className="text-white/40 text-[11px] font-black uppercase tracking-[0.6em]">Telemetry Locked</span>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-16 md:gap-24 border-t xl:border-t-0 xl:border-l border-white/10 pt-24 xl:pt-0 xl:pl-28">
               {[
                 { label: "High / Low Range", value: `${Math.round(forecastDay[0].day.maxtemp_c)}° / ${Math.round(forecastDay[0].day.mintemp_c)}°`, icon: Thermometer },
                 { label: "Saturation Index", value: `${current.humidity}%`, icon: Droplets },
                 { label: "Kinetic Vector", value: `${Math.round(current.wind_kph)} KM/H`, icon: Wind },
                 { label: "Bio-Precipitation", value: `${Math.round(forecastDay[0].day.daily_chance_of_rain)}%`, icon: CloudRain }
               ].map((stat, i) => ( stat.icon &&
                 <div key={i} className="space-y-6 group/stat">
                    <div className="flex items-center gap-6 text-white/20 group-hover/stat:text-brand transition-all duration-700 uppercase tracking-[0.5em] font-black text-[11px]">
                       <stat.icon className="w-7 h-7" />
                       {stat.label}
                    </div>
                    <p className="text-5xl md:text-7xl font-black text-white tracking-tighter whitespace-nowrap group-hover/stat:translate-x-4 transition-transform duration-700">{stat.value}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Advice Card */}
      <div className="premium-card p-16 md:p-24 bg-white/40 border border-white/60 backdrop-blur-3xl flex flex-col xl:flex-row items-center xl:items-start gap-16 shadow-2xl rounded-[64px] group transition-all duration-1000 hover:scale-[1.02]">
         <div className="w-32 h-32 bg-brand/5 border border-brand/20 rounded-[48px] flex items-center justify-center flex-shrink-0 relative shadow-xl">
            <div className="absolute inset-0 bg-brand/10 blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
            <Leaf className="text-brand w-16 h-16 relative z-10 animate-pulse" />
         </div>
         <div className="text-center xl:text-left flex-1 space-y-8">
            <div className="flex items-center justify-center xl:justify-start gap-6">
              <Sparkles className="w-6 h-6 text-brand" />
              <span className="text-[12px] font-black uppercase tracking-[0.6em] text-brand">Heuristic Growth Analysis</span>
            </div>
            <h4 className="text-3xl md:text-5xl font-black text-deep-green tracking-tighter leading-tight uppercase">Environmental Synthesis.</h4>
            <div className="p-10 bg-white/60 rounded-[40px] border border-white/80 shadow-inner">
               <p className="text-lg md:text-2xl font-semibold text-slate-500 leading-relaxed max-w-5xl">
                  "{current.humidity > 80 ? "Critical atmospheric saturation detected. Hyper-hydric stress imminent. Execute preventive antifungal protocols immediately." : 
                   current.temp_c > 30 ? "Maximum thermal threshold exceeded. Bio-luminescent activity peaked. Initiate high-density cooling sequence for cellular stability." :
                   forecastDay[0].day.daily_chance_of_rain > 50 ? "Hydro-sequence incoming. Discontinue artificial watering cycles to maintain root integrity and prevent saturation." :
                   "Atmospheric variables in perfect alignment. Biosphere maintaining standard vegetative expansion sequence."}"
               </p>
            </div>
         </div>
      </div>

      {/* Forecast */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 md:gap-12 pb-24">
         {forecastDay.map((f: any, i: number) => {
           const Icon = getIcon(f.day.condition.text);
           const date = new Date(f.date);
           const dayName = i === 0 ? "Present" : date.toLocaleDateString('en-US', { weekday: 'long' });
           
           return (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
               className="premium-card p-12 md:p-20 text-center hover:scale-110 transition-all duration-1000 cursor-pointer bg-white/20 group border border-white/60 rounded-[56px] hover:border-brand/40 shadow-2xl backdrop-blur-2xl"
             >
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em] mb-14 group-hover:text-brand transition-colors">{dayName}</p>
                <div className="w-32 h-32 bg-white/60 rounded-[32px] flex items-center justify-center mx-auto mb-14 border border-white group-hover:bg-brand group-hover:border-white transition-all duration-700 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-brand/5 blur-2xl group-hover:opacity-100 opacity-0 transition-opacity" />
                  <Icon className="w-16 h-16 text-slate-400 group-hover:text-white transition-all relative z-10" />
                </div>
                <p className="text-4xl md:text-6xl font-black text-deep-green tracking-tighter leading-none">{Math.round(f.day.avgtemp_c)}°</p>
             </motion.div>
           );
         })}
      </div>
      
      <div className="flex flex-col items-center pt-24 pb-12">
         <div className="flex items-center gap-8 text-slate-300 font-black uppercase tracking-[0.8em] text-[12px]">
           <div className="w-2.5 h-2.5 bg-brand rounded-full shadow-[0_0_15px_#00ff88]" />
           Biosphere Telemetry Nominal
         </div>
      </div>
    </div>
  );
}
