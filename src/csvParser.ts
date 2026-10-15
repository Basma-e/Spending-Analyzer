import type { CardMember, Transaction } from './types';
import { categorizeDescription } from './categories';
import { generateId } from './utils';

interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  cardMemberName?: string;
}

export interface ParseOptions {
  fileName: string;
  defaultCardMemberId?: string;
  cardMembers: CardMember[];
}

export interface ParseResult {
  transactions: Transaction[];
  errors: string[];
  detectedCardMemberColumn: boolean;
  newCardMembers: CardMember[];
}

const DATE_HEADERS = ['date', 'transaction date', 'post date', 'posted date', 'trans date'];
const DESC_HEADERS = ['description', 'merchant', 'payee', 'name', 'transaction', 'details', 'memo'];
const AMOUNT_HEADERS = ['amount', 'debit', 'charge', 'transaction amount', 'payment'];
const MEMBER_HEADERS = ['card member', 'cardholder', 'card holder', 'user', 'account name', 'member name', 'cardmember'];

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/['"]/g, '');
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function findColumnIndex(headers: string[], candidates: string[]): number {
  for (const candidate of candidates) {
    const idx = headers.findIndex((h) => h.includes(candidate));
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseDate(raw: string): string | null {
  const cleaned = raw.trim().replace(/['"]/g, '');
  if (!cleaned) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
    return cleaned.slice(0, 10);
  }

  const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const [, m, d, y] = slashMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const dashMatch = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (dashMatch) {
    const [, m, d, y] = dashMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/['"]/g, '').replace(/\$/g, '').replace(/,/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '') return null;

  const value = parseFloat(cleaned);
  if (isNaN(value)) return null;

  return Math.abs(value);
}

function isLikelyPayment(description: string, rawAmount: string): boolean {
  const lower = description.toLowerCase();
  const paymentKeywords = [
    'payment thank', 'autopay', 'online payment', 'credit card payment',
    'payment received', 'mobile payment', 'pymt', 'pmt ',
  ];
  if (paymentKeywords.some((kw) => lower.includes(kw))) return true;
  const cleaned = rawAmount.replace(/[$,]/g, '').trim();
  if (cleaned.startsWith('-') && !lower.includes('refund')) return true;
  if (cleaned.startsWith('(')) return true;
  return false;
}

function resolveCardMemberId(
  name: string | undefined,
  cardMembers: CardMember[],
  newMembers: CardMember[]
): string | undefined {
  if (!name?.trim()) return undefined;

  const normalized = name.trim().toLowerCase();
  const existing = cardMembers.find((m) => m.name.toLowerCase() === normalized);
  if (existing) return existing.id;

  const pending = newMembers.find((m) => m.name.toLowerCase() === normalized);
  if (pending) return pending.id;

  const newMember: CardMember = {
    id: generateId(),
    name: name.trim(),
  };
  newMembers.push(newMember);
  return newMember.id;
}

export function parseStatementCSV(content: string, options: ParseOptions): ParseResult {
  const { fileName, defaultCardMemberId, cardMembers } = options;
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const errors: string[] = [];
  const newCardMembers: CardMember[] = [];

  if (lines.length < 2) {
    return {
      transactions: [],
      errors: ['File appears empty or has no data rows.'],
      detectedCardMemberColumn: false,
      newCardMembers: [],
    };
  }

  let headerIdx = 0;
  let dateCol = -1;
  let descCol = -1;
  let amountCol = -1;
  let memberCol = -1;

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const candidate = parseCSVLine(lines[i]).map(normalizeHeader);
    const d = findColumnIndex(candidate, DATE_HEADERS);
    const desc = findColumnIndex(candidate, DESC_HEADERS);
    const a = findColumnIndex(candidate, AMOUNT_HEADERS);
    const m = findColumnIndex(candidate, MEMBER_HEADERS);
    if (d !== -1 && desc !== -1 && a !== -1) {
      headerIdx = i;
      dateCol = d;
      descCol = desc;
      amountCol = a;
      memberCol = m;
      break;
    }
  }

  if (dateCol === -1 || descCol === -1 || amountCol === -1) {
    return {
      transactions: [],
      errors: [
        'Could not find Date, Description, and Amount columns. Make sure your CSV has headers like "Transaction Date", "Description", and "Amount".',
      ],
      detectedCardMemberColumn: false,
      newCardMembers: [],
    };
  }

  const detectedCardMemberColumn = memberCol !== -1;
  const allMembers = [...cardMembers];
  const rows: ParsedRow[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < Math.max(dateCol, descCol, amountCol) + 1) continue;

    const date = parseDate(cols[dateCol]);
    const description = cols[descCol]?.replace(/['"]/g, '').trim();
    const rawAmount = cols[amountCol];
    const amount = parseAmount(rawAmount);
    const cardMemberName =
      memberCol !== -1 ? cols[memberCol]?.replace(/['"]/g, '').trim() : undefined;

    if (!date || !description || amount === null || amount === 0) continue;
    if (isLikelyPayment(description, rawAmount)) continue;

    rows.push({ date, description, amount, cardMemberName });
  }

  if (rows.length === 0) {
    errors.push('No valid transactions found. Check that amounts and dates are formatted correctly.');
  }

  const transactions: Transaction[] = rows.map((row) => {
    let cardMemberId: string | undefined;

    if (detectedCardMemberColumn && row.cardMemberName) {
      cardMemberId = resolveCardMemberId(row.cardMemberName, allMembers, newCardMembers);
      // Add newly discovered members to allMembers for subsequent rows
      for (const nm of newCardMembers) {
        if (!allMembers.find((m) => m.id === nm.id)) allMembers.push(nm);
      }
    } else {
      cardMemberId = defaultCardMemberId;
    }

    return {
      id: generateId(),
      date: row.date,
      description: row.description,
      amount: row.amount,
      categoryId: categorizeDescription(row.description),
      cardMemberId,
      source: 'import' as const,
      statementName: fileName,
    };
  });

  return { transactions, errors, detectedCardMemberColumn, newCardMembers };
}
