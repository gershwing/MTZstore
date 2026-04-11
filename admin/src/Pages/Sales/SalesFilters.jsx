export default function SalesFilters({ filters, setFilters }) {
  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-sm">Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Desde</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Hasta</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Cliente</label>
          <input
            type="text"
            placeholder="Nombre, CI, email..."
            value={filters.searchCustomer}
            onChange={(e) => setFilters({ ...filters, searchCustomer: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => setFilters({ startDate: "", endDate: "", searchCustomer: "" })}
            className="w-full border rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
