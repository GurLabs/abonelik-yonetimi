import React from 'react';
import { Calendar, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Subscription } from '../types';
import { 
  getMonthlyCost, 
  formatPrice, 
  getDaysUntilRenewal 
} from '../utils/subscriptionUtils';

interface SummaryCardsProps {
  subscriptions: Subscription[];
  isOledDark: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  subscriptions,
  isOledDark
}) => {
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const pausedCount = subscriptions.length - activeSubs.length;

  // Calculate monthly total
  const totalMonthlyCost = activeSubs.reduce((acc, sub) => acc + getMonthlyCost(sub), 0);
  const totalYearlyCost = totalMonthlyCost * 12;

  // Find nearest upcoming renewal among active subscriptions
  let closestSub: Subscription | null = null;
  let minDays = Infinity;

  activeSubs.forEach((sub) => {
    const days = getDaysUntilRenewal(sub.billingDate, sub.billingCycle);
    if (days >= 0 && days < minDays) {
      minDays = days;
      closestSub = sub;
    }
  });

  const cardBgClass = isOledDark
    ? 'bg-zinc-950 border-zinc-800/90 text-white'
    : 'bg-white border-gray-200 text-gray-900';

  const subTextClass = isOledDark ? 'text-zinc-400' : 'text-gray-500';
  const iconBgClass = isOledDark ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-100 text-gray-700';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {/* Monthly Expense */}
      <div className={`border rounded-2xl p-4 shadow-xs transition-colors ${cardBgClass}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${subTextClass}`}>Aylık Toplam</span>
          <div className={`p-1.5 rounded-lg ${iconBgClass}`}>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight">
          {formatPrice(totalMonthlyCost)}
        </div>
        <p className={`text-[11px] mt-1 ${subTextClass}`}>
          Aylık aktif ödemeler
        </p>
      </div>

      {/* Yearly Expense */}
      <div className={`border rounded-2xl p-4 shadow-xs transition-colors ${cardBgClass}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${subTextClass}`}>Yıllık Tahmin</span>
          <div className={`p-1.5 rounded-lg ${iconBgClass}`}>
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight">
          {formatPrice(totalYearlyCost)}
        </div>
        <p className={`text-[11px] mt-1 ${subTextClass}`}>
          12 aylık projeksiyon
        </p>
      </div>

      {/* Active Subscriptions Count */}
      <div className={`border rounded-2xl p-4 shadow-xs transition-colors ${cardBgClass}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${subTextClass}`}>Abonelikler</span>
          <div className={`p-1.5 rounded-lg ${iconBgClass}`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight">
          {activeSubs.length}{' '}
          <span className={`text-xs font-normal ${subTextClass}`}>aktif</span>
        </div>
        <p className={`text-[11px] mt-1 ${subTextClass}`}>
          {pausedCount > 0 ? `${pausedCount} duraklatıldı` : 'Tümü aktif'}
        </p>
      </div>

      {/* Closest Renewal */}
      <div className={`border rounded-2xl p-4 shadow-xs transition-colors ${cardBgClass}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${subTextClass}`}>Yaklaşan Ödeme</span>
          <div className={`p-1.5 rounded-lg ${iconBgClass}`}>
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        {closestSub ? (
          <div>
            <div className="text-sm sm:text-base font-bold truncate">
              {(closestSub as Subscription).name}
            </div>
            <p className="text-[11px] text-emerald-500 font-semibold mt-1">
              {minDays === 0
                ? 'Bugün!'
                : minDays === 1
                ? 'Yarın'
                : `${minDays} gün kaldı`}
            </p>
          </div>
        ) : (
          <div>
            <div className={`text-sm font-medium ${subTextClass}`}>Ödeme yok</div>
            <p className={`text-[11px] mt-1 ${subTextClass}`}>Kayıtlı abonelik yok</p>
          </div>
        )}
      </div>
    </div>
  );
};
