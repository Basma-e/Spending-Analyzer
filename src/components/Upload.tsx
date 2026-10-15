import { useRef, useState } from 'react';
import type { AppState, CardMember } from '../types';
import { parseStatementCSV } from '../csvParser';
import { deduplicateTransactions, generateId } from '../utils';
import { Upload, FileText, CheckCircle, AlertCircle, Plus, Trash2, User } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

export function UploadStatements({ state, updateState }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [defaultCardMemberId, setDefaultCardMemberId] = useState(
    state.cardMembers[0]?.id ?? ''
  );
  const [newMemberName, setNewMemberName] = useState('');

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setStatus({
        type: 'error',
        message: 'Please upload a CSV file. Most banks let you download statements as CSV.',
      });
      return;
    }

    const content = await file.text();
    const result = parseStatementCSV(content, {
      fileName: file.name,
      defaultCardMemberId: defaultCardMemberId || undefined,
      cardMembers: state.cardMembers,
    });

    if (result.transactions.length === 0) {
      setStatus({ type: 'error', message: result.errors[0] ?? 'No transactions found in file.' });
      return;
    }

    const unique = deduplicateTransactions(state.transactions, result.transactions);
    const skipped = result.transactions.length - unique.length;

    updateState((prev) => ({
      ...prev,
      cardMembers: [...prev.cardMembers, ...result.newCardMembers],
      transactions: [...prev.transactions, ...unique],
    }));

    const memberNote = result.detectedCardMemberColumn
      ? ' Card members were detected from the file.'
      : ` All transactions assigned to ${state.cardMembers.find((m) => m.id === defaultCardMemberId)?.name ?? 'selected member'}.`;

    setStatus({
      type: 'success',
      message: `Imported ${unique.length} transactions from ${file.name}${skipped > 0 ? ` (${skipped} duplicates skipped)` : ''}.${memberNote} Categories were assigned automatically.`,
    });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const updateMemberName = (id: string, name: string) => {
    updateState((prev) => ({
      ...prev,
      cardMembers: prev.cardMembers.map((m) =>
        m.id === id ? { ...m, name } : m
      ),
    }));
  };

  const addMember = () => {
    const name = newMemberName.trim();
    if (!name) return;
    const member: CardMember = { id: generateId(), name };
    updateState((prev) => ({
      ...prev,
      cardMembers: [...prev.cardMembers, member],
    }));
    setNewMemberName('');
    if (!defaultCardMemberId) setDefaultCardMemberId(member.id);
  };

  const deleteMember = (id: string) => {
    if (state.cardMembers.length <= 1) return;
    if (!confirm('Remove this card member? Their transactions will become unassigned.')) return;
    updateState((prev) => ({
      ...prev,
      cardMembers: prev.cardMembers.filter((m) => m.id !== id),
      transactions: prev.transactions.map((t) =>
        t.cardMemberId === id ? { ...t, cardMemberId: undefined } : t
      ),
    }));
    if (defaultCardMemberId === id) {
      setDefaultCardMemberId(state.cardMembers.find((m) => m.id !== id)?.id ?? '');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-serif text-2xl text-sage-800">Upload Statements</h2>
        <p className="text-sage-400 text-sm">
          Import past credit card statements to analyze your spending
        </p>
      </div>

      {/* Card member management */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-sage-600" />
          <h3 className="font-semibold text-sage-800">Card Members</h3>
        </div>
        <p className="text-sm text-sage-500 mb-4">
          Name the people on your cards. If your CSV includes a card member column, names will be matched automatically.
        </p>
        <div className="space-y-2 mb-4">
          {state.cardMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <input
                className="input-field flex-1"
                value={member.name}
                onChange={(e) => updateMemberName(member.id, e.target.value)}
              />
              {state.cardMembers.length > 1 && (
                <button
                  onClick={() => deleteMember(member.id)}
                  className="p-2 text-sage-300 hover:text-coral-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Add another member..."
            onKeyDown={(e) => e.key === 'Enter' && addMember()}
          />
          <button onClick={addMember} className="btn-secondary flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Default card member for imports without column */}
      <div className="card p-4">
        <label className="label">Default card member for imports</label>
        <p className="text-xs text-sage-400 mb-2">
          Used when the CSV doesn't include a card member column
        </p>
        <select
          className="input-field"
          value={defaultCardMemberId}
          onChange={(e) => setDefaultCardMemberId(e.target.value)}
        >
          {state.cardMembers.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`card p-10 border-2 border-dashed cursor-pointer transition-colors text-center ${
          isDragging
            ? 'border-sage-500 bg-sage-50'
            : 'border-cream-300 hover:border-sage-400 hover:bg-cream-50'
        }`}
      >
        <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-sage-600' : 'text-sage-400'}`} />
        <p className="font-medium text-sage-700 mb-1">
          Drop your CSV statement here, or click to browse
        </p>
        <p className="text-sm text-sage-400">
          Supports exports from Chase, Amex, Capital One, Citi, and most banks
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {status && (
        <div
          className={`card p-4 flex items-start gap-3 ${
            status.type === 'success'
              ? 'border-sage-300 bg-sage-50'
              : status.type === 'error'
              ? 'border-coral-300 bg-coral-50'
              : 'border-cream-300'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-coral-600 shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-sage-700">{status.message}</p>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-sage-600" />
          <h3 className="font-semibold text-sage-800">How to export your statement</h3>
        </div>
        <ol className="space-y-2 text-sm text-sage-600 list-decimal list-inside">
          <li>Log into your credit card account online</li>
          <li>Go to Statements or Transaction History</li>
          <li>Look for "Download" or "Export" and choose CSV format</li>
          <li>Upload the file here — we'll sort transactions into categories automatically</li>
        </ol>
        <p className="text-xs text-sage-400 mt-4">
          Your file is processed locally in your browser. Nothing is sent to a server.
        </p>
      </div>

      {state.transactions.length > 0 && (
        <div className="card p-5">
          <p className="text-sm text-sage-600">
            <strong>{state.transactions.length}</strong> total transactions loaded
            {' · '}
            <strong>{state.transactions.filter((t) => t.source === 'import').length}</strong> from imports
            {' · '}
            <strong>{state.transactions.filter((t) => t.source === 'manual').length}</strong> added manually
          </p>
        </div>
      )}
    </div>
  );
}
