import React, { useState } from 'react';
import { CheckCircle2, Clock, Calendar, Check, X, ShieldCheck } from 'lucide-react';
import { Subscription } from '../types';
import { formatPrice, getMonthlyCost } from '../utils/subscriptionUtils';

interface PaymentHistoryViewProps {
  subscriptions: Subscription[];
  isOledDark: boolean;
  onTogglePaymentStatus: (subId: string, monthKey: string) => void;
}

export const PaymentHistoryView: React.FC<PaymentHistoryViewProps> = ({
  subscriptions,
  isOledDark,
  onTogglePaymentStatus
}) => {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month, -1 = last month, etc.

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + selectedMonthOffset);

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthLabel = targetDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  // Calculate totals for selected month
  let totalCost = 0;
  let totalPaid = 0;
  let paidCount = 0;

  activeSubs.forEach((sub) => {
    const cost = getMonthlyCost(sub);
    totalCost += cost;
    const isPaid = (sub.paidMonths || []).includes(monthKey);
    if (isPaid) {
      totalPaid += cost;
      paidCount++;
    }
  });

  const pendingCost = Math.max(0, totalCost - totalPaid);
  const percentPaid = totalCost > 0 ? Math.round((totalPaid / totalCost) * 100) : 0;

  const cardBg = isOledDark
    ? 'bg-zinc-950 border-zinc-800 text-white'
    : 'bg-white border-gray-200 text-gray-900';

  const subText = isOledDark ? 'text-zinc-400' : 'text-gray-500';

  return (
    <div className="space-y-6 mb-6">
      {/* Month Picker & Overall Stats */}
      <div className={`border rounded-2xl p-4 sm:p-5 shadow-xs ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold capitalize">
                {monthLabel} Ödeme Kayıtları
              </h2>
            </div>
            <p className={`text-xs mt-0.5 ${subText}`}>
              Aboneliklerinizin ödeme onay geçmişi ve durumu
            </p>
          </div>

          {/* Month selector buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedMonthOffset((prev) => prev - 1)}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isOledDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ← Önceki Ay
            </button>
            {selectedMonthOffset !== 0 && (
              <button
                onClick={() => setSelectedMonthOffset(0)}
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black text-xs font-semibold"
              >
                Bu Ay
              </button>
            )}
            <button
              onClick={() => setSelectedMonthOffset((prev) => prev + 1)}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isOledDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sonraki Ay →
            </button>
          </div>
        </div>

        {/* Paid Progress metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className={`p-3.5 rounded-xl border ${isOledDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-emerald-50/60 border-emerald-100'}`}>
            <span className={`text-xs font-medium ${subText}`}>Ödenen Tutar</span>
            <div className="text-xl font-bold text-emerald-500 mt-1">
              {formatPrice(totalPaid)}
            </div>
            <p className={`text-[11px] mt-0.5 ${subText}`}>{paidCount} / {activeSubs.length} abonelik tamamlandı</p>
          </div>

          <div className={`p-3.5 rounded-xl border ${isOledDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-amber-50/60 border-amber-100'}`}>
            <span className={`text-xs font-medium ${subText}`}>Kalan Ödemeler</span>
            <div className="text-xl font-bold text-amber-500 mt-1">
              {formatPrice(pendingCost)}
            </div>
            <p className={`text-[11px] mt-0.5 ${subText}`}>{activeSubs.length - paidCount} abonelik bekleniyor</p>
          </div>

          <div className={`p-3.5 rounded-xl border ${isOledDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`text-xs font-medium ${subText}`}>Tamamlanma Oranı</span>
            <div className="text-xl font-bold mt-1">
              %{percentPaid}
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${percentPaid}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription List with Toggle Payment */}
      <div className={`border rounded-2xl p-4 sm:p-5 shadow-xs ${cardBg}`}>
        <h3 className="text-sm font-bold mb-4">
          {monthLabel} İçin Abonelik Ödeme Onayları
        </h3>

        {activeSubs.length === 0 ? (
          <p className={`text-xs text-center py-8 ${subText}`}>
            Aktif aboneliğiniz bulunmuyor.
          </p>
        ) : (
          <div className="space-y-2.5">
            {activeSubs.map((sub) => {
              const isPaid = (sub.paidMonths || []).includes(monthKey);

              return (
                <div
                  key={sub.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isPaid
                      ? isOledDark
                        ? 'bg-emerald-950/30 border-emerald-800/80'
                        : 'bg-emerald-50/50 border-emerald-200'
                      : isOledDark
                      ? 'bg-zinc-900/40 border-zinc-800'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                      isPaid
                        ? 'bg-emerald-500 text-white'
                        : isOledDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isPaid ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{sub.name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                          isPaid
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                        }`}>
                          {isPaid ? 'Ödendi' : 'Bekliyor'}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 ${subText}`}>
                        {sub.category} • {formatPrice(sub.price)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onTogglePaymentStatus(sub.id, monthKey)}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs ${
                      isPaid
                        ? isOledDark
                          ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isPaid ? (
                      <>
                        <X className="w-4 h-4 text-rose-500" />
                        <span>Ödemeyi İptal Et</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ödendi İşaretle</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
