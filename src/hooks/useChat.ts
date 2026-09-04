import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type MessagePriority = 'normal' | 'important' | 'urgent';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type SenderRole = 'admin' | 'driver';

export interface ChatMessage {
  id: string;
  driver_id: string;
  sender_role: SenderRole;
  sender_id: string | null;
  content: string;
  priority: MessagePriority;
  status: MessageStatus;
  requires_confirmation: boolean;
  confirmed_at: string | null;
  confirmed_by: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  route_sheet_id: string | null;
  customer_id: string | null;
  truck_id: string | null;
  visit_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface QuickReply {
  id: string;
  text: string;
  created_at: string;
}

export interface DriverConversation {
  id: string;
  name: string;
  status: string;
  plate: string | null;
  model: string | null;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

export const priorityConfig: Record<MessagePriority, { label: string; badge: string; text: string }> = {
  normal: { label: 'Normal', badge: 'bg-brand-light text-text-secondary', text: '' },
  important: { label: 'Importante', badge: 'bg-amber-100 text-amber-700', text: 'text-amber-700' },
  urgent: { label: 'Urgente', badge: 'bg-red-100 text-red-700', text: 'text-red-700' },
};

export const driverStatusLabels: Record<string, string> = {
  Active: 'Activo',
  Inactive: 'Inactivo',
  On_Route: 'En Ruta',
};

function buildConversations(
  driverRows: Record<string, unknown>[],
  messages: ChatMessage[],
): DriverConversation[] {
  const byDriver = new Map<string, ChatMessage[]>();
  for (const m of messages) {
    const list = byDriver.get(m.driver_id);
    if (list) list.push(m);
    else byDriver.set(m.driver_id, [m]);
  }

  return driverRows.map((row) => {
    const id = row.id as string;
    const truck = row.truck as Record<string, string> | null;
    const msgs = byDriver.get(id) || [];
    const lastMessage = msgs.length ? msgs[msgs.length - 1] : null;
    const unreadCount = msgs.filter((m) => m.sender_role === 'driver' && m.status !== 'read').length;
    return {
      id,
      name: (row.name as string) || 'Sin nombre',
      status: (row.status as string) || 'Active',
      plate: truck?.plate || null,
      model: truck?.model || null,
      lastMessage,
      unreadCount,
    };
  });
}

export function useChat() {
  const [conversations, setConversations] = useState<DriverConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Consulta drivers SIN embebida (no hay FK definida en BD)
      const [driversRes, trucksRes, messagesRes, qrRes] = await Promise.all([
        supabase
          .from('drivers')
          .select('id, name, status, assigned_truck_id')
          .is('deleted_at', null)
          .order('name'),
        supabase
          .from('trucks')
          .select('id, plate, model')
          .is('deleted_at', null),
        supabase.from('chat_messages').select('*').order('created_at', { ascending: true }),
        supabase.from('chat_quick_replies').select('*').order('created_at', { ascending: true }),
      ]);

      if (driversRes.error) throw driversRes.error;
      if (trucksRes.error) throw trucksRes.error;
      if (messagesRes.error) throw messagesRes.error;
      if (qrRes.error) throw qrRes.error;

      // Unir trucks con drivers manualmente
      const truckMap = new Map<string, { plate: string; model: string }>();
      (trucksRes.data || []).forEach((t: Record<string, unknown>) => {
        truckMap.set(t.id as string, { plate: t.plate as string, model: t.model as string });
      });

      const driversWithTrucks = (driversRes.data || []).map((d: Record<string, unknown>) => {
        const truck = truckMap.get((d.assigned_truck_id as string) || '');
        return {
          ...d,
          truck: truck || null,
        };
      });

      const msgs = (messagesRes.data || []) as ChatMessage[];
      setMessages(msgs);
      setQuickReplies((qrRes.data || []) as QuickReply[]);
      setConversations(buildConversations(driversWithTrucks, msgs));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('chat-messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            const next = [...prev, newMsg];
            next.sort((a, b) => a.created_at.localeCompare(b.created_at));
            return next;
          });
          // Marcar como "entregado" cuando llega un mensaje del conductor
          if (newMsg.sender_role === 'driver' && newMsg.status === 'sent') {
            supabase
              .from('chat_messages')
              .update({ status: 'delivered' })
              .eq('id', newMsg.id)
              .then();
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const updated = payload.new as ChatMessage;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Rebuild conversations whenever messages change
  useEffect(() => {
    // Rebuild from current conversations (keep driver metadata) + latest messages
    setConversations((prev) => {
      const byDriver = new Map<string, ChatMessage[]>();
      for (const m of messages) {
        const list = byDriver.get(m.driver_id);
        if (list) list.push(m);
        else byDriver.set(m.driver_id, [m]);
      }
      return prev.map((c) => {
        const msgs = byDriver.get(c.id) || [];
        const lastMessage = msgs.length ? msgs[msgs.length - 1] : null;
        const unreadCount = msgs.filter((m) => m.sender_role === 'driver' && m.status !== 'read').length;
        return { ...c, lastMessage, unreadCount };
      });
    });
  }, [messages]);

  const sendMessage = useCallback(
    async (payload: Partial<ChatMessage> & { driver_id: string; content: string }) => {
      const { data, error: err } = await supabase
        .from('chat_messages')
        .insert(payload)
        .select()
        .single();
      if (err) throw err;
      // Optimistic update: agregar inmediatamente al estado local
      const newMsg = data as ChatMessage;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        const next = [...prev, newMsg];
        next.sort((a, b) => a.created_at.localeCompare(b.created_at));
        return next;
      });
      return newMsg;
    },
    [],
  );

  const markRead = useCallback(async (driverId: string) => {
    await supabase
      .from('chat_messages')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('driver_id', driverId)
      .eq('sender_role', 'driver')
      .neq('status', 'read');
  }, []);

  const confirmMessage = useCallback(async (messageId: string, confirmedBy: string) => {
    await supabase
      .from('chat_messages')
      .update({ confirmed_at: new Date().toISOString(), confirmed_by: confirmedBy })
      .eq('id', messageId);
  }, []);

  const addQuickReply = useCallback(async (text: string) => {
    const { data, error: err } = await supabase
      .from('chat_quick_replies')
      .insert({ text })
      .select()
      .single();
    if (err) throw err;
    setQuickReplies((prev) => [...prev, data as QuickReply]);
    return data as QuickReply;
  }, []);

  const deleteQuickReply = useCallback(async (id: string) => {
    await supabase.from('chat_quick_replies').delete().eq('id', id);
    setQuickReplies((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const messagesFor = useCallback(
    (driverId: string) => messages.filter((m) => m.driver_id === driverId),
    [messages],
  );

  return {
    conversations,
    messages,
    quickReplies,
    loading,
    error,
    refetch: fetchAll,
    sendMessage,
    markRead,
    confirmMessage,
    addQuickReply,
    deleteQuickReply,
    messagesFor,
  };
}