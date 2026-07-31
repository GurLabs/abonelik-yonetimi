import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { CATEGORIES } from '../types';

export type SortOption = 'renewal-asc' | 'price-desc' | 'name-asc';

interface FilterToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  isOledDark: boolean;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  isOledDark
}) => {
  const containerBg = isOledDark
    ? 'bg-zinc-950 border-zinc-800 text-white'
    : 'bg-white border-gray-200 text-gray-900';

  const inputBg = isOledDark
    ? 'bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-zinc-600'
    : 'bg-gray-50/70 border-gray-200 text-gray-900 focus:ring-gray-900';

  const selectBg = isOledDark
    ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
    : 'bg-gray-50 border-gray-200 text-gray-700';

  return (
    <div className={`border rounded-2xl p-3 mb-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${containerBg}`}>
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isOledDark ? 'text-zinc-500' : 'text-gray-400'}`} />
        <input
          type="text"
          placeholder="Abonelik veya not ara..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full min-h-[44px] text-xs pl-10 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${inputBg}`}
        />
      </div>

      {/* Filter and Sort Pickers */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Category filter */}
        <div className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 min-h-[44px] ${selectBg}`}>
          <Filter className={`w-3.5 h-3.5 shrink-0 ${isOledDark ? 'text-zinc-400' : 'text-gray-400'}`} />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-xs font-medium bg-transparent focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL" className={isOledDark ? 'bg-zinc-900 text-white' : ''}>Tüm Kategoriler</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className={isOledDark ? 'bg-zinc-900 text-white' : ''}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className={`border rounded-xl px-2.5 py-1.5 min-h-[44px] flex items-center ${selectBg}`}>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs font-medium bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="ALL" className={isOledDark ? 'bg-zinc-900 text-white' : ''}>Tüm Durumlar</option>
            <option value="active" className={isOledDark ? 'bg-zinc-900 text-white' : ''}>Sadece Aktifler</option>
            <option value="paused" className={isOledDark ? 'bg-zinc-900 text-white' : ''}>Sadece Duraklatılanlar</option>
          </select>
        </div>

        {/* Sort picker */}
        <div className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 min-h-[44px] ${selectBg}`}>
          <ArrowUpDown className={`w-3.5 h-3.5 shrink-0 ${isOledDark ? 'text-zinc-400' : 'text-gray-400'}`} />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="text-xs font-medium bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="renewal-asc" className={isOledDark ? 'bg-zinc-900 text-white' : ''}>Yenileme Yakınlığı</option>
            <option value="price-desc" className={isOledDark ? 'bg-zinc-900 text-white' : ''}>Yüksek Fiyat</option>
            <option value="name-asc" className={isOledDark ? 'bg-zinc-900 text-white' : ''}>İsim (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
