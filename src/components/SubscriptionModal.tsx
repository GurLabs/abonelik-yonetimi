import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { 
  Subscription, 
  BillingCycle, 
  Category, 
  CATEGORIES, 
  BILLING_CYCLE_LABELS 
} from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subData: Omit<Subscription, 'id' | 'userId'>) => Promise<void>;
  editingSubscription?: Subscription | null;
  isOledDark: boolean;
}

// Preset shortcuts with standard TRY pricing
const PRESETS = [
  { name: 'Claude Pro', price: 799.99, cycle: 'monthly' as BillingCycle, category: 'Yapay Zeka & AI' as Category },
  { name: 'ChatGPT Plus', price: 650.00, cycle: 'monthly' as BillingCycle, category: 'Yapay Zeka & AI' as Category },
  { name: 'Hepsiburada Premium', price: 69.90, cycle: 'monthly' as BillingCycle, category: 'Fatura & Hizmet' as Category },
  { name: 'TV+ x HBO Max', price: 129.99, cycle: 'monthly' as BillingCycle, category: 'Eğlence' as Category },
  { name: 'Netflix', price: 149.99, cycle: 'monthly' as BillingCycle, category: 'Eğlence' as Category },
  { name: 'Spotify', price: 59.99, cycle: 'monthly' as BillingCycle, category: 'Müzik & Medya' as Category },
  { name: 'YouTube Premium', price: 57.99, cycle: 'monthly' as BillingCycle, category: 'Müzik & Medya' as Category },
  { name: 'Amazon Prime', price: 39.00, cycle: 'monthly' as BillingCycle, category: 'Eğlence' as Category }
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSubscription,
  isOledDark
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [customMonths, setCustomMonths] = useState<string>('3');
  const [billingDate, setBillingDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<Category>('Eğlence');
  const [status, setStatus] = useState<'active' | 'paused'>('active');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingSubscription) {
      setName(editingSubscription.name);
      setPrice(String(editingSubscription.price));
      setBillingCycle(editingSubscription.billingCycle);
      setCustomMonths(String(editingSubscription.customMonths || 3));
      setBillingDate(editingSubscription.billingDate || new Date().toISOString().split('T')[0]);
      setCategory(editingSubscription.category);
      setStatus(editingSubscription.status);
      setNotes(editingSubscription.notes || '');
    } else {
      setName('');
      setPrice('');
      setBillingCycle('monthly');
      setCustomMonths('3');
      setBillingDate(new Date().toISOString().split('T')[0]);
      setCategory('Eğlence');
      setStatus('active');
      setNotes('');
    }
    setError(null);
  }, [editingSubscription, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setName(preset.name);
    setPrice(String(preset.price));
    setBillingCycle(preset.cycle);
    setCategory(preset.category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Lütfen bir abonelik adı girin.');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Geçerli bir tutar girin.');
      return;
    }

    const parsedCustomMonths = parseInt(customMonths, 10);
    if (billingCycle === 'custom' && (isNaN(parsedCustomMonths) || parsedCustomMonths < 1)) {
      setError('Geçerli bir ay sayısı girin.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        name: name.trim(),
        price: parsedPrice,
        billingCycle,
        customMonths: billingCycle === 'custom' ? parsedCustomMonths : undefined,
        billingDate,
        category,
        status,
        notes: notes.trim()
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save subscription:', err);
      setError(err?.message || 'Abonelik kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalBg = isOledDark
    ? 'bg-zinc-950 text-white border-zinc-800'
    : 'bg-white text-gray-900 border-gray-200';

  const inputClass = isOledDark
    ? 'bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-zinc-600'
    : 'bg-white border-gray-300 text-gray-900 focus:ring-gray-900';

  const labelClass = isOledDark ? 'text-zinc-300' : 'text-gray-700';
  const borderHeader = isOledDark ? 'border-zinc-800' : 'border-gray-100';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className={`w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-all ${modalBg}`}>
        {/* Modal Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${borderHeader}`}>
          <h2 className="text-base font-bold">
            {editingSubscription ? 'Abonelik Düzenle' : 'Yeni Abonelik Ekle'}
          </h2>
          <button
            onClick={onClose}
            className={`min-h-[44px] min-w-[44px] p-2 rounded-xl flex items-center justify-center transition-colors ${
              isOledDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className={`p-3 rounded-xl border text-xs font-medium ${
              isOledDark ? 'bg-rose-950/40 border-rose-900 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              {error}
            </div>
          )}

          {/* Quick Preset Buttons */}
          {!editingSubscription && (
            <div>
              <label className={`block text-xs font-medium mb-1.5 flex items-center gap-1 ${labelClass}`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Hızlı Şablonlar:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                      isOledDark
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                    }`}
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className={`block text-xs font-medium mb-1 ${labelClass}`}>
              Abonelik Adı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="örn. Netflix, Spotify, Gym, İnternet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full min-h-[44px] text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
            />
          </div>

          {/* Price */}
          <div>
            <label className={`block text-xs font-medium mb-1 ${labelClass}`}>
              Tutar (₺) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold ${isOledDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                ₺
              </span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="149.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full min-h-[44px] text-sm pl-8 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
              />
            </div>
          </div>

          {/* Cycle & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${labelClass}`}>
                Ödeme Periyodu
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className={`w-full min-h-[44px] text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all cursor-pointer ${inputClass}`}
              >
                <option value="monthly" className={isOledDark ? 'bg-zinc-900 text-white' : ''}>Aylık</option>
                <option value="yearly" className={isOledDark ? 'bg-zinc-900 text-white' : ''}>Yıllık</option>
                <option value="weekly" className={isOledDark ? 'bg-zinc-900 text-white' : ''}>Haftalık</option>
                <option value="custom" className={isOledDark ? 'bg-zinc-900 text-white' : ''}>Özel (Ay Seçimi)</option>
              </select>
            </div>

            {billingCycle === 'custom' ? (
              <div>
                <label className={`block text-xs font-medium mb-1 ${labelClass}`}>
                  Kaç Ayda Bir Ödeniyor?
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  required
                  placeholder="örn. 3 veya 6"
                  value={customMonths}
                  onChange={(e) => setCustomMonths(e.target.value)}
                  className={`w-full min-h-[44px] text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
                />
              </div>
            ) : (
              <div>
                <label className={`block text-xs font-medium mb-1 ${labelClass}`}>
                  İlk / Yenileme Tarihi
                </label>
                <input
                  type="date"
                  required
                  value={billingDate}
                  onChange={(e) => setBillingDate(e.target.value)}
                  className={`w-full min-h-[44px] text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
                />
              </div>
            )}
          </div>

          {billingCycle === 'custom' && (
            <div>
              <label className={`block text-xs font-medium mb-1 ${labelClass}`}>
                İlk / Yenileme Tarihi
              </label>
              <input
                type="date"
                required
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
                className={`w-full min-h-[44px] text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
              />
            </div>
          )}

          {/* Category */}
          <div>
            <label className={`block text-xs font-medium mb-1 ${labelClass}`}>
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={`w-full min-h-[44px] text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all cursor-pointer ${inputClass}`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className={isOledDark ? 'bg-zinc-900 text-white' : ''}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={`block text-xs font-medium mb-1 ${labelClass}`}>
              Durum
            </label>
            <div className="flex items-center gap-6 text-sm font-medium mt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Aktif</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="status"
                  value="paused"
                  checked={status === 'paused'}
                  onChange={() => setStatus('paused')}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                <span>Duraklatıldı</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-xs font-medium mb-1 ${labelClass}`}>
              Notlar (Opsiyonel)
            </label>
            <input
              type="text"
              placeholder="örn. Aile planı, Kredi kartından çekiliyor"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full min-h-[44px] text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
            />
          </div>

          {/* Actions */}
          <div className={`pt-4 border-t flex items-center justify-end gap-3 shrink-0 ${borderHeader}`}>
            <button
              type="button"
              onClick={onClose}
              className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-xl transition-colors ${
                isOledDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-xs disabled:opacity-50 ${
                isOledDark
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
