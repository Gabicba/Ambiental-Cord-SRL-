import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockEquipment, getEquipmentStatus, equipmentLabels, equipmentIcons, loadEquipment, saveEquipment, type EmployeeEquipment } from '@/mocks/equipment';
import { mockDrivers } from '@/mocks/drivers';
import { mockCompanions } from '@/mocks/companions';

const itemTypes: EmployeeEquipment['item_type'][] = ['Shoes', 'Jacket', 'Gloves', 'Shirt', 'Pants', 'Other'];

interface StaffOption {
  id: string;
  name: string;
  type: 'driver' | 'companion';
}

function getAllStaff(): StaffOption[] {
  const drivers = mockDrivers.map((d) => ({ id: d.id, name: d.name, type: 'driver' as const }));
  const companions = mockCompanions.map((c) => ({ id: c.id, name: c.full_name, type: 'companion' as const }));
  return [...drivers, ...companions].sort((a, b) => a.name.localeCompare(b.name));
}

function generateId(list: EmployeeEquipment[]): string {
  const max = list.reduce((m, e) => {
    const n = parseInt(e.id.replace('EQP-', ''), 10);
    return n > m ? n : m;
  }, 0);
  return `EQP-${String(max + 1).padStart(3, '0')}`;
}

const typeLabels: Record<EmployeeEquipment['employee_type'], string> = {
  driver: 'Conductor',
  companion: 'Acompañante',
};

