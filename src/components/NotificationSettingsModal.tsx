import React, { useState, useEffect } from 'react';
import { X, Bell, Mail, Send, CheckCircle2, AlertCircle, Link, Globe, Sparkles, Loader2 } from 'lucide-react';
import { Subscription } from '../types';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOledDark: boolean;
  onRequestNotificationPermission: () => void;
  hasNotificationPermission: boolean;
  subscriptions: Subscription[];
}

export interface NotificationConfig {
  email: string;
  emailEnabled: boolean;
  discordWebhook: string;
  discordEnabled: boolean;
  customWebhook: string;
  customWebhookEnabled: boolean;
  notifyDaysBefore: number; // e.g. 3
  notifyOnRenewalDay: boolean;
}

interface LastTestTimestamps {
  email?: number;
  discord?: number;
  webhook?: number;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  isOledDark,
  onRequestNotificationPermission,
  hasNotificationPermission,
  subscriptions
}) => {
  const [email, setEmail] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(false);

  const [discordWebhook, setDiscordWebhook] = useState('');
  const [discordEnabled, setDiscordEnabled] = useState(false);

  const [customWebhook, setCustomWebhook] = useState('');
  const [customWebhookEnabled, setCustomWebhookEnabled] = useState(false);

  const [notifyDaysBefore, setNotifyDaysBefore] = useState<number>(3);
  const [notifyOnRenewalDay, setNotifyOnRenewalDay] = useState(true);

  // Status message state
  const [testingChannel, setTestingChannel] = useState<'email' | 'discord' | 'webhook' | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sub_tracker_notification_config');
    if (saved) {
      try {
        const parsed: NotificationConfig = JSON.parse(saved);
        setEmail(parsed.email || '');
        setEmailEnabled(parsed.emailEnabled ?? false);
        setDiscordWebhook(parsed.discordWebhook || '');
        setDiscordEnabled(parsed.discordEnabled ?? false);
        setCustomWebhook(parsed.customWebhook || '');
        setCustomWebhookEnabled(parsed.customWebhookEnabled ?? false);
        setNotifyDaysBefore(parsed.notifyDaysBefore ?? 3);
        setNotifyOnRenewalDay(parsed.notifyOnRenewalDay ?? true);
      } catch (err) {
        console.error('Error loading notification config:', err);
      }
    }
  }, [isOpen]);

  const handleSaveConfig = () => {
    const config: NotificationConfig = {
      email,
      emailEnabled,
      discordWebhook,
      discordEnabled,
      customWebhook,
      customWebhookEnabled,
      notifyDaysBefore,
      notifyOnRenewalDay
    };
    localStorage.setItem('sub_tracker_notification_config', JSON.stringify(config));
    setStatusMessage({ type: 'success', text: 'Bildirim ve kanal ayarları başarıyla kaydedildi!' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Helper to check rate limit (1 test per day per channel)
  const checkRateLimit = (channel: 'email' | 'discord' | 'webhook'): { allowed: boolean; remainingText?: string } => {
    const savedStamps = localStorage.getItem('sub_tracker_last_test_timestamps');
    if (!savedStamps) return { allowed: true };
    try {
      const stamps: LastTestTimestamps = JSON.parse(savedStamps);
      const lastTime = stamps[channel];
      if (!lastTime) return { allowed: true };

      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const now = Date.now();
      const elapsed = now - lastTime;
      if (elapsed < ONE_DAY_MS) {
        const remainingMs = ONE_DAY_MS - elapsed;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        return {
          allowed: false,
          remainingText: `${hours} saat ${minutes} dakika`
        };
      }
    } catch (e) {
      console.error(e);
    }
    return { allowed: true };
  };

  const recordTestTimestamp = (channel: 'email' | 'discord' | 'webhook') => {
    const savedStamps = localStorage.getItem('sub_tracker_last_test_timestamps');
    let stamps: LastTestTimestamps = {};
    if (savedStamps) {
      try {
        stamps = JSON.parse(savedStamps);
      } catch (e) {}
    }
    stamps[channel] = Date.now();
    localStorage.setItem('sub_tracker_last_test_timestamps', JSON.stringify(stamps));
  };

  const sampleSub = subscriptions[0] || {
    name: 'Netflix Premium',
    price: 149.99,
    billingDate: new Date().toISOString().split('T')[0],
    category: 'Eğlence'
  };

  // Test Email
  const handleTestEmail = async () => {
    if (!emailEnabled) {
      setStatusMessage({ type: 'error', text: 'E-posta bildirimi kapalı! Lütfen önce e-posta switch açma anahtarını aktifleştirin.' });
      return;
    }
    if (!email) {
      setStatusMessage({ type: 'error', text: 'Lütfen bir e-posta adresi girin.' });
      return;
    }

    const rateCheck = checkRateLimit('email');
    if (!rateCheck.allowed) {
      setStatusMessage({
        type: 'error',
        text: `Test gönderim sınırı: Günde 1 defa test yapabilirsiniz. Bir sonraki test için kalan süre: ${rateCheck.remainingText}`
      });
      return;
    }

    setTestingChannel('email');
    setStatusMessage(null);
    try {
      const res = await fetch('/api/notify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: email,
          subject: '🔔 [Test] Abonelik Hatırlatma Test E-postası',
          subName: sampleSub.name,
          price: sampleSub.price,
          billingDate: sampleSub.billingDate,
          daysLeft: 3,
          cancelUrl: 'https://gurlabs.com'
        })
      });
      const data = await res.json();
      if (data.success) {
        recordTestTimestamp('email');
        setStatusMessage({ type: 'success', text: 'Test e-postası başarıyla gönderildi! Kutunuzu ve Spam klasörünü kontrol edin.' });
      } else {
        setStatusMessage({ type: 'error', text: `E-posta Gönderilemedi: ${data.message}` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Sunucuya ulaşılamadı. ' + err.message });
    } finally {
      setTestingChannel(null);
    }
  };

  // Test Discord
  const handleTestDiscord = async () => {
    if (!discordEnabled) {
      setStatusMessage({ type: 'error', text: 'Discord bildirimi kapalı! Lütfen önce Discord switch anahtarını aktifleştirin.' });
      return;
    }
    if (!discordWebhook) {
      setStatusMessage({ type: 'error', text: 'Lütfen geçerli bir Discord Webhook URL girin.' });
      return;
    }

    const rateCheck = checkRateLimit('discord');
    if (!rateCheck.allowed) {
      setStatusMessage({
        type: 'error',
        text: `Test gönderim sınırı: Günde 1 defa Discord testi yapabilirsiniz. Kalan süre: ${rateCheck.remainingText}`
      });
      return;
    }

    setTestingChannel('discord');
    setStatusMessage(null);
    try {
      const res = await fetch('/api/notify-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: discordWebhook,
          subName: sampleSub.name,
          price: sampleSub.price,
          billingDate: sampleSub.billingDate,
          daysLeft: 3,
          category: sampleSub.category
        })
      });
      const data = await res.json();
      if (data.success) {
        recordTestTimestamp('discord');
        setStatusMessage({ type: 'success', text: 'Discord kanalınıza test bildirimi başarıyla atıldı!' });
      } else {
        setStatusMessage({ type: 'error', text: `Discord Webhook Hatası: ${data.message}` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Discord Webhook ulaşılamadı. ' + err.message });
    } finally {
      setTestingChannel(null);
    }
  };

  // Test Custom Webhook
  const handleTestWebhook = async () => {
    if (!customWebhookEnabled) {
      setStatusMessage({ type: 'error', text: 'Özel Webhook bildirimi kapalı! Lütfen önce Webhook switch anahtarını aktifleştirin.' });
      return;
    }
    if (!customWebhook) {
      setStatusMessage({ type: 'error', text: 'Lütfen bir Custom Webhook URL adresi girin.' });
      return;
    }

    const rateCheck = checkRateLimit('webhook');
    if (!rateCheck.allowed) {
      setStatusMessage({
        type: 'error',
        text: `Test gönderim sınırı: Günde 1 defa Webhook testi yapabilirsiniz. Kalan süre: ${rateCheck.remainingText}`
      });
      return;
    }

    setTestingChannel('webhook');
    setStatusMessage(null);
    try {
      const res = await fetch('/api/notify-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: customWebhook,
          subName: sampleSub.name,
          price: sampleSub.price,
          billingDate: sampleSub.billingDate,
          daysLeft: 3,
          category: sampleSub.category
        })
      });
      const data = await res.json();
      if (data.success) {
        recordTestTimestamp('webhook');
        setStatusMessage({ type: 'success', text: 'Custom Webhook servisine test payload başarıyla iletildi!' });
      } else {
        setStatusMessage({ type: 'error', text: `Webhook Hatası: ${data.message}` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Webhook adresine bağlanılamadı. ' + err.message });
    } finally {
      setTestingChannel(null);
    }
  };

  if (!isOpen) return null;

  const modalBg = isOledDark
    ? 'bg-zinc-950 text-white border-zinc-800'
    : 'bg-white text-gray-900 border-gray-200';

  const subText = isOledDark ? 'text-zinc-400' : 'text-gray-500';
  const headerBorder = isOledDark ? 'border-zinc-800' : 'border-gray-100';
  const inputClass = isOledDark
    ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:ring-emerald-500'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-500';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all my-8 ${modalBg}`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${headerBorder}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isOledDark ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Özel Bildirim & Entegrasyon Ayarları
              </h3>
              <p className={`text-xs ${subText}`}>
                Discord, SMTP E-posta, Custom Webhook & Tarayıcı alarmları
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? isOledDark ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : statusMessage.type === 'error'
                ? isOledDark ? 'bg-rose-950/50 border-rose-800 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
                : isOledDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-gray-100 border-gray-300 text-gray-700'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* 1. Browser Push Notifications */}
          <div className={`p-4 rounded-xl border ${isOledDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold block">Tarayıcı Anlık Bildirimleri</span>
                <p className={`text-[11px] mt-0.5 ${subText}`}>
                  Cihazınızın ekranında yerel pop-up uyarısı gösterir
                </p>
              </div>
              <button
                onClick={onRequestNotificationPermission}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  hasNotificationPermission
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {hasNotificationPermission ? 'İzin Verildi ✓' : 'İzin Ver'}
              </button>
            </div>
          </div>

          {/* 2. E-posta (SMTP) Bildirimi */}
          <div className={`p-4 rounded-xl border space-y-3 ${isOledDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider">E-posta Bildirimi (SMTP)</h4>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-semibold">{emailEnabled ? 'Açık' : 'Kapalı'}</span>
              </label>
            </div>

            <p className={`text-[11px] ${subText}`}>
              Alarmların gönderileceği e-posta adresiniz. Sunucu SMTP kimlik bilgileri <code>.env</code> dosyasından çekilir.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                disabled={!emailEnabled}
                placeholder="ornek@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-xl border focus:outline-none focus:ring-2 ${
                  !emailEnabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${inputClass}`}
              />
              <button
                onClick={handleTestEmail}
                disabled={testingChannel === 'email' || !emailEnabled}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                {testingChannel === 'email' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Test Gönder</span>
                  </>
                )}
              </button>
            </div>

            {/* Email Troubleshooting Diagnostics */}
            <div className={`mt-3 p-3 rounded-xl border text-[11px] space-y-1.5 ${
              isOledDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300' : 'bg-amber-50/70 border-amber-200/80 text-amber-900'
            }`}>
              <div className="font-bold flex items-center gap-1.5 text-amber-500">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>E-posta Neden Ulaşmamış Olabilir? (Sorun Giderme)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[10.5px] opacity-90 pl-1">
                <li><strong>SMTP Sunucu Ayarları (.env):</strong> Uygulama sunucuda <code>SMTP_HOST</code>, <code>SMTP_USER</code> ve <code>SMTP_PASS</code> ortam değişkenlerine ihtiyaç duyar. Henüz eklemediyseniz sunucu e-posta gönderemez.</li>
                <li><strong>Spam / Önemsiz Klasörü:</strong> Gönderilen test mailleri e-posta servis sağlayıcınızın Spam/Junk kutusuna düşebilir.</li>
                <li><strong>Uygulama Şifresi (Gmail / Outlook):</strong> Özel SMTP kullanıyorsanız 2FA güvenlik nedeniyle normal şifre yerine Google 'Uygulama Şifresi' girilmelidir.</li>
              </ul>
            </div>
          </div>

          {/* 3. Discord Webhook */}
          <div className={`p-4 rounded-xl border space-y-3 ${isOledDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-indigo-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Discord Webhook Entegrasyonu</h4>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={discordEnabled}
                  onChange={(e) => setDiscordEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-2 text-xs font-semibold">{discordEnabled ? 'Açık' : 'Kapalı'}</span>
              </label>
            </div>

            <p className={`text-[11px] ${subText}`}>
              Discord sunucu kanalınız için oluşturduğunuz Webhook URL adresini buraya ekleyin.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                disabled={!discordEnabled}
                placeholder="https://discord.com/api/webhooks/..."
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                className={`flex-1 min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-xl border focus:outline-none focus:ring-2 ${
                  !discordEnabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${inputClass}`}
              />
              <button
                onClick={handleTestDiscord}
                disabled={testingChannel === 'discord' || !discordEnabled}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                {testingChannel === 'discord' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Discord Test</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4. Custom Webhook (n8n / Zapier / Make / WhatsApp) */}
          <div className={`p-4 rounded-xl border space-y-3 ${isOledDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Özel Webhook (Zapier / n8n / WhatsApp)</h4>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={customWebhookEnabled}
                  onChange={(e) => setCustomWebhookEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                <span className="ml-2 text-xs font-semibold">{customWebhookEnabled ? 'Açık' : 'Kapalı'}</span>
              </label>
            </div>

            <p className={`text-[11px] ${subText}`}>
              Zapier, n8n, Make veya WhatsApp Business Gateway gibi servislerinize HTTP POST JSON gönderir.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                disabled={!customWebhookEnabled}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={customWebhook}
                onChange={(e) => setCustomWebhook(e.target.value)}
                className={`flex-1 min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-xl border focus:outline-none focus:ring-2 ${
                  !customWebhookEnabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${inputClass}`}
              />
              <button
                onClick={handleTestWebhook}
                disabled={testingChannel === 'webhook' || !customWebhookEnabled}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                {testingChannel === 'webhook' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Webhook Test</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 5. Notification Timing Rules */}
          <div className={`p-4 rounded-xl border space-y-3 ${isOledDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Bildirim Zamanlama Kuralları
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnRenewalDay}
                  onChange={(e) => setNotifyOnRenewalDay(e.target.checked)}
                  className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500"
                />
                <span>Yenileme ve fatura gününde bildirim gönder</span>
              </label>

              <div className="flex items-center gap-3 pt-1">
                <span>Yenilemeye</span>
                <select
                  value={notifyDaysBefore}
                  onChange={(e) => setNotifyDaysBefore(Number(e.target.value))}
                  className={`px-2.5 py-1 text-xs rounded-lg border focus:outline-none ${
                    isOledDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={1}>1 Gün</option>
                  <option value={2}>2 Gün</option>
                  <option value={3}>3 Gün</option>
                  <option value={5}>5 Gün</option>
                  <option value={7}>7 Gün</option>
                </select>
                <span>kala erken uyarı gönder</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-end gap-2 ${headerBorder}`}>
          <button
            onClick={onClose}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isOledDark ? 'bg-zinc-900 text-zinc-300 hover:text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vazgeç
          </button>
          <button
            onClick={handleSaveConfig}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Ayarları Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
