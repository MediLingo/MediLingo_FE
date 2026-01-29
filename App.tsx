import React, { useState } from 'react';
import SearchHeader from './components/SearchHeader';
import MedicineCard from './components/MedicineCard';
import BottomNav from './components/BottomNav';
import { RankingView } from './components/RankingView';
import { findMedicine } from './services/geminiService';
import { SearchResult, SearchState } from './types';
import { AlertTriangle, Info, Globe, ShieldCheck, Thermometer, Pill } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'ranking'>('search');
  
  // Search State
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<SearchState | null>(null);

  const handleSearch = async (params: SearchState) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setLastSearch(params);

    try {
      const data = await findMedicine(
        params.homeCountry,
        params.targetCountry,
        params.query,
        params.image,
        params.searchType,
        params.symptoms
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || "약 정보를 찾지 못했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setLastSearch(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      {activeTab === 'search' ? (
        <>
        <SearchHeader 
          onSearch={handleSearch} 
          onReset={handleReset} 
          isLoading={loading}
          hasResult={!!result} 
        />

        <main className="flex-grow p-4 max-w-md mx-auto w-full">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 mb-6">
              <AlertTriangle className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="text-center py-4 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-slate-300 w-8 h-8" />
              </div>
              <h2 className="text-lg font-semibold text-slate-600 mb-2">안전한 여행을 위한 메디링고</h2>
              <p className="text-sm max-w-xs mx-auto">
                위의 탭을 눌러 <strong>약 이름</strong> 혹은 <strong>증상</strong>으로<br/>현지 약을 검색해보세요.
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
                    <Thermometer className="text-blue-500 w-8 h-8 mb-2" />
                    <div className="text-xs font-bold text-slate-700">"배가 너무 아파요"</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
                    <Pill className="text-purple-500 w-8 h-8 mb-2" />
                    <div className="text-xs font-bold text-slate-700">"타이레놀 찾아줘"</div>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="animate-fadeIn pb-10">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  검색 결과 {result.medicines.length}건
                </h2>
                <div className="flex gap-2">
                  {lastSearch && (
                    <>
                      <span className="text-xs font-medium px-2 py-1 bg-slate-200 text-slate-700 rounded-lg">
                        {lastSearch.searchType === 'drug' ? '약 이름' : '증상'}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                        {lastSearch.targetCountry}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* AI Advice Card */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 text-sm text-amber-900 flex gap-3">
                <Info className="shrink-0 text-amber-600 w-5 h-5" />
                <div>
                  <p className="font-semibold mb-1">AI 약사 조언</p>
                  <p>{result.advice}</p>
                </div>
              </div>

              {/* Medicine List */}
              <div className="space-y-4">
                {result.medicines.map((med, index) => (
                  <MedicineCard 
                    key={index} 
                    medicine={med} 
                    rank={index + 1} 
                    countryCode={lastSearch?.targetCountry || 'JP'} 
                  />
                ))}
              </div>

              {/* Disclaimer */}
              <div className="mt-8 p-4 bg-slate-100 rounded-xl text-xs text-slate-500 text-center">
                <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <p>
                  이 정보는 AI가 생성한 참고용 정보입니다. 
                  복용 전 반드시 현지 약사나 의사와 상담하세요.
                </p>
              </div>
            </div>
          )}
        </main>
      </>
      ) : (
        <RankingView />
      )}
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;