const typeColors: Record<EmployeeEquipment['employee_type'], string> = {
  driver: 'bg-blue-50 text-blue-700 border-blue-200',
  companion: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function EquipmentPage() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<EmployeeEquipment[]>(loadEquipment);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<EmployeeEquipment['item_type'] | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ok' | 'near' | 'expired'>('all');
  const [filterStaff, setFilterStaff] = useState<'all' | 'driver' | 'companion'>('all');

  const [form, setForm] = useState({
    employee_id: '',
    item_type: 'Shoes' as EmployeeEquipment['item_type'],
    quantity: 1,
    size: '',
    delivery_date: '',
    replacement_date: '',
    notes: '',
  });

  const staffOptions = useMemo(() => getAllStaff(), []);

  const filtered = useMemo(() => {
    let list = [...equipment];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.employee_name.toLowerCase().includes(q) ||
          equipmentLabels[e.item_type].toLowerCase().includes(q) ||
          e.size.toLowerCase().includes(q) ||
          typeLabels[e.employee_type].toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') {
      list = list.filter((e) => e.item_type === filterType);
    }
    if (filterStatus !== 'all') {
      list = list.filter((e) => getEquipmentStatus(e.replacement_date).status === filterStatus);
    }
    if (filterStaff !== 'all') {
      list = list.filter((e) => e.employee_type === filterStaff);
    }
    return list;
  }, [equipment, search, filterType, filterStatus, filterStaff]);

  const summary = useMemo(() => {
    let ok = 0;
    let near = 0;
    let expired = 0;
    equipment.forEach((e) => {
      const s = getEquipmentStatus(e.replacement_date).status;
      if (s === 'ok') ok++;
      else if (s === 'near') near++;
      else expired++;
    });
    return { ok, near, expired, total: equipment.length };
  }, [equipment]);

  const openNew = () => {
    setForm({
      employee_id: '',
      item_type: 'Shoes',
      quantity: 1,
      size: '',
      delivery_date: '',
      replacement_date: '',
      notes: '',
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (eq: EmployeeEquipment) => {
    setForm({
      employee_id: eq.employee_id,
      item_type: eq.item_type,
      quantity: eq.quantity,
      size: eq.size,
      delivery_date: eq.delivery_date,
      replacement_date: eq.replacement_date,
      notes: eq.notes || '',
    });
    setEditingId(eq.id);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.employee_id || !form.size.trim() || !form.delivery_date || !form.replacement_date) return;
    const list = loadEquipment();
    const staff = staffOptions.find((s) => s.id === form.employee_id);
    if (!staff) return;
    if (editingId) {
      const idx = list.findIndex((e) => e.id === editingId);
      if (idx >= 0) {
        list[idx] = {
          ...list[idx],
          employee_id: form.employee_id,
          employee_name: staff.name,
          employee_type: staff.type,
          item_type: form.item_type,
          quantity: form.quantity,
          size: form.size.trim(),
          delivery_date: form.delivery_date,
          replacement_date: form.replacement_date,
          notes: form.notes.trim() || null,
        };
      }
    } else {
      list.push({
        id: generateId(list),
        employee_id: form.employee_id,
        employee_name: staff.name,
        employee_type: staff.type,
        item_type: form.item_type,
        quantity: form.quantity,
        size: form.size.trim(),
        delivery_date: form.delivery_date,
        replacement_date: form.replacement_date,
        notes: form.notes.trim() || null,
        created_at: new Date().toISOString(),
      });
    }
    saveEquipment(list);
    setEquipment([...list]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const list = loadEquipment().filter((e) => e.id !== id);
    saveEquipment(list);
    setEquipment([...list]);
    setConfirmDeleteId(null);
  };

  const navigateToEmployee = (eq: EmployeeEquipment) => {
    if (eq.employee_type === 'driver') {
      navigate(`/drivers/${eq.employee_id}`);
    } else {
      navigate('/companions');
    }
  };

  useEffect(() => {
    setEquipment(loadEquipment());
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Equipamiento del Personal</h1>
          <p className="text-sm text-text-secondary mt-1">
            Uniformes y equipos asignados a conductores y acompañantes
          </p>
        </div>
        <button
          onClick={openNew}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors whitespace-nowrap"
        >
          <i className="ri-add-line" />
          Asignar Equipamiento
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <i className="ri-checkbox-circle-line" />
            </div>
            <p className="text-xs text-text-muted">Vigente</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{summary.ok}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <i className="ri-time-line" />
            </div>
            <p className="text-xs text-text-muted">Próximo a reemplazar</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{summary.near}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <i className="ri-alert-line" />
            </div>
            <p className="text-xs text-text-muted">Vencido / Reemplazar</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{summary.expired}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <i className="ri-shopping-bag-line" />
            </div>
            <p className="text-xs text-text-muted">Total Asignaciones</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{summary.total}</p>
        </div>
      </div>

      {/* Filters + Table */}
      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="p-4 border-b border-brand-border/60 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative max-w-xs w-full">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Buscar por empleado, artículo o talle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EmployeeEquipment['item_type'] | 'all')}
              className="px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            >
              <option value="all">Todos los artículos</option>
              {itemTypes.map((t) => (
                <option key={t} value={t}>{equipmentLabels[t]}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            >
              <option value="all">Todos los estados</option>
              <option value="ok">Vigente</option>
              <option value="near">Próximo a reemplazar</option>
              <option value="expired">Vencido / Reemplazar</option>
            </select>
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value as typeof filterStaff)}
              className="px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            >
              <option value="all">Todo el personal</option>
              <option value="driver">Conductores</option>
              <option value="companion">Acompañantes</option>
            </select>
          </div>
          <span className="text-xs text-text-muted">
            {filtered.length} {filtered.length === 1 ? 'asignación' : 'asignaciones'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border/60 bg-brand-light">
                <th className="text-left px-4 py-3 font-semibold text-text-primary">Artículo</th>
                <th className="text-left px-4 py-3 font-semibold text-text-primary">Empleado</th>
                <th className="text-left px-4 py-3 font-semibold text-text-primary">Rol</th>
                <th className="text-left px-4 py-3 font-semibold text-text-primary">Talle / Cant.</th>
                <th className="text-left px-4 py-3 font-semibold text-text-primary">Entrega</th>
                <th className="text-left px-4 py-3 font-semibold text-text-primary">Reemplazo</th>
                <th className="text-left px-4 py-3 font-semibold text-text-primary">Estado</th>
                <th className="text-right px-4 py-3 font-semibold text-text-primary">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-muted">
                    No hay equipamientos registrados.
                  </td>
                </tr>
              )}
              {filtered.map((eq) => {
                const status = getEquipmentStatus(eq.replacement_date);
                return (
                  <tr key={eq.id} className="border-b border-brand-border/40 hover:bg-brand-light/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                          <i className={equipmentIcons[eq.item_type]} />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{equipmentLabels[eq.item_type]}</p>
                          {eq.notes && <p className="text-xs text-text-muted truncate max-w-[180px]">{eq.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigateToEmployee(eq)}
                        className="text-text-primary font-medium hover:text-brand-primary hover:underline transition-colors text-left whitespace-nowrap"
                      >
                        {eq.employee_name}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[eq.employee_type]}`}>
                        {eq.employee_type === 'driver' ? (
                          <i className="ri-steering-line text-xs" />
                        ) : (
                          <i className="ri-user-line text-xs" />
                        )}
                        {typeLabels[eq.employee_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {eq.size} · x{eq.quantity}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{eq.delivery_date}</td>
                    <td className="px-4 py-3 text-text-secondary">{eq.replacement_date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEdit(eq)}
                          type="button"
                          className="w-8 h-8 rounded-lg bg-brand-light border border-brand-border flex items-center justify-center text-text-secondary hover:text-brand-primary hover:border-brand-primary/30 transition-colors"
                          title="Editar"
                        >
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(eq.id)}
                          type="button"
                          className="w-8 h-8 rounded-lg bg-brand-light border border-brand-border flex items-center justify-center text-text-secondary hover:text-red-600 hover:border-red-200 transition-colors"
                          title="Eliminar"
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border/60">
              <h3 className="text-base font-semibold text-text-primary">
                {editingId ? 'Editar Equipamiento' : 'Asignar Equipamiento'}
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
                <label className="text-xs font-medium text-text-muted uppercase">Empleado *</label>
                <select
                  value={form.employee_id}
                  onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                >
                  <option value="">Seleccionar empleado...</option>
                  <optgroup label="Conductores">
                    {staffOptions.filter((s) => s.type === 'driver').map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Acompañantes">
                    {staffOptions.filter((s) => s.type === 'companion').map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted uppercase">Artículo *</label>
                <select
                  value={form.item_type}
                  onChange={(e) => setForm((f) => ({ ...f, item_type: e.target.value as EmployeeEquipment['item_type'] }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                >
                  {itemTypes.map((t) => (
                    <option key={t} value={t}>{equipmentLabels[t]}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-muted uppercase">Cantidad *</label>
                  <input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted uppercase">Talle *</label>
                  <input
                    type="text"
                    value={form.size}
                    onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                    placeholder="Ej: 42, L, M"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-muted uppercase">Fecha de entrega *</label>
                  <input
                    type="date"
                    value={form.delivery_date}
                    onChange={(e) => setForm((f) => ({ ...f, delivery_date: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted uppercase">Fecha de reemplazo *</label>
                  <input
                    type="date"
                    value={form.replacement_date}
                    onChange={(e) => setForm((f) => ({ ...f, replacement_date: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted uppercase">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Observaciones sobre el artículo..."
                  rows={2}
                  maxLength={500}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none"
                />
                <p className="text-[10px] text-text-muted mt-0.5 text-right">{form.notes.length}/500</p>
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
                disabled={!form.employee_id || !form.size.trim() || !form.delivery_date || !form.replacement_date}
                className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {editingId ? 'Guardar cambios' : 'Asignar'}
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
                <h3 className="text-base font-semibold text-text-primary">¿Eliminar asignación?</h3>
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