const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function NumberInput({ label, value, onChange, placeholder = "0.00", step = "0.01", min = "0", suffix }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {suffix && <span className="text-gray-400 font-normal">{suffix}</span>}
      </label>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-3 py-2"
        placeholder={placeholder}
      />
    </div>
  );
}

export default function ManufacturedSection({ manufactured, updateManufactured, costUsd }) {
  return (
    <div className="space-y-4 mt-3 pl-4 border-l-2 border-orange-200">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Costos de producción</p>
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Materia prima" suffix="USD" value={manufactured.rawMaterials} onChange={(v) => updateManufactured("rawMaterials", v)} />
        <NumberInput label="Mano de obra directa" suffix="USD" value={manufactured.directLabor} onChange={(v) => updateManufactured("directLabor", v)} />
        <NumberInput label="Empaque" suffix="USD" value={manufactured.packaging} onChange={(v) => updateManufactured("packaging", v)} />
        <NumberInput label="Overhead / Gastos generales" suffix="USD" value={manufactured.overhead} onChange={(v) => updateManufactured("overhead", v)} />
        <NumberInput label="Control de calidad" suffix="USD" value={manufactured.qualityControl} onChange={(v) => updateManufactured("qualityControl", v)} />
        <NumberInput label="Logística" suffix="USD" value={manufactured.logistics} onChange={(v) => updateManufactured("logistics", v)} />
      </div>

      <NumberInput label="Merma" suffix="%" value={manufactured.wastePct} onChange={(v) => updateManufactured("wastePct", v)} step="0.1" placeholder="0" />

      <div>
        <label className="block text-sm font-medium mb-1">Notas de producción</label>
        <textarea
          value={manufactured.productionNotes}
          onChange={(e) => updateManufactured("productionNotes", e.target.value)}
          rows={2}
          className="w-full border rounded px-3 py-2"
          placeholder="Notas sobre el proceso de fabricación..."
        />
      </div>

      {costUsd > 0 && (
        <div className="bg-orange-50 text-orange-800 text-sm font-semibold px-4 py-2 rounded-md">
          Costo total fabricado: ${fmt(costUsd)} USD
        </div>
      )}
    </div>
  );
}
