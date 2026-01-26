import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES, SearchState, SearchType } from '../types';
import { Search, Camera, X, Loader2, Pill, Thermometer, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface SearchHeaderProps {
  onSearch: (params: SearchState) => void;
  onReset: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ onSearch, onReset, isLoading, hasResult }) => {
  const [homeCountry, setHomeCountry] = useState('KR');
  const [targetCountry, setTargetCountry] = useState('JP');
  const [query, setQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<SearchType>('drug');
  
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
    if (!query && !previewImage) return;
    
    onSearch({
      homeCountry: COUNTRIES.find(c => c.code === homeCountry)?.name || homeCountry,
      targetCountry: COUNTRIES.find(c => c.code === targetCountry)?.name || targetCountry,
      query,
      image: previewImage,
      searchType
    });
    // setIsExpanded(false) will be handled by the useEffect dependent on hasResult
    // or we can force it here if optimistic update is preferred, but useEffect is safer.
  };

  const handleLogoClick = () => {
    setQuery('');
    setPreviewImage(null);
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
    setQuery('');
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

          {/* Search Input */}
          <div className="relative">
            <div className="absolute left-3 top-3.5 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === 'drug' ? "약 이름 (예: 타이레놀)" : "증상 (예: 머리가 지끈거려요)"}
              className="w-full pl-10 pr-12 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner"
            />
            
            {/* Camera is only available for Drug Search */}
            {searchType === 'drug' && (
              <>
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
              </>
            )}
          </div>

          {/* Image Preview */}
          {previewImage && (
            <div className="relative inline-block mt-2">
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

          <button 
            type="submit" 
            disabled={isLoading || (!query && !previewImage)}
            className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg"
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