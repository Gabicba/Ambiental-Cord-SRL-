import { useState } from 'react';
import type { ActiveVisitState } from '../types';
import type { RouteVisit } from '@/mocks/driverApp';
import { driverAppData } from '@/mocks/driverApp';

interface ReceiptScreenProps {
  activeVisit: ActiveVisitState;
  selectedVisit: RouteVisit | null;
  onContinueRoute: () => void;
}

export default function ReceiptScreen({ activeVisit, selectedVisit, onContinueRoute }: ReceiptScreenProps) {
  const visit = selectedVisit || driverAppData.todayVisits.find((v) => v.id === activeVisit.visitId);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const manifestNumber = `MNF-${Math.floor(10000000 + Math.random() * 89999999)}`;

  const handleGeneratePdf = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Comprobante de Retiro - Ambiental Cord', 14, 20);
      doc.setFontSize(12);
      doc.text(`Manifiesto: ${manifestNumber}`, 14, 35);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 14, 43);
      doc.text(`Cliente: ${visit?.customer_name || ''}`, 14, 51);
      doc.text(`Direccion: ${visit?.address || ''}`, 14, 59);
      doc.text(`Litros recolectados: ${activeVisit.liters || '0'} L`, 14, 67);
      doc.text(`Aceite - Pago al cliente: ${activeVisit.oilPaid ? `Pagado $${(activeVisit.totalOilPayment || 0).toLocaleString('es-AR')}` : 'No se pagó'}`, 14, 75);
      if (activeVisit.detergentDelivered) {
        doc.text(`Detergente entregado: ${activeVisit.detergentQuantity} bidones de 5L (sin costo)`, 14, 83);
      }
      const total = activeVisit.totalOilPayment || 0;
      if (total > 0) {
        doc.text(`Total pagado al cliente: $${total.toLocaleString('es-AR')}`, 14, activeVisit.detergentDelivered ? 91 : 83);
      }
      const nextY = activeVisit.detergentDelivered ? (total > 0 ? 99 : 91) : (total > 0 ? 91 : 83);
      doc.text(`Receptor: ${activeVisit.receiverName || '-'}`, 14, nextY);
      doc.text(`DNI Receptor: ${activeVisit.receiverDni || '-'}`, 14, nextY + 8);
      doc.text(`Observaciones: ${activeVisit.observations || '-'}`, 14, nextY + 16);
      doc.setFontSize(10);
      doc.text('Ambiental Cord S.R.L. - Gestion de aceite usado', 14, nextY + 32);
      doc.save(`Comprobante_${manifestNumber}.pdf`);
      setPdfGenerated(true);
    });
  };

  const handleSharePdf = async () => {
    if (!pdfGenerated) {
      await handleGeneratePdf();
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Comprobante ${manifestNumber}`,
          text: `Comprobante de retiro - ${visit?.customer_name} - ${activeVisit.liters || '0'}L`,
        });
      } catch {
        // User cancelled
      }
    } else {
      alert('Compartir no disponible en este dispositivo');
    }
  };

  const handleWhatsAppPdf = () => {
    const total = activeVisit.totalOilPayment || 0;
    const message = encodeURIComponent(
      `Hola! Adjunto comprobante de retiro de aceite usado.\n\n` +
      `Cliente: ${visit?.customer_name}\n` +
      `Litros: ${activeVisit.liters || '0'} L\n` +
      `Aceite - pago al cliente: ${activeVisit.oilPaid ? `Pagado $${(activeVisit.totalOilPayment || 0).toLocaleString('es-AR')}` : 'Sin pago'}\n` +
      (activeVisit.detergentDelivered
        ? `Detergente: ${activeVisit.detergentQuantity} bidones de 5L entregados (sin costo)\n`
        : '') +
      (total > 0 ? `Total pagado: $${total.toLocaleString('es-AR')}\n` : '') +
      `Manifiesto: ${manifestNumber}\n\n` +
      `El PDF del comprobante fue generado. Por favor descargalo desde la app.`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const totalPayment = activeVisit.totalOilPayment || 0;

  return (
    <div className="min-h-screen bg-brand-bg pb-6">
      <div className="bg-emerald-600 text-white p-4">
        <h1 className="text-lg font-bold">Visita finalizada</h1>
        <p className="text-xs opacity-80">{visit?.customer_name}</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Manifiesto */}
        <div className="bg-white rounded-xl p-4 border border-brand-border text-center">
          <p className="text-xs text-text-muted mb-1">Manifiesto de retiro</p>
          <p className="text-2xl font-bold text-text-primary tracking-wider">{manifestNumber}</p>
          <p className="text-xs text-text-muted mt-2">{new Date().toLocaleDateString('es-AR')}</p>
        </div>

        {/* Resumen pago - solo aceite */}
        {totalPayment > 0 && (
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
            <p className="text-xs text-emerald-600 mb-1">Total pagado al cliente</p>
            <p className="text-3xl font-bold text-emerald-800">
              ${totalPayment.toLocaleString('es-AR')}
            </p>
            <div className="mt-2 space-y-1">
              {activeVisit.totalOilPayment > 0 && (
                <p className="text-xs text-emerald-700">
                  Aceite: ${activeVisit.totalOilPayment.toLocaleString('es-AR')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Aceite - estado */}
        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="ri-oil-line text-brand-primary text-lg" />
              <span className="text-sm font-semibold text-text-primary">Aceite usado</span>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${activeVisit.oilPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {activeVisit.oilPaid ? `Pagado $${(activeVisit.totalOilPayment || 0).toLocaleString('es-AR')}` : 'No se pagó'}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">{activeVisit.liters || '0'}L recolectados</p>
        </div>

        {/* Detergente - solo cantidad */}
        {activeVisit.detergentDelivered && (
          <div className="bg-white rounded-xl p-4 border border-brand-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ri-drop-line text-sky-500 text-lg" />
                <span className="text-sm font-semibold text-text-primary">Detergente</span>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-sky-100 text-sky-700">
                {activeVisit.detergentQuantity} bidones
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">{activeVisit.detergentQuantity} bidones de 5L entregados (sin costo)</p>
          </div>
        )}

        {/* PDF preview */}
        <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">Comprobante PDF</span>
            <button onClick={() => setShowPdf(!showPdf)} type="button" className="text-xs text-brand-primary font-medium hover:underline">
              {showPdf ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          {showPdf && (
            <div className="p-4 bg-gray-50">
              <div className="bg-white rounded-lg border border-brand-border p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Manifiesto</span>
                  <span className="text-xs font-mono text-text-primary">{manifestNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Cliente</span>
                  <span className="text-xs font-medium text-text-primary">{visit?.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Litros</span>
                  <span className="text-xs font-medium text-text-primary">{activeVisit.liters || '0'}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Aceite</span>
                  <span className="text-xs font-medium text-text-primary">{activeVisit.oilPaid ? `Pagado $${(activeVisit.totalOilPayment || 0).toLocaleString('es-AR')}` : 'Sin pago'}</span>
                </div>
                {activeVisit.detergentDelivered && (
                  <div className="flex justify-between">
                    <span className="text-xs text-text-muted">Detergente</span>
                    <span className="text-xs font-medium text-text-primary">{activeVisit.detergentQuantity} bidones de 5L</span>
                  </div>
                )}
                {totalPayment > 0 && (
                  <div className="flex justify-between">
                    <span className="text-xs text-text-muted">Total pagado</span>
                    <span className="text-xs font-bold text-emerald-700">${totalPayment.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Receptor</span>
                  <span className="text-xs text-text-primary">{activeVisit.receiverName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Fecha</span>
                  <span className="text-xs text-text-primary">{new Date().toLocaleString('es-AR')}</span>
                </div>
                <div className="border-t border-brand-border pt-2 mt-2">
                  <p className="text-[10px] text-text-muted text-center">Ambiental Cord · Gestion de aceite usado</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleGeneratePdf}
          type="button"
          className="w-full py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <i className="ri-file-pdf-line text-lg" />
          {pdfGenerated ? 'Descargar PDF nuevamente' : 'Generar PDF del comprobante'}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSharePdf}
            type="button"
            className="py-3 bg-white border border-brand-border rounded-xl text-sm font-semibold text-text-primary hover:bg-brand-light transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <i className="ri-share-line text-brand-primary" />
            Compartir
          </button>
          <button
            onClick={handleWhatsAppPdf}
            type="button"
            className="py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <i className="ri-whatsapp-line" />
            WhatsApp
          </button>
        </div>

        <button
          onClick={onContinueRoute}
          type="button"
          className="w-full py-4 bg-brand-green text-white rounded-xl text-base font-bold hover:bg-brand-green/90 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <i className="ri-route-line text-xl" />
          Continuar recorrido
        </button>
      </div>
    </div>
  );
}