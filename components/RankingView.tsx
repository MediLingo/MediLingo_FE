import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, MapPin, Loader2, MousePointerClick } from 'lucide-react';
import { COUNTRIES, RankingItem } from '../types';
import { fetchWeeklyRanking } from '../services/geminiService';

export const RankingView: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRankings = async () => {
      setLoading(true);
      try {
        const data = await fetchWeeklyRanking(selectedCountry, 10);
        setRankings(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadRankings();
  }, [selectedCountry]);

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-400 text-yellow-900 border-yellow-200';
      case 1: return 'bg-slate-300 text-slate-800 border-slate-200';
      case 2: return 'bg-amber-600 text-amber-50 border-amber-400';
      default: return 'bg-white text-slate-600 border-slate-200';
    }
  };

  const getTrophyColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-500'; // Gold
      case 1: return 'text-slate-400';  // Silver
      case 2: return 'text-amber-700';  // Bronze
      default: return 'text-slate-200';
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 pt-6 pb-20 min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-red-500 w-8 h-8" />
        <h2 className="text-2xl font-bold text-slate-900">인기 약 랭킹</h2>
      </div>

      {/* Country Selector */}
      <div className="mb-6 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-2">
            {COUNTRIES.filter((country) => country.name !== "대한민국").map((country) => (
            <button
              key={country.code}
              onClick={() => setSelectedCountry(country.code)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
              selectedCountry === country.code
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{country.flag}</span>
              <span>{country.name}</span>
            </button>
            ))}
        </div>
      </div>

      {/* Ranking List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-500" />
          <p>랭킹 정보를 불러오고 있습니다...</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          {rankings.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-200">
              <p>해당 국가의 랭킹 데이터가 없습니다.</p>
            </div>
          ) : (
            rankings.map((item, index) => (
              <div 
                key={item.localProductId}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden"
              >
                {/* Rank Badge */}
                <div className={`absolute top-0 left-0 w-10 h-10 flex items-center justify-center rounded-br-2xl font-bold text-lg shadow-sm border-r border-b ${getMedalColor(index)}`}>
                  {index + 1}
                </div>

                <div className="w-16 h-16 flex-shrink-0 ml-8 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                   {/* Handle image loading error nicely or use a placeholder */}
                   <img 
                      src={item.imageUrl} 
                      alt={item.localName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${item.localName}&background=random`;
                      }}
                   />
                </div>

                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm truncate mb-1">
                    {item.localName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                      <MapPin size={12} />
                      <span>{COUNTRIES.find(c => c.code === selectedCountry)?.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                      <MousePointerClick size={12} />
                      <span>{item.clickCount.toLocaleString()}회 조회</span>
                    </div>
                  </div>
                </div>

                {index < 3 && (
                  <div className="absolute top-4 right-2 opacity-10 pointer-events-none">
                    <Trophy size={64} className={getTrophyColor(index)} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};