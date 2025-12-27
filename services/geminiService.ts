
import { GoogleGenAI } from "@google/genai";
import { PersonaType, RiskLevel } from "../types.ts";
import { SYSTEM_PROMPT, PERSONAS } from "../constants.tsx";

export const getGeminiStreamResponse = async (
  message: string, 
  personaId: PersonaType, 
  history: {role: string, content: string}[],
  userMemory: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
) => {
  try {
    // Lấy API Key từ biến môi trường đã được Vite xử lý
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      return {
        reply: "⚠️ LỖI HỆ THỐNG: Bot chưa nhận được API Key từ Vercel. Bạn hãy kiểm tra lại mục Environment Variables trên Vercel, đảm bảo tên biến là 'API_KEY' và đã thực hiện REDEPLOY nhé!",
        riskLevel: RiskLevel.GREEN,
        new_insights: ""
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const persona = PERSONAS.find(p => p.id === personaId);
    
    const dynamicPrompt = SYSTEM_PROMPT
      .replace("{persona_name}", persona?.name || "")
      .replace("{persona_role}", persona?.role || "")
      .replace("{user_memory}", userMemory || "Đây là lần đầu học sinh này nhắn tin.");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.slice(-6).map(h => ({ 
          role: h.role === 'user' ? 'user' : 'model', 
          parts: [{ text: h.content }] 
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: dynamicPrompt,
        responseMimeType: "application/json",
      }
    });

    const fullText = response.text || "";
    
    try {
      const cleanJson = fullText.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      return {
        reply: fullText,
        riskLevel: RiskLevel.GREEN,
        new_insights: ""
      };
    }
  } catch (error: any) {
    console.error("Lỗi AI:", error);
    return {
      reply: "Mình đang gặp chút khó khăn khi kết nối với máy chủ AI. Bạn vui lòng thử lại sau giây lát nhé!",
      riskLevel: RiskLevel.GREEN,
      new_insights: ""
    };
  }
};
