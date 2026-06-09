export default function DocumentsPage() {
  const documents = [
    { id: 'MAN-2026-001', type: 'Manifiesto', client: 'Parrilla Don Jose', date: '2026-05-21', status: 'Generado' },
    { id: 'MAN-2026-002', type: 'Manifiesto', client: 'Restaurante La Brasserie', date: '2026-05-21', status: 'Pendiente' },
    { id: 'MAN-2026-003', type: 'Manifiesto', client: 'Bar El Faro', date: '2026-05-20', status: 'Generado' },
    { id: 'REC-2026-001', type: 'Recibo', client: 'Hotel Continental Catering', date: '2026-05-20', status: 'Generado' },
    { id: 'FOT-2026-015', type: 'Evidencia', client: 'Fabrica de Empanadas La Masa', date: '2026-05-20', status: 'Subido' },
    { id: 'MAN-2026-004', type: 'Manifiesto', client: 'Sushi Bar Tokyo', date: '2026-05-19', status: 'Anulado' },
    { id: 'FOT-2026-014', type: 'Evidencia', client: 'Cerveceria Artesanal Patagonia', date: '2026-05-19', status: 'Subido' },
    { id: 'REC-2026-002', type: 'Recibo', client: 'Pizzeria Napoli Express', date: '2026-05-18', status: 'Pendiente' },
  ];

  const typeColors: Record<string, string> = {
    Manifiesto: 'bg-blue-100 text-blue-700 border-blue-200',
    Recibo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Evidencia: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  const statusColors: Record<string, string> = {
    Generado: 'bg-emerald-100 text-emerald-700',
    Pendiente: 'bg-amber-100 text-amber-700',
    Subido: 'bg-blue-100 text-blue-700',
    Anulado: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Documentos y Manifiestos</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manifiestos, recibos y evidencia fotografica
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
        >
          <i className="ri-file-add-line" />
          Nuevo Manifiesto
        </button>
      </div>

      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border/40">
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">ID</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Tipo</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Cliente</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Fecha</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Estado</th>
                <th className="text-center text-xs font-medium text-text-muted uppercase px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-brand-border/30 hover:bg-brand-light/50 transition-colors">
                  <td className="px-5 py-3 text-sm font-mono text-text-muted">{doc.id}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${typeColors[doc.type]}`}>
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-text-primary">{doc.client}</td>
                  <td className="px-5 py-3 text-sm text-text-secondary">{doc.date}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[doc.status]}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button type="button" className="text-text-muted hover:text-brand-primary transition-colors p-1 mr-1">
                      <i className="ri-eye-line" />
                    </button>
                    <button type="button" className="text-text-muted hover:text-brand-primary transition-colors p-1">
                      <i className="ri-download-line" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}