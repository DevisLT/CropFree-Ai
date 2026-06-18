import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle, 
  Search, Globe, Copy, Check, Terminal, Play, Sparkles, ArrowRight, Eye, RefreshCw
} from "lucide-react";
import { Locale, supportedLanguages, translations } from "../../contexts/LanguageContext";
import { aiService } from "../../services/aiService";
import toast from "react-hot-toast";

interface AuditMetric {
  langCode: Locale;
  langName: string;
  totalKeys: number;
  translatedCount: number;
  missingCount: number;
  untranslatedWarnings: number; // Identical to English (excluding proper nouns / abbreviations)
  completionRate: number;
  missingKeys: string[];
  warningKeys: string[];
}

export default function LocalizationAuditHub() {
  const [selectedAuditLang, setSelectedAuditLang] = useState<Locale>("rw");
  const [searchQuery, setSearchQuery] = useState("");
  const [simKey, setSimKey] = useState("crop_doctor");
  const [customTextTranslate, setCustomTextTranslate] = useState("");
  const [translatedCustomText, setTranslatedCustomText] = useState("");
  const [isTranslatingText, setIsTranslatingText] = useState(false);
  const [isCopying, setIsCopying] = useState<string | null>(null);
  const [suggestedTranslations, setSuggestedTranslations] = useState<Record<string, string> | null>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  // Common proper nouns, abbreviations, or codes that are expected to be identical to English
  const EXPECTED_IDENTICAL = new Set([
    "en", "fr", "pt", "ar", "es", "zh", "hi", "rw", "sw", "am", "ha", "yo", "zu", "ig",
    "98%", "24/7", "01 / The Mission", "02 / Guhanga Udushya", "03 / Reliability",
    "24°", "26°C", "65%", "pH", "782-Sigma", "MoMo", "$2.99", "2.4", "GPS", "CropFree", "AI"
  ]);

  const runAudit = (): AuditMetric[] => {
    const enKeys = Object.keys(translations.en);
    const totalCount = enKeys.length;

    return supportedLanguages.map(lang => {
      const langTrans = translations[lang.code] || {};
      const missingKeys: string[] = [];
      const warningKeys: string[] = [];
      let translatedCount = 0;

      enKeys.forEach(key => {
        const hasKey = langTrans[key] !== undefined;
        if (!hasKey) {
          missingKeys.push(key);
        } else {
          translatedCount++;
          const val = langTrans[key];
          const enVal = translations.en[key];
          
          if (
            lang.code !== "en" && 
            val === enVal && 
            !EXPECTED_IDENTICAL.has(enVal) &&
            !key.toLowerCase().includes("logo") &&
            !key.toLowerCase().includes("station") &&
            !key.toLowerCase().includes("date")
          ) {
            warningKeys.push(key);
          }
        }
      });

      const completionRate = Math.round((translatedCount / totalCount) * 100);

      return {
        langCode: lang.code,
        langName: lang.name,
        totalKeys: totalCount,
        translatedCount,
        missingCount: missingKeys.length,
        untranslatedWarnings: warningKeys.length,
        completionRate,
        missingKeys,
        warningKeys
      };
    });
  };

  const auditData = runAudit();
  const currentAudit = auditData.find(d => d.langCode === selectedAuditLang) || auditData[0];

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopying(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setIsCopying(null), 2000);
  };

  const handleTranslateCustomText = async () => {
    if (!customTextTranslate.trim()) return;
    setIsTranslatingText(true);
    try {
      const response = await aiService.askCoach(
        `Please translate the following string precisely. Maintain any symbols, numbers, and variables (e.g. {t(...)}) if they exist: "${customTextTranslate}"`,
        [],
        selectedAuditLang
      );
      setTranslatedCustomText(response);
    } catch (e) {
      toast.error("Failed to translate via Gemini API.");
    } finally {
      setIsTranslatingText(false);
    }
  };

  const generateAIPatches = async () => {
    if (currentAudit.missingCount === 0) {
      toast.success("No missing translations to patch!");
      return;
    }

    setIsGeneratingSuggestions(true);
    setSuggestedTranslations(null);
    try {
      const keysToPatch = currentAudit.missingKeys.slice(0, 15); // Limit batch size for safety and fast answer
      const keysWithSource = keysToPatch.map(k => `"${k}": "${translations.en[k]}"`).join(",\n  ");
      const prompt = `You are a professional software translation assistant specializing in agricultural terminology.
Translate the following English key-value dictionary into the language "${currentAudit.langName}" (ISO Code: "${currentAudit.langCode}").
Maintain exactly same agricultural meaning, tone, and casing. Keep explanations simple, humble, and standard.

Source Dictionary (English):
{
  ${keysWithSource}
}

Return ONLY the translated entries as a valid JSON object structure, with no markdown code blocks, explanations, or metadata.`;

      const responseText = await aiService.askCoach(prompt, [], "English");
      let cleaned = responseText;
      if (cleaned.includes("```json")) {
        cleaned = cleaned.split("```json")[1].split("```")[0].trim();
      } else if (cleaned.includes("```")) {
        cleaned = cleaned.split("```")[1].split("```")[0].trim();
      }
      const data = JSON.parse(cleaned.trim());
      setSuggestedTranslations(data);
      toast.success("AI suggested patches generated!");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate translation suggestions. Please verify your Gemini API key.");
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  return (
    <div className="space-y-8 bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 md:p-8 mt-12 shadow-2xl relative overflow-hidden font-sans text-left">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 blur-[120px] pointer-events-none" />
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-6 relative z-10">
         <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-brand border border-brand/20 px-3 py-1 rounded-full bg-brand/5 inline-block">
               Quality Audit Node
            </span>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase">localization compliance hub</h3>
            <p className="text-sm font-medium text-slate-400">
               Automated diagnostics and compliance checks across all 14 supported agricultural dictionaries.
            </p>
         </div>
         <div className="flex items-center gap-2">
            <Globe className="w-10 h-10 text-brand opacity-80" />
         </div>
      </div>

      {/* Grid of cards with completion rate */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
         {auditData.map(metric => (
            <button
               key={metric.langCode}
               onClick={() => {
                 setSelectedAuditLang(metric.langCode);
                 setSuggestedTranslations(null);
               }}
               type="button"
               className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left h-24 ${
                 selectedAuditLang === metric.langCode 
                   ? 'bg-brand border-brand text-slate-950 shadow-lg shadow-brand/10' 
                   : 'bg-white/5 border-white/[0.05] hover:border-white/10 hover:bg-white/10 text-white'
               }`}
            >
               <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-black uppercase tracking-wider block truncate max-w-[70%]">
                     {metric.langName}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                    selectedAuditLang === metric.langCode ? 'bg-slate-950 text-brand' : 'bg-white/10 text-white/60'
                  }`}>
                     {metric.langCode}
                  </span>
               </div>
               
               <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                     <span className="text-lg md:text-xl font-black tracking-tight leading-none">
                        {metric.completionRate}%
                     </span>
                     <span className="text-[9px] font-bold opacity-60">
                        {metric.translatedCount}/{metric.totalKeys}
                     </span>
                  </div>
                  {/* Small progress meter */}
                  <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                     <div 
                        style={{ width: `${metric.completionRate}%` }} 
                        className={`h-full ${selectedAuditLang === metric.langCode ? 'bg-slate-950' : 'bg-brand'}`} 
                     />
                  </div>
               </div>
            </button>
         ))}
      </div>

      {/* Audit findings layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
         {/* Findings Details Column */}
         <div className="lg:col-span-8 space-y-6">
            <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-6">
               <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                     <Terminal className="w-5 h-5 text-brand" />
                     <h4 className="text-base font-black uppercase tracking-wider text-white">
                        Findings: {currentAudit.langName} ({currentAudit.langCode.toUpperCase()})
                     </h4>
                  </div>
                  
                  <div className="flex gap-2">
                     <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md text-[10px] font-black tracking-wider uppercase">
                        {currentAudit.missingCount} Missing
                     </span>
                     <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md text-[10px] font-black tracking-wider uppercase">
                        {currentAudit.untranslatedWarnings} Dup Warnings
                     </span>
                  </div>
               </div>

               {/* Stats bar */}
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/[0.05] flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                     <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Compliance Ratio</span>
                        <span className="text-lg font-black">{currentAudit.completionRate}% Verified</span>
                     </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/[0.05] flex items-center gap-3">
                     <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
                     <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Critical Failures</span>
                        <span className="text-lg font-black">{currentAudit.missingCount} Keys Missing</span>
                     </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/[0.05] flex items-center gap-3">
                     <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                     <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Suspicious Matches</span>
                        <span className="text-lg font-black">{currentAudit.untranslatedWarnings} Untranslated</span>
                     </div>
                  </div>
               </div>

               {/* Missing translation panel */}
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                     <h5 className="text-xs font-black text-brand uppercase tracking-wider">
                        Missing Dictionary Keys ({currentAudit.missingKeys.length})
                     </h5>
                     <span className="text-[10px] text-slate-400 font-bold">First 10 shown below</span>
                  </div>

                  {currentAudit.missingKeys.length > 0 ? (
                     <div className="max-h-[160px] overflow-y-auto border border-white/5 bg-slate-950/80 p-3 rounded-xl space-y-2 text-xs font-mono custom-scrollbar">
                        {currentAudit.missingKeys.slice(0, 10).map(key => (
                           <div key={key} className="flex justify-between items-center py-1.5 border-b border-white/5 hover:bg-white/5 px-2 rounded transition-colors group">
                              <span className="text-slate-300 font-semibold">{key}</span>
                              <div className="flex items-center gap-3">
                                 <span className="text-slate-500 italic max-w-[180px] md:max-w-[300px] truncate block text-[11px]">
                                    en: "{translations.en[key]}"
                                 </span>
                              </div>
                           </div>
                        ))}
                        {currentAudit.missingKeys.length > 10 && (
                           <p className="text-[10px] text-center text-slate-500 pt-1">
                              And {currentAudit.missingKeys.length - 10} more missing keys...
                           </p>
                        )}
                     </div>
                  ) : (
                     <div className="py-8 text-center bg-green-500/5 rounded-xl border border-green-500/10">
                        <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <h6 className="text-xs font-bold text-green-400 uppercase tracking-wider">100% Dictionary Compliance</h6>
                        <p className="text-[11px] text-slate-400 mt-1">This language matches English perfectly across all system labels!</p>
                     </div>
                  )}
               </div>

               {/* Untranslated / Suspicious duplicates panel */}
               {currentAudit.warningKeys.length > 0 && (
                  <div className="space-y-3 pt-2">
                     <div className="flex items-center justify-between">
                        <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                           <AlertTriangle className="w-3.5 h-3.5" /> Suspicious Duplicate Warnings ({currentAudit.warningKeys.length})
                        </h5>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                     </div>

                     <div className="max-h-[140px] overflow-y-auto border border-white/5 bg-slate-950/80 p-3 rounded-xl space-y-1.5 text-xs font-mono custom-scrollbar">
                        {currentAudit.warningKeys.slice(0, 8).map(key => (
                           <div key={key} className="flex justify-between items-center py-1 px-2 hover:bg-white/5 rounded group border-b border-white/[0.02]">
                              <span className="text-amber-400 font-semibold">{key}</span>
                              <span className="text-slate-500 text-[11px] font-medium max-w-[200px] md:max-w-[400px] truncate block">
                                 Value: "{translations[selectedAuditLang]?.[key]}"
                              </span>
                           </div>
                        ))}
                        {currentAudit.warningKeys.length > 8 && (
                           <p className="text-[10px] text-center text-slate-500 pt-1">
                              And {currentAudit.warningKeys.length - 8} other identical match markers.
                           </p>
                        )}
                     </div>
                  </div>
               )}
            </div>

            {/* AI assisted translation suggestion component */}
            <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-6">
               <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                     <Sparkles className="w-5 h-5 text-brand" />
                     <h4 className="text-base font-black uppercase tracking-wider text-white">AI Diagnostic Auto-Repair</h4>
                  </div>
               </div>

               <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Select a language dictionary above and request the precision Gemini model to construct valid dictionary patches. You can copy-paste this direct replacement directly into the workspace.
               </p>

               <div className="flex flex-wrap gap-4 items-center">
                  <button
                     onClick={generateAIPatches}
                     disabled={isGeneratingSuggestions || currentAudit.missingCount === 0}
                     type="button"
                     className="px-5 py-2.5 bg-brand text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-brand-deep disabled:bg-white/5 disabled:text-white/20 hover:scale-103 active:scale-97 transition-all flex items-center gap-2"
                  >
                     {isGeneratingSuggestions ? (
                       <>
                         <RefreshCw className="w-4 h-4 animate-spin" />
                         <span>Generating AI patches...</span>
                       </>
                     ) : (
                       <>
                         <Play className="w-4 h-4 text-slate-950" />
                         <span>Analyze & Generate Patches</span>
                       </>
                     )}
                  </button>
                  <span className="text-[10px] font-mono text-slate-500">
                     Pushes translation suggestions for missing items.
                  </span>
               </div>

               {suggestedTranslations && (
                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-brand">Suggested {currentAudit.langName} Patch Snippet</span>
                        <button
                           onClick={() => handleCopyText(JSON.stringify(suggestedTranslations, null, 2), "suggested-patches")}
                           type="button"
                           className="text-[10px] font-black text-brand flex items-center gap-1 hover:underline"
                        >
                           {isCopying === "suggested-patches" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                           {isCopying === "suggested-patches" ? "COPIED!" : "COPY JSON BLOCK"}
                        </button>
                     </div>
                     <div className="p-3 bg-[#0F131C] border border-white/10 rounded-xl max-h-[180px] overflow-y-auto text-xs font-mono text-brand custom-scrollbar">
                        <pre>{JSON.stringify(suggestedTranslations, null, 2)}</pre>
                     </div>
                     <p className="text-[10px] text-slate-500 leading-relaxed">
                        To commit this permanently, an agronomist can copy and append these keys to the language file under the <b>{currentAudit.langCode}: {'{'}</b> block.
                     </p>
                  </div>
               )}
            </div>
         </div>

         {/* Sidebar utilities inside Auditor */}
         <div className="lg:col-span-4 space-y-6">
            {/* Live Interpreter playground */}
            <div className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-5">
               <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                  <Globe className="w-4 h-4 text-brand" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Interactive Inspector</h4>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Dictionary Key Test</label>
                     <div className="relative">
                        <input
                           type="text"
                           value={simKey}
                           onChange={(e) => setSimKey(e.target.value)}
                           className="w-full bg-slate-950 border border-white/10 text-xs font-semibold rounded-lg py-2 pl-2 pr-8 text-white focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                           placeholder="e.g. crop_doctor"
                        />
                     </div>
                     <p className="text-[10px] text-slate-500 font-medium">Resolving the key instantly under currently audited language:</p>
                     <div className="p-2.5 bg-slate-950 border border-white/5 rounded-lg text-xs leading-normal">
                        <span className="text-slate-400 select-none text-[10px] tracking-wider uppercase block mb-1">Result:</span>
                        <span className="font-bold text-brand">
                           {translations[selectedAuditLang]?.[simKey] !== undefined 
                             ? translations[selectedAuditLang][simKey] 
                             : translations.en[simKey] !== undefined 
                             ? <span className="text-amber-400 font-bold">{translations.en[simKey]} (Fallback to English)</span>
                             : <span className="text-rose-500 font-bold">{simKey} (Missing completely)</span>
                           }
                        </span>
                     </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* AI Sandbox string translator */}
                  <div className="space-y-2.5">
                     <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">AI Dynamic Sandbox</label>
                     <textarea
                        value={customTextTranslate}
                        onChange={(e) => setCustomTextTranslate(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-950 border border-white/10 text-xs font-semibold rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand leading-relaxed"
                        placeholder="Enter any sentence to test dynamic translation layer..."
                     />
                     <button
                        onClick={handleTranslateCustomText}
                        disabled={isTranslatingText || !customTextTranslate.trim()}
                        type="button"
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                     >
                        {isTranslatingText ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Translating...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-white" />
                            <span>Translate to {currentAudit.langName}</span>
                          </>
                        )}
                     </button>

                     {translatedCustomText && (
                        <div className="p-3 bg-[#0F131C] border border-[#2ECC71]/10 rounded-xl space-y-1">
                           <span className="text-[9px] text-[#2ECC71] font-black uppercase tracking-wider">Localized Result</span>
                           <p className="text-xs text-white leading-relaxed font-semibold">{translatedCustomText}</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Developer guidelines card */}
            <div className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-4">
               <div className="flex items-center gap-2 text-brand">
                  <Terminal className="w-4 h-4" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Dev Protocols</h4>
               </div>
               <ul className="space-y-2.5 text-[11px] text-slate-400 leading-relaxed list-disc list-inside">
                  <li>Maintain <b>LanguageContext.tsx</b> as single-source configuration.</li>
                  <li>Always use standard React hook <code>const {'{ t }'} = useLanguage()</code> inside elements.</li>
                  <li>Leverage the JSON generator above to safely patch unfinished dictionaries.</li>
                  <li>Proper nouns and abbreviations are automatically white-listed from audit flags.</li>
               </ul>
            </div>
         </div>
      </div>
    </div>
  );
}
