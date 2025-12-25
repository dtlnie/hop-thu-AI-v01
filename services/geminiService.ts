
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
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });
    const persona = PERSONAS.find(p => p.id === personaId);
    
    const dynamicPrompt = SYSTEM_PROMPT
      .replace("{persona_name}", persona?.name || "")
      .replace("{persona_role}", persona?.role || "")
      .replace("{user_memory}", userMemory || "Chưa có dữ liệu cũ.");

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
      // Loại bỏ các ký tự markdown JSON nếu AI trả về nhầm định dạng
      const cleanJson = fullText.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.warn("Dữ liệu trả về không phải JSON chuẩn, cố gắng trích xuất text...");
      return {
        reply: fullText || "Mình đang ở đây lắng nghe bạn.",
        riskLevel: RiskLevel.GREEN,
        new_insights: ""
      };
    }
  } catch (error: any) {
    console.error("Lỗi Gemini API:", error);
    
    if (error.message === "API_KEY_MISSING") {
      return {
        reply: "Hệ thống chưa cấu hình API Key. Vui lòng kiểm tra lại cài đặt môi trường!",
        riskLevel: RiskLevel.GREEN
      };
    }

    if (error.message?.includes("404") || error.message?.includes("not found")) {
      return {
        reply: "Mô hình AI đang bận hoặc đang được cập nhật. Bạn thử lại sau ít phút nhé!",
        riskLevel: RiskLevel.GREEN
      };
    }

    throw error;
  }
};
