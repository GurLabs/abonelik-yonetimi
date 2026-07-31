import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, Plus, LogIn, LogOut, User as UserIcon, Settings, Download, Trash2, Bell, AlertCircle } from 'lucide-react';
import { User, signInWithPopup, googleProvider, firebaseSignOut, auth } from '../lib/firebase';

interface HeaderProps {
  user: User | null;
  onOpenAddModal: () => void;
  isLoadingAuth: boolean;
  isOledDark: boolean;
  onToggleOledDark?: () => void;
  onExportCSV: () => void;
  onClearAllData: () => void;
  onRequestNotificationPermission: () => void;
  hasNotificationPermission: boolean;
  onOpenCancelAssistant: () => void;
  onOpenNotificationSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAddModal,
  isLoadingAuth,
  isOledDark,
  onExportCSV,
  onClearAllData,
  onRequestNotificationPermission,
  hasNotificationPermission,
  onOpenCancelAssistant,
  onOpenNotificationSettings
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const menuBg = isOledDark 
    ? 'bg-zinc-950 border-zinc-800 text-white shadow-2xl' 
    : 'bg-white border-gray-200 text-gray-900 shadow-xl';

  const menuItemHover = isOledDark
    ? 'hover:bg-zinc-900 text-zinc-200 hover:text-white'
    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900';

  return (
    <header className={`border-b sticky top-0 z-30 transition-colors ${
      isOledDark 
        ? 'bg-black border-zinc-800 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Branding */}
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium shadow-xs transition-colors ${
            isOledDark ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-gray-900 text-white'
          }`}>
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight leading-none">
              Abonelik Takibi
            </h1>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Settings Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              title="Ayarlar & Araçlar"
              aria-label="Ayarlar ve Araçlar Menüsü"
              className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                isOledDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
            </button>

            {isSettingsOpen && (
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border p-1.5 z-50 ${menuBg}`}>
                <div className={`px-3 py-2 border-b text-[11px] font-semibold tracking-wider uppercase ${isOledDark ? 'border-zinc-800 text-zinc-400' : 'border-gray-100 text-gray-400'}`}>
                  Araçlar & Ayarlar
                </div>

                {/* Cancellation Assistant */}
                <button
                  onClick={() => {
                    onOpenCancelAssistant();
                    setIsSettingsOpen(false);
                  }}
                  className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${menuItemHover}`}
                >
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>İptal Hatırlatıcısı & Rehber</span>
                </button>

                {/* Notification & Integration Settings */}
                <button
                  onClick={() => {
                    onOpenNotificationSettings();
                    setIsSettingsOpen(false);
                  }}
                  className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${menuItemHover}`}
                >
                  <Bell className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Bildirim & Webhook Ayarları</span>
                </button>

                {/* CSV Export */}
                <button
                  onClick={() => {
                    onExportCSV();
                    setIsSettingsOpen(false);
                  }}
                  className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${menuItemHover}`}
                >
                  <Download className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>CSV Dışa Aktar</span>
                </button>

                {/* Notification Permission Toggle */}
                <button
                  onClick={() => {
                    onRequestNotificationPermission();
                    setIsSettingsOpen(false);
                  }}
                  className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${menuItemHover}`}
                >
                  <Bell className={`w-4 h-4 shrink-0 ${hasNotificationPermission ? 'text-amber-500' : 'text-gray-400'}`} />
                  <span>
                    {hasNotificationPermission ? 'Bildirimler Aktif' : 'Bildirimleri Etkinleştir'}
                  </span>
                </button>

                <div className={`my-1 border-t ${isOledDark ? 'border-zinc-800' : 'border-gray-100'}`} />

                {/* Clear All Data */}
                <button
                  onClick={() => {
                    onClearAllData();
                    setIsSettingsOpen(false);
                  }}
                  className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                    isOledDark
                      ? 'hover:bg-rose-950/50 text-rose-400'
                      : 'hover:bg-rose-50 text-rose-600'
                  }`}
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span>Tüm Verileri Temizle</span>
                </button>
              </div>
            )}
          </div>

          {/* Auth Button */}
          {!isLoadingAuth && (
            <div>
              {user && !user.isAnonymous ? (
                <div className="flex items-center gap-1.5">
                  <div className={`hidden sm:flex items-center gap-2 text-xs px-2.5 py-2 rounded-xl border ${
                    isOledDark 
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-300' 
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-4 h-4 rounded-full" />
                    ) : (
                      <UserIcon className="w-3.5 h-3.5" />
                    )}
                    <span className="font-medium truncate max-w-[100px]">
                      {user.displayName || user.email || 'Kullanıcı'}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    title="Çıkış Yap"
                    aria-label="Çıkış Yap"
                    className={`min-h-[44px] min-w-[44px] p-2 rounded-xl flex items-center justify-center transition-colors ${
                      isOledDark
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border inline-flex items-center gap-1.5 transition-colors ${
                    isOledDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Google ile Giriş</span>
                </button>
              )}
            </div>
          )}

          {/* Add Subscription Button (Desktop view) */}
          <button
            onClick={onOpenAddModal}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs ${
              isOledDark
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Ekle</span>
          </button>
        </div>
      </div>
    </header>
  );
};

