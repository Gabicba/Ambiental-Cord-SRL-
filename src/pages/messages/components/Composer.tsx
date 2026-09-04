import { useState } from 'react';
import type { MessagePriority, QuickReply } from '@/hooks/useChat';

interface ComposerProps {
  onSend: (payload: {
    content: string;
    priority: MessagePriority;
    requiresConfirmation: boolean;
    routeSheetId: string | null;
  }) => void;
  quickReplies: QuickReply[];
  routeOptions: { id: string; name: string; status: string }[];
  sending: boolean;
}

const routeStatusLabel: Record<string, string> = {
  Pending: 'Pendiente',
  In_Progress: 'En Progreso',
  Completed: 'Completada',
  Canceled: 'Cancelada',
};

export default function Composer({ onSend, quickReplies, routeOptions, sending }: ComposerProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<MessagePriority>('normal');
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [routeSheetId, setRouteSheetId] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const canSend = text.trim().length > 0 && !sending;

  const handleSend = () => {
    if (!canSend) return;
    onSend({ content: text.trim(), priority, requiresConfirmation, routeSheetId });
    setText('');
    setRequiresConfirmation(false);
    setShowQuickReplies(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-brand-border bg-white p-3">
      {showQuickReplies && (
        <div className="mb-2 flex flex-wrap gap-2">
          {quickReplies.map((qr) => (
            <button
              key={qr.id}
              onClick={() => {
                setText(qr.text);
                setShowQuickReplies(false);
              }}
              type="button"
              className="px-3 py-1.5 rounded-full bg-brand-light border border-brand-border text-xs text-text-secondary hover:bg-brand-green/10 hover:text-brand-green hover:border-brand-green/30 transition-colors whitespace-nowrap"
            >
              {qr.text}
            </button>
          ))}
          {quickReplies.length === 0 && (
            <span className="text-xs text-text-muted">No hay respuestas rápidas</span>
          )}
        </div>
      )}

      {(priority !== 'normal' || requiresConfirmation || routeSheetId) && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {priority !== 'normal' && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <i className={priority === 'urgent' ? 'ri-alarm-warning-line' : 'ri-error-warning-line'} />
              {priority === 'urgent' ? 'Urgente' : 'Importante'}
            </span>
          )}
          {requiresConfirmation && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-light border border-brand-border text-xs text-text-secondary">
              <i className="ri-checkbox-circle-line" /> Solicita confirmación
            </span>
          )}
          {routeSheetId && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-light border border-brand-border text-xs text-text-secondary">
              <i className="ri-route-line" />
              {routeOptions.find((r) => r.id === routeSheetId)?.name || 'Hoja de ruta'}
            </span>
          )}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        placeholder="Escribí un mensaje..."
        className="w-full resize-none px-4 py-2.5 rounded-xl bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
      />

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <button
          onClick={() => setShowQuickReplies((v) => !v)}
          type="button"
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors whitespace-nowrap ${
            showQuickReplies ? 'bg-brand-green/10 text-brand-green' : 'text-text-secondary hover:bg-brand-light'
          }`}
          title="Respuestas rápidas"
        >
          <i className="ri-lightbulb-flash-line text-lg" />
        </button>

        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-muted cursor-not-allowed"
          title="Adjuntos (próximamente)"
          disabled
        >
          <i className="ri-attachment-2 text-lg" />
        </button>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as MessagePriority)}
          className="px-2.5 py-1.5 rounded-lg bg-brand-light border border-brand-border text-xs text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
        >
          <option value="normal">Normal</option>
          <option value="important">Importante</option>
          <option value="urgent">Urgente</option>
        </select>

        <select
          value={routeSheetId || ''}
          onChange={(e) => setRouteSheetId(e.target.value || null)}
          className="px-2.5 py-1.5 rounded-lg bg-brand-light border border-brand-border text-xs text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-green/30 max-w-[160px]"
        >
          <option value="">Sin hoja de ruta</option>
          {routeOptions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} · {routeStatusLabel[r.status] || r.status}
            </option>
          ))}
        </select>

        <button
          onClick={() => setRequiresConfirmation((v) => !v)}
          type="button"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
            requiresConfirmation
              ? 'bg-brand-green text-white border-brand-green'
              : 'bg-white text-text-secondary border-brand-border hover:bg-brand-light'
          }`}
        >
          <i className="ri-checkbox-circle-line" />
          Solicitar confirmación
        </button>

        <div className="flex-1" />

        <button
          onClick={handleSend}
          disabled={!canSend}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green text-white text-sm font-medium hover:bg-brand-green/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {sending ? (
            <i className="ri-loader-4-line animate-spin" />
          ) : (
            <i className="ri-send-plane-fill" />
          )}
          Enviar
        </button>
      </div>
    </div>
  );
}