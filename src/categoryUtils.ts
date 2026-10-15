import type { AppState, Category } from './types';
import { BUILT_IN_CATEGORIES } from './types';

export function getAllCategories(state: AppState): Category[] {
  return [...BUILT_IN_CATEGORIES, ...state.customCategories];
}

export function getCategoryById(state: AppState, id: string): Category | undefined {
  return getAllCategories(state).find((c) => c.id === id);
}

export function getCategoryName(state: AppState, id: string): string {
  return getCategoryById(state, id)?.name ?? id;
}

export function getCategoryColor(state: AppState, id: string): string {
  return getCategoryById(state, id)?.color ?? '#c9b8a3';
}

export const CATEGORY_COLOR_PRESETS = [
  '#f86b4f', '#7a967a', '#394e39', '#5a7a5a', '#c9b8a3',
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4',
];
