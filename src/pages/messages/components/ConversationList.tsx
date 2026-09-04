import { useMemo } from 'react';
import type { DriverConversation } from '@/hooks/useChat';
import { driverStatusLabels } from '@/hooks/useChat';

type ChatFilter = 'all' | 'unread' | 'active' | 'onRoute';

interface ConversationListProps {
  conversations: DriverConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  filter: ChatFilter;
  onFilterChange: (value: ChatFilter) => void;
  activeRouteDriverIds: Set<string>;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

const filterOptions: { key: ChatFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'unread', label: 'No leídos' },
  { key: 'active', label: 'Activos' },
  { key: 'onRoute', label: 'En ruta' },
];

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  activeRouteDriverIds,
}: ConversationListProps) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations
      .filter((c) => {
        if (filter === 'unread' && c.unreadCount === 0) return false;
        if (filter === 'active' && c.status !== 'Active') return false;
        if (filter === 'onRoute' && !activeRouteDriverIds.has(c.id)) return false;
        if (q) {
          return (
            c.name.toLowerCase().includes(q) ||
            (c.plate || '').toLowerCase().includes(q) ||
            (c.model || '').toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const at = a.lastMessage?.created_at || '';
        const bt = b.lastMessage?.created_at || '';
        return bt.localeCompare(at);
      });
  }, [conversations, search, filter, activeRouteDriverIds]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-brand-border">
      <div className="p-4 border-b border-brand-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">Mensajes</h2>
          <span className="text-xs text-text-muted">{filtered.length} conversaciones</span>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <i className="ri-search-line" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, patente o vehículo..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onFilterChange(opt.key)}
              type="button"
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                filter === opt.key
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-text-secondary border-brand-border hover:bg-brand-light'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-text-muted">
            No hay conversaciones para mostrar
          </div>
        ) : (
          filtered.map((c) => {
            const isSelected = c.id === selectedId;
            const statusLabel = driverStatusLabels[c.status] || c.status;
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                type="button"
                className={`w-full text-left px-4 py-3 border-b border-brand-border/50 transition-colors ${
                  isSelected ? 'bg-brand-light' : 'hover:bg-brand-light/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-brand-primary text-white flex items-center justify-center font-semibold text-sm">
                      {c.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        c.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text-primary truncate">{c.name}</p>
                      <span className="text-[11px] text-text-muted whitespace-nowrap">
                        {c.lastMessage ? formatTime(c.lastMessage.created_at) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 truncate">
                      {c.model ? `${c.model} · ` : ''}{c.plate || 'Sin vehículo'} · {statusLabel}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-sm text-text-secondary truncate flex-1">
                        {c.lastMessage
                          ? (c.lastMessage.sender_role === 'admin' ? 'Tú: ' : '') + c.lastMessage.content
                          : 'Sin mensajes todavía'}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-green text-white text-[11px] font-semibold flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}