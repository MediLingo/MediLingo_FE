
import { SearchResult, Medicine, SearchType, Symptom } from "../types";

// Define the API Response structure based on the requirements
interface ApiLocalProduct {
  name: string;
  imageUrl: string;
  source: string;
  // Optional fields for mock data to keep UI rich
  description?: string;
  usage?: string;
  type?: 'pill' | 'liquid' | 'cream' | 'patch' | 'other';
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

// Mock Data for Drug Search (e.g. Tylenol, EVE)
const MOCK_DRUG_RESPONSE: ApiResponse = {
  success: true,
  data: {
    normalized: {
      activeIngredient: "Ibuprofen",
      dose: "200mg",
      form: "tablet",
      notes: "두통, 생리통, 치통 등 통증 완화 및 해열 작용"
    },
    localProducts: [
      {
        name: "EVE A (イブA錠)",
        imageUrl: "https://image.dokodemo.world/catalog-skus/1078712/f05e55504d720eb0a86ed4c0bb71c5ee.png?d=1000x0",
        source: "seed",
        description: "일본의 대표적인 진통제로, 이부프로펜과 진정 성분이 배합되어 있습니다.",
        usage: "성인 1회 2정, 1일 3회 한도",
        type: "pill",
        manufacturer: "SS Pharmaceutical"
      },
      {
        name: "Bufferin Premium (バファリン)",
        imageUrl: "https://doc.lion.co.jp/uploads/grn/product/normal_image/188/bufferin_premium20.png",
        source: "seed",
        description: "빠른 효과와 위장 보호 성분이 특징인 프리미엄 진통제입니다.",
        usage: "식후 2정 복용",
        type: "pill",
        manufacturer: "Lion Corp"
      },
      {
        name: "Loxonin S (ロキソニンS)",
        imageUrl: "https://www.daiichisankyo-hc.co.jp/library/content/img_library/image/loxonin-s_CF005_main.jpg",
        source: "seed",
        description: "강력한 소염 진통 효과를 가진 로키소프로펜 성분의 약입니다.",
        usage: "증상이 있을 때 1정 복용",
        type: "pill",
        manufacturer: "Daiichi Sankyo"
      }
    ],
    disclaimer: "현지 성분/용량은 국가별로 다를 수 있어요. 복용 전 라벨 확인 및 약사/의사 상담을 권장합니다."
  },
  error: null
};

// Mock Data for Symptom Search (e.g. Stomach ache)
const MOCK_SYMPTOM_RESPONSE: ApiResponse = {
  success: true,
  data: {
    normalized: {
      activeIngredient: "Digestive Enzymes",
      dose: "N/A",
      form: "powder/tablet",
      notes: "소화불량, 과식, 위통 증상 완화"
    },
    localProducts: [
      {
        name: "EVE A (イブA錠)",
        imageUrl: "https://image.dokodemo.world/catalog-skus/1078712/f05e55504d720eb0a86ed4c0bb71c5ee.png?d=1000x0",
        source: "seed",
        description: "일본의 대표적인 진통제로, 이부프로펜과 진정 성분이 배합되어 있습니다.",
        usage: "성인 1회 2정, 1일 3회 한도",
        type: "pill",
        manufacturer: "SS Pharmaceutical"
      },
      {
        name: "Bufferin Premium (バファリン)",
        imageUrl: "https://doc.lion.co.jp/uploads/grn/product/normal_image/188/bufferin_premium20.png",
        source: "seed",
        description: "빠른 효과와 위장 보호 성분이 특징인 프리미엄 진통제입니다.",
        usage: "식후 2정 복용",
        type: "pill",
        manufacturer: "Lion Corp"
      },
      {
        name: "Loxonin S (ロキソニンS)",
        imageUrl: "https://www.daiichisankyo-hc.co.jp/library/content/img_library/image/loxonin-s_CF005_main.jpg",
        source: "seed",
        description: "강력한 소염 진통 효과를 가진 로키소프로펜 성분의 약입니다.",
        usage: "증상이 있을 때 1정 복용",
        type: "pill",
        manufacturer: "Daiichi Sankyo"
      }
    ],
    disclaimer: "증상 기반 추천은 참고용입니다. 지속적인 통증은 반드시 의사와 상담하세요."
  },
  error: null
};

const SEVERITY_MAP: Record<string, string> = {
  "경미": "mild",
  "보통": "moderate",
  "심함": "severe"
};

export const findMedicine = async (
  homeCountry: string, // Not used in API payload example but kept for interface consistency
  targetCountry: string,
  query: string,
  imageBase64: string | null,
  searchType: SearchType,
  symptoms?: Symptom[]
): Promise<SearchResult> => {
  
  // API Call Simulation
  try {
    let apiEndpoint = '';
    let requestBody = {};
    let mockDataToReturn = MOCK_DRUG_RESPONSE;

    if (searchType === 'drug') {
      apiEndpoint = '/api/drug/translate';
      requestBody = {
        koreanDrugText: query,
        countryCode: targetCountry
      };
      mockDataToReturn = MOCK_DRUG_RESPONSE;
    } else {
      // Logic for Symptom Search
      apiEndpoint = '/api/drug/diagnose';
    
      // Map UI severity (Korean) to API severity (English)
      const formattedSymptoms = symptoms?.map(s => ({
        name: s.name,
        severity: SEVERITY_MAP[s.severity] || "moderate" // Default to moderate if not found
      })) || [];

      requestBody = {
        symptoms: formattedSymptoms,
        // Optional fields are omitted as per requirement, but structure is ready
        // patient: { ... },
        // constraints: { ... },
        countryCode: targetCountry
      };
      mockDataToReturn = MOCK_SYMPTOM_RESPONSE;
    }

    console.log(`Calling API: ${apiEndpoint} with`, requestBody);

    // TODO: Uncomment this when the real API is ready
    /*
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const json: ApiResponse = await response.json();
    return mapApiResponseToSearchResult(json);
    */

    // Simulate Network Delay for Mock
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return appropriate Mock Data based on search type
    return mapApiResponseToSearchResult(mockDataToReturn);

  } catch (error) {
    console.error("API Error:", error);
    // Fallback to mock even on error
    return mapApiResponseToSearchResult(MOCK_DRUG_RESPONSE);
  }
};

// Helper to convert the new API structure to the existing UI State
function mapApiResponseToSearchResult(apiResponse: ApiResponse): SearchResult {
  const { normalized, localProducts, disclaimer } = apiResponse.data;

  const medicines: Medicine[] = localProducts.map(product => ({
    name: product.name,
    // Since API sends combined name or just English, use it for both unless we split it manually
    localName: product.name, 
    manufacturer: product.manufacturer || "Unknown Manufacturer",
    // Use data from API or fallback to normalized notes
    description: product.description || `성분: ${normalized.activeIngredient} (${normalized.notes})`,
    ingredients: [normalized.activeIngredient], // The API gives normalized ingredient
    usage: product.usage || "약사의 지시에 따르세요.",
    matchReason: normalized.notes || "검색된 내용과 관련된 추천 약품입니다.",
    type: product.type || 'other',
    imageUrl: product.imageUrl
  }));

  return {
    medicines,
    advice: disclaimer
  };
}
