import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Film, Music, Code, BookOpen, Heart, Zap, Tag, Sparkles } from 'lucide-react';
import { Subscription } from '../types';
import { formatPrice, calculateNextRenewalDate } from '../utils/subscriptionUtils';

interface CalendarViewProps {
  subscriptions: Subscription[];
  isOledDark: boolean;
  onTogglePaymentStatus: (subId: string, monthKey: string) => void;
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

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  subscriptions,
  isOledDark,
  onTogglePaymentStatus
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const currentMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  const monthName = currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar grid calculations
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get weekday index (0 = Mon, 6 = Sun)
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday

  const today = new Date();
  const isCurrentMonthView = today.getFullYear() === year && today.getMonth() === month;
  const todayDateNum = today.getDate();

  // Map active subscriptions to their renewal day in this view month
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  const subsByDay: Record<number, Subscription[]> = {};

  activeSubs.forEach((sub) => {
    const nextRenewal = calculateNextRenewalDate(sub.billingDate, sub.billingCycle, sub.customMonths);
    // If the renewal falls within the current view month and year
    if (nextRenewal.getFullYear() === year && nextRenewal.getMonth() === month) {
      const dayNum = nextRenewal.getDate();
      if (!subsByDay[dayNum]) {
        subsByDay[dayNum] = [];
      }
      subsByDay[dayNum].push(sub);
    } else {
      // Fallback for standard monthly billing date day matching
      const billingDateObj = new Date(sub.billingDate);
      const dayNum = Math.min(billingDateObj.getDate(), daysInMonth);
      if (!subsByDay[dayNum]) {
        subsByDay[dayNum] = [];
      }
      if (!subsByDay[dayNum].some((s) => s.id === sub.id)) {
        subsByDay[dayNum].push(sub);
      }
    }
  });

  const cardBg = isOledDark
    ? 'bg-zinc-950 border-zinc-800 text-white'
    : 'bg-white border-gray-200 text-gray-900';

  const subText = isOledDark ? 'text-zinc-400' : 'text-gray-500';

  return (
    <div className={`border rounded-2xl p-4 sm:p-5 shadow-xs mb-6 ${cardBg}`}>
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-bold capitalize">
            {monthName} Takvimi
          </h2>
          <p className={`text-xs mt-0.5 ${subText}`}>
            Bu ayki abonelik yenileme ve ödeme günleri
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className={`min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              isOledDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bu Ay
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              title="Önceki Ay"
              className={`min-h-[44px] min-w-[44px] p-2 rounded-xl border flex items-center justify-center transition-colors ${
                isOledDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              title="Sonraki Ay"
              className={`min-h-[44px] min-w-[44px] p-2 rounded-xl border flex items-center justify-center transition-colors ${
                isOledDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
        {WEEKDAYS.map((day) => (
          <div key={day} className={`text-[11px] font-bold uppercase py-1 ${subText}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Empty leading cells */}
        {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="min-h-[80px] sm:min-h-[100px] rounded-xl opacity-20 bg-gray-50 dark:bg-zinc-900/40" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const isTodayCell = isCurrentMonthView && dayNum === todayDateNum;
          const daySubs = subsByDay[dayNum] || [];

          return (
            <div
              key={`day-${dayNum}`}
              className={`min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                isTodayCell
                  ? isOledDark
                    ? 'border-white bg-zinc-900/90 font-bold'
                    : 'border-gray-900 bg-gray-50 font-bold'
                  : isOledDark
                  ? 'border-zinc-900 bg-zinc-950/60'
                  : 'border-gray-100 bg-white'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs ${isTodayCell ? 'text-amber-500 font-extrabold' : subText}`}>
                  {dayNum}
                </span>
                {isTodayCell && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-black">
                    Bugün
                  </span>
                )}
              </div>

              {/* Subscriptions List on this Day */}
              <div className="space-y-1 overflow-y-auto max-h-[65px] custom-scrollbar">
                {daySubs.map((sub) => {
                  const IconComp = CATEGORY_ICONS[sub.category] || Tag;
                  const isPaid = (sub.paidMonths || []).includes(currentMonthKey);

                  return (
                    <button
                      key={sub.id}
                      onClick={() => onTogglePaymentStatus(sub.id, currentMonthKey)}
                      title={`${sub.name} - ${formatPrice(sub.price)} (${isPaid ? 'Ödendi' : 'Tıkla ve Ödendi İşaretle'})`}
                      className={`w-full text-left p-1 rounded-lg border text-[10px] flex items-center justify-between gap-1 transition-transform active:scale-95 ${
                        isPaid
                          ? isOledDark
                            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : isOledDark
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                          : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        {isPaid ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        ) : (
                          <IconComp className="w-3 h-3 opacity-70 shrink-0" />
                        )}
                        <span className="truncate font-semibold">{sub.name}</span>
                      </div>
                      <span className="font-bold shrink-0">{formatPrice(sub.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
