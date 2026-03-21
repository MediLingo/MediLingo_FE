import React, { useState } from 'react';
import SearchHeader from './components/SearchHeader';
import MedicineCard from './components/MedicineCard';
import BottomNav from './components/BottomNav';
import { RankingView } from './components/RankingView';
import { findMedicine } from './services/geminiService';
import { SearchResult, SearchState, SearchType } from './types';
import { AlertTriangle, Info, Globe, ShieldCheck, Thermometer, Pill } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'ranking'>('search');
  
  // Search State
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<SearchState | null>(null);
  const [searchType, setSearchType] = useState<SearchType>('drug');

  const handleSearch = async (params: SearchState) => {
    console.log("[App] handleSearch called", params);
    setLoading(true);
    setError(null);
    setResult(null);
    setLastSearch(params);

    try {
      console.log("[App] calling findMedicine");
      const data = await findMedicine(
        params.homeCountry,
        params.targetCountry,
        params.query,
        params.image,
        params.searchType,
        params.symptoms
      );
      console.log("[App] findMedicine returned", data);
      setResult(data);
    } catch (err: any) {
      console.error("[App] handleSearch error", err);
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
          lastSearch={lastSearch}
          onSearchTypeChange={setSearchType}
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
              

              {searchType === 'drug' ? (
                <div className="mt-6">
                  <p className="text-xs text-slate-400 mb-3">자주 찾는 약</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['타이레놀', '판콜', '콜대원', '알보칠', '게보린', '이지엔식스', '판피린', '알레그라'].map((medicine) => (
                      <button
                        key={medicine}
                        onClick={() => handleSearch({
                          homeCountry: 'KR',
                          targetCountry: 'US',
                          query: medicine,
                          image: null,
                          searchType: 'drug',
                          symptoms: undefined,
                        })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
                      >
                        {medicine}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <p className="text-xs text-slate-400 mb-3">자주 찾는 증상</p>
                  <div className="flex flex-col gap-2 items-center">
                    {[
                      { label: '몸이 으슬으슬해요', symptom: '오한' },
                      { label: '열이 나요', symptom: '발열' },
                      { label: '목이 아파요', symptom: '인후통' },
                      { label: '콧물이 나요', symptom: '콧물' },
                      { label: '배가 아파요', symptom: '복통' },
                    ].map(({ label, symptom }) => (
                      <button
                        key={symptom}
                        onClick={() => handleSearch({
                          homeCountry: 'KR',
                          targetCountry: 'US',
                          query: `${symptom}(보통)`,
                          image: null,
                          searchType: 'symptom',
                          symptoms: [{ name: symptom, severity: '보통' }],
                        })}
                        className="w-full max-w-xs px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm text-left"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                        {lastSearch.searchType === 'drug'
                          ? lastSearch.query
                          : lastSearch.symptoms?.map(s => s.name).join(', ') || lastSearch.query}
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
                <div className="w-full">
                  <p className="font-semibold mb-1">AI 약사 조언</p>
                  <p>{result.advice}</p>
                  {result.ingredients.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <p className="font-semibold mb-2">주요 성분</p>
                      <div className="flex flex-wrap gap-2">
                        {result.ingredients.map((ing, idx) => (
                          <span key={idx} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full border border-amber-200">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Medicine List */}
              <div className="space-y-4">
                {result.medicines.map((med, index) => (
                  <MedicineCard 
                    key={index} 
                    medicine={med} 
                    rank={index + 1} 
                    countryCode={lastSearch?.targetCountry || 'US'} 
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