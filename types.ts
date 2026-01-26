
export interface Medicine {
  name: string;
  localName: string; // The name in the target country's language
  manufacturer: string;
  description: string;
  ingredients: string[];
  usage: string;
  matchReason: string; // Why is this a match?
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

export const COUNTRIES = [
  { code: 'KR', name: '대한민국', flag: '🇰🇷' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'VN', name: '베트남', flag: '🇻🇳' },
  { code: 'TH', name: '태국', flag: '🇹🇭' },
  { code: 'CN', name: '중국', flag: '🇨🇳' },
  { code: 'FR', name: '프랑스', flag: '🇫🇷' },
  { code: 'DE', name: '독일', flag: '🇩🇪' },
  { code: 'IT', name: '이탈리아', flag: '🇮🇹' },
  { code: 'ES', name: '스페인', flag: '🇪🇸' },
];

export interface SearchResult {
  medicines: Medicine[];
  advice: string;
}