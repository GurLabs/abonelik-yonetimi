import React from 'react';
import { 
  PauseCircle, 
  PlayCircle, 
  Trash2, 
  Edit3, 
  Clock, 
  Film, 
  Music, 
  Code, 
  BookOpen, 
  Heart, 
  Zap, 
  Tag,
  Sparkles
} from 'lucide-react';
import { Subscription, BILLING_CYCLE_LABELS } from '../types';
import { 
  formatPrice, 
  getDaysUntilRenewal, 
  calculateNextRenewalDate 
} from '../utils/subscriptionUtils';

interface SubscriptionItemProps {
  subscription: Subscription;
  isOledDark: boolean;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, newStatus: 'active' | 'paused') => void;
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'Yapay Zeka & AI': Sparkles,
  'Eğlence': Film,
  'Müzik & Medya': Music,
  'Çalışma & Yazılım': Code,
  'Eğitim': BookOpen,
  'Yaşam & Sağlık': Heart,
  'Fatura & Hizmet': Zap,
  'Diğer': Tag
};

export const SubscriptionItem: React.FC<SubscriptionItemProps> = ({
  subscription,
  isOledDark,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const isPaused = subscription.status === 'paused';
  const IconComponent = CATEGORY_ICONS[subscription.category] || Tag;

  const daysUntil = getDaysUntilRenewal(subscription.billingDate, subscription.billingCycle, subscription.customMonths);
  const nextDate = calculateNextRenewalDate(subscription.billingDate, subscription.billingCycle, subscription.customMonths);
  const formattedNextDate = nextDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short'
  });

  const billingLabel = subscription.billingCycle === 'custom'
    ? `${subscription.customMonths || 1} Ayda Bir`
    : BILLING_CYCLE_LABELS[subscription.billingCycle];

  const cardBg = isOledDark
    ? isPaused
      ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
      : 'bg-zinc-950 border-zinc-800/90 hover:border-zinc-700 text-white'
    : isPaused
      ? 'bg-gray-50/70 border-gray-200 opacity-70'
      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-900';

  const titleClass = isPaused
    ? isOledDark ? 'text-zinc-500 line-through' : 'text-gray-400 line-through'
    : isOledDark ? 'text-white' : 'text-gray-900';

  const badgeClass = isOledDark
    ? 'bg-zinc-900 text-zinc-300 border-zinc-800'
    : 'bg-gray-100 text-gray-700 border-gray-200';

  const iconContainerBg = isOledDark
    ? isPaused ? 'bg-zinc-900 text-zinc-600' : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
    : isPaused ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-800';

  const subText = isOledDark ? 'text-zinc-400' : 'text-gray-500';

  return (
    <div 
      className={`border rounded-2xl p-4 transition-all duration-150 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${cardBg}`}
    >
      {/* Left side: Icon + Name + Category + Renewal */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-medium ${iconContainerBg}`}>
          <IconComponent className="w-5.5 h-5.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-sm sm:text-base font-semibold truncate ${titleClass}`}>
              {subscription.name}
            </h3>
            
            <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md border ${badgeClass}`}>
              {subscription.category}
            </span>

            {!isPaused && daysUntil >= 0 && daysUntil <= 3 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                {daysUntil === 0 ? 'Bugün Yenileniyor!' : `${daysUntil} Gün Kaldı!`}
              </span>
            )}

            {isPaused && (
              <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                isOledDark 
                  ? 'bg-amber-950/60 text-amber-300 border-amber-900/50' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Duraklatıldı
              </span>
            )}
          </div>

          <div className={`flex items-center gap-2.5 text-xs mt-1 flex-wrap ${subText}`}>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>
                Yenileme: <strong className={`font-semibold ${isOledDark ? 'text-zinc-200' : 'text-gray-800'}`}>{formattedNextDate}</strong>
              </span>
            </div>

            {!isPaused && (
              <span className={`text-[11px] font-semibold ${
                daysUntil <= 3 
                  ? 'text-rose-500' 
                  : daysUntil <= 7 
                  ? 'text-amber-500' 
                  : subText
              }`}>
                ({daysUntil === 0 ? 'Bugün!' : `${daysUntil} gün kaldı`})
              </span>
            )}

            {subscription.notes && (
              <span className={`text-xs truncate max-w-[200px] ${isOledDark ? 'text-zinc-500' : 'text-gray-400'}`} title={subscription.notes}>
                • {subscription.notes}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Price & Action Buttons */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-zinc-800/80">
        {/* Price */}
        <div className="text-left sm:text-right">
          <div className={`text-base sm:text-lg font-bold tracking-tight ${isOledDark ? 'text-white' : 'text-gray-900'}`}>
            {formatPrice(subscription.price)}
            <span className={`text-xs font-normal ml-1 ${subText}`}>
              / {billingLabel}
            </span>
          </div>
        </div>

        {/* Action buttons with Touch targets (min 44px) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleStatus(subscription.id, isPaused ? 'active' : 'paused')}
            title={isPaused ? 'Aktif Et' : 'Duraklat'}
            aria-label={isPaused ? 'Aktif Et' : 'Duraklat'}
            className={`min-h-[44px] min-w-[44px] p-2 rounded-xl flex items-center justify-center transition-colors ${
              isOledDark 
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' 
                : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {isPaused ? <PlayCircle className="w-5 h-5 text-emerald-500" /> : <PauseCircle className="w-5 h-5" />}
          </button>

          <button
            onClick={() => onEdit(subscription)}
            title="Düzenle"
            aria-label="Düzenle"
            className={`min-h-[44px] min-w-[44px] p-2 rounded-xl flex items-center justify-center transition-colors ${
              isOledDark 
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' 
                : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Edit3 className="w-5 h-5" />
          </button>

          <button
            onClick={() => onDelete(subscription.id)}
            title="Sil"
            aria-label="Sil"
            className={`min-h-[44px] min-w-[44px] p-2 rounded-xl flex items-center justify-center transition-colors ${
              isOledDark 
                ? 'text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40' 
                : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
