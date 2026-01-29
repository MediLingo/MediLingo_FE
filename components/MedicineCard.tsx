
import React, { useState } from 'react';
import { Medicine } from '../types';
import { Pill, Droplets, SprayCan as Spray, Info, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
  rank: number;
  countryCode: string;
}

// ✅ baseURL + mock 토글 (Vite env)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "https://medilingo-be.onrender.com";

const USE_MOCK =
  String(import.meta.env.VITE_USE_MOCK || "false").toLowerCase() === "true";

// ✅ 슬래시 중복 방지 URL 조합
const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, rank, countryCode }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = async () => {
    // Determine the next state
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    let apiPath = '';

    // If we are expanding (state becoming true), call the API
    if (nextState) {
      try {
        const id = String((medicine as any).localProductId ?? "").trim();

        // Guard: if mapping is still using a temp id, skip tracking to avoid noisy 4xx
        if (!id || id.startsWith("temp_")) {
          console.warn("[track click] skipped (invalid id)", { id, medicine });
          return;
        }

        // NOTE: backend routes are typically under `/api` (align with other calls)
        apiPath = `/api/drugs/${encodeURIComponent(id)}/click`;
        const url = joinUrl(API_BASE_URL, apiPath);

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ countryCode }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn("[track click] failed", {
            status: res.status,
            url,
            body: text,
            id,
          });
        }
      } catch (error) {
        // Silently fail for analytics/tracking to not disrupt UX
        console.error("Failed to track click:", error);
      }
    }
  };

  const getIcon = () => {
    switch (medicine.type) {
      case 'liquid': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'cream': return <Spray className="w-5 h-5 text-purple-500" />;
      default: return <Pill className="w-5 h-5 text-emerald-500" />;
    }
  };

  // Use provided imageUrl or fallback to a placeholder
  const imageUrl = medicine.imageUrl 
    ? medicine.imageUrl 
    : `https://picsum.photos/300/200?random=${(medicine.name.length * 7) % 50 + 10}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4 transition-all hover:shadow-md">
      <div className="flex p-4 gap-4 cursor-pointer" onClick={toggleExpand}>
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {rank}
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">{medicine.name}</h3>
              <p className="text-xl font-bold text-blue-700 font-sans mt-1">{medicine.localName}</p>
            </div>
            <div className="bg-slate-100 p-2 rounded-lg">
              {getIcon()}
            </div>
          </div>
          
          <p className="text-sm text-slate-500 mt-1">{medicine.manufacturer}</p>
          
          <div className="mt-2 flex items-center gap-1 text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded w-fit">
            <Check size={14} />
            <span className="font-medium truncate max-w-[200px]">{medicine.matchReason}</span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100 animate-fadeIn">
          <div className="mt-4">
             <img 
              src={imageUrl} 
              alt={medicine.name} 
              className="w-full h-80 object-cover rounded-lg mb-4 bg-slate-200"
            />
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-1">효능 / 설명</h4>
                <p className="text-slate-700 text-sm">{medicine.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-1">복용법</h4>
                <p className="text-slate-800 font-medium text-sm bg-white border border-slate-200 p-2 rounded">
                  {medicine.usage}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-1">주요 성분</h4>
                <div className="flex flex-wrap gap-2">
                  {medicine.ingredients && medicine.ingredients.map((ing, idx) => (
                    <span key={idx} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button Area */}
      <button 
        onClick={toggleExpand}
        className="w-full py-2 bg-slate-50 border-t border-slate-100 text-slate-400 flex items-center justify-center hover:text-blue-600 transition-colors"
      >
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
    </div>
  );
};

export default MedicineCard;
