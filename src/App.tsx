import { useCallback, useEffect, useState } from 'react';
import type { AppState } from './types';
import { loadState, saveState, exportState, importState } from './storage';
import { Overview } from './components/Overview';
import { Transactions } from './components/Transactions';
import { UploadStatements } from './components/Upload';
import { Goals } from './components/Goals';
import { getDateRange } from './utils';
import {
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionFilters,
} from './transactionFilters';
import {
  BarChart3,
  Receipt,
  Upload,
  Download,
  TrendingUp,
  Target,
} from 'lucide-react';

type Tab = 'overview' | 'transactions' | 'goals' | 'upload';

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'upload', label: 'Upload', icon: Upload },
];

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>(
    DEFAULT_TRANSACTION_FILTERS
  );

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const range = getDateRange(state.transactions);
    if (range && !dateFilter.start) {
      setDateFilter({ start: range.start, end: range.end });
    }
  }, [state.transactions, dateFilter.start]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(updater);
  }, []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importState(file);
      setState(imported);
    } catch {
      alert('Could not import file. Please check the format.');
    }
    e.target.value = '';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview
            state={state}
            dateFilter={dateFilter}
            filters={transactionFilters}
            onFiltersChange={setTransactionFilters}
          />
        );
      case 'transactions':
        return (
          <Transactions
            state={state}
            updateState={updateState}
            dateFilter={dateFilter}
            filters={transactionFilters}
            onFiltersChange={setTransactionFilters}
          />
        );
      case 'goals':
        return <Goals state={state} updateState={updateState} />;
      case 'upload':
        return <UploadStatements state={state} updateState={updateState} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-cream-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-xl text-sage-800 leading-tight">Spending Analyzer</h1>
              <p className="text-xs text-sage-400 hidden sm:block">Understand where your money goes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state.transactions.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter((f) => ({ ...f, start: e.target.value }))}
                  className="input-field w-auto text-sm py-1.5"
                />
                <span className="text-sage-400 text-sm">to</span>
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter((f) => ({ ...f, end: e.target.value }))}
                  className="input-field w-auto text-sm py-1.5"
                />
              </div>
            )}
            <button
              onClick={() => exportState(state)}
              className="p-2 text-sage-500 hover:text-sage-700 hover:bg-cream-100 rounded-lg transition-colors"
              title="Export data"
            >
              <Download className="w-5 h-5" />
            </button>
            <label
              className="p-2 text-sage-500 hover:text-sage-700 hover:bg-cream-100 rounded-lg transition-colors cursor-pointer"
              title="Import backup"
            >
              <Upload className="w-5 h-5" />
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-cream-200 sticky top-[73px] z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'bg-sage-600 text-white'
                    : 'text-sage-500 hover:bg-cream-100 hover:text-sage-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        {renderContent()}
      </main>

      <footer className="border-t border-cream-200 py-4 text-center text-xs text-sage-400">
        All data stays on your device. Upload CSV statements from your bank to get started.
      </footer>
    </div>
  );
}
