import type { ChatMessage } from '@/hooks/useChat';
import { priorityConfig } from '@/hooks/useChat';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  driverName: string;
  onConfirm?: (message: ChatMessage) => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isOwn, driverName, onConfirm }: MessageBubbleProps) {
  const priority = priorityConfig[message.priority] || priorityConfig.normal;
  const isHighlighted = message.priority !== 'normal';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isOwn
              ? 'bg-brand-primary text-white rounded-br-md'
              : 'bg-white text-text-primary border border-brand-border rounded-bl-md'
          }`}
        >
          {isHighlighted && (
            <div
              className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${
                message.priority === 'urgent' ? 'text-red-300' : 'text-amber-200'
              }`}
            >
              <i className={message.priority === 'urgent' ? 'ri-alarm-warning-line' : 'ri-error-warning-line'} />
              {' '}
              {priority.label}
            </div>
          )}

          {message.attachment_url && (
            <img
              src={message.attachment_url}
              alt="Adjunto"
              className="rounded-lg mb-2 max-h-56 w-auto object-cover"
            />
          )}

          <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        </div>

        <div className={`flex items-center gap-1.5 mt-1 px-1 text-[11px] ${isOwn ? 'text-white/70' : 'text-text-muted'}`}>
          <span>{formatTime(message.created_at)}</span>
          {isOwn && (
            <span className={message.status === 'read' ? 'text-brand-accent font-medium' : ''}>
              {message.status === 'sent' ? '✓' : '✓✓'}
            </span>
          )}
        </div>

        {message.requires_confirmation && (
          <div className="mt-1 px-1">
            {message.confirmed_at ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                <i className="ri-check-double-line" />
                Confirmado por {isOwn ? driverName : 'Administracion'} · {formatTime(message.confirmed_at)}
              </span>
            ) : isOwn ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-white/70">
                <i className="ri-time-line" /> Se solicito confirmacion
              </span>
            ) : (
              <button
                onClick={() => onConfirm?.(message)}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-green text-white text-xs font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
              >
                <i className="ri-check-line" /> Confirmar recepcion
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}