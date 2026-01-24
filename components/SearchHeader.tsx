import React, { useState, useRef } from 'react';
import { COUNTRIES, SearchState } from '../types';
import { Search, MapPin, Camera, X, Loader2 } from 'lucide-react';

interface SearchHeaderProps {
  onSearch: (params: SearchState) => void;
  onReset: () => void;
  isLoading: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ onSearch, onReset, isLoading }) => {
  const [homeCountry, setHomeCountry] = useState('KR');
  const [targetCountry, setTargetCountry] = useState('JP');
  const [query, setQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query && !previewImage) return;
    
    onSearch({
      homeCountry: COUNTRIES.find(c => c.code === homeCountry)?.name || homeCountry,
      targetCountry: COUNTRIES.find(c => c.code === targetCountry)?.name || targetCountry,
      query,
      image: previewImage
    });
  };

  const handleLogoClick = () => {
    setQuery('');
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onReset();
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

  return (
    <div className="bg-blue-600 text-white pb-6 pt-4 px-4 shadow-lg sticky top-0 z-50 rounded-b-3xl">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 
            onClick={handleLogoClick}
            className="text-2xl font-bold flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-3xl">💊</span> MediLingo
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
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

          {/* Search Input */}
          <div className="relative">
            <div className="absolute left-3 top-3.5 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="약 이름이나 증상을 입력하세요..."
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