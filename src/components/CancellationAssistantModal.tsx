import React, { useState } from 'react';
import { ExternalLink, X, Bell, AlertCircle, HelpCircle, Check, Search, Info } from 'lucide-react';
import { POPULAR_CANCELLATION_GUIDES, CancellationGuide } from '../data/cancellationGuides';
import { Subscription } from '../types';

interface CancellationAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  isOledDark: boolean;
  onRequestNotificationPermission: () => void;
  hasNotificationPermission: boolean;
}

export const CancellationAssistantModal: React.FC<CancellationAssistantModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  isOledDark,
  onRequestNotificationPermission,
  hasNotificationPermission
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<CancellationGuide | null>(null);

  if (!isOpen) return null;

  const filteredGuides = POPULAR_CANCELLATION_GUIDES.filter((guide) =>
    guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const modalBg = isOledDark
    ? 'bg-zinc-950 text-white border-zinc-800'
    : 'bg-white text-gray-900 border-gray-200';

  const subText = isOledDark ? 'text-zinc-400' : 'text-gray-500';
  const headerBorder = isOledDark ? 'border-zinc-800' : 'border-gray-100';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all my-8 ${modalBg}`}>
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${headerBorder}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isOledDark ? 'bg-amber-950/60 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Abonelik İptal Hatırlatıcısı ve Rehberi
              </h3>
              <p className={`text-xs ${subText}`}>
                Tek tıkla doğrudan abonelik iptal sayfalarına gidin & hatırlatıcı kurun
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isOledDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Notification Alert Banner */}
          {!hasNotificationPermission && (
            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              isOledDark ? 'bg-amber-950/40 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2.5 text-xs font-medium">
                <Bell className="w-4 h-4 text-amber-500 shrink-0" />
                <span>İptal hatırlatma alarmları için tarayıcı bildirimlerini aktif edin.</span>
              </div>
              <button
                onClick={onRequestNotificationPermission}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shrink-0 transition-colors"
              >
                Bildirimi Aç
              </button>
            </div>
          )}

          {/* Quick Filter Search */}
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${subText}`} />
            <input
              type="text"
              placeholder="İptal etmek istediğiniz servisi arayın (Netflix, Spotify, Adobe...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full min-h-[44px] pl-10 pr-4 py-2 text-xs font-medium rounded-xl border focus:outline-none focus:ring-2 ${
                isOledDark
                  ? 'bg-zinc-900 border-zinc-800 text-white focus:ring-amber-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-amber-500'
              }`}
            />
          </div>

          {/* Popular Services Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-amber-500">
              Popüler Servisler & Doğrudan İptal Bağlantıları
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto custom-scrollbar p-1">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-colors ${
                    isOledDark
                      ? 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900'
                      : 'bg-gray-50 border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold block">{guide.name}</span>
                      <span className={`text-[10px] ${subText}`}>{guide.category}</span>
                    </div>

                    <a
                      href={guide.cancelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>İptal Et</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <button
                    onClick={() => setSelectedGuide(selectedGuide?.id === guide.id ? null : guide)}
                    className={`text-[11px] font-semibold text-left inline-flex items-center gap-1 transition-colors ${
                      isOledDark ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Info className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{selectedGuide?.id === guide.id ? 'Adımları Gizle' : 'Adım Adım Nasıl İptal Edilir?'}</span>
                  </button>

                  {/* Step by step guide collapse */}
                  {selectedGuide?.id === guide.id && (
                    <div className={`mt-2 p-2.5 rounded-lg border text-[11px] space-y-1.5 ${
                      isOledDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-white border-gray-200 text-gray-700'
                    }`}>
                      {guide.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="font-bold text-amber-500 shrink-0">{idx + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-end ${headerBorder}`}>
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black font-semibold text-xs transition-colors"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
};
