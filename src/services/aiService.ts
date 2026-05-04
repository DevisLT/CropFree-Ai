import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CropDiagnosis {
  cropName: string;
  interpretation: string;
  observedSymptoms: string[];
  possibleConditions: string[];
  mostLikelyDiagnosis: string;
  confidenceLevel: "High" | "Medium" | "Low";
  confidenceScore: number;
  severity: "Low" | "Moderate" | "High" | "Critical";
    explanation: string;
    recommendedActions: string[];
    preventionTips: string[];
  }
  
  export const aiService = {
    async diagnoseCrop(base64Image: string, mimeType: string, language: string = 'en'): Promise<CropDiagnosis> {
      const model = "gemini-3-flash-preview";
      
      const prompt = `Analyze this crop image like a professional agricultural expert.
      Perform a "True Intelligence" analysis:
      1. Describe what you see in detail (leaf color, spots, damage patterns, textures).
      2. Identify possible issues (fungal, bacterial, pest damage, nutrient deficiency, or environmental stress).
      3. Provide a best-fit diagnosis with reasoning.
      4. If the image is unclear or you are uncertain, reflect this in the confidence level.
  
      IMPORTANT: You MUST provide all text descriptions (cropName, interpretation, observedSymptoms, mostLikelyDiagnosis, explanation, recommendedActions, preventionTips) in the following language: ${language}.
  
      Return the analysis in JSON format with these exact fields:
      - cropName: Common name of the crop (or "Unknown").
      - interpretation: Your visual observation of the plant parts.
      - observedSymptoms: List of specific visual markers found.
      - possibleConditions: List of broad categories that might apply (e.g., "Fungal Infection", "Nitrient Deficiency").
      - mostLikelyDiagnosis: The specific name of the condition you suspect most.
      - confidenceLevel: "High", "Medium", or "Low".
      - confidenceScore: A numeric value from 0 to 1.
      - severity: "Low", "Moderate", "High", or "Critical".
      - explanation: A simple, natural language explanation of your reasoning for the diagnosis.
      - recommendedActions: Immediate steps the farmer should take.
      - preventionTips: Ways to prevent this issue in the future.`;

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Image.split(",")[1] || base64Image,
      },
    };

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cropName: { type: Type.STRING },
            interpretation: { type: Type.STRING },
            observedSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            possibleConditions: { type: Type.ARRAY, items: { type: Type.STRING } },
            mostLikelyDiagnosis: { type: Type.STRING },
            confidenceLevel: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            severity: { type: Type.STRING },
            explanation: { type: Type.STRING },
            recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            preventionTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "cropName", 
            "interpretation", 
            "observedSymptoms", 
            "possibleConditions", 
            "mostLikelyDiagnosis", 
            "confidenceLevel", 
            "severity", 
            "explanation", 
            "recommendedActions"
          ],
        },
      },
    });

    try {
      const data = JSON.parse(response.text || "{}");
      return data as CropDiagnosis;
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Analysis failed. Please try a clearer photo.");
    }
  },

    async askCoach(question: string, history: { role: string; content: string }[], language: string = 'en'): Promise<string> {
      const model = "gemini-3-flash-preview";
      const systemInstruction = `You are CropFree AI Coach, a master agricultural expert. Provide practical, clear, and encouraging advice to farmers. Keep explanations simple and supportive. IMPORTANT: You MUST respond in ${language}.`;
  
      const response = await ai.models.generateContent({
      model,
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
        { role: "user", parts: [{ text: question }] }
      ],
      config: { systemInstruction },
    });

    return response.text || "I'm sorry, I couldn't process that. How can I help you with your crops today?";
  }
};
