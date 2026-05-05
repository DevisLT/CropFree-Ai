import React, { useEffect, useState } from "react";
import { Cloud, Thermometer, Droplets, Wind, Sun, CloudRain, SunMedium, Navigation, Leaf, RefreshCcw, AlertTriangle } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCcw className="w-8 h-8 text-brand animate-spin" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Synchronizing Atmospheric Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8 text-center bg-rose-50 rounded-[48px] border border-rose-100 mx-4">
        <div className="w-16 h-16 bg-rose-100 rounded-[28px] flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-rose-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-rose-900 tracking-tighter">Atmospheric Link Failure.</h3>
          <p className="text-rose-600 font-medium max-w-sm mx-auto">
            {error.includes("key not configured") 
              ? "The weather telemetry system has no active uplink. Please configure the WEATHER_API_KEY in the environment settings." 
              : error}
          </p>
        </div>
        <button 
          onClick={fetchWeather}
          className="px-8 py-4 bg-rose-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-900/20"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!data) return null;

  const current = data.current;
  const location = data.location;
  const forecastDay = data.forecast.forecastday;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-4 md:py-8 px-2 md:px-0">
      {/* City Hero */}
      <div className="premium-card p-10 md:p-16 bg-slate-950 text-white relative overflow-hidden border-none shadow-2xl shadow-slate-950/20">
         <div className="absolute top-0 right-0 w-[60%] h-full bg-brand/10 rounded-full blur-[100px]" />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
            <div className="text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-3 text-white/40 mb-6 uppercase tracking-[0.3em] font-black text-[10px]">
                  <Navigation className="w-4 h-4 fill-brand stroke-brand" />
                  {location.name}, {location.country}
               </div>
               <div className="flex items-baseline justify-center md:justify-start gap-4 mb-4">
                  <h2 className="text-8xl md:text-[10rem] font-black leading-none tracking-tighter">{Math.round(current.temp_c)}°</h2>
                  <span className="text-xl md:text-2xl font-bold text-white/40">C</span>
               </div>
               <p className="text-2xl md:text-3xl font-black text-brand">{current.condition.text}</p>
            </div>

            <div className="grid grid-cols-2 gap-10 md:gap-14 border-t md:border-t-0 md:border-l border-white/10 pt-10 md:pt-0 md:pl-14">
               <div className="space-y-2">
                  <div className="flex items-center gap-3 text-white/30 uppercase tracking-widest font-black text-[9px]">
                     <Thermometer className="w-3 h-3" />
                     Max / Min
                  </div>
                  <p className="text-3xl font-black">{Math.round(forecastDay[0].day.maxtemp_c)}° <span className="opacity-30">/ {Math.round(forecastDay[0].day.mintemp_c)}°</span></p>
               </div>
               <div className="space-y-2">
                  <div className="flex items-center gap-3 text-white/30 uppercase tracking-widest font-black text-[9px]">
                     <Droplets className="w-3 h-3" />
                     Humidity
                  </div>
                  <p className="text-3xl font-black">{current.humidity}%</p>
               </div>
               <div className="space-y-2">
                  <div className="flex items-center gap-3 text-white/30 uppercase tracking-widest font-black text-[9px]">
                     <Wind className="w-3 h-3" />
                     Wind
                  </div>
                  <p className="text-3xl font-black">{Math.round(current.wind_kph)} <span className="text-xs uppercase opacity-30">km/h</span></p>
               </div>
               <div className="space-y-2">
                  <div className="flex items-center gap-3 text-white/30 uppercase tracking-widest font-black text-[9px]">
                     <CloudRain className="w-3 h-3" />
                     Precip.
                  </div>
                  <p className="text-3xl font-black">{Math.round(forecastDay[0].day.daily_chance_of_rain)}%</p>
               </div>
            </div>
         </div>
      </div>

      {/* Advice Card */}
      <div className="premium-card p-10 bg-white border-brand/20 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-xl">
         <div className="w-20 h-20 bg-brand/10 rounded-[32px] flex items-center justify-center flex-shrink-0">
            <Leaf className="text-brand w-10 h-10" />
         </div>
         <div className="text-center md:text-left flex-1 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand">{t('farming_advice') || 'Biometric Intel'}</span>
            <h4 className="text-3xl font-black text-slate-950 tracking-tighter">Optimal Growing Window</h4>
            <p className="text-lg font-medium text-slate-500 leading-relaxed">
               {current.humidity > 80 ? "High atmospheric moisture detected. Monitor for fungal pathogens." : 
                current.temp_c > 30 ? "High temperature stress protocol advised. Consistent irrigation required." :
                forecastDay[0].day.daily_chance_of_rain > 50 ? "Precipitation event imminent. Defer manual irrigation cycles." :
                "Stable conditions detected. Continue standard maintenance protocols."}
            </p>
         </div>
      </div>

      {/* Forecast */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
         {forecastDay.map((f: any, i: number) => {
           const Icon = getIcon(f.day.condition.text);
           const date = new Date(f.date);
           const dayName = i === 0 ? "Today" : date.toLocaleDateString('en-US', { weekday: 'short' });
           
           return (
             <div key={i} className="premium-card p-10 text-center hover:scale-105 transition-all cursor-pointer bg-white group border-none shadow-premium">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">{dayName}</p>
                <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 group-hover:bg-brand/10 transition-colors">
                  <Icon className="w-10 h-10 text-slate-300 group-hover:text-brand transition-colors" />
                </div>
                <p className="text-4xl font-black text-slate-950">{Math.round(f.day.avgtemp_c)}°</p>
             </div>
           );
         })}
      </div>
    </div>
  );
}
