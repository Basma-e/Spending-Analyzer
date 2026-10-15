import type { Transaction } from './types';
import { filterByDateRange } from './utils';

export type SourceFilter = 'all' | 'import' | 'manual';

export interface TransactionFilters {
  search: string;
  categoryIds: string[];
  cardMemberId: string;
  source: SourceFilter;
  minAmount: string;
  maxAmount: string;
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  search: '',
  categoryIds: [],
  cardMemberId: 'all',
  source: 'all',
  minAmount: '',
  maxAmount: '',
};

export function countActiveFilters(filters: TransactionFilters): number {
  return [
    filters.search.trim() !== '',
    filters.categoryIds.length > 0,
    filters.cardMemberId !== 'all',
    filters.source !== 'all',
    filters.minAmount !== '',
    filters.maxAmount !== '',
  ].filter(Boolean).length;
}

export function filterTransactions(
  transactions: Transaction[],
  dateFilter: { start: string; end: string },
  filters: TransactionFilters
): Transaction[] {
  let txs = filterByDateRange(transactions, dateFilter.start, dateFilter.end);

  if (filters.categoryIds.length > 0) {
    txs = txs.filter((t) => filters.categoryIds.includes(t.categoryId));
  }
  if (filters.cardMemberId !== 'all') {
    txs = txs.filter((t) =>
      filters.cardMemberId === 'unassigned'
        ? !t.cardMemberId
        : t.cardMemberId === filters.cardMemberId
    );
  }
  if (filters.source !== 'all') {
    txs = txs.filter((t) => t.source === filters.source);
  }
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    txs = txs.filter((t) => t.description.toLowerCase().includes(q));
  }
  if (filters.minAmount) {
    const min = parseFloat(filters.minAmount);
    if (!isNaN(min)) txs = txs.filter((t) => t.amount >= min);
  }
  if (filters.maxAmount) {
    const max = parseFloat(filters.maxAmount);
    if (!isNaN(max)) txs = txs.filter((t) => t.amount <= max);
  }

  return txs;
}
