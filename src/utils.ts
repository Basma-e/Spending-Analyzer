import type { AppState, Transaction } from './types';
import { getAllCategories, getCategoryColor, getCategoryName } from './categoryUtils';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export { getCategoryName, getCategoryColor };

export function getCardMemberName(state: AppState, id?: string): string {
  if (!id) return 'Unassigned';
  return state.cardMembers.find((m) => m.id === id)?.name ?? 'Unknown';
}

export function getTotalSpending(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

export function getSpendingByCategory(
  transactions: Transaction[]
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const t of transactions) {
    result[t.categoryId] = (result[t.categoryId] ?? 0) + t.amount;
  }
  return result;
}

export function getSpendingByCardMember(
  state: AppState,
  transactions: Transaction[]
): { memberId: string; name: string; total: number }[] {
  const totals: Record<string, number> = {};
  for (const t of transactions) {
    const key = t.cardMemberId ?? 'unassigned';
    totals[key] = (totals[key] ?? 0) + t.amount;
  }

  return Object.entries(totals)
    .map(([memberId, total]) => ({
      memberId,
      name:
        memberId === 'unassigned'
          ? 'Unassigned'
          : getCardMemberName(state, memberId),
      total,
    }))
    .sort((a, b) => b.total - a.total);
}

export function getMonthlySpending(
  transactions: Transaction[]
): { month: string; total: number; byCategory: Record<string, number> }[] {
  const byMonth: Record<string, Transaction[]> = {};

  for (const t of transactions) {
    const month = t.date.slice(0, 7);
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(t);
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, txs]) => ({
      month,
      total: getTotalSpending(txs),
      byCategory: getSpendingByCategory(txs),
    }));
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function getDateRange(transactions: Transaction[]): { start: string; end: string } | null {
  if (transactions.length === 0) return null;
  const dates = transactions.map((t) => t.date).sort();
  return { start: dates[0], end: dates[dates.length - 1] };
}

export function filterByDateRange(
  transactions: Transaction[],
  start?: string,
  end?: string
): Transaction[] {
  return transactions.filter((t) => {
    if (start && t.date < start) return false;
    if (end && t.date > end) return false;
    return true;
  });
}

export function getTopMerchants(
  transactions: Transaction[],
  limit = 5
): { description: string; total: number; count: number }[] {
  const map: Record<string, { total: number; count: number }> = {};
  for (const t of transactions) {
    const key = t.description.slice(0, 40);
    if (!map[key]) map[key] = { total: 0, count: 0 };
    map[key].total += t.amount;
    map[key].count += 1;
  }
  return Object.entries(map)
    .map(([description, data]) => ({ description, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function getAverageMonthlySpending(transactions: Transaction[]): number {
  const monthly = getMonthlySpending(transactions);
  if (monthly.length === 0) return 0;
  return getTotalSpending(transactions) / monthly.length;
}

export function deduplicateTransactions(
  existing: Transaction[],
  incoming: Transaction[]
): Transaction[] {
  const seen = new Set(
    existing.map((t) => `${t.date}|${t.description}|${t.amount}|${t.cardMemberId ?? ''}`)
  );
  const unique = incoming.filter((t) => {
    const key = `${t.date}|${t.description}|${t.amount}|${t.cardMemberId ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique;
}

export function getCategoriesWithSpending(
  state: AppState,
  transactions: Transaction[]
) {
  const byCategory = getSpendingByCategory(transactions);
  return getAllCategories(state).filter((c) => (byCategory[c.id] ?? 0) > 0);
}
