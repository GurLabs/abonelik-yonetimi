import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { BudgetCard } from './components/BudgetCard';
import { CalendarView } from './components/CalendarView';
import { PaymentHistoryView } from './components/PaymentHistoryView';
import { SubscriptionItem } from './components/SubscriptionItem';
import { SubscriptionModal } from './components/SubscriptionModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FilterToolbar, SortOption } from './components/FilterToolbar';
import { EmptyState } from './components/EmptyState';
import { CancellationAssistantModal } from './components/CancellationAssistantModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { Footer } from './components/Footer';
import { Subscription } from './types';
import { 
  auth, 
  onAuthStateChanged, 
  signInAnonymously, 
  User 
} from './lib/firebase';
import { 
  subscribeToUserSubscriptions, 
  addSubscription, 
  updateSubscription, 
  deleteSubscription,
  clearAllUserSubscriptions 
} from './services/subscriptionService';
import { getDaysUntilRenewal, getMonthlyCost, formatPrice } from './utils/subscriptionUtils';
import { exportSubscriptionsToCSV } from './utils/exportUtils';
import { Loader2, Plus, Bell, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(true);

  // OLED Dark mode state persisted in localStorage
  const [isOledDark, setIsOledDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('sub_tracker_oled_theme');
    return savedTheme ? savedTheme === 'true' : false;
  });

  const handleToggleOledDark = () => {
    setIsOledDark((prev) => {
      const next = !prev;
      localStorage.setItem('sub_tracker_oled_theme', String(next));
      return next;
    });
  };

  // Active View Tab ('list' | 'calendar' | 'payments')
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'payments'>('list');

  // Monthly Budget state persisted in localStorage
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('sub_tracker_monthly_budget');
    return saved ? parseFloat(saved) || 1500 : 1500;
  });

  const handleUpdateBudget = (newBudget: number) => {
    setMonthlyBudget(newBudget);
    localStorage.setItem('sub_tracker_monthly_budget', String(newBudget));
  };
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [subToDelete, setSubToDelete] = useState<Subscription | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('renewal-asc');

  // Persistent local user ID fallback if anonymous auth fails/restricted
  const getFallbackUserId = (): string => {
    let localId = localStorage.getItem('sub_tracker_local_uid');
    if (!localId) {
      localId = 'local_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('sub_tracker_local_uid', localId);
    }
    return localId;
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsLoadingAuth(false);
      } else {
        try {
          const anon = await signInAnonymously(auth);
          setUser(anon.user);
        } catch (err) {
          const fallbackUid = getFallbackUserId();
          setUser({
            uid: fallbackUid,
            isAnonymous: true,
            displayName: 'Misafir Kullanıcı'
          } as User);
        } finally {
          setIsLoadingAuth(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time updates for current user
  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setIsLoadingSubs(false);
      return;
    }

    setIsLoadingSubs(true);
    const unsubscribe = subscribeToUserSubscriptions(
      user.uid,
      (subs) => {
        setSubscriptions(subs);
        setIsLoadingSubs(false);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setIsLoadingSubs(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<{ id: string; title: string; body: string; type?: 'info' | 'success' | 'warning' } | null>(null);
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  // Request browser notification permission
  const handleRequestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setToastMessage({
        id: Date.now().toString(),
        title: 'Bildirim Desteği',
        body: 'Tarayıcınız masaüstü bildirimlerini desteklemiyor.',
        type: 'warning'
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setHasNotificationPermission(true);
        setToastMessage({
          id: Date.now().toString(),
          title: 'Bildirimler Etkinleştirildi',
          body: 'Yenileme zamanı gelen abonelikler için hatırlatmalar alacaksınız.',
          type: 'success'
        });
      } else {
        setHasNotificationPermission(false);
        setToastMessage({
          id: Date.now().toString(),
          title: 'Bildirim İzni Reddedildi',
          body: 'Tarayıcı ayarlarından bildirim iznini açabilirsiniz.',
          type: 'warning'
        });
      }
    } catch (err) {
      console.error('Notification permission error:', err);
    }
  };

  // Check for renewal dates (due tomorrow or today) and trigger notification/toast
  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) return;

    const activeSubs = subscriptions.filter((s) => s.status === 'active');
    const dueTomorrowOrToday = activeSubs.filter((s) => {
      const days = getDaysUntilRenewal(s.billingDate, s.billingCycle);
      return days === 0 || days === 1;
    });

    if (dueTomorrowOrToday.length > 0) {
      // Log to console as required
      console.log('⏰ Abonelik Yenileme Hatırlatması:', dueTomorrowOrToday.map((s) => `${s.name} (${formatPrice(s.price)})`));

      const firstDue = dueTomorrowOrToday[0];
      const days = getDaysUntilRenewal(firstDue.billingDate, firstDue.billingCycle);
      const daysText = days === 0 ? 'Bugün' : 'Yarın';

      const notificationTitle = `Abonelik Yenileme Uyarısı: ${firstDue.name}`;
      const notificationBody = `"${firstDue.name}" aboneliğiniz ${daysText} yenilenecektir (${formatPrice(firstDue.price)}).`;

      // Trigger UI Toast
      setToastMessage({
        id: `due_${firstDue.id}`,
        title: notificationTitle,
        body: notificationBody,
        type: 'warning'
      });

      // Trigger Browser Native Notification if permission granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(notificationTitle, {
            body: notificationBody,
            icon: '/favicon.ico'
          });
        } catch (err) {
          console.error('Failed to trigger native notification:', err);
        }
      }
    }
  }, [subscriptions]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (subscriptions.length === 0) {
      setToastMessage({
        id: Date.now().toString(),
        title: 'Dışa Aktarma Hatası',
        body: 'Dışa aktarılacak abonelik bulunmuyor.',
        type: 'warning'
      });
      return;
    }
    const success = exportSubscriptionsToCSV(subscriptions);
    if (success) {
      setToastMessage({
        id: Date.now().toString(),
        title: 'CSV İndirildi',
        body: `${subscriptions.length} adet abonelik başarıyla CSV dosyasına aktarıldı.`,
        type: 'success'
      });
    }
  };

  // Clear All Data Handler
  const handleClearAllData = () => {
    if (!user) return;
    if (subscriptions.length === 0) {
      setToastMessage({
        id: Date.now().toString(),
        title: 'Bilgi',
        body: 'Silinecek herhangi bir abonelik verisi yok.',
        type: 'info'
      });
      return;
    }
    setIsClearAllModalOpen(true);
  };

  const confirmClearAll = async () => {
    if (!user) return;
    try {
      await clearAllUserSubscriptions(user.uid);
      setSubscriptions([]);
      setToastMessage({
        id: Date.now().toString(),
        title: 'Veriler Temizlendi',
        body: 'Tüm abonelikleriniz başarıyla silindi.',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to clear all subscriptions:', err);
      setToastMessage({
        id: Date.now().toString(),
        title: 'Hata',
        body: 'Veriler silinirken bir hata oluştu.',
        type: 'warning'
      });
    } finally {
      setIsClearAllModalOpen(false);
    }
  };

  // Handle Save (Create / Update)
  const handleSaveSubscription = async (subData: Omit<Subscription, 'id' | 'userId'>) => {
    if (!user) return;
    if (editingSub) {
      await updateSubscription(editingSub.id, subData);
    } else {
      await addSubscription({
        ...subData,
        userId: user.uid
      });
    }
  };

  // Handle Toggle Payment Status for a specific month
  const handleTogglePaymentStatus = async (subId: string, monthKey: string) => {
    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return;

    const currentPaid = sub.paidMonths || [];
    const isPaid = currentPaid.includes(monthKey);
    const updatedPaid = isPaid
      ? currentPaid.filter((m) => m !== monthKey)
      : [...currentPaid, monthKey];

    // Optimistic UI update
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, paidMonths: updatedPaid } : s))
    );

    try {
      await updateSubscription(subId, { paidMonths: updatedPaid });
      setToastMessage({
        id: Date.now().toString(),
        title: isPaid ? 'Ödeme İptal Edildi' : 'Ödeme Onaylandı',
        body: `"${sub.name}" aboneliği ${monthKey} dönemi için ${isPaid ? 'bekliyor' : 'ödendi'} durumuna getirildi.`,
        type: isPaid ? 'info' : 'success'
      });
    } catch (err) {
      console.error('Failed to update payment status:', err);
      // Rollback
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, paidMonths: currentPaid } : s))
      );
    }
  };

  // Handle Delete Request
  const handleDeleteSubscription = (id: string) => {
    const target = subscriptions.find((s) => s.id === id);
    if (target) {
      setSubToDelete(target);
    }
  };

  const confirmDeleteSingle = async () => {
    if (!subToDelete) return;
    try {
      await deleteSubscription(subToDelete.id);
      setSubscriptions((prev) => prev.filter((s) => s.id !== subToDelete.id));
      setToastMessage({
        id: Date.now().toString(),
        title: 'Abonelik Silindi',
        body: `"${subToDelete.name}" aboneliği kaldırıldı.`,
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to delete subscription:', err);
      setToastMessage({
        id: Date.now().toString(),
        title: 'Hata',
        body: 'Abonelik silinirken bir sorun oluştu.',
        type: 'warning'
      });
    } finally {
      setSubToDelete(null);
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (id: string, newStatus: 'active' | 'paused') => {
    try {
      await updateSubscription(id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleOpenAdd = () => {
    setEditingSub(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setIsModalOpen(true);
  };

  // Filter and Sort logic
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        const matchesSearch = 
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sub.notes && sub.notes.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = 
          selectedCategory === 'ALL' || sub.category === selectedCategory;

        const matchesStatus = 
          selectedStatus === 'ALL' || sub.status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'renewal-asc') {
          if (a.status === 'paused' && b.status !== 'paused') return 1;
          if (a.status !== 'paused' && b.status === 'paused') return -1;
          const daysA = getDaysUntilRenewal(a.billingDate, a.billingCycle);
          const daysB = getDaysUntilRenewal(b.billingDate, b.billingCycle);
          return daysA - daysB;
        } else if (sortBy === 'price-desc') {
          return getMonthlyCost(b) - getMonthlyCost(a);
        } else if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name, 'tr-TR');
        }
        return 0;
      });
  }, [subscriptions, searchTerm, selectedCategory, selectedStatus, sortBy]);

  const hasFiltersActive = searchTerm.trim() !== '' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL';

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors ${
      isOledDark 
        ? 'bg-black text-white selection:bg-zinc-800 selection:text-white' 
        : 'bg-gray-50/70 text-gray-900 selection:bg-gray-900 selection:text-white'
    }`}>
      {/* Header */}
      <Header
        user={user}
        onOpenAddModal={handleOpenAdd}
        isLoadingAuth={isLoadingAuth}
        isOledDark={isOledDark}
        onToggleOledDark={handleToggleOledDark}
        onExportCSV={handleExportCSV}
        onClearAllData={handleClearAllData}
        onRequestNotificationPermission={handleRequestNotificationPermission}
        hasNotificationPermission={hasNotificationPermission}
        onOpenCancelAssistant={() => setIsCancelModalOpen(true)}
        onOpenNotificationSettings={() => setIsNotificationModalOpen(true)}
      />

      {/* Floating Toast Notification Banner */}
      {toastMessage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div className={`p-4 rounded-2xl border shadow-lg flex items-start justify-between gap-3 transition-all ${
            toastMessage.type === 'warning'
              ? isOledDark ? 'bg-amber-950/60 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
              : toastMessage.type === 'success'
              ? isOledDark ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : isOledDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-gray-100 border-gray-200 text-gray-800'
          }`}>
            <div className="flex items-start gap-3">
              {toastMessage.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              ) : toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Bell className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-bold">{toastMessage.title}</h4>
                <p className="text-xs mt-0.5 opacity-90">{toastMessage.body}</p>
              </div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs opacity-60 hover:opacity-100 font-semibold px-2 py-1 rounded-lg hover:bg-black/10 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-12">
        {/* Metric Summary Cards */}
        <SummaryCards
          subscriptions={subscriptions}
          isOledDark={isOledDark}
        />

        {/* Budget Target & Over-budget Warning Card */}
        <BudgetCard
          totalMonthlyCost={subscriptions.filter(s => s.status === 'active').reduce((acc, sub) => acc + getMonthlyCost(sub), 0)}
          monthlyBudget={monthlyBudget}
          onUpdateBudget={handleUpdateBudget}
          isOledDark={isOledDark}
        />

        {/* View Mode Navigation Tabs */}
        <div className={`p-1 rounded-2xl border flex items-center mb-6 max-w-md mx-auto sm:mx-0 ${
          isOledDark ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-100 border-gray-200'
        }`}>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'list'
                ? isOledDark
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'bg-white text-gray-900 shadow-xs'
                : isOledDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Liste Görünümü
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'calendar'
                ? isOledDark
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'bg-white text-gray-900 shadow-xs'
                : isOledDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Takvim Görünümü
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payments'
                ? isOledDark
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'bg-white text-gray-900 shadow-xs'
                : isOledDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ödeme Geçmişi
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'calendar' ? (
          <CalendarView
            subscriptions={subscriptions}
            isOledDark={isOledDark}
            onTogglePaymentStatus={handleTogglePaymentStatus}
          />
        ) : activeTab === 'payments' ? (
          <PaymentHistoryView
            subscriptions={subscriptions}
            isOledDark={isOledDark}
            onTogglePaymentStatus={handleTogglePaymentStatus}
          />
        ) : (
          <>
            {/* Filter and Search Controls */}
            <FilterToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
              isOledDark={isOledDark}
            />

            {/* List Section */}
            {isLoadingSubs ? (
              <div className={`flex flex-col items-center justify-center py-16 border rounded-2xl shadow-xs ${
                isOledDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200'
              }`}>
                <Loader2 className={`w-6 h-6 animate-spin mb-2 ${isOledDark ? 'text-zinc-500' : 'text-gray-400'}`} />
                <p className={`text-xs font-medium ${isOledDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                  Veriler yükleniyor...
                </p>
              </div>
            ) : filteredSubscriptions.length > 0 ? (
              <div className="space-y-3">
                {filteredSubscriptions.map((sub) => (
                  <SubscriptionItem
                    key={sub.id}
                    subscription={sub}
                    isOledDark={isOledDark}
                    onEdit={handleEdit}
                    onDelete={handleDeleteSubscription}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                isFiltered={hasFiltersActive}
                onOpenAddModal={handleOpenAdd}
                onClearFilters={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                }}
                isOledDark={isOledDark}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={handleOpenAdd}
        title="Yeni Abonelik Ekle"
        aria-label="Yeni Abonelik Ekle"
        className={`fixed bottom-6 right-5 z-40 sm:hidden w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95 ${
          isOledDark
            ? 'bg-white text-black border border-zinc-300'
            : 'bg-gray-900 text-white'
        }`}
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSubscription}
        editingSubscription={editingSub}
        isOledDark={isOledDark}
      />

      {/* Delete Single Subscription Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!subToDelete}
        title="Abonelik Silme Onayı"
        description={`"${subToDelete?.name || ''}" aboneliğini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmButtonText="Evet, Sil"
        onClose={() => setSubToDelete(null)}
        onConfirm={confirmDeleteSingle}
        isOledDark={isOledDark}
      />

      {/* Clear All Data Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isClearAllModalOpen}
        title="Tüm Verileri Sıfırla"
        description={`Kayıtlı tüm aboneliklerinizi (${subscriptions.length} adet) kalıcı olarak silmek istediğinizden emin misiniz?`}
        confirmButtonText="Tümünü Sil"
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={confirmClearAll}
        isOledDark={isOledDark}
      />
      {/* Footer */}
      <Footer isOledDark={isOledDark} />

      {/* Cancellation Assistant Modal */}
      <CancellationAssistantModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        subscriptions={subscriptions}
        isOledDark={isOledDark}
        onRequestNotificationPermission={handleRequestNotificationPermission}
        hasNotificationPermission={hasNotificationPermission}
      />

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        isOledDark={isOledDark}
        onRequestNotificationPermission={handleRequestNotificationPermission}
        hasNotificationPermission={hasNotificationPermission}
        subscriptions={subscriptions}
      />
    </div>
  );
}
