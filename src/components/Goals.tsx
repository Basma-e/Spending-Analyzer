import { useState } from 'react';
import type { AppState, SavingsGoal } from '../types';
import {
  formatCurrency,
  generateId,
  getAverageMonthlySpending,
} from '../utils';
import {
  getGoalProgress,
  getMonthlyGoalContribution,
  getTotalMonthlyGoalSavings,
  getTotalSaved,
  getNetMonthlySavings,
  getSavingsRate,
} from '../goalUtils';
import { ProgressBar } from './ProgressBar';
import {
  Target,
  DollarSign,
  TrendingUp,
  PiggyBank,
  Plus,
  Trash2,
  X,
  Lightbulb,
} from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

export function Goals({ state, updateState }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [contributingTo, setContributingTo] = useState<string | null>(null);

  const avgSpending = getAverageMonthlySpending(state.transactions);
  const netAvailable = getNetMonthlySavings(state.monthlyIncome, avgSpending);
  const savingsRate = getSavingsRate(state.monthlyIncome, avgSpending);
  const totalSaved = getTotalSaved(state.goals);
  const monthlyGoalNeeds = getTotalMonthlyGoalSavings(state.goals);

  const updateIncome = (value: number) => {
    updateState((prev) => ({ ...prev, monthlyIncome: value }));
  };

  const addGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    updateState((prev) => ({
      ...prev,
      goals: [...prev.goals, { ...goal, id: generateId(), currentAmount: 0 }],
    }));
    setShowForm(false);
  };

  const deleteGoal = (id: string) => {
    updateState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  const contribute = (id: string, amount: number) => {
    updateState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
      ),
    }));
    setContributingTo(null);
  };

  const insight = getInsight(state.monthlyIncome, avgSpending, netAvailable, monthlyGoalNeeds);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-sage-800">Goals & Income</h2>
        <p className="text-sage-400 text-sm">Track your household income and savings goals</p>
      </div>

      {/* Income */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-sage-600" />
          <h3 className="font-semibold text-sage-800">Monthly Household Income</h3>
        </div>
        <p className="text-sm text-sage-500 mb-3">
          Enter your combined monthly take-home pay (after taxes).
        </p>
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400">$</span>
          <input
            className="input-field pl-7 text-lg font-semibold"
            type="number"
            min="0"
            step="100"
            value={state.monthlyIncome || ''}
            onChange={(e) => updateIncome(parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Monthly Income"
          value={formatCurrency(state.monthlyIncome)}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Avg Monthly Spending"
          value={formatCurrency(avgSpending)}
        />
        <StatCard
          icon={<PiggyBank className="w-5 h-5" />}
          label="Net Available"
          value={formatCurrency(netAvailable)}
          highlight={netAvailable < 0 ? 'negative' : 'positive'}
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Total Saved"
          value={formatCurrency(totalSaved)}
        />
      </div>

      {/* Insights */}
      {state.monthlyIncome > 0 && (
        <div className="card p-5 bg-gradient-to-br from-sage-50 to-cream-100 border-sage-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sage-800 mb-1">
                Savings rate: {savingsRate.toFixed(0)}%
              </p>
              <p className="text-sm text-sage-600">{insight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Goals header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sage-800">Savings Goals</h3>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {showForm && (
        <GoalForm onSubmit={addGoal} onCancel={() => setShowForm(false)} />
      )}

      {state.goals.length === 0 ? (
        <div className="card p-12 text-center">
          <Target className="w-10 h-10 text-sage-300 mx-auto mb-3" />
          <h3 className="font-semibold text-sage-800 mb-2">What are you saving for?</h3>
          <p className="text-sage-400 text-sm mb-4 max-w-md mx-auto">
            Set goals for an emergency fund, vacation, or anything else — and track your progress together.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {state.goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={() => deleteGoal(goal.id)}
              onContribute={(amount) => contribute(goal.id, amount)}
              isContributing={contributingTo === goal.id}
              onStartContribute={() => setContributingTo(goal.id)}
              onCancelContribute={() => setContributingTo(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getInsight(
  income: number,
  avgSpending: number,
  netAvailable: number,
  monthlyGoalNeeds: number
): string {
  if (income <= 0) return 'Add your monthly income above to see personalized insights.';
  if (avgSpending > income) {
    return `You're spending ${formatCurrency(avgSpending - income)} more than you earn on average. Review your spending to free up room for savings.`;
  }
  if (monthlyGoalNeeds > 0 && netAvailable < monthlyGoalNeeds) {
    return `You need ${formatCurrency(monthlyGoalNeeds)}/mo for your goals but only have ${formatCurrency(netAvailable)} available after spending. Consider trimming expenses or extending deadlines.`;
  }
  if (monthlyGoalNeeds > 0 && netAvailable >= monthlyGoalNeeds) {
    return `You're on track! After spending, you have ${formatCurrency(netAvailable)} available — enough to cover your goal contributions of ${formatCurrency(monthlyGoalNeeds)}/mo.`;
  }
  return `You have ${formatCurrency(netAvailable)} left each month after average spending. Consider setting a savings goal!`;
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: 'positive' | 'negative';
}) {
  return (
    <div className="card p-4">
      <div className="w-9 h-9 rounded-lg bg-sage-100 text-sage-600 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-xs text-sage-400 mb-1">{label}</p>
      <p
        className={`text-lg font-semibold ${
          highlight === 'negative' ? 'text-coral-600' : 'text-sage-800'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function GoalCard({
  goal,
  onDelete,
  onContribute,
  isContributing,
  onStartContribute,
  onCancelContribute,
}: {
  goal: SavingsGoal;
  onDelete: () => void;
  onContribute: (amount: number) => void;
  isContributing: boolean;
  onStartContribute: () => void;
  onCancelContribute: () => void;
}) {
  const progress = getGoalProgress(goal);
  const monthly = getMonthlyGoalContribution(goal);
  const isComplete = progress >= 100;

  const priorityColors = {
    high: 'bg-coral-100 text-coral-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-sage-100 text-sage-600',
  };

  return (
    <div className={`card p-5 ${isComplete ? 'border-sage-300 bg-sage-50' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-sage-800">{goal.name}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[goal.priority]}`}>
            {goal.priority} priority
          </span>
        </div>
        <button onClick={onDelete} className="p-1 text-sage-300 hover:text-coral-500">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-sage-600">{formatCurrency(goal.currentAmount)}</span>
          <span className="text-sage-400">{formatCurrency(goal.targetAmount)}</span>
        </div>
        <ProgressBar value={progress} color={isComplete ? '#5a7a5a' : '#7a967a'} height="h-3" />
        <p className="text-xs text-sage-400 mt-1.5">
          {isComplete
            ? 'Goal reached!'
            : `${Math.round(progress)}% · ${formatCurrency(monthly)}/mo needed`}
        </p>
      </div>

      {!isComplete && (
        isContributing ? (
          <ContributeForm onSubmit={onContribute} onCancel={onCancelContribute} />
        ) : (
          <button onClick={onStartContribute} className="btn-secondary w-full text-sm">
            Add Contribution
          </button>
        )
      )}
    </div>
  );
}

function ContributeForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (amount: number) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    onSubmit(parsed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="number"
        step="0.01"
        min="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input-field flex-1"
        placeholder="Amount"
        autoFocus
        required
      />
      <button type="submit" className="btn-primary text-sm px-3">Save</button>
      <button type="button" onClick={onCancel} className="btn-secondary text-sm px-3">
        <X className="w-4 h-4" />
      </button>
    </form>
  );
}

function GoalForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<SavingsGoal['priority']>('medium');

  const suggestions = ['Emergency Fund', 'Vacation', 'New Car', 'House Down Payment', 'Wedding'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(targetAmount);
    if (!name.trim() || isNaN(parsed) || parsed <= 0 || !deadline) return;
    onSubmit({ name: name.trim(), targetAmount: parsed, deadline, priority });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sage-800">New Savings Goal</h3>
        <button onClick={onCancel} className="p-1 text-sage-400 hover:text-sage-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setName(s)}
            className="text-xs px-3 py-1.5 rounded-full bg-cream-100 text-sage-600 hover:bg-cream-200"
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Goal Name</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Target Amount ($)</label>
          <input
            className="input-field"
            type="number"
            min="1"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Target Date</label>
          <input
            className="input-field"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Priority</label>
          <select
            className="input-field"
            value={priority}
            onChange={(e) => setPriority(e.target.value as SavingsGoal['priority'])}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Create Goal</button>
        </div>
      </form>
    </div>
  );
}
