import { useState } from 'react';
import type { AppState, Category } from '../types';
import { getAllCategories } from '../categoryUtils';
import { CATEGORY_COLOR_PRESETS } from '../categoryUtils';
import { generateId } from '../utils';
import { X, Plus, Trash2 } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onClose: () => void;
}

export function CategoryManager({ state, updateState, onClose }: Props) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(CATEGORY_COLOR_PRESETS[0]);
  const allCategories = getAllCategories(state);

  const addCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    const id = `custom-${generateId()}`;
    const category: Category = { id, name, color: newColor };

    updateState((prev) => ({
      ...prev,
      customCategories: [...prev.customCategories, category],
    }));
    setNewName('');
    setNewColor(CATEGORY_COLOR_PRESETS[(state.customCategories.length + 1) % CATEGORY_COLOR_PRESETS.length]);
  };

  const deleteCategory = (id: string) => {
    if (!confirm('Delete this category? Affected transactions will be moved to Other.')) return;
    updateState((prev) => ({
      ...prev,
      customCategories: prev.customCategories.filter((c) => c.id !== id),
      transactions: prev.transactions.map((t) =>
        t.categoryId === id ? { ...t, categoryId: 'other' } : t
      ),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sage-800">Manage Categories</h3>
          <button onClick={onClose} className="p-1 text-sage-400 hover:text-sage-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          <p className="text-xs text-sage-400 uppercase tracking-wide">Built-in</p>
          {allCategories
            .filter((c) => c.isBuiltIn)
            .map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 p-2 rounded-lg bg-cream-50">
                <div className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-sage-700 flex-1">{cat.name}</span>
              </div>
            ))}
        </div>

        {state.customCategories.length > 0 && (
          <div className="space-y-2 mb-6">
            <p className="text-xs text-sage-400 uppercase tracking-wide">Custom</p>
            {state.customCategories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 p-2 rounded-lg bg-cream-50">
                <div className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-sage-700 flex-1">{cat.name}</span>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1 text-sage-300 hover:text-coral-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={addCategory} className="border-t border-cream-200 pt-4">
          <p className="text-sm font-medium text-sage-700 mb-3">Add custom category</p>
          <div className="flex gap-2 mb-3">
            <input
              className="input-field flex-1"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Subscriptions"
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORY_COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewColor(color)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  newColor === color ? 'border-sage-800 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </form>
      </div>
    </div>
  );
}
