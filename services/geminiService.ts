import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult } from "../types";

// Initialize Gemini Client
// Assumption: process.env.API_KEY is available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert pharmacist and travel medical assistant. 
Your goal is to help travelers find equivalent Over-The-Counter (OTC) medicines in a foreign country.
The user will provide their home country, a target country, and a query (which could be a medicine name from their home country or a symptom).
You must analyze the active ingredients and effects to recommend the best local matching medicines in the target country.
Prioritize safety. If a prescription is likely required, state that clearly.
Output ONLY strictly structured JSON.
`;

export const findMedicine = async (
  homeCountry: string,
  targetCountry: string,
  query: string,
  imageBase64?: string | null
): Promise<SearchResult> => {
  
  const model = "gemini-3-flash-preview";

  // Define the output schema
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      medicines: {
        type: Type.ARRAY,
        description: "List of recommended medicines in the target country",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "English or Romanized name of the medicine" },
            localName: { type: Type.STRING, description: "Name in the local script (e.g., Katakana for Japan)" },
            manufacturer: { type: Type.STRING, description: "Brand or manufacturer" },
            description: { type: Type.STRING, description: "Brief description of what it treats in Korean" },
            ingredients: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Active ingredients"
            },
            usage: { type: Type.STRING, description: "Simple dosage instruction in Korean (e.g., 식후 2알)" },
            matchReason: { type: Type.STRING, description: "Why this fits the user's request in Korean" },
            type: { type: Type.STRING, enum: ['pill', 'liquid', 'cream', 'patch', 'other'] }
          },
          required: ["name", "localName", "description", "usage", "matchReason", "type"]
        }
      },
      advice: {
        type: Type.STRING,
        description: "General medical advice or warnings for this specific query in the target country in Korean."
      }
    },
    required: ["medicines", "advice"]
  };

  try {
    const promptText = `
      I am from ${homeCountry} and currently traveling in ${targetCountry}.
      My search query is: "${query}".
      Find me the top 3-5 equivalent or most suitable OTC medicines available in ${targetCountry}.
      If I provided a medicine name, find the closest ingredient match.
      If I provided a symptom, find the best standard treatment.
      Provide the local name so I can show it to a pharmacist.
      
      IMPORTANT: 
      - Return the 'description', 'usage', 'matchReason', and 'advice' in KOREAN.
      - Keep the medicine 'name' and 'manufacturer' in their original language (English/Local) so it can be identified.
    `;

    let contents: any = promptText;

    // If an image is provided (e.g. photo of a pill box), add it to the prompt
    if (imageBase64) {
      // Remove data URI prefix if present for the API call
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
      
      contents = {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming JPEG for simplicity from capture, standardizing in component
              data: cleanBase64
            }
          }
        ]
      };
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, // Keep it factual
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI 응답을 받을 수 없습니다.");
    }

    return JSON.parse(text) as SearchResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};