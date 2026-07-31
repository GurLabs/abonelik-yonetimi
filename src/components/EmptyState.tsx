import React from 'react';
import { CreditCard, Plus, SearchX } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  onOpenAddModal: () => void;
  onClearFilters?: () => void;
  isOledDark: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered,
  onOpenAddModal,
  onClearFilters,
  isOledDark
}) => {
  const containerBg = isOledDark
    ? 'bg-zinc-950 border-zinc-800 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  const iconBg = isOledDark ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-100 text-gray-700';
  const subText = isOledDark ? 'text-zinc-400' : 'text-gray-500';

  if (isFiltered) {
    return (
      <div className={`border border-dashed rounded-2xl p-10 text-center my-6 ${containerBg}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${iconBg}`}>
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold mb-1">
          Sonuç Bulunamadı
        </h3>
        <p className={`text-xs max-w-sm mx-auto mb-4 ${subText}`}>
          Arama ve filtre kriterlerinize uyan hiçbir abonelik bulunamadı.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold underline rounded-xl transition-colors ${
              isOledDark ? 'text-zinc-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Filtreleri Temizle
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`border border-dashed rounded-2xl p-10 text-center my-6 ${containerBg}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${iconBg}`}>
        <CreditCard className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold mb-1">
        Henüz Abonelik Eklenmedi
      </h3>
      <p className={`text-xs max-w-sm mx-auto mb-5 ${subText}`}>
        Düzenli ödemelerinizi ve yenileme tarihlerini takip etmek için ilk aboneliğinizi ekleyin.
      </p>
      <button
        onClick={onOpenAddModal}
        className={`min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-xs ${
          isOledDark
            ? 'bg-white text-black hover:bg-zinc-200'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        <Plus className="w-4 h-4" />
        <span>Abonelik Ekle</span>
      </button>
    </div>
  );
};
