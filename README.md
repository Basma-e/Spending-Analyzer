# Spending Analyzer

Upload credit card statements and see where your money goes. Transactions are automatically sorted into categories so you can analyze spending over time.

## Features

- **Upload CSV statements** — Import past credit card exports; card member column auto-detected when present
- **Auto-categorization** — Transactions sorted into Food, Shopping, Gas, Necessities, and Other
- **Custom categories** — Add your own categories (e.g. Subscriptions, Travel)
- **Card members** — Track spending per person; filter and sort by card member
- **Sort & filter** — Sort by date, amount, description, category, or card member; filter by category (multi-select), member, source, and amount range — shared across Overview and Transactions
- **Goals page** — Set household monthly income, create savings goals, track contributions, and see savings rate insights
- **Spending over time** — Monthly trends, category breakdowns, per-member totals, and top merchants
- **Add transactions manually** — Record cash purchases or anything missing from statements

## Getting Started

```bash
cd budget-app
npm install
npm run dev
```

Open http://localhost:5173

1. Go to **Upload** — name your card members, then upload a CSV
2. Check **Overview** for spending trends and per-member breakdown
3. Go to **Transactions** to sort, filter, edit categories, or add manual entries
4. Visit **Goals** to set your income and track savings goals
5. Use **Categories** button to add custom categories

## Test with sample data

Upload `sample-statement.csv` included in the project — it has transactions for two card members (Alex and Jordan).

## Privacy

All processing happens in your browser. No data is sent to any server.
