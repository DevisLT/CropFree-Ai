import React, { useEffect, useState } from "react";
import { Cloud, Thermometer, Droplets, Wind, Sun, CloudRain, SunMedium, Navigation, Leaf, RefreshCcw, AlertTriangle, Sparkles } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-6">
        <div className="w-24 h-1 bg-brand/10 rounded-full overflow-hidden">
          <motion.div 
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1/2 h-full bg-brand"
          />
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('sync_weather') || "Synchronizing Live Weather Feed..."}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-xl border border-rose-100 shadow-soft max-w-lg mx-auto">
        <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center border border-rose-100 mb-6">
          <AlertTriangle className="w-6 h-6 text-rose-500" />
        </div>
        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-bold text-slate-900">{t('weather_unreachable')}</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {error.includes("key not configured") 
              ? t('weather_not_configured') 
              : error}
          </p>
        </div>
        <button 
          onClick={fetchWeather}
          className="px-5 py-2.5 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand-deep transition-colors shadow-soft"
        >
          {t('retry_connection')}
        </button>
      </div>
    );
  }

  if (!data) return null;

  const current = data.current;
  const location = data.location;
  const forecastDay = data.forecast.forecastday;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 px-2 font-sans text-left">
      <header className="space-y-1 mb-2">
         <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{t('meteorological_feed')}</span>
         <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t('atmospheric_conditions')}</h2>
         <p className="text-sm text-slate-500 font-medium max-w-xl">
           {t('weather_intro_desc')}
         </p>
      </header>

      {/* Weather Hero Card */}
      <div className="premium-card p-6 bg-[#18211D] text-white relative overflow-hidden rounded-xl shadow-premium group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 sm:gap-12">
            <div className="text-left">
               <div className="flex items-center gap-2 text-[#C8A96B] mb-6 uppercase tracking-wider font-bold text-xs">
                  <Navigation className="w-3.5 h-3.5 animate-bounce" />
                  {location.name}, {location.country === "Rwanda" && t('locale') === 'rw' ? "Rwanda" : location.country}
               </div>
               <div className="flex items-baseline gap-3 mb-6">
                  <h2 className="text-5xl sm:text-7xl font-extrabold leading-none tracking-tight">{Math.round(current.temp_c)}°</h2>
                  <span className="text-base font-bold text-[#8FBFA8]">{t('celsius')}</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-wide rounded-md">
                     {current.condition.text}
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                     <span className="text-white/40 text-[9px] font-semibold uppercase tracking-wider">{t('live_station_link')}</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6 md:gap-8 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
               {[
                 { label: t('max_min'), value: `${Math.round(forecastDay[0].day.maxtemp_c)}° / ${Math.round(forecastDay[0].day.mintemp_c)}°`, icon: Thermometer },
                 { label: t('air_humidity'), value: `${current.humidity}%`, icon: Droplets },
                 { label: t('wind_velocity'), value: `${Math.round(current.wind_kph)} km/h`, icon: Wind },
                 { label: t('rain_forecast'), value: `${Math.round(forecastDay[0].day.daily_chance_of_rain)}%`, icon: CloudRain }
               ].map((stat, i) => (
                 <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2 text-white/40 uppercase tracking-wider font-bold text-[9px]">
                       <stat.icon className="w-3.5 h-3.5 text-[#C8A96B]" />
                       {stat.label}
                    </div>
                    <p className="text-lg font-bold text-white tracking-tight">{stat.value}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Farming Advice Statement */}
      <div className="premium-card p-5 bg-white border border-[#EAEFED] backdrop-blur-3xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-soft rounded-xl">
         <div className="w-10 h-10 bg-brand/5 border border-brand/20 rounded-lg flex items-center justify-center flex-shrink-0 relative">
            <Leaf className="text-brand w-4 h-4" />
         </div>
         <div className="text-center sm:text-left flex-1 space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#C8A96B]">{t('weekly_strategy')}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">{t('environmental_advisor')}</h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed font-semibold">
               {current.humidity > 80 ? t('weather_advice_humidity') : 
                current.temp_c > 30 ? t('weather_advice_temp') :
                forecastDay[0].day.daily_chance_of_rain > 50 ? t('weather_advice_rain') :
                t('weather_advice_perfect')}
            </div>
         </div>
      </div>

      {/* Weekly Forecast Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
         {forecastDay.map((f: any, i: number) => {
           const Icon = getIcon(f.day.condition.text);
           const date = new Date(f.date);
           const dayName = i === 0 ? t('today') : date.toLocaleDateString(t('locale') === 'rw' ? 'rw-RW' : 'en-US', { weekday: 'short' });
           
           return (
             <div 
               key={i} 
               className="premium-card p-4 text-center bg-white border border-[#EAEFED] rounded-xl shadow-soft"
             >
                 <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mb-3">{dayName}</p>
                 <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                   <Icon className="w-4 h-4 text-brand" />
                 </div>
                 <p className="text-sm font-bold text-slate-800">{Math.round(f.day.avgtemp_c)}°C</p>
                 <span className="text-[8.5px] font-semibold text-slate-400 block mt-1 truncate">{f.day.condition.text}</span>
             </div>
           );
         })}
      </div>
    </div>
  );
}
