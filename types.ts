
export interface Medicine {
  localProductId: string;
  name: string;
  localName: string; // The name in the target country's language
  matchReason: string; // Why is this a match?
  coverageWarning?: string; // Ingredients not covered by this product
  activeIngredients?: string[]; // Active ingredient names (English)
  type: 'pill' | 'liquid' | 'cream' | 'patch' | 'other';
  imageUrl?: string; // Added to support API provided images
}

export type SearchType = 'drug' | 'symptom';

export interface Symptom {
  name: string;
  severity: string;
}

export interface SearchState {
  homeCountry: string;
  targetCountry: string;
  query: string; // Used for display summary and drug search
  image: string | null; // Base64 string
  searchType: SearchType;
  symptoms?: Symptom[]; // Added for structured API requests
}

export interface RankingItem {
  localProductId: number;
  localName: string;
  imageUrl: string;
  source: string;
  clickCount: number;
}

export const COUNTRIES = [
  { code: 'KR', name: '대한민국', flag: '🇰🇷' },
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'FR', name: '프랑스', flag: '🇫🇷' },
];

export interface SearchResult {
  medicines: Medicine[];
  advice: string;
  ingredients: string[];
}