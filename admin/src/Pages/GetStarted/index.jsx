// admin/src/Pages/GetStarted/index.jsx (ajusta la ruta si difiere)
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdPointOfSale } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { AppContext } from "../../context/AppContext"; // ✅ named export correcto
import { goToMyStore } from "../../utils/goToMyStore";

export default function GetStarted() {
  const navigate = useNavigate();
  const ctx = useContext(AppContext); // ✅ usa AppContext real
  const [loading, setLoading] = useState(false);

  const handleGo = async () => {
    if (loading) return;
    setLoading(true);
    await goToMyStore(navigate, ctx);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">¿Qué quieres hacer?</h1>
      <p className="text-gray-600 mb-6">Elige una opción para continuar.</p>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          to="/admin/sell"
          className="border rounded-xl p-5 hover:shadow transition flex items-start gap-3"
        >
          <MdPointOfSale size={22} className="mt-1" />
          <div>
            <div className="font-medium">Vender</div>
            <div className="text-sm text-gray-600">
              Crea una tienda y empieza a publicar productos.
            </div>
          </div>
        </Link>

        <Link
          to="/admin/apply-delivery"
          className="border rounded-xl p-5 hover:shadow transition flex items-start gap-3"
        >
          <TbTruckDelivery size={22} className="mt-1" />
          <div>
            <div className="font-medium">Ser Delivery</div>
            <div className="text-sm text-gray-600">
              Postúlate para repartir pedidos sin necesidad de tener tienda.
            </div>
          </div>
        </Link>

        {/* Nuevo: Ir a mi tienda */}
        <button
          onClick={handleGo}
          className="border rounded-xl p-5 hover:shadow transition text-left"
          disabled={loading}
        >
          <div className="font-medium mb-1">
            {loading ? "Abriendo…" : "Ir a mi tienda"}
          </div>
          <div className="text-sm text-gray-600">
            Entrar al panel de mi tienda activa.
          </div>
        </button>
      </div>
    </div>
  );
}
