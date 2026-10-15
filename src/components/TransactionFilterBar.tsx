import { useState } from 'react';
import type { AppState } from '../types';
import { getAllCategories } from '../categoryUtils';
import {
  type TransactionFilters,
  DEFAULT_TRANSACTION_FILTERS,
  countActiveFilters,
} from '../transactionFilters';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Props {
  state: AppState;
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function TransactionFilterBar({ state, filters, onChange }: Props) {
  const allCategories = getAllCategories(state);
  const activeFilterCount = countActiveFilters(filters);

  const update = (partial: Partial<TransactionFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const clearFilters = () => onChange({ ...DEFAULT_TRANSACTION_FILTERS });

  return (
    <div className="card p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
          <input
            className="input-field pl-9"
            placeholder="Search merchants..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
          />
        </div>
        <CategoryMultiSelect
          categories={allCategories}
          selected={filters.categoryIds}
          onChange={(categoryIds) => update({ categoryIds })}
        />
        <select
          className="input-field w-auto"
          value={filters.cardMemberId}
          onChange={(e) => update({ cardMemberId: e.target.value })}
        >
          <option value="all">All card members</option>
          {state.cardMembers.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
          <option value="unassigned">Unassigned</option>
        </select>
        <select
          className="input-field w-auto"
          value={filters.source}
          onChange={(e) => update({ source: e.target.value as TransactionFilters['source'] })}
        >
          <option value="all">All sources</option>
          <option value="import">Imported</option>
          <option value="manual">Manual</option>
        </select>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <input
          className="input-field w-28"
          type="number"
          min="0"
          step="0.01"
          placeholder="Min $"
          value={filters.minAmount}
          onChange={(e) => update({ minAmount: e.target.value })}
        />
        <span className="text-sage-400 text-sm hidden sm:inline">to</span>
        <input
          className="input-field w-28"
          type="number"
          min="0"
          step="0.01"
          placeholder="Max $"
          value={filters.maxAmount}
          onChange={(e) => update({ maxAmount: e.target.value })}
        />
        <div className="flex-1" />
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-sm text-sage-500 hover:text-sage-700">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function CategoryMultiSelect({
  categories,
  selected,
  onChange,
}: {
  categories: { id: string; name: string; color: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const label =
    selected.length === 0
      ? 'All categories'
      : selected.length === 1
      ? categories.find((c) => c.id === selected[0])?.name ?? '1 category'
      : `${selected.length} categories`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`input-field w-auto min-w-[10rem] flex items-center justify-between gap-2 text-left ${
          selected.length > 0 ? 'border-sage-400 bg-sage-50' : ''
        }`}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 sm:left-0 z-20 mt-1 w-56 card py-2 shadow-lg max-h-64 overflow-y-auto">
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full px-3 py-1.5 text-left text-xs text-sage-500 hover:bg-cream-50 hover:text-sage-700"
              >
                Clear selection
              </button>
            )}
            {categories.map((cat) => {
              const isSelected = selected.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggle(cat.id)}
                  className={`w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-cream-50 ${
                    isSelected ? 'text-sage-800' : 'text-sage-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-sage-600 border-sage-600' : 'border-cream-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
