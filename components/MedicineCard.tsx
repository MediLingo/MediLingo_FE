
import React, { useState } from 'react';
import { Medicine } from '../types';
import { Check, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
  rank: number;
  countryCode: string;
}

// ✅ baseURL + mock 토글 (Vite env)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim();

const USE_MOCK =
  String(import.meta.env.VITE_USE_MOCK || "false").toLowerCase() === "true";

// ✅ 슬래시 중복 방지 URL 조합
const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, rank, countryCode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const toggleExpand = async () => {
    // Determine the next state
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (!nextState) setImgError(false);
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
              <p className="text-xl font-bold text-blue-700 font-sans">{medicine.localName}</p>
            </div>
          </div>
          
          
          {medicine.coverageWarning && (
            <div className="mt-2 flex items-start gap-1 text-sm text-red-700 bg-red-50 px-2 py-1 rounded w-fit">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <span className="font-medium break-words">{medicine.coverageWarning}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100 animate-fadeIn">
          <div className="mt-4">
            {imgError ? (
              <div className="w-full h-80 rounded-lg mb-4 bg-slate-200 flex items-center justify-center">
                <p className="text-slate-600 text-2xl font-bold text-center px-4 break-words">
                  {medicine.localName}
                </p>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={medicine.name}
                className="w-full h-80 object-cover rounded-lg mb-4 bg-slate-200"
                onError={() => setImgError(true)}
              />
            )}
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-1"> 성분 설명</h4>
                <div className="flex items-start gap-1 text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                  <Check size={14} className="mt-0.5 flex-shrink-0" />
                  <span className="break-words">{medicine.matchReason}</span>
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
