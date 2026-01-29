import React from 'react';
import { Search, Trophy } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'search' | 'ranking';
  onTabChange: (tab: 'search' | 'ranking') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex max-w-md mx-auto">
        <button
          onClick={() => onTabChange('search')}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
            activeTab === 'search' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Search size={24} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
          <span className="text-xs font-medium">약 찾기</span>
        </button>
        
        <button
          onClick={() => onTabChange('ranking')}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
            activeTab === 'ranking' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Trophy size={24} strokeWidth={activeTab === 'ranking' ? 2.5 : 2} />
          <span className="text-xs font-medium">인기 랭킹</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;