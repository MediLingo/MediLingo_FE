import { SearchResult, Medicine, SearchType, Symptom, RankingItem } from "../types";

// ✅ baseURL + mock 토글 (Vite env)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim();

const USE_MOCK =
  String(import.meta.env.VITE_USE_MOCK || "false").toLowerCase() === "true";

// ✅ 슬래시 중복 방지 URL 조합
const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

// Define the API Response structure based on the requirements
interface ApiLocalProduct {
  localProductId: number; // backend long
  name: string;
  imageUrl: string;
  source: string;
  description?: string;
  usage?: string;
  type?: "pill" | "liquid" | "cream" | "patch" | "other";
  manufacturer?: string;
}

interface ApiResponseData {
  normalized: {
    activeIngredient: string;
    dose: string;
    form: string;
    notes: string;
  };
  localProducts: ApiLocalProduct[];
  disclaimer: string;
}

interface ApiResponse {
  success: boolean;
  data: ApiResponseData;
  error: string | null;
}

interface RankingApiResponse {
  success: boolean;
  data: RankingItem[];
  error: string | null;
}

// ===== Mock data (optional)
// If you have real mock objects elsewhere, import them and replace these.
const MOCK_DRUG_RESPONSE: ApiResponse | null = null;
const MOCK_SYMPTOM_RESPONSE: ApiResponse | null = null;
const MOCK_RANKING_DATA: Record<string, RankingItem[]> | null = null;

function assertMock<T>(value: T | null, name: string): T {
  if (value == null) {
    throw new Error(`${name} is not defined. Set VITE_USE_MOCK=false or provide mock data for ${name}.`);
  }
  return value;
}

const SEVERITY_MAP: Record<string, string> = {
  "경미": "MILD",
  "보통": "MODERATE",
  "심함": "SEVERE",
};

export const findMedicine = async (
  homeCountry: string,
  targetCountry: string,
  query: string,
  imageBase64: string | null,
  searchType: SearchType,
  symptoms?: Symptom[]
): Promise<SearchResult> => {
  console.log("[geminiService] findMedicine called", { searchType, targetCountry });
  try {
    let apiPath = "";
    let requestBody: any = {};
    let mockDataToReturn: ApiResponse | null = null;

    if (searchType === "drug") {
      apiPath = "/api/drug/translate";
      requestBody = {
        koreanDrugText: query,
        countryCode: targetCountry,
      };
      mockDataToReturn = MOCK_DRUG_RESPONSE;
    } else {
      apiPath = "/api/drug/symptom-drug-mapping";

      const formattedSymptoms =
        symptoms?.map((s) => ({
          name: s.name,
          severity: SEVERITY_MAP[s.severity] || "MODERATE", // ✅ 대문자 통일
        })) || [];

      requestBody = {
        symptoms: formattedSymptoms,
        countryCode: targetCountry,
      };

      mockDataToReturn = MOCK_SYMPTOM_RESPONSE;
    }

    console.log(
      `Calling API (${USE_MOCK ? "MOCK" : "REAL"}):`,
      apiPath,
      requestBody
    );

    // ✅ mock 모드면 기존처럼 지연 후 mock 반환
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return mapApiResponseToSearchResult(assertMock(mockDataToReturn, "MOCK_* response"));
    }

    // ✅ real API 호출: 절대경로로 호출
    const url = joinUrl(API_BASE_URL, apiPath);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`API request failed: ${response.status} ${text}`);
    }

    const json: ApiResponse = await response.json();
    return mapApiResponseToSearchResult(json);
  } catch (error) {
    console.error("API Error:", error);
    // If mock data isn't provided, don't crash the UI — return an empty result.
    return { medicines: [], advice: "" };
  }
};

export const fetchWeeklyRanking = async (
  countryCode: string,
  limit: number = 10
): Promise<RankingItem[]> => {
  try {
    console.log(`Fetching rankings (${USE_MOCK ? "MOCK" : "REAL"}):`, countryCode);

    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const data = assertMock(MOCK_RANKING_DATA, "MOCK_RANKING_DATA");
      const rankings = data[countryCode] || data["US"] || [];
      return rankings.slice(0, limit);
    }

    // ✅ real API 호출: 절대경로 + querystring
    const path = `/api/drugs/weekly?country=${encodeURIComponent(
      countryCode
    )}&limit=${encodeURIComponent(String(limit))}`;

    const url = joinUrl(API_BASE_URL, path);

    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to fetch rankings: ${response.status} ${text}`);
    }

    const json: RankingApiResponse = await response.json();
    return json.data;
  } catch (error) {
    console.error("Ranking API Error:", error);
    return [];
  }
};

// Helper to convert the new API structure to the existing UI State
function mapApiResponseToSearchResult(apiResponse: ApiResponse): SearchResult {
  const { normalized, localProducts, disclaimer } = apiResponse.data;

  const medicines: Medicine[] = localProducts.map((product) => ({
    // ✅ UI Medicine.id를 number로 바꿨다면 여기서 String(...) 안 해도 됨
    localProductId: String(product.localProductId ?? `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`),
    name: product.name,
    localName: product.name,
    manufacturer: product.manufacturer || "Unknown Manufacturer",
    description: product.description || `성분: ${normalized.activeIngredient} (${normalized.notes})`,
    ingredients: [normalized.activeIngredient],
    usage: product.usage || "약사의 지시에 따르세요.",
    matchReason: normalized.notes || "검색된 내용과 관련된 추천 약품입니다.",
    type: product.type || "other",
    imageUrl: product.imageUrl,
  }));

  return { medicines, advice: disclaimer };
}