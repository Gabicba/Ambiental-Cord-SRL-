import { useEffect, useRef } from 'react';
import type { ChatMessage, DriverConversation, QuickReply } from '@/hooks/useChat';
import { driverStatusLabels } from '@/hooks/useChat';
import MessageBubble from './MessageBubble';
import Composer from './Composer';

interface ChatWindowProps {
  conversation: DriverConversation;
  messages: ChatMessage[];
  quickReplies: QuickReply[];
  routeOptions: { id: string; name: string; status: string }[];
  activeRoute: { id: string; name: string; status: string } | null;
  sending: boolean;
  onSend: (payload: {
    content: string;
    priority: 'normal' | 'important' | 'urgent';
    requiresConfirmation: boolean;
    routeSheetId: string | null;
  }) => void;
  onConfirm: (message: ChatMessage) => void;
}

const routeStatusLabel: Record<string, string> = {
  Pending: 'Pendiente',
  In_Progress: 'En Progreso',
  Completed: 'Completada',
  Canceled: 'Cancelada',
};

export default function ChatWindow({
  conversation,
  messages,
  quickReplies,
  routeOptions,
  activeRoute,
  sending,
  onSend,
  onConfirm,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const statusLabel = driverStatusLabels[conversation.status] || conversation.status;

  return (
    <div className="flex flex-col h-full bg-brand-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-brand-border">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-semibold text-sm">
            {conversation.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              conversation.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{conversation.name}</p>
          <p className="text-xs text-text-secondary truncate">
            {conversation.model ? `${conversation.model} · ` : ''}
            {conversation.plate || 'Sin vehículo'} · {statusLabel}
          </p>
        </div>
        {activeRoute && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-light border border-brand-border">
            <i className="ri-route-line text-brand-green" />
            <div className="text-right">
              <p className="text-xs font-medium text-text-primary">{activeRoute.name}</p>
              <p className="text-[11px] text-text-muted">{routeStatusLabel[activeRoute.status] || activeRoute.status}</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center mb-3">
              <i className="ri-message-3-line text-2xl text-text-muted" />
            </div>
            <p className="text-sm text-text-secondary">Todavía no hay mensajes</p>
            <p className="text-xs text-text-muted mt-1">
              Enviá el primer mensaje a {conversation.name.split(' ')[0]} para iniciar la conversación.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isOwn={m.sender_role === 'admin'}
              driverName={conversation.name}
              onConfirm={onConfirm}
            />
          ))
        )}
      </div>

      {/* Composer */}
      <Composer onSend={onSend} quickReplies={quickReplies} routeOptions={routeOptions} sending={sending} />
    </div>
  );
}