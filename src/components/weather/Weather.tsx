import React from "react";
import { Cloud, Thermometer, Droplets, Wind, Sun, CloudRain, SunMedium, Navigation } from "lucide-react";

export default function Weather() {
  const current = { temp: 24, high: 28, low: 18, hum: 65, wind: 12, cond: "Partly Cloudy" };
  
  const forecast = [
    { day: "Today", temp: 24, icon: Cloud },
    { day: "Tue", temp: 26, icon: Sun },
    { day: "Wed", temp: 22, icon: CloudRain },
    { day: "Thu", temp: 25, icon: SunMedium },
    { day: "Fri", temp: 27, icon: Sun },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-4 md:py-8 px-2 md:px-0">
      {/* City Hero */}
      <div className="premium-card p-6 md:p-12 bg-gradient-to-br from-indigo-600 via-brand to-indigo-800 text-white relative overflow-hidden">
         <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[150%] bg-white/10 rounded-full blur-[100px] rotate-[-20deg]" />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12">
            <div className="text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-2 text-white/70 mb-4">
                  <Navigation className="w-4 h-4 fill-white/70" />
                  <span className="text-xs md:text-sm font-bold uppercase tracking-widest">Kigali, Rwanda</span>
               </div>
               <h2 className="text-6xl md:text-8xl font-black mb-2 leading-none tracking-tighter">24°</h2>
               <p className="text-xl md:text-2xl font-medium text-white/80">{current.cond}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-8 text-neutral-100">
               <div className="space-y-1">
                  <div className="flex items-center gap-2 opacity-60">
                     <Thermometer className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-widest">High / Low</span>
                  </div>
                  <p className="text-xl font-bold">{current.high}° / {current.low}°</p>
               </div>
               <div className="space-y-1">
                  <div className="flex items-center gap-2 opacity-60">
                     <Droplets className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-widest">Humidity</span>
                  </div>
                  <p className="text-xl font-bold">{current.hum}%</p>
               </div>
               <div className="space-y-1">
                  <div className="flex items-center gap-2 opacity-60">
                     <Wind className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-widest">Wind Speed</span>
                  </div>
                  <p className="text-xl font-bold">{current.wind} km/h</p>
               </div>
               <div className="space-y-1">
                  <div className="flex items-center gap-2 opacity-60">
                     <CloudRain className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-widest">Rain Chance</span>
                  </div>
                  <p className="text-xl font-bold">15%</p>
               </div>
            </div>
         </div>
      </div>

      {/* Advice Card */}
      <div className="premium-card p-6 md:p-8 bg-green-50 border-green-100 flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
         <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
            <Leaf className="text-white w-6 h-6 md:w-8 md:h-8" />
         </div>
         <div className="text-center sm:text-left">
            <h4 className="text-lg md:text-xl font-bold text-green-900 mb-1">Farming Advice</h4>
            <p className="text-sm md:text-base text-green-700 leading-relaxed">
               Optimal conditions for irrigation. Soil moisture is currently stable. We recommend applying fertilizer before the expected rainfall on Wednesday.
            </p>
         </div>
      </div>

      {/* Forecast */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
         {forecast.map((f, i) => (
           <div key={i} className={`premium-card p-4 md:p-6 text-center hover:scale-105 transition-transform cursor-pointer ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
              <p className="text-[10px] md:text-xs font-bold text-neutral-400 mb-2 md:mb-4">{f.day}</p>
              <f.icon className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 md:mb-4 text-brand" />
              <p className="text-xl md:text-2xl font-black">{f.temp}°</p>
           </div>
         ))}
      </div>
    </div>
  );
}

function Leaf(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 3.5 1.1 7.9A7 7 0 0 1 11 20Z"/><path d="M19 2c-5 2-6 3-10 10"/></svg>; }
