import { useState } from 'react';
import type { ActiveVisitState } from '../types';
import { photoPlaceholders } from '../types';

interface PhotosScreenProps {
  activeVisit: ActiveVisitState;
  onBack: () => void;
  onContinue: (photos: string[]) => void;
}

export default function PhotosScreen({ activeVisit, onBack, onContinue }: PhotosScreenProps) {
  const [photos, setPhotos] = useState<string[]>(activeVisit.photos || []);
  const [capturing, setCapturing] = useState(false);

  const takePhoto = () => {
    if (photos.length >= 6) return;
    setCapturing(true);
    setTimeout(() => {
      const nextPhoto = photoPlaceholders[photos.length % photoPlaceholders.length];
      setPhotos((prev) => [...prev, nextPhoto]);
      setCapturing(false);
    }, 800);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const canFinish = photos.length >= 1;

  return (
    <div className="min-h-screen bg-brand-bg pb-6">
      <div className="bg-brand-primary text-white p-4">
        <button onClick={onBack} type="button" className="flex items-center gap-1 text-white/70 hover:text-white mb-2 transition-colors">
          <i className="ri-arrow-left-line" /> Volver
        </button>
        <h1 className="text-lg font-bold">Evidencia fotográfica</h1>
        <p className="text-xs opacity-80">Mínimo 1 foto obligatoria</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Big photo button */}
        <button
          onClick={takePhoto}
          disabled={capturing || photos.length >= 6}
          type="button"
          className="w-full aspect-[4/3] rounded-2xl bg-brand-light border-2 border-dashed border-brand-border flex flex-col items-center justify-center gap-3 hover:border-brand-green transition-colors disabled:opacity-50"
        >
          {capturing ? (
            <>
              <div className="w-12 h-12 rounded-full border-4 border-brand-primary/20 border-t-brand-primary animate-spin" />
              <span className="text-sm font-medium text-text-muted">Capturando...</span>
            </>
          ) : (
            <>
              <i className="ri-camera-line text-4xl text-brand-primary" />
              <span className="text-sm font-medium text-text-primary">📷 Tomar foto</span>
              <span className="text-xs text-text-muted">{photos.length}/6 fotos</span>
            </>
          )}
        </button>

        {/* Photo gallery */}
        {photos.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-brand-border">
            <p className="text-sm font-semibold text-text-primary mb-3">Fotos capturadas</p>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-brand-border">
                  <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(idx)}
                    type="button"
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <i className="ri-close-line text-xs" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">
              Ejemplos: cliente cerrado · aceite retirado · evidencia del lugar
            </p>
          </div>
        )}

        <button
          onClick={() => onContinue(photos)}
          disabled={!canFinish}
          type="button"
          className="w-full py-4 bg-brand-green text-white rounded-xl text-base font-bold hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {canFinish ? 'Continuar al resumen' : 'Se requiere al menos 1 foto'}
        </button>
      </div>
    </div>
  );
}