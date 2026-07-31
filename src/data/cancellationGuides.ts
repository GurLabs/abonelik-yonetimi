export interface CancellationGuide {
  id: string;
  name: string;
  category: string;
  cancelUrl: string;
  steps: string[];
}

export const POPULAR_CANCELLATION_GUIDES: CancellationGuide[] = [
  {
    id: 'claude-pro',
    name: 'Claude Pro (Anthropic)',
    category: 'Yapay Zeka & AI',
    cancelUrl: 'https://claude.ai/settings/billing',
    steps: [
      'Claude.ai adresine giriş yapın.',
      'Sol alt köşedeki profil isminize tıklayıp "Settings" (Ayarlar) bölümüne gidin.',
      '"Billing" (Faturalandırma) sekmesine tıklayın.',
      '"Cancel Subscription" (Aboneliği İptal Et) butonuna basarak onaylayın.'
    ]
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus (OpenAI)',
    category: 'Yapay Zeka & AI',
    cancelUrl: 'https://chatgpt.com/#settings/Subscription',
    steps: [
      'ChatGPT sol alt menüsünden profil adınıza ve "Settings" (Ayarlar) seçeneğine tıklayın.',
      '"Subscription" (Abonelik) sekmesine gelin.',
      '"Manage My Subscription" butonuna tıklayıp Stripe ödeme ekranında "Cancel Plan" seçin.'
    ]
  },
  {
    id: 'hepsiburada-premium',
    name: 'Hepsiburada Premium',
    category: 'Fatura & Hizmet',
    cancelUrl: 'https://www.hepsiburada.com/premium',
    steps: [
      'Hepsiburada hesabınıza giriş yapın ve Hesabım bölümüne gidin.',
      '"Hepsiburada Premium" sekmesine tıklayın.',
      'Sayfanın en altındaki "Üyelik İptali" veya "Aboneliği İptal Et" butonuna tıklayıp onaylayın.'
    ]
  },
  {
    id: 'tvplus-hbo',
    name: 'TV+ x HBO Max (TV+)',
    category: 'Eğlence',
    cancelUrl: 'https://www.tvplus.com.tr/hesabim',
    steps: [
      'TV+ web sitesine veya mobil uygulamasına giriş yapın.',
      '"Hesabım" -> "Paketlerim / Üyeliğim" sayfasına gidin.',
      'Aktif paketin yanında yer alan "İptal Et" butonuna dokunup onaylayın.'
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon Prime',
    category: 'Eğlence',
    cancelUrl: 'https://www.amazon.com.tr/mc/manage',
    steps: [
      'Amazon.com.tr hesabınıza giriş yapın.',
      '"Hesabım" -> "Prime Üyeliğim" sayfasına gidin.',
      '"Üyeliği Yönet" sekmesinden "Üyeliği ve Ayrıcalıkları Sonlandır" butonuna tıklayın.'
    ]
  },
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Eğlence',
    cancelUrl: 'https://www.netflix.com/youraccount',
    steps: [
      'Netflix hesabınıza giriş yapın.',
      'Sağ üstteki profil ikonuna tıklayıp "Hesap" bölümüne gidin.',
      'Üyelik ve Faturalama altındaki "Üyeliği İptal Et" butonuna tıklayın.',
      'İptal İşlemini Tamamla butonuna basarak onaylayın.'
    ]
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Müzik & Medya',
    cancelUrl: 'https://www.spotify.com/account/subscription/',
    steps: [
      'Spotify hesap sayfanıza tarayıcı üzerinden giriş yapın.',
      'Planınız altında yer alan "Planı Değiştir" veya "Planı İptal Et" seçeneğine tıklayın.',
      'Spotify Free hesabına geçiş yap seçeneğine tıklayarak Premium\'u iptal edin.'
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    category: 'Eğlence',
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    steps: [
      'YouTube hesabınıza giriş yapın ve profil simgenize tıklayın.',
      '"Satın Alınanlar ve Üyelikler" seçeneğine gidin.',
      'Üyeliği yönet butonuna basarak "Devam Et" ve ardından "İptal Et" adımlarını izleyin.'
    ]
  },
  {
    id: 'adobe',
    name: 'Adobe Creative Cloud',
    category: 'Çalışma & Yazılım',
    cancelUrl: 'https://account.adobe.com/plans',
    steps: [
      'Adobe Account portalına giriş yapın.',
      'Planları Yönet seçeneğine tıklayın.',
      '"Planı İptal Et" seçeneğini seçin ve iptal nedeninizi belirterek onaylayın.'
    ]
  },
  {
    id: 'exxen',
    name: 'Exxen',
    category: 'Eğlence',
    cancelUrl: 'https://www.exxen.com/tr/account/details',
    steps: [
      'Exxen.com üzerinden profilinize giriş yapın.',
      'Hesabım sekmesindeki "Üyelik Bilgilerim" alanına gelin.',
      '"Üyeliğimi İptal Et" bağlantısına tıklayarak şifrenizi girin ve onaylayın.'
    ]
  },
  {
    id: 'apple',
    name: 'Apple (iCloud / Apple Music / Arcade)',
    category: 'Eğlence',
    cancelUrl: 'https://support.apple.com/HT202039',
    steps: [
      'iPhone veya iPad Ayarlar uygulamasını açın.',
      'En üstteki adınıza (Apple ID) tıklayın.',
      '"Abonelikler" bölümüne girip iptal etmek istediğiniz servise dokunun ve "Aboneliği İptal Et" seçin.'
    ]
  },
  {
    id: 'disney',
    name: 'Disney+',
    category: 'Eğlence',
    cancelUrl: 'https://www.disneyplus.com/account',
    steps: [
      'Disney+ tarayıcı sayfasından hesabınıza gidin.',
      'Profil simgenizden "Hesap" menüsüne girin.',
      'Abonelik seçeneğinize tıklayıp "Aboneliği İptal Et" adımlarını tamamlayın.'
    ]
  }
];
