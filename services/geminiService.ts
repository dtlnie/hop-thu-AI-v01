
import { GoogleGenAI, Type } from "@google/genai";
import { PersonaType, RiskLevel } from "../types";
import { SYSTEM_PROMPT, PERSONAS } from "../constants";

export const getGeminiResponse = async (
  message: string, 
  personaId: PersonaType, 
  history: {role: string, content: string}[],
  signal?: AbortSignal
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const persona = PERSONAS.find(p => p.id === personaId);
    
    const dynamicPrompt = SYSTEM_PROMPT
      .replace("{persona_name}", persona?.name || "")
      .replace("{persona_role}", persona?.role || "");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ 
          role: h.role === 'user' ? 'user' : 'model', 
          parts: [{ text: h.content }] 
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: dynamicPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: Object.values(RiskLevel) },
            reason: { type: Type.STRING },
            detectedEmotion: { type: Type.STRING }
          },
          required: ["reply", "riskLevel", "reason", "detectedEmotion"]
        }
      }
    }, { signal }); // Truyền signal vào đây để có thể hủy

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Request was cancelled by user');
      throw error;
    }
    console.error("Gemini Error:", error);
    return {
      reply: "Mình đang gặp chút sự cố kết nối, bạn chờ mình xíu nhé!",
      riskLevel: RiskLevel.GREEN,
      reason: "API Error"
    };
  }
};
