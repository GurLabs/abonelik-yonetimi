import { Subscription, BillingCycle } from '../types';

export function getMonthlyCost(sub: Subscription): number {
  if (sub.status === 'paused') return 0;
  let monthlyPrice = sub.price;
  if (sub.billingCycle === 'yearly') {
    monthlyPrice = sub.price / 12;
  } else if (sub.billingCycle === 'weekly') {
    monthlyPrice = sub.price * (52 / 12);
  } else if (sub.billingCycle === 'custom') {
    const months = sub.customMonths && sub.customMonths > 0 ? sub.customMonths : 1;
    monthlyPrice = sub.price / months;
  }
  return monthlyPrice;
}

export function getYearlyCost(sub: Subscription): number {
  return getMonthlyCost(sub) * 12;
}

export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `₺${formatted}`;
}

export function calculateNextRenewalDate(billingDateStr: string, cycle: BillingCycle, customMonths?: number): Date {
  const date = new Date(billingDateStr);
  if (isNaN(date.getTime())) {
    return new Date();
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);

  const monthsStep = cycle === 'custom' && customMonths && customMonths > 0 ? customMonths : 1;

  // If date is in the past, roll forward by cycle until today or future
  while (nextDate < today) {
    if (cycle === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (cycle === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else if (cycle === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (cycle === 'custom') {
      nextDate.setMonth(nextDate.getMonth() + monthsStep);
    }
  }

  return nextDate;
}

export function getDaysUntilRenewal(billingDateStr: string, cycle: BillingCycle, customMonths?: number): number {
  const nextDate = calculateNextRenewalDate(billingDateStr, cycle, customMonths);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

