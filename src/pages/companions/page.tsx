import { useState, useEffect, useMemo } from 'react';
import { mockCompanions } from '@/mocks/companions';
import type { Companion } from '@/mocks/companions';

const STORAGE_KEY = 'ambiental_companions';

function loadCompanions(): Companion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Companion[];
  } catch { /* ignore */ }
  return [...mockCompanions];
}

function saveCompanions(list: Companion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  // Also update the in-memory mock array so other pages see changes
  mockCompanions.length = 0;
  mockCompanions.push(...list);
}

function generateId(): string {
  const next = loadCompanions().length + 1;
  return `CMP-${String(next).padStart(3, '0')}`;
}

export default function CompanionsPage() {
  const [companions, setCompanions] = useState<Companion[]>(loadCompanions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ full_name: '', dni: '', phone: '' });

  const filtered = useMemo(() => {
    if (!search.trim()) return companions;
    const q = search.toLowerCase();
    return companions.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.dni.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [companions, search]);

  const openNew = () => {
    setForm({ full_name: '', dni: '', phone: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (c: Companion) => {
    setForm({ full_name: c.full_name, dni: c.dni, phone: c.phone || '' });
    setEditingId(c.id);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.full_name.trim() || !form.dni.trim()) return;
    const list = loadCompanions();
    if (editingId) {
      const idx = list.findIndex((c) => c.id === editingId);
      if (idx >= 0) {
        list[idx] = {
          ...list[idx],
          full_name: form.full_name.trim(),
          dni: form.dni.trim(),
          phone: form.phone.trim() || null,
        };
      }
    } else {
      list.push({
        id: generateId(),
        full_name: form.full_name.trim(),
        dni: form.dni.trim(),
        phone: form.phone.trim() || null,
        created_at: new Date().toISOString(),
      });
    }
    saveCompanions(list);
    setCompanions([...list]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const list = loadCompanions().filter((c) => c.id !== id);
    saveCompanions(list);
    setCompanions([...list]);
    setConfirmDeleteId(null);
  };

  useEffect(() => {
    setCompanions(loadCompanions());
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Acompañantes</h1>
          <p className="text-sm text-text-secondary mt-1">
            Personal que acompaña a los conductores en las rutas
          </p>
        </div>
        <button
          onClick={openNew}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors whitespace-nowrap"
        >
          <i className="ri-add-line" />
          Nuevo Acompañante
        </button>
      </div>

      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="p-4 border-b border-brand-border/60 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative max-w-xs w-full">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
          <span className="text-xs text-text-muted">
            {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border/60 bg-brand-light">
                <th className="text-left px-4 py-3 font-semibold text-text-primary">Nombre completo</th>
                <th className="text-left px-4 py-3 font-semibold text-text-primary">DNI</th>
                <th className="text-left px-4 py-3 font-semibold text-text-primary">Teléfono</th>
                <th className="text-right px-4 py-3 font-semibold text-text-primary">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                    No hay acompañantes registrados.
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-brand-border/40 hover:bg-brand-light/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
                        {c.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <span className="font-medium text-text-primary">{c.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary font-mono">{c.dni}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        type="button"
                        className="w-8 h-8 rounded-lg bg-brand-light border border-brand-border flex items-center justify-center text-text-secondary hover:text-brand-primary hover:border-brand-primary/30 transition-colors"
                        title="Editar"
                      >
                        <i className="ri-edit-line" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(c.id)}
                        type="button"
                        className="w-8 h-8 rounded-lg bg-brand-light border border-brand-border flex items-center justify-center text-text-secondary hover:text-red-600 hover:border-red-200 transition-colors"
                        title="Eliminar"
                      >
                        <i className="ri-delete-bin-line" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border/60">
              <h3 className="text-base font-semibold text-text-primary">
                {editingId ? 'Editar Acompañante' : 'Nuevo Acompañante'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-brand-light transition-colors"
              >
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted uppercase">Nombre completo *</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Ej: José Luis Fernández"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted uppercase">DNI *</label>
                <input
                  type="text"
                  value={form.dni}
                  onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
                  placeholder="Ej: 18.234.567"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted uppercase">Teléfono</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Ej: +54 11 3456-7890"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-brand-border/60">
              <button
                onClick={() => setIsModalOpen(false)}
                type="button"
                className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                type="button"
                disabled={!form.full_name.trim() || !form.dni.trim()}
                className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {editingId ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación eliminar */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <i className="ri-alert-line text-lg" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">¿Eliminar acompañante?</h3>
                <p className="text-xs text-text-secondary mt-0.5">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                type="button"
                className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                type="button"
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}