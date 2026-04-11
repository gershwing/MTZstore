export default function PnLSelector({ period, setPeriod, date, setDate, storeId, setStoreId, stores, isSuper }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-sm mb-3">Filtros</h3>
      <div className={`grid grid-cols-1 ${isSuper ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
        <div>
          <label className="block text-xs font-medium mb-1">Periodo</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="day">Diario</option>
            <option value="week">Semanal</option>
            <option value="month">Mensual</option>
            <option value="year">Anual</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">
            {period === "year" ? "Ano" : "Fecha"}
          </label>
          {period === "year" ? (
            <input
              type="number"
              value={date.split("-")[0] || new Date().getFullYear()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              min="2020"
              max={new Date().getFullYear()}
            />
          ) : (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          )}
        </div>

        {isSuper && (
          <div>
            <label className="block text-xs font-medium mb-1">Tienda</label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="all">Consolidado (todas)</option>
              <option value="platform">MTZstore (plataforma)</option>
              {stores.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
