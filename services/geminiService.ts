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

const MOCK_RESULT: SearchResult = {
  medicines: [
    {
      name: "EVE Quick DX",
      localName: "イブクイック頭痛薬DX",
      manufacturer: "SS Pharmaceutical",
      description: "두통과 열에 빠른 효과를 보이는 진통제입니다. 위 점막을 보호하는 성분이 포함되어 있습니다.",
      ingredients: ["Ibuprofen 200mg", "Magnesium Oxide"],
      usage: "성인 1회 2정, 1일 2회 한도, 식후 복용 권장",
      matchReason: "한국의 '이지엔6'나 '탁센'과 유사한 이부프로펜 계열의 강력한 진통제입니다.",
      type: "pill"
    },
    {
      name: "Ohta's Isan",
      localName: "太田胃散",
      manufacturer: "Ohta's Isan Co.",
      description: "과식, 과음, 속쓰림에 효과적인 종합 위장약입니다. 생약 성분이 포함되어 향이 독특할 수 있습니다.",
      ingredients: ["Cinnamon bark", "Fennel", "Nutmeg", "Sodium Bicarbonate"],
      usage: "성인 1회 1스푼(동봉), 1일 3회 식후 또는 식간",
      matchReason: "한국의 '까스활명수'나 가루형 위장약과 유사한 용도로 쓰이는 현지 국민 위장약입니다.",
      type: "liquid" // Actually powder usually, but mapping to valid type or closest visual
    },
    {
      name: "Roihi Tsuboko",
      localName: "ロイヒつぼ膏",
      manufacturer: "Nichiban",
      description: "어깨 결림이나 허리 통증 부위에 붙이는 동전 모양의 온감 파스입니다.",
      ingredients: ["Methyl Salicylate", "Menthol", "Camphor"],
      usage: "통증이 있는 부위(경혈)에 직접 부착",
      matchReason: "근육통 완화에 효과적이며 여행 선물로도 인기 있는 제품입니다.",
      type: "patch"
    }
  ],
  advice: "[더미 데이터] 현재 API 연결이 되어 있지 않아 예시 데이터를 보여드립니다. 실제 서비스에서는 증상에 맞는 현지 약품이 추천됩니다. 약 구매 전 번역된 이름(localName)을 약사에게 보여주세요."
};

export const findMedicine = async (
  homeCountry: string,
  targetCountry: string,
  query: string,
  imageBase64?: string | null
): Promise<SearchResult> => {
  
  // Check if API Key is missing, return mock data immediately with a delay
  if (!process.env.API_KEY) {
    console.warn("API Key missing. Returning mock data.");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    return MOCK_RESULT;
  }

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
    console.error("Gemini API Error, falling back to mock data:", error);
    // Fallback to mock data on error as well, for better demo experience
    await new Promise(resolve => setTimeout(resolve, 1000));
    return MOCK_RESULT;
  }
};