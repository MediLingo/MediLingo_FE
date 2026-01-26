import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES, SearchState, SearchType, Symptom } from '../types';
import { Search, Camera, X, Loader2, Pill, Thermometer, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';

interface SearchHeaderProps {
  onSearch: (params: SearchState) => void;
  onReset: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

const SYMPTOMS_LIST = [
  "오한", "발열", "몸살", "기침", "가래", "콧물", "재채기", "인후통", 
  "두통", "근육통", "관절통", "복통", "속쓰림", "소화불량", "구토", 
  "설사", "변비", "복부팽만", "치통", "구내염", "피부 가려움", 
  "두드러기", "충혈", "생리통", "불면"
];

const SEVERITY_OPTIONS = ["경미", "보통", "심함"];

interface SymptomPair {
  id: number;
  name: string;
  severity: string;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ onSearch, onReset, isLoading, hasResult }) => {
  const [homeCountry, setHomeCountry] = useState('KR');
  const [targetCountry, setTargetCountry] = useState('JP');
  
  // Query state is used for the display in collapsed mode and drug search input
  const [query, setQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<SearchType>('drug');
  
  // Symptom Search State
  const [symptomPairs, setSymptomPairs] = useState<SymptomPair[]>([
    { id: Date.now(), name: '', severity: '보통' }
  ]);
  
  // UI State for custom dropdown
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  
  // Header state: if no result, always expanded. If result exists, defaults to collapsed.
  const [isExpanded, setIsExpanded] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When a search is successfully triggered (hasResult becomes true), collapse the header
  useEffect(() => {
    if (hasResult) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [hasResult]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalQuery = query;
    let symptomsPayload: Symptom[] | undefined = undefined;

    if (searchType === 'symptom') {
      const validPairs = symptomPairs.filter(p => p.name.trim() !== '');
      if (validPairs.length === 0) return;
      
      // Serialize for UI Display (Summary)
      finalQuery = validPairs.map(p => `${p.name}(${p.severity})`).join(', ');
      setQuery(finalQuery);

      // Create structured payload for API
      symptomsPayload = validPairs.map(p => ({
        name: p.name,
        severity: p.severity
      }));

    } else {
      if (!query && !previewImage) return;
    }
    
    onSearch({
      homeCountry: COUNTRIES.find(c => c.code === homeCountry)?.name || homeCountry,
      targetCountry: COUNTRIES.find(c => c.code === targetCountry)?.name || targetCountry,
      query: finalQuery,
      image: previewImage,
      searchType,
      symptoms: symptomsPayload
    });
  };

  const handleLogoClick = () => {
    setQuery('');
    setPreviewImage(null);
    setSymptomPairs([{ id: Date.now(), name: '', severity: '보통' }]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onReset();
    setIsExpanded(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleSearchType = (type: SearchType) => {
    setSearchType(type);
    // Reset inputs when switching
    if (type === 'drug') {
      setQuery('');
      setPreviewImage(null);
    } else {
      setSymptomPairs([{ id: Date.now(), name: '', severity: '보통' }]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Symptom List Logic
  const addSymptomRow = () => {
    setSymptomPairs([...symptomPairs, { id: Date.now(), name: '', severity: '보통' }]);
  };

  const removeSymptomRow = (id: number) => {
    if (symptomPairs.length > 1) {
      setSymptomPairs(symptomPairs.filter(p => p.id !== id));
    } else {
      // If it's the last one, just clear the name
      setSymptomPairs([{ ...symptomPairs[0], name: '' }]);
    }
  };

  const updateSymptomRow = (id: number, field: keyof SymptomPair, value: string) => {
    setSymptomPairs(symptomPairs.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // Render the collapsed Summary View
  if (hasResult && !isExpanded) {
    const homeFlag = COUNTRIES.find(c => c.code === homeCountry)?.flag;
    const targetFlag = COUNTRIES.find(c => c.code === targetCountry)?.flag;
    
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className="bg-blue-600 text-white shadow-lg sticky top-0 z-50 cursor-pointer hover:bg-blue-700 transition-colors animate-fadeIn"
      >
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 overflow-hidden">
               {/* Icon */}
              <div className="p-2 bg-blue-500 rounded-full flex-shrink-0">
                {searchType === 'drug' ? <Pill size={16} /> : <Thermometer size={16} />}
              </div>
              
              {/* Text Summary */}
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-xs text-blue-200 mb-0.5">
                   <span>{homeFlag}</span> 
                   <span>→</span> 
                   <span>{targetFlag}</span>
                </div>
                <h2 className="text-md font-bold truncate pr-2">
                  {query || (previewImage ? "사진 검색" : "검색")}
                </h2>
              </div>
            </div>

            {/* Action Icon */}
            <div className="flex-shrink-0 text-blue-200">
               <ChevronDown size={24} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the Expanded Full Form
  return (
    <div className="bg-blue-600 text-white pb-6 pt-4 px-4 shadow-lg sticky top-0 z-50 rounded-b-3xl transition-all">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 
            onClick={handleLogoClick}
            className="text-2xl font-bold flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-3xl">💊</span> MediLingo
          </h1>
          
          {/* Close button only if we have a result (cancellable edit) */}
          {hasResult && (
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-2 text-blue-200 hover:text-white hover:bg-blue-700 rounded-full transition-colors"
            >
              <ChevronUp size={24} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Country Selection */}
          <div className="flex items-center gap-2 bg-blue-700/50 p-1 rounded-lg">
            <select 
              value={homeCountry}
              onChange={(e) => setHomeCountry(e.target.value)}
              className="bg-transparent text-white text-sm font-medium w-1/2 p-2 outline-none text-center appearance-none cursor-pointer hover:bg-blue-600 rounded"
            >
              {COUNTRIES.map(c => <option key={c.code} value={c.code} className="text-slate-900">{c.flag} 출발: {c.name}</option>)}
            </select>
            <span className="text-blue-300">➜</span>
            <select 
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              className="bg-transparent text-white text-sm font-medium w-1/2 p-2 outline-none text-center appearance-none cursor-pointer hover:bg-blue-600 rounded"
            >
              {COUNTRIES.map(c => <option key={c.code} value={c.code} className="text-slate-900">{c.flag} 도착: {c.name}</option>)}
            </select>
          </div>

          {/* Search Type Tabs */}
          <div className="flex bg-blue-800/40 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => toggleSearchType('drug')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                searchType === 'drug' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-blue-100 hover:bg-blue-700/50'
              }`}
            >
              <Pill size={16} /> 약 이름
            </button>
            <button
              type="button"
              onClick={() => toggleSearchType('symptom')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                searchType === 'symptom' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-blue-100 hover:bg-blue-700/50'
              }`}
            >
              <Thermometer size={16} /> 증상
            </button>
          </div>

          {/* Dynamic Content based on Search Type */}
          {searchType === 'drug' ? (
            // --- Drug Search UI ---
            <div className="relative">
              <div className="absolute left-3 top-3.5 text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="약 이름 (예: 타이레놀)"
                className="w-full pl-10 pr-12 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Camera size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload} 
              />
              
              {/* Image Preview for Drug Search */}
              {previewImage && (
                <div className="relative inline-block mt-3">
                  <img src={previewImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border-2 border-white" />
                  <button 
                    type="button" 
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            // --- Symptom Search UI ---
            <div className="space-y-2">
              {/* Custom Dropdown Implementation instead of datalist */}
              {symptomPairs.map((pair, index) => (
                <div key={pair.id} className="flex gap-2 animate-fadeIn z-10 relative">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={pair.name}
                      onChange={(e) => updateSymptomRow(pair.id, 'name', e.target.value)}
                      onFocus={() => setActiveDropdownId(pair.id)}
                      onBlur={() => setTimeout(() => setActiveDropdownId(null), 200)}
                      placeholder="증상 (예: 두통)"
                      className="w-full pl-4 pr-2 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner"
                    />
                    
                    {/* Custom Dropdown List */}
                    {activeDropdownId === pair.id && (
                       <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 no-scrollbar animate-fadeIn">
                         {SYMPTOMS_LIST.map((symptom) => (
                           <div
                             key={symptom}
                             onClick={() => updateSymptomRow(pair.id, 'name', symptom)}
                             className={`px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-none text-slate-700 ${
                               pair.name === symptom ? 'bg-blue-50 text-blue-600 font-bold' : ''
                             }`}
                           >
                             {symptom}
                           </div>
                         ))}
                       </div>
                    )}
                  </div>
                  <div className="w-24">
                    <select
                      value={pair.severity}
                      onChange={(e) => updateSymptomRow(pair.id, 'severity', e.target.value)}
                      className="w-full h-full px-2 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner text-sm font-medium"
                    >
                      {SEVERITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSymptomRow(pair.id)}
                    className="w-10 flex items-center justify-center bg-blue-700/30 text-blue-100 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                    aria-label="Remove symptom"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addSymptomRow}
                className="w-full py-2 border-2 border-dashed border-blue-400 text-blue-100 rounded-xl hover:bg-blue-700/50 hover:border-blue-300 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
              >
                <Plus size={16} /> 증상 추가
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading || (searchType === 'drug' && !query && !previewImage) || (searchType === 'symptom' && symptomPairs.every(p => !p.name))}
            className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" /> 분석 중...
              </>
            ) : (
              '약 찾기'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchHeader;