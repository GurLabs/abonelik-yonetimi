import { Subscription, BILLING_CYCLE_LABELS } from '../types';
import { calculateNextRenewalDate, formatPrice } from './subscriptionUtils';

export function exportSubscriptionsToCSV(subscriptions: Subscription[]) {
  if (!subscriptions || subscriptions.length === 0) {
    return false;
  }

  const headers = ['Abonelik Adı', 'Tutar', 'Ödeme Periyodu', 'Kategori', 'Sonraki Yenileme', 'Durum', 'Notlar'];
  
  const rows = subscriptions.map((sub) => {
    const nextDate = calculateNextRenewalDate(sub.billingDate, sub.billingCycle);
    const formattedNextDate = nextDate.toISOString().split('T')[0];
    const priceFormatted = formatPrice(sub.price);
    const cycleLabel = BILLING_CYCLE_LABELS[sub.billingCycle] || sub.billingCycle;
    const statusLabel = sub.status === 'active' ? 'Aktif' : 'Duraklatıldı';

    // Sanitize values for CSV
    const sanitize = (text: string) => `"${(text || '').replace(/"/g, '""')}"`;

    return [
      sanitize(sub.name),
      sanitize(priceFormatted),
      sanitize(cycleLabel),
      sanitize(sub.category),
      sanitize(formattedNextDate),
      sanitize(statusLabel),
      sanitize(sub.notes || '')
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n'); // UTF-8 BOM for Excel Turkish char support
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `abonelikler_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
