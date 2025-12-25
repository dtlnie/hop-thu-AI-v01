
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
    // API_KEY được inject bởi Vite define
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === '' || apiKey === 'undefined') {
      return {
        reply: "⚠️ LỖI CẤU HÌNH: Ứng dụng chưa nhận được API Key. Bạn hãy kiểm tra đã thêm 'API_KEY' vào Environment Variables trên Vercel và thực hiện 'Redeploy' chưa nhé!",
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
      // Làm sạch dữ liệu nếu model trả về markdown
      const cleanJson = fullText.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      // Fallback nếu AI không trả về JSON đúng định dạng
      return {
        reply: fullText,
        riskLevel: RiskLevel.GREEN,
        new_insights: ""
      };
    }
  } catch (error: any) {
    console.error("Lỗi AI:", error);
    if (error.name === 'AbortError') throw error;
    
    return {
      reply: "Mình gặp chút lỗi kết nối với máy chủ AI. Bạn thử tải lại trang hoặc nhắn lại cho mình sau vài giây nhé!",
      riskLevel: RiskLevel.GREEN,
      new_insights: ""
    };
  }
};
