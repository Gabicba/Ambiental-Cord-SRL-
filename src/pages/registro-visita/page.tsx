import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MobileContainer from "@/components/base/MobileContainer";
import { useDriverData } from "@/hooks/useDriverData";
import { useRouteState } from "@/hooks/useRouteState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const visitStatuses = [
  {
    value: "Completed",
    label: "Completada",
    icon: "ri-checkbox-circle-line",
    color: "bg-accent-100 text-accent-700 border-accent-300",
  },
  {
    value: "Closed",
    label: "Cliente cerrado",
    icon: "ri-door-lock-line",
    color: "bg-red-100 text-red-700 border-red-300",
  },
  {
    value: "Delayed",
    label: "Cliente demorado",
    icon: "ri-timer-line",
    color: "bg-amber-100 text-amber-700 border-amber-300",
  },
  {
    value: "Failed",
    label: "No se pudo realizar",
    icon: "ri-close-circle-line",
    color: "bg-secondary-200 text-secondary-700 border-secondary-300",
  },
];

export default function RegistroVisitaPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { visits, updateVisit } = useDriverData();
  const { dispatch } = useRouteState();
  const { driver } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visit = visits.find((v) => v.id === id);

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [receiverName, setReceiverName] = useState("");
  const [receiverDoc, setReceiverDoc] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [photoError, setPhotoError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visitStarted, setVisitStarted] = useState(false);

  useEffect(() => {
    if (visit && visit.status === "In_Progress") {
      setVisitStarted(true);
    }
  }, [visit]);

  const displayName = visit?.customer_fantasy_name || "Cliente";
  const displayAddress = visit?.pickup_address || visit?.customer_address || "Sin dirección";

  if (!visit) {
    return (
      <MobileContainer>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-background-50">
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
            <i className="ri-user-unfollow-line text-4xl text-foreground-400"></i>
          </div>
          <p className="text-lg font-semibold text-foreground-700 mb-1">Cliente no encontrado</p>
          <button
            onClick={() => navigate("/hoja-ruta")}
            className="px-6 py-3 bg-primary-500 text-background-50 font-semibold rounded-xl hover:bg-primary-600 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            Volver a Hoja de Ruta
          </button>
        </div>
      </MobileContainer>
    );
  }

  const handleStartVisit = async () => {
    const result = await updateVisit(visit.id, {
      status: "In_Progress",
      visited_at: new Date().toISOString(),
    });
    if (result.success) {
      dispatch({ type: "SET_CLIENT_STATUS", clientId: visit.id, status: "In_Progress" });
      setVisitStarted(true);
    }
  };

  const uploadPhotoToStorage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${visit.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("visit-evidence")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("visit-evidence")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch {
      return URL.createObjectURL(file);
    }
  };

  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const url = await uploadPhotoToStorage(files[i]);
      setPhotos((prev) => [...prev, url]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = [...prev];
      if (updated[index]?.startsWith("blob:")) {
        URL.revokeObjectURL(updated[index]);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setNotes(value);
      setNotesError("");
    } else {
      setNotesError("Máximo 500 caracteres");
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    if (photos.length === 0) {
      setPhotoError(true);
      return;
    }

    setPhotoError(false);
    setSaving(true);

    const now = new Date().toISOString();

    if (selectedStatus === "Delayed") {
      await updateVisit(visit.id, {
        status: "Delayed",
        observations: notes || null,
        receiver_name: receiverName || null,
        receiver_dni: receiverDoc || null,
        photos: photos.length > 0 ? photos : null,
        updated_at: now,
      });

      dispatch({ type: "SET_CLIENT_STATUS", clientId: visit.id, status: "Delayed" });

      dispatch({
        type: "ADD_VISIT",
        visit: {
          clientId: visit.id,
          clientName: displayName,
          status: selectedStatus,
          notes,
          receiverName,
          receiverDoc,
          photos: [...photos],
          arrivalTime: new Date(),
          departureTime: new Date(),
        },
      });

      setSaving(false);
      navigate(`/cliente/${visit.id}/demorado`);
      return;
    }

    await updateVisit(visit.id, {
      status: selectedStatus,
      observations: notes || null,
      receiver_name: receiverName || null,
      receiver_dni: receiverDoc || null,
      photos: photos.length > 0 ? photos : null,
      updated_at: now,
      visited_at: visit.visited_at || now,
    });

    dispatch({ type: "SET_CLIENT_STATUS", clientId: visit.id, status: selectedStatus });

    dispatch({
      type: "ADD_VISIT",
      visit: {
        clientId: visit.id,
        clientName: displayName,
        status: selectedStatus,
        notes,
        receiverName,
        receiverDoc,
        photos: [...photos],
        arrivalTime: visit.visited_at ? new Date(visit.visited_at) : new Date(),
        departureTime: new Date(),
      },
    });

    setSaving(false);
    setShowSuccess(true);
    setTimeout(() => {
      navigate("/hoja-ruta");
    }, 1500);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const now = new Date();

  if (showSuccess) {
    return (
      <MobileContainer>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-background-50">
          <div className="w-24 h-24 bg-accent-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <i className="ri-check-line text-accent-600 text-5xl"></i>
          </div>
          <h2 className="text-xl font-heading font-bold text-foreground-900 mb-2">Visita registrada</h2>
          <p className="text-sm text-foreground-500 text-center mb-2">La información se guardó correctamente</p>
          <p className="text-xs text-foreground-400">Redirigiendo a la hoja de ruta...</p>
        </div>
      </MobileContainer>
    );
  }

  if (!visitStarted) {
    return (
      <MobileContainer>
        <div className="flex flex-col min-h-screen bg-background-50">
          <div className="px-5 pt-12 pb-4 flex items-center gap-3">
            <button
              onClick={() => navigate(`/cliente/${visit.id}`)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-100 hover:bg-background-200 transition-colors cursor-pointer shrink-0"
            >
              <i className="ri-arrow-left-line text-foreground-700 text-lg"></i>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-heading font-bold text-foreground-900 truncate">
                Iniciar Visita
              </h1>
              <p className="text-xs text-foreground-500 truncate">{displayName}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
            <div className="w-28 h-28 bg-primary-100 rounded-full flex items-center justify-center mb-8">
              <i className="ri-map-pin-line text-primary-600 text-6xl"></i>
            </div>

            <h2 className="text-xl font-heading font-bold text-foreground-900 text-center mb-2">
              {displayName}
            </h2>
            <p className="text-sm text-foreground-500 text-center mb-2">{displayAddress}</p>
            <p className="text-xs text-foreground-400 mb-8">Confirmá tu llegada para iniciar el registro</p>

            <div className="w-full bg-secondary-50 rounded-2xl p-4 mb-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground-500">Hora de llegada</span>
                  <span className="text-xs font-semibold text-foreground-700">
                    {now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground-500">Conductor</span>
                  <span className="text-xs font-semibold text-foreground-700">
                    {driver?.name || "Conductor"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
            <div className="w-full max-w-[430px] px-5 pb-8 pt-4 bg-gradient-to-t from-background-50 via-background-50 to-transparent pointer-events-auto">
              <button
                onClick={handleStartVisit}
                className="w-full py-4 bg-primary-500 text-background-50 font-semibold text-base rounded-2xl hover:bg-primary-600 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-play-circle-line text-xl"></i>
                INICIAR VISITA
              </button>
            </div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen bg-background-50">
        <div className="px-5 pt-12 pb-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/cliente/${visit.id}`)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-100 hover:bg-background-200 transition-colors cursor-pointer shrink-0"
          >
            <i className="ri-arrow-left-line text-foreground-700 text-lg"></i>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-heading font-bold text-foreground-900 truncate">
              Registro de Visita
            </h1>
            <p className="text-xs text-foreground-500 truncate">{displayName}</p>
          </div>
        </div>

        <div className="flex-1 px-5 pb-28 overflow-y-auto">
          <div className="bg-secondary-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-store-2-line text-foreground-500"></i>
              </div>
              <h3 className="text-sm font-semibold text-foreground-800">Datos del cliente</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Cliente</span>
                <span className="text-sm font-semibold text-foreground-800 truncate ml-4 text-right">{displayName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Dirección</span>
                <span className="text-sm text-foreground-700 truncate ml-4 text-right">{displayAddress}</span>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground-800 mb-3 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-flag-line text-primary-500"></i>
            </div>
            Estado de la visita
          </h3>

          <div className="grid grid-cols-2 gap-2 mb-5">
            {visitStatuses.map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  selectedStatus === status.value
                    ? `${status.color} border-current shadow-sm`
                    : "bg-background-50 border-background-200 text-foreground-600 hover:border-background-300"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <i className={`${status.icon} text-base`}></i>
                </div>
                <span className="text-xs font-semibold">{status.label}</span>
              </button>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-foreground-800 mb-3 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-message-2-line text-primary-500"></i>
            </div>
            Observaciones
          </h3>

          <div className="mb-5">
            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Describa el resultado de la visita, novedades, incidencias..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-background-50 border border-background-200 rounded-xl text-sm text-foreground-800 placeholder-foreground-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
            ></textarea>
            <div className="flex items-center justify-between mt-1.5">
              {notesError ? (
                <span className="text-xs text-red-500">{notesError}</span>
              ) : (
                <span className="text-xs text-foreground-400">{notes.length}/500 caracteres</span>
              )}
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground-800 mb-3 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-camera-line text-red-500"></i>
            </div>
            Evidencia fotográfica
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wide">
              Obligatorio
            </span>
          </h3>

          <div className="mb-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-secondary-100 group">
                    <img
                      src={photo}
                      alt={`Evidencia ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setPhotoError(false);
                handlePhotoCapture();
              }}
              className={`w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed rounded-xl transition-all cursor-pointer bg-background-50 ${
                photoError
                  ? "border-red-300 text-red-500 bg-red-50 hover:border-red-400"
                  : photos.length > 0
                  ? "border-accent-300 text-accent-600 bg-accent-50/50"
                  : "border-background-300 text-foreground-500 hover:border-primary-400 hover:text-primary-600"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-add-line text-lg"></i>
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
                {photoError
                  ? "⚠️ Debe adjuntar al menos una fotografía"
                  : photos.length > 0
                  ? `Agregar más fotos (${photos.length})`
                  : "Tomar / Adjuntar fotografía"}
              </span>
            </button>
            {photoError && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <i className="ri-error-warning-line text-sm"></i>
                La evidencia fotográfica es obligatoria para finalizar la visita
              </p>
            )}
          </div>

          <h3 className="text-sm font-semibold text-foreground-800 mb-3 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-user-received-line text-primary-500"></i>
            </div>
            Persona que recibe <span className="text-xs text-foreground-400 font-normal">(opcional)</span>
          </h3>

          <div className="space-y-2.5 mb-5">
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="Nombre y apellido"
              maxLength={100}
              className="w-full px-4 py-3 bg-background-50 border border-background-200 rounded-xl text-sm text-foreground-800 placeholder-foreground-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            />
            <input
              type="text"
              value={receiverDoc}
              onChange={(e) => setReceiverDoc(e.target.value)}
              placeholder="Documento (DNI/CUIT)"
              maxLength={20}
              className="w-full px-4 py-3 bg-background-50 border border-background-200 rounded-xl text-sm text-foreground-800 placeholder-foreground-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>

          <div className="bg-secondary-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-time-line text-foreground-400"></i>
              </div>
              <h3 className="text-sm font-semibold text-foreground-800">Datos automáticos</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Hora de llegada</span>
                <span className="text-xs font-semibold text-foreground-700">
                  {visit.visited_at ? formatDateTime(visit.visited_at) : formatDateTime(now.toISOString())}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Conductor</span>
                <span className="text-xs font-semibold text-foreground-700">{driver?.name || "Conductor"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-full max-w-[430px] px-5 pb-8 pt-4 bg-gradient-to-t from-background-50 via-background-50 to-transparent pointer-events-auto">
            <button
              onClick={handleSubmit}
              disabled={!selectedStatus || photos.length === 0 || saving}
              className={`w-full py-4 font-semibold text-base rounded-2xl transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 ${
                !selectedStatus || photos.length === 0 || saving
                  ? "bg-background-200 text-foreground-400 cursor-not-allowed"
                  : "bg-primary-500 text-background-50 hover:bg-primary-600 active:scale-[0.98] cursor-pointer"
              }`}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-background-50/30 border-t-background-50 rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="ri-check-double-line text-xl"></i>
                  FINALIZAR VISITA
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}