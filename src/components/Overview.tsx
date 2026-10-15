import { useMemo } from 'react';
import type { AppState } from '../types';
import { getAllCategories } from '../categoryUtils';
import {
  formatCurrency,
  getTotalSpending,
  getSpendingByCategory,
  getSpendingByCardMember,
  getMonthlySpending,
  formatMonth,
  getDateRange,
  getAverageMonthlySpending,
  getTopMerchants,
  getCategoryColor,
  getCategoriesWithSpending,
} from '../utils';
import {
  filterTransactions,
  countActiveFilters,
  type TransactionFilters,
} from '../transactionFilters';
import { TransactionFilterBar } from './TransactionFilterBar';
import { ProgressBar } from './ProgressBar';
import { TrendingUp, Calendar, Receipt, Users } from 'lucide-react';

interface Props {
  state: AppState;
  dateFilter: { start: string; end: string };
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

export function Overview({ state, dateFilter, filters, onFiltersChange }: Props) {
  const filtered = useMemo(
    () => filterTransactions(state.transactions, dateFilter, filters),
    [state.transactions, dateFilter, filters]
  );

  const total = getTotalSpending(filtered);
  const byCategory = getSpendingByCategory(filtered);
  const byMember = getSpendingByCardMember(state, filtered);
  const monthly = getMonthlySpending(filtered);
  const range = getDateRange(filtered);
  const avgMonthly = getAverageMonthlySpending(filtered);
  const topMerchants = getTopMerchants(filtered);
  const maxMonthly = Math.max(...monthly.map((m) => m.total), 1);
  const allCategories = getAllCategories(state);
  const categoriesWithSpending = getCategoriesWithSpending(state, filtered);
  const activeFilterCount = countActiveFilters(filters);

  const biggestCategory =
    categoriesWithSpending.length > 0
      ? categoriesWithSpending.reduce((max, c) =>
          (byCategory[c.id] ?? 0) > (byCategory[max.id] ?? 0) ? c : max
        )
      : null;

  if (state.transactions.length === 0) {
    return (
      <div className="card p-10 text-center max-w-lg mx-auto mt-8">
        <Receipt className="w-12 h-12 text-sage-300 mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-sage-800 mb-2">No spending data yet</h2>
        <p className="text-sage-500">
          Upload a credit card statement CSV to see your spending broken down by category over time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-sage-800">Spending Overview</h2>
        {range && (
          <p className="text-sage-400 text-sm">
            {new Date(range.start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' — '}
            {new Date(range.end + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' · '}{filtered.length} transactions
            {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
          </p>
        )}
      </div>

      <TransactionFilterBar
        state={state}
        filters={filters}
        onChange={onFiltersChange}
      />

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sage-400">No transactions match your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Spent" value={formatCurrency(total)} />
            <StatCard label="Avg / Month" value={formatCurrency(avgMonthly)} />
            <StatCard label="Months Tracked" value={String(monthly.length)} />
            <StatCard label="Biggest Category" value={biggestCategory?.name ?? '—'} />
          </div>

          {byMember.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-sage-600" />
                <h3 className="font-semibold text-sage-800">Spending by Card Member</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {byMember.map((m) => {
                  const pct = total > 0 ? (m.total / total) * 100 : 0;
                  return (
                    <div key={m.memberId} className="bg-cream-50 rounded-xl p-4">
                      <p className="text-sm text-sage-500 mb-1">{m.name}</p>
                      <p className="text-xl font-semibold text-sage-800">{formatCurrency(m.total)}</p>
                      <p className="text-xs text-sage-400 mt-1">{pct.toFixed(0)}% of total</p>
                      <ProgressBar value={pct} color="#5a7a5a" height="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-sage-600" />
              <h3 className="font-semibold text-sage-800">Spending Over Time</h3>
            </div>
            <div className="space-y-3">
              {monthly.map((m) => (
                <div key={m.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-sage-600">{formatMonth(m.month)}</span>
                    <span className="font-medium text-sage-800">{formatCurrency(m.total)}</span>
                  </div>
                  <div className="h-6 bg-cream-100 rounded-lg overflow-hidden flex">
                    {allCategories.map((cat) => {
                      const amt = m.byCategory[cat.id] ?? 0;
                      if (amt === 0) return null;
                      const pct = (amt / m.total) * 100;
                      return (
                        <div
                          key={cat.id}
                          style={{ width: `${pct}%`, backgroundColor: cat.color }}
                          title={`${cat.name}: ${formatCurrency(amt)}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-cream-200">
              {allCategories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-1.5 text-xs text-sage-500">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-sage-800 mb-4">By Category</h3>
              <div className="space-y-4">
                {categoriesWithSpending.map((cat) => {
                  const amt = byCategory[cat.id] ?? 0;
                  const pct = total > 0 ? (amt / total) * 100 : 0;
                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-sage-700">{cat.name}</span>
                        <span className="text-sage-500">
                          {formatCurrency(amt)} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <ProgressBar value={pct} color={cat.color} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-sage-800 mb-4">Top Merchants</h3>
              {topMerchants.length === 0 ? (
                <p className="text-sm text-sage-400">No data</p>
              ) : (
                <div className="space-y-3">
                  {topMerchants.map((m, i) => (
                    <div key={m.description} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-cream-200 text-sage-600 text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-sage-800 truncate">{m.description}</p>
                        <p className="text-xs text-sage-400">{m.count} transactions</p>
                      </div>
                      <span className="text-sm font-medium text-sage-700">{formatCurrency(m.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="w-5 h-5 text-sage-600" />
              <h3 className="font-semibold text-sage-800">Monthly Comparison</h3>
            </div>
            <div className="flex items-end gap-2 h-40">
              {monthly.map((m) => {
                const height = (m.total / maxMonthly) * 100;
                const topCat = allCategories.reduce((max, c) =>
                  (m.byCategory[c.id] ?? 0) > (m.byCategory[max.id] ?? 0) ? c : max
                );
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-sage-500 font-medium">
                      {formatCurrency(m.total)}
                    </span>
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${Math.max(height, 4)}%`,
                        backgroundColor: getCategoryColor(state, topCat.id),
                      }}
                    />
                    <span className="text-xs text-sage-400 truncate w-full text-center">
                      {formatMonth(m.month).split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-sage-400 mb-1">{label}</p>
      <p className="text-lg font-semibold text-sage-800">{value}</p>
    </div>
  );
}
