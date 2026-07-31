export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'custom';

export type Category = 
  | 'Yapay Zeka & AI'
  | 'Eğlence' 
  | 'Çalışma & Yazılım' 
  | 'Müzik & Medya' 
  | 'Eğitim' 
  | 'Yaşam & Sağlık' 
  | 'Fatura & Hizmet' 
  | 'Diğer';

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  customMonths?: number; // E.g. 3 for every 3 months
  billingDate: string; // YYYY-MM-DD
  category: Category;
  status: 'active' | 'paused';
  notes?: string;
  paidMonths?: string[]; // Array of YYYY-MM strings representing paid billing periods
  createdAt?: string;
  updatedAt?: string;
}

export const CATEGORIES: Category[] = [
  'Yapay Zeka & AI',
  'Eğlence',
  'Çalışma & Yazılım',
  'Müzik & Medya',
  'Eğitim',
  'Yaşam & Sağlık',
  'Fatura & Hizmet',
  'Diğer'
];

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: 'Aylık',
  yearly: 'Yıllık',
  weekly: 'Haftalık',
  custom: 'Özel (Ay)'
};

