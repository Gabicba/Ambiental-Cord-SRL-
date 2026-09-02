import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import type { ChatMessage, MessagePriority } from '@/hooks/useChat';
import ConversationList from './components/ConversationList';
import ChatWindow from './components/ChatWindow';

type ChatFilter = 'all' | 'unread' | 'active' | 'onRoute';

interface RouteOption {
  id: string;
  name: string;
  status: string;
  driver_id: string | null;
}

export default function MessagesPage() {
  const {
    conversations,
    messages,
    quickReplies,
    loading,
    error,
    refetch,
    sendMessage,
    markRead,
    confirmMessage,
  } = useChat();
  const { profile } = useAuth();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ChatFilter>('all');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase
      .from('route_sheets')
      .select('id, name, status, driver_id')
      .order('date', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setRoutes((data || []) as RouteOption[]);
      });
  }, []);

  const activeRouteDriverIds = useMemo(() => {
    const ids = new Set<string>();
    routes.forEach((r) => {
      if ((r.status === 'Pending' || r.status === 'In_Progress') && r.driver_id) {
        ids.add(r.driver_id);
      }
    });
    return ids;
  }, [routes]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId],
  );

  const selectedMessages = useMemo(
    () => messages.filter((m) => m.driver_id === selectedId),
    [messages, selectedId],
  );

  const selectedRouteOptions = useMemo(
    () => routes.filter((r) => r.driver_id === selectedId),
    [routes, selectedId],
  );

  const selectedActiveRoute = useMemo(
    () =>
      selectedRouteOptions.find((r) => r.status === 'Pending' || r.status === 'In_Progress') || null,
    [selectedRouteOptions],
  );

  // Marcar como leídos los mensajes del conductor al abrir la conversación
  useEffect(() => {
    if (selectedId) {
      markRead(selectedId);
    }
  }, [selectedId, markRead]);

  const handleSend = useCallback(
    async (payload: {
      content: string;
      priority: MessagePriority;
      requiresConfirmation: boolean;
      routeSheetId: string | null;
    }) => {
      if (!selectedId) return;
      setSending(true);
      try {
        await sendMessage({
          driver_id: selectedId,
          sender_role: 'admin',
          sender_id: profile?.id ?? null,
          content: payload.content,
          priority: payload.priority,
          requires_confirmation: payload.requiresConfirmation,
          route_sheet_id: payload.routeSheetId,
          status: 'sent',
        });
      } catch {
        // Error silencioso; el realtime mantendrá el estado consistente
      } finally {
        setSending(false);
      }
    },
    [selectedId, profile?.id, sendMessage],
  );

  const handleConfirm = useCallback(
    (message: ChatMessage) => {
      confirmMessage(message.id, profile?.full_name || 'Administracion');
    },
    [confirmMessage, profile?.full_name],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <i className="ri-error-warning-line text-3xl text-red-500" />
          <p className="text-sm text-red-700 mt-2">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 whitespace-nowrap"
            type="button"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] bg-white rounded-xl border border-brand-border overflow-hidden flex">
      {/* Lista de conversaciones */}
      <div className="w-full sm:w-80 md:w-96 flex-shrink-0 border-r border-brand-border">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          activeRouteDriverIds={activeRouteDriverIds}
        />
      </div>

      {/* Ventana de conversación */}
      <div className="flex-1 min-w-0 flex flex-col">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            messages={selectedMessages}
            quickReplies={quickReplies}
            routeOptions={selectedRouteOptions}
            activeRoute={selectedActiveRoute}
            sending={sending}
            onSend={handleSend}
            onConfirm={handleConfirm}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mb-4">
              <i className="ri-message-3-line text-3xl text-text-muted" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Mensajes</h2>
            <p className="text-sm text-text-secondary mt-1 max-w-sm">
              Seleccioná una conversación de la lista para chatear con un conductor, o empezá una nueva.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}