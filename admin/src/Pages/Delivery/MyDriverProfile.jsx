// admin/src/Pages/Delivery/MyDriverProfile.jsx
// Vista del DELIVERY_AGENT: su perfil, nivel de confianza, y solicitud de verificación
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getMyAgentProfile, requestVerification } from "../../services/deliveryAgentProfile";

const TRUST_BADGE = {
  BASIC: { label: "Basico", cls: "bg-gray-100 text-gray-600 border-gray-300" },
  VERIFIED: { label: "Verificado", cls: "bg-blue-100 text-blue-700 border-blue-300" },
  TRUSTED: { label: "Confiable", cls: "bg-amber-100 text-amber-700 border-amber-300" },
};

const STATUS_BADGE = {
  ACTIVE: { label: "Activo", cls: "bg-green-100 text-green-700" },
  PAUSED: { label: "Pausado", cls: "bg-yellow-100 text-yellow-700" },
  SUSPENDED: { label: "Suspendido", cls: "bg-red-100 text-red-700" },
};

const VER_STATUS = {
  NONE: { label: "No solicitada", cls: "text-gray-400" },
  REQUESTED: { label: "Pendiente de revision", cls: "text-yellow-600" },
  COMPLETED: { label: "Verificacion completada", cls: "text-green-600" },
  REJECTED: { label: "Rechazada", cls: "text-red-600" },
};

export default function MyDriverProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMyAgentProfile();
      setProfile(data);
    } catch { setProfile(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRequestVerification = async () => {
    setRequesting(true);
    try {
      await requestVerification("");
      toast.success("Solicitud de verificacion enviada. Te contactaremos para coordinar la cita presencial.");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Error al solicitar verificacion");
    } finally { setRequesting(false); }
  };

  if (loading) return <div className="p-4 text-gray-500">Cargando perfil...</div>;
  if (!profile) return (
    <div className="p-4 text-center py-12">
      <p className="text-gray-400 text-lg">No tienes un perfil de conductor activo.</p>
    </div>
  );

  const trust = TRUST_BADGE[profile.platformTrustLevel] || TRUST_BADGE.BASIC;
  const status = STATUS_BADGE[profile.status] || STATUS_BADGE.ACTIVE;
  const verStatus = profile.verificationRequest?.status || "NONE";
  const ver = VER_STATUS[verStatus] || VER_STATUS.NONE;
  const isVerified = ["VERIFIED", "TRUSTED"].includes(profile.platformTrustLevel);
  const canRequest = profile.platformTrustLevel === "BASIC"
    && verStatus !== "REQUESTED"
    && verStatus !== "COMPLETED";

  return (
    <div className="p-4 space-y-6 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-2xl font-bold">Mi perfil de conductor</h1>

      {/* Header card */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
              {(profile.userId?.name || "A")[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{profile.userId?.name || "Conductor"}</h2>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-blue-600" title="Conductor verificado">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{profile.userId?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${trust.cls}`}>
              {trust.label}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{profile.stats?.totalDeliveries || 0}</p>
            <p className="text-xs text-gray-500">Entregas totales</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{profile.stats?.rating?.toFixed(1) || "—"}</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{profile.stats?.onTimeRate ? `${(profile.stats.onTimeRate * 100).toFixed(0)}%` : "—"}</p>
            <p className="text-xs text-gray-500">A tiempo</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{profile.stats?.incidentCount || 0}</p>
            <p className="text-xs text-gray-500">Incidentes</p>
          </div>
        </div>

        {/* Servicios aprobados */}
        <div className="pt-2">
          <p className="text-xs font-medium text-gray-500 mb-1">Servicios aprobados</p>
          <div className="flex gap-2">
            {profile.approvedServiceTypes?.map((t) => (
              <span key={t} className={`text-xs px-2 py-0.5 rounded font-medium ${t === "express" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                {t === "express" ? "Express" : "Estandar"}
              </span>
            ))}
            {(!profile.approvedServiceTypes || profile.approvedServiceTypes.length === 0) && (
              <span className="text-xs text-gray-400">Ninguno</span>
            )}
          </div>
        </div>
      </div>

      {/* Verificación */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold">Verificacion de identidad</h3>
          {isVerified && (
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {isVerified ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-blue-800">Conductor verificado</p>
                <p className="text-sm text-blue-600">
                  Tu identidad y documentos fueron verificados presencialmente.
                  {profile.identityReverifiedAt && (
                    <span className="ml-1">
                      Verificado el {new Date(profile.identityReverifiedAt).toLocaleDateString("es-BO")}.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Para ser un conductor <strong>verificado</strong> debes presentarte en persona
              con los documentos de tu motorizado y tu licencia de conducir en orden.
              Esto te habilita para realizar entregas estandar (rutas con multiples productos).
            </p>

            {/* Estado de la solicitud */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Estado:</span>
              <span className={`text-sm font-medium ${ver.cls}`}>{ver.label}</span>
            </div>

            {verStatus === "REQUESTED" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium">Solicitud enviada</p>
                <p className="text-sm text-yellow-700">
                  Tu solicitud esta siendo revisada. Te contactaremos para coordinar
                  la cita de verificacion presencial.
                </p>
                {profile.verificationRequest?.requestedAt && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Solicitada el {new Date(profile.verificationRequest.requestedAt).toLocaleDateString("es-BO")}
                  </p>
                )}
              </div>
            )}

            {verStatus === "REJECTED" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">Solicitud rechazada</p>
                {profile.verificationRequest?.rejectionReason && (
                  <p className="text-sm text-red-700">Motivo: {profile.verificationRequest.rejectionReason}</p>
                )}
                <p className="text-xs text-red-600 mt-1">Puedes volver a solicitar verificacion.</p>
              </div>
            )}

            {canRequest && (
              <button
                onClick={handleRequestVerification}
                disabled={requesting}
                className="w-full sm:w-auto bg-blue-600 text-white rounded-lg px-6 py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {requesting ? "Enviando..." : "Solicitar verificacion"}
              </button>
            )}
          </>
        )}
      </div>

      {/* Vehículos */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold">Vehiculos registrados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile.vehicles?.express?.vehicleType && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-xs font-medium text-purple-600 mb-1">Express</p>
              <p className="font-semibold text-sm">{profile.vehicles.express.vehicleType}</p>
              {profile.vehicles.express.licensePlate && (
                <p className="text-xs text-gray-500">Placa: {profile.vehicles.express.licensePlate}</p>
              )}
            </div>
          )}
          {profile.vehicles?.standard?.vehicleType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-medium text-blue-600 mb-1">Estandar</p>
              <p className="font-semibold text-sm">{profile.vehicles.standard.vehicleType}</p>
              {profile.vehicles.standard.licensePlate && (
                <p className="text-xs text-gray-500">Placa: {profile.vehicles.standard.licensePlate}</p>
              )}
              {profile.vehicles.standard.cargoCapacityKg > 0 && (
                <p className="text-xs text-gray-500">Capacidad: {profile.vehicles.standard.cargoCapacityKg} kg</p>
              )}
            </div>
          )}
          {!profile.vehicles?.express?.vehicleType && !profile.vehicles?.standard?.vehicleType && (
            <p className="text-sm text-gray-400">No hay vehiculos registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}
