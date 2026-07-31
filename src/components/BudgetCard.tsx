import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle, Edit2, Check, X } from 'lucide-react';
import { formatPrice } from '../utils/subscriptionUtils';

interface BudgetCardProps {
  totalMonthlyCost: number;
  monthlyBudget: number;
  onUpdateBudget: (newBudget: number) => void;
  isOledDark: boolean;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  totalMonthlyCost,
  monthlyBudget,
  onUpdateBudget,
  isOledDark
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetValue, setBudgetValue] = useState(String(monthlyBudget));

  const percent = monthlyBudget > 0 ? Math.min(Math.round((totalMonthlyCost / monthlyBudget) * 100), 100) : 0;
  const isOverBudget = totalMonthlyCost > monthlyBudget;
  const remaining = monthlyBudget - totalMonthlyCost;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetValue);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget(val);
      setIsEditing(false);
    }
  };

  const cardBg = isOledDark
    ? isOverBudget
      ? 'bg-rose-950/30 border-rose-900/80 text-white'
      : 'bg-zinc-950 border-zinc-800/90 text-white'
    : isOverBudget
      ? 'bg-rose-50/80 border-rose-200 text-rose-950'
      : 'bg-white border-gray-200 text-gray-900';

  const subText = isOledDark ? 'text-zinc-400' : 'text-gray-500';

  return (
    <div className={`border rounded-2xl p-4 sm:p-5 mb-6 shadow-xs transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${
            isOverBudget 
              ? 'bg-rose-500/20 text-rose-500' 
              : isOledDark ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-100 text-gray-700'
          }`}>
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              Aylık Abonelik Bütçesi
            </h3>
            <p className={`text-xs ${subText}`}>
              Belirlediğiniz bütçe limiti ve harcama durumu
            </p>
          </div>
        </div>

        {/* Edit Budget Action */}
        {!isEditing ? (
          <button
            onClick={() => {
              setBudgetValue(String(monthlyBudget));
              setIsEditing(true);
            }}
            className={`min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
              isOledDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Bütçeyi Düzenle</span>
          </button>
        ) : (
          <form onSubmit={handleSave} className="flex items-center gap-1.5">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold opacity-60">₺</span>
              <input
                type="number"
                step="50"
                min="100"
                value={budgetValue}
                onChange={(e) => setBudgetValue(e.target.value)}
                className={`w-28 min-h-[44px] text-xs font-bold pl-6 pr-2 py-1.5 rounded-xl border focus:outline-none focus:ring-2 ${
                  isOledDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                autoFocus
              />
            </div>
            <button
              type="submit"
              title="Kaydet"
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="İptal"
              onClick={() => setIsEditing(false)}
              className={`min-h-[44px] min-w-[44px] p-2 rounded-xl flex items-center justify-center ${
                isOledDark ? 'text-zinc-400 hover:text-white' : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Progress & Values */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>Harcama: {formatPrice(totalMonthlyCost)}</span>
          <span>Bütçe Sınırı: {formatPrice(monthlyBudget)}</span>
        </div>

        {/* Progress bar */}
        <div className={`w-full h-3 rounded-full overflow-hidden ${
          isOledDark ? 'bg-zinc-900' : 'bg-gray-100'
        }`}>
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isOverBudget
                ? 'bg-rose-500'
                : percent >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Status Message Banner */}
        <div className="flex items-center justify-between text-xs pt-1">
          {isOverBudget ? (
            <div className="flex items-center gap-1.5 font-bold text-rose-500 animate-pulse">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Bütçe Sınırı Aşıldı! ({formatPrice(Math.abs(remaining))} fazla harcandı)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-semibold text-emerald-500">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Bütçe Dahilinde ({formatPrice(remaining)} kullanılabilir limit kaldı)</span>
            </div>
          )}

          <span className={`font-medium ${subText}`}>
            %{percent} Kullanıldı
          </span>
        </div>
      </div>
    </div>
  );
};
