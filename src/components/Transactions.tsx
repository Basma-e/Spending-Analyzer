import { useMemo, useState } from 'react';
import type { AppState, Transaction } from '../types';
import { getAllCategories } from '../categoryUtils';
import { categorizeDescription } from '../categories';
import {
  formatCurrency,
  generateId,
  getCategoryColor,
  getCategoryName,
  getCardMemberName,
} from '../utils';
import {
  filterTransactions,
  countActiveFilters,
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionFilters,
} from '../transactionFilters';
import { TransactionFilterBar } from './TransactionFilterBar';
import { CategoryManager } from './CategoryManager';
import {
  Plus,
  Trash2,
  X,
  Pencil,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Tag,
} from 'lucide-react';

type SortField = 'date' | 'amount' | 'description' | 'category' | 'cardMember';
type SortDirection = 'asc' | 'desc';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  dateFilter: { start: string; end: string };
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

export function Transactions({
  state,
  updateState,
  dateFilter,
  filters,
  onFiltersChange,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'category' | 'cardMember' | null>(null);
  const [lastCardMemberId, setLastCardMemberId] = useState(
    state.cardMembers[0]?.id ?? ''
  );

  const allCategories = getAllCategories(state);
  const activeFilterCount = countActiveFilters(filters);

  const filtered = useMemo(() => {
    const txs = filterTransactions(state.transactions, dateFilter, filters);
    const dir = sortDirection === 'asc' ? 1 : -1;
    return [...txs].sort((a, b) => {
      switch (sortField) {
        case 'date':
          return a.date.localeCompare(b.date) * dir;
        case 'amount':
          return (a.amount - b.amount) * dir;
        case 'description':
          return a.description.localeCompare(b.description) * dir;
        case 'category':
          return getCategoryName(state, a.categoryId).localeCompare(
            getCategoryName(state, b.categoryId)
          ) * dir;
        case 'cardMember':
          return getCardMemberName(state, a.cardMemberId).localeCompare(
            getCardMemberName(state, b.cardMemberId)
          ) * dir;
        default:
          return 0;
      }
    });
  }, [state, dateFilter, filters, sortField, sortDirection]);

  const total = filtered.reduce((s, t) => s + t.amount, 0);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    if (tx.cardMemberId) setLastCardMemberId(tx.cardMemberId);
    updateState((prev) => ({
      ...prev,
      transactions: [{ ...tx, id: generateId() }, ...prev.transactions],
    }));
    setShowForm(false);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    updateState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
    setEditingId(null);
    setEditingField(null);
  };

  const deleteTransaction = (id: string) => {
    updateState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  };

  const recategorizeAll = () => {
    updateState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => ({
        ...t,
        categoryId: categorizeDescription(t.description),
      })),
    }));
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'date' || field === 'amount' ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-sage-800">Transactions</h2>
          <p className="text-sage-400 text-sm">
            {filtered.length} transactions · {formatCurrency(total)} total
            {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowCategoryManager(true)} className="btn-secondary text-sm flex items-center gap-1">
            <Tag className="w-4 h-4" />
            Categories
          </button>
          <button onClick={recategorizeAll} className="btn-secondary text-sm">
            Re-categorize All
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <TransactionFilterBar
        state={state}
        filters={filters}
        onChange={onFiltersChange}
      />

      {showForm && (
        <TransactionForm
          state={state}
          defaultCardMemberId={lastCardMemberId}
          onSubmit={addTransaction}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          state={state}
          updateState={updateState}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sage-400 mb-4">
            {state.transactions.length === 0
              ? 'No transactions yet. Upload a statement or add one manually.'
              : 'No transactions match your filters.'}
          </p>
          {state.transactions.length === 0 ? (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Add a transaction
            </button>
          ) : (
            <button
              onClick={() => onFiltersChange({ ...DEFAULT_TRANSACTION_FILTERS })}
              className="btn-secondary"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-cream-50 border-b border-cream-200 text-xs font-medium text-sage-500">
            <div className="w-2 shrink-0" />
            <button onClick={() => toggleSort('description')} className="flex-1 flex items-center gap-1 hover:text-sage-700 text-left">
              Description <SortIcon field="description" />
            </button>
            <button onClick={() => toggleSort('cardMember')} className="w-28 flex items-center gap-1 hover:text-sage-700">
              Member <SortIcon field="cardMember" />
            </button>
            <button onClick={() => toggleSort('category')} className="w-28 flex items-center gap-1 hover:text-sage-700">
              Category <SortIcon field="category" />
            </button>
            <button onClick={() => toggleSort('amount')} className="w-24 flex items-center gap-1 justify-end hover:text-sage-700">
              Amount <SortIcon field="amount" />
            </button>
            <button onClick={() => toggleSort('date')} className="w-24 flex items-center gap-1 justify-end hover:text-sage-700">
              Date <SortIcon field="date" />
            </button>
            <div className="w-8 shrink-0" />
          </div>

          <div className="divide-y divide-cream-200">
            {filtered.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-4 hover:bg-cream-50 transition-colors group">
                <div
                  className="w-2 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: getCategoryColor(state, tx.categoryId) }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sage-800 truncate">{tx.description}</p>
                  <p className="text-xs text-sage-400 sm:hidden">
                    {new Date(tx.date + 'T12:00:00').toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                    {' · '}{getCardMemberName(state, tx.cardMemberId)}
                  </p>
                  <p className="text-xs text-sage-400 hidden sm:block">
                    {tx.source === 'import' && tx.statementName ? tx.statementName : 'Manual'}
                  </p>
                </div>

                <div className="shrink-0 w-28 hidden sm:block">
                  {editingId === tx.id && editingField === 'cardMember' ? (
                    <select
                      className="input-field text-sm py-1"
                      value={tx.cardMemberId ?? ''}
                      onChange={(e) =>
                        updateTransaction(tx.id, { cardMemberId: e.target.value || undefined })
                      }
                      autoFocus
                      onBlur={() => { setEditingId(null); setEditingField(null); }}
                    >
                      <option value="">Unassigned</option>
                      {state.cardMembers.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => { setEditingId(tx.id); setEditingField('cardMember'); }}
                      className="text-xs px-2.5 py-1 rounded-full bg-cream-100 text-sage-600 hover:bg-cream-200 transition-colors truncate max-w-full"
                    >
                      {getCardMemberName(state, tx.cardMemberId)}
                    </button>
                  )}
                </div>

                <div className="shrink-0 w-28">
                  {editingId === tx.id && editingField === 'category' ? (
                    <select
                      className="input-field text-sm py-1"
                      value={tx.categoryId}
                      onChange={(e) => updateTransaction(tx.id, { categoryId: e.target.value })}
                      autoFocus
                      onBlur={() => { setEditingId(null); setEditingField(null); }}
                    >
                      {allCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => { setEditingId(tx.id); setEditingField('category'); }}
                      className="text-xs px-2.5 py-1 rounded-full bg-cream-100 text-sage-600 hover:bg-cream-200 transition-colors flex items-center gap-1"
                    >
                      {getCategoryName(state, tx.categoryId)}
                      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>

                <p className="font-semibold text-sage-800 shrink-0 w-24 text-right">
                  {formatCurrency(tx.amount)}
                </p>
                <p className="text-xs text-sage-400 shrink-0 w-24 text-right hidden sm:block">
                  {new Date(tx.date + 'T12:00:00').toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric',
                  })}
                </p>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="p-2 text-sage-300 hover:text-coral-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionForm({
  state,
  defaultCardMemberId,
  onSubmit,
  onCancel,
}: {
  state: AppState;
  defaultCardMemberId: string;
  onSubmit: (tx: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('other');
  const [cardMemberId, setCardMemberId] = useState(defaultCardMemberId);
  const allCategories = getAllCategories(state);

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    if (val.length > 3) setCategoryId(categorizeDescription(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!description.trim() || isNaN(parsed) || parsed <= 0) return;
    onSubmit({
      description: description.trim(),
      amount: parsed,
      date,
      categoryId,
      cardMemberId: cardMemberId || undefined,
      source: 'manual',
    });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sage-800">Add Transaction</h3>
        <button onClick={onCancel} className="p-1 text-sage-400 hover:text-sage-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Description / Merchant</label>
          <input
            className="input-field"
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="e.g. Shell Gas Station"
            required
          />
        </div>
        <div>
          <label className="label">Amount ($)</label>
          <input className="input-field" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="label">Date</label>
          <input className="input-field" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label className="label">Card Member</label>
          <select className="input-field" value={cardMemberId} onChange={(e) => setCardMemberId(e.target.value)}>
            {state.cardMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {allCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Add Transaction</button>
        </div>
      </form>
    </div>
  );
}
