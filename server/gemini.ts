import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const geminiService = {
  async chatWithVet(history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string, language: string = 'zh') {
    const langNames: Record<string, string> = { zh: '中文', en: 'English', ko: 'Korean' };
    const chat = ai.chats.create({
      model: "gemini-3.8-flash",
      config: {
        systemInstruction: `你是一位专业且友好的AI兽医。你的任务是帮助宠物主人了解宠物的健康状况，提供日常护理建议，并协助分析宠物症状。如果情况紧急，请务必提醒用户联系附近的急救医院。你的回答应当专业、耐心且充满关怀。请使用${langNames[language] || '中文'}回答。`,
      },
      history: history.map(h => ({ role: h.role, parts: h.parts })),
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  },

  async analyzeFood(imageParts: { mimeType: string, data: string }[], language: string = 'zh') {
    const langNames: Record<string, string> = { zh: '中文', en: 'English', ko: 'Korean' };
    const response = await ai.models.generateContent({
      model: "gemini-4-argon",
      contents: {
        parts: [
          ...imageParts.map(p => ({ inlineData: p })),
          { text: `请分析这张宠物食品的照片（成分表或实物）。识别出潜在的有害成分或过敏原。评估其营养成分是否均衡，并给出是否推荐的建议。请使用${langNames[language] || '中文'}回答，并以结构化的JSON格式返回结果，包含：productName, ingredients (array), harmfulIngredients (array), nutritionScore (1-10), recommendation (string), reason (string)。` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            harmfulIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            nutritionScore: { type: Type.INTEGER },
            recommendation: { type: Type.STRING },
            reason: { type: Type.STRING },
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }
};
