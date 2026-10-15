import type { SavingsGoal } from './types';

export function getGoalProgress(goal: SavingsGoal): number {
  if (goal.targetAmount === 0) return 0;
  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
}

export function getMonthsUntil(dateStr: string): number {
  const deadline = new Date(dateStr);
  const now = new Date();
  const months =
    (deadline.getFullYear() - now.getFullYear()) * 12 +
    (deadline.getMonth() - now.getMonth());
  return Math.max(months, 1);
}

export function getMonthlyGoalContribution(goal: SavingsGoal): number {
  const remaining = goal.targetAmount - goal.currentAmount;
  if (remaining <= 0) return 0;
  const months = getMonthsUntil(goal.deadline);
  return Math.ceil(remaining / months);
}

export function getTotalMonthlyGoalSavings(goals: SavingsGoal[]): number {
  return goals.reduce((sum, g) => sum + getMonthlyGoalContribution(g), 0);
}

export function getTotalSaved(goals: SavingsGoal[]): number {
  return goals.reduce((sum, g) => sum + g.currentAmount, 0);
}

export function getNetMonthlySavings(income: number, avgMonthlySpending: number): number {
  return income - avgMonthlySpending;
}

export function getSavingsRate(income: number, spending: number): number {
  if (income <= 0) return 0;
  return Math.max(((income - spending) / income) * 100, 0);
}
