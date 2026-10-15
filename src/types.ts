export type BuiltInCategoryId = 'food' | 'shopping' | 'gas' | 'necessities' | 'other';

export interface Category {
  id: string;
  name: string;
  color: string;
  isBuiltIn?: boolean;
}

export interface CardMember {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  categoryId: string;
  cardMemberId?: string;
  source: 'manual' | 'import';
  statementName?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AppState {
  transactions: Transaction[];
  cardMembers: CardMember[];
  customCategories: Category[];
  monthlyIncome: number;
  goals: SavingsGoal[];
}

export const BUILT_IN_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', color: '#f86b4f', isBuiltIn: true },
  { id: 'shopping', name: 'Shopping', color: '#7a967a', isBuiltIn: true },
  { id: 'gas', name: 'Gas', color: '#394e39', isBuiltIn: true },
  { id: 'necessities', name: 'Necessities', color: '#5a7a5a', isBuiltIn: true },
  { id: 'other', name: 'Other', color: '#c9b8a3', isBuiltIn: true },
];

export const DEFAULT_CARD_MEMBERS: CardMember[] = [
  { id: 'member1', name: 'Card Member 1' },
  { id: 'member2', name: 'Card Member 2' },
];

export const DEFAULT_STATE: AppState = {
  transactions: [],
  cardMembers: [...DEFAULT_CARD_MEMBERS],
  customCategories: [],
  monthlyIncome: 0,
  goals: [],
};

export const CATEGORIES = BUILT_IN_CATEGORIES;
