import type { AppState } from './types';
import { DEFAULT_STATE, DEFAULT_CARD_MEMBERS } from './types';

const STORAGE_KEY = 'spending-analyzer-data';

function migrateState(parsed: Partial<AppState>): AppState {
  return {
    transactions: (parsed.transactions ?? []).map((t) => ({
      ...t,
      categoryId: t.categoryId ?? 'other',
    })),
    cardMembers:
      parsed.cardMembers && parsed.cardMembers.length > 0
        ? parsed.cardMembers
        : [...DEFAULT_CARD_MEMBERS],
    customCategories: parsed.customCategories ?? [],
    monthlyIncome: parsed.monthlyIncome ?? 0,
    goals: parsed.goals ?? [],
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE, cardMembers: [...DEFAULT_CARD_MEMBERS] };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return migrateState(parsed);
  } catch {
    return { ...DEFAULT_STATE, cardMembers: [...DEFAULT_CARD_MEMBERS] };
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportState(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spending-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importState(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as Partial<AppState>;
        resolve(migrateState(parsed));
      } catch {
        reject(new Error('Invalid file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
