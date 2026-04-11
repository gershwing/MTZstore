import { useState } from "react";
import { Switch, FormControlLabel } from "@mui/material";
import ManufacturedSection from "./ManufacturedSection";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function NumberInput({ label, value, onChange, placeholder = "0.00", step = "0.01", min = "0", suffix, disabled }) {
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
        className={`w-full border rounded px-3 py-2 ${disabled ? "bg-gray-100 text-gray-600" : ""}`}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-3 py-2"
        placeholder={placeholder}
      />
    </div>
  );
}

/* ============================================================
   SECCIÓN COSTOS DE IMPORTACIÓN (nueva lógica)
============================================================ */
function ImportedSection({ imported, updateImported, computed, baseCurrency = "USD", bobPerUsd = 1 }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const hasVM = Number(imported.valorMercancia || 0) > 0;

  return (
    <div className="space-y-4 mt-3 pl-4 border-l-2 border-blue-200">
      {/* Fila 1: Identificación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <TextInput label="Código de importación" value={imported.importCode} onChange={(v) => updateImported("importCode", v)} placeholder="IMP-001" />
        <TextInput label="País de origen" value={imported.originCountry} onChange={(v) => updateImported("originCountry", v)} placeholder="Ej: China, EE.UU." />
        <TextInput label="Proveedor" value={imported.supplier} onChange={(v) => updateImported("supplier", v)} placeholder="Nombre del proveedor" />
      </div>

      {/* COSTOS PRINCIPALES */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Costos principales</p>
      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Costo base"
          suffix={baseCurrency === "BOB" ? "Bs" : "USD"}
          value={imported.baseCost}
          onChange={(v) => updateImported("baseCost", v)}
        />
        <NumberInput
          label="Factor flete"
          suffix="%"
          value={imported.freightPct}
          onChange={(v) => updateImported("freightPct", v)}
          step="0.1"
          placeholder="25"
        />
        <NumberInput
          label="Factor CIF"
          suffix="%"
          value={imported.tariffIvaPct}
          onChange={(v) => updateImported("tariffIvaPct", v)}
          step="0.1"
          placeholder="30"
        />
        <NumberInput
          label="Otros gastos"
          suffix="%"
          value={imported.otherCostsPct}
          onChange={(v) => updateImported("otherCostsPct", v)}
          step="0.1"
          placeholder="7"
        />
      </div>

      {/* Desglose de costos calculados */}
      {computed && computed.costUsd > 0 && (() => {
        const sym = baseCurrency === "BOB" ? "Bs." : "$";
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Costo base:</span>
              <span>{sym} {fmt(imported.baseCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Flete ({imported.freightPct || 0}%):</span>
              <span>{sym} {fmt(computed.fleteUsd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Factor CIF ({imported.tariffIvaPct || 0}%):</span>
              <span>{sym} {fmt(computed.cifFactor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Otros gastos ({imported.otherCostsPct || 0}%):</span>
              <span>{sym} {fmt(computed.otrosGastosUsd)}</span>
            </div>
            <div className="border-t border-blue-300 pt-1 flex justify-between font-bold text-blue-900">
              <span>COSTO TOTAL:</span>
              <span>{sym} {fmt(computed.costUsd)}</span>
            </div>
          </div>
        );
      })()}

      {/* Detalle logístico avanzado (colapsable) */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-gray-500 hover:text-gray-700 font-medium underline"
        >
          {showAdvanced ? "Ocultar detalle logístico avanzado" : "Ver detalle logístico avanzado"}
        </button>
        {showAdvanced && (
          <div className="mt-3 space-y-5 pl-3 border-l border-gray-200">
            {/* VALOR DE MERCANCÍA */}
            <div>
              <NumberInput
                label="Valor de mercancía"
                suffix="USD"
                value={imported.valorMercancia}
                onChange={(v) => updateImported("valorMercancia", v)}
                placeholder="Ej: 30000"
              />
              {hasVM && (
                <p className="text-xs text-blue-600 mt-1">Los % se auto-calculan desde el desglose (puedes ajustarlos manualmente)</p>
              )}
            </div>

            {/* DESGLOSE FLETE */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Desglose Flete {hasVM && computed?.desglose?.fletePctCalc != null ? `(${computed.desglose.fletePctCalc}%)` : `(${imported.freightPct || 0}%)`}
              </p>
              <div className="grid grid-cols-3 gap-3">
                <NumberInput label="Flete terrestre origen → puerto" suffix="USD" value={imported.fleteTerrOrigen} onChange={(v) => updateImported("fleteTerrOrigen", v)} />
                <NumberInput label="Flete marítimo" suffix="USD" value={imported.fleteMaritimo} onChange={(v) => updateImported("fleteMaritimo", v)} />
                <NumberInput label="Flete terrestre puerto → Bolivia" suffix="USD" value={imported.fleteTerrDestino} onChange={(v) => updateImported("fleteTerrDestino", v)} />
              </div>
              {hasVM && computed?.desglose?.fleteTotalUsd > 0 && (
                <p className="text-xs text-gray-500 mt-1">Total fletes: ${fmt(computed.desglose.fleteTotalUsd)} USD</p>
              )}
            </div>

            {/* DESGLOSE CIF */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Desglose CIF {hasVM && computed?.desglose?.cifPctCalc != null ? `(${computed.desglose.cifPctCalc}%)` : `(${imported.tariffIvaPct || 0}%)`}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <NumberInput label="Gravamen Arancelario (GA)" suffix="%" value={imported.gravamenArancelarioPct} onChange={(v) => updateImported("gravamenArancelarioPct", v)} step="0.1" />
                <NumberInput label="IVA" suffix="%" value={imported.ivaCifPct} onChange={(v) => updateImported("ivaCifPct", v)} step="0.1" />
              </div>
              {hasVM && computed?.desglose?.cifValUsd > 0 && (
                <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                  <p>CIF (mercancía + fletes): ${fmt(computed.desglose.cifValUsd)}</p>
                  <p>Arancel ({imported.gravamenArancelarioPct || 0}%): ${fmt(computed.desglose.arancelUsd)}</p>
                  <p>IVA ({imported.ivaCifPct || 0}%): ${fmt(computed.desglose.ivaCifUsd)}</p>
                  <p className="font-medium">Total impuestos: ${fmt(computed.desglose.totalImpuestos)}</p>
                </div>
              )}
              {!hasVM && (
                <p className="text-xs text-gray-400 mt-2">Valor CIF = GA + IVA sobre (mercancía + fletes)</p>
              )}
            </div>

            {/* DESGLOSE OTROS GASTOS */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Desglose Otros Gastos {hasVM && computed?.desglose?.otrosPctCalc != null ? `(${computed.desglose.otrosPctCalc}%)` : `(${imported.otherCostsPct || 0}%)`}
              </p>
              <div className="grid grid-cols-3 gap-3">
                <NumberInput label="Comisión consolidación" suffix="%" value={imported.comisionConsolidacionPct} onChange={(v) => updateImported("comisionConsolidacionPct", v)} step="0.1" placeholder="3" />
                <NumberInput label="Liberación contenedor" suffix="USD" value={imported.liberacionContenedor} onChange={(v) => updateImported("liberacionContenedor", v)} />
                <NumberInput label="Manipuleo origen" suffix="USD" value={imported.manipuleoOrigen} onChange={(v) => updateImported("manipuleoOrigen", v)} />
                <NumberInput label="Manipuleo destino" suffix="USD" value={imported.manipuleoDestino} onChange={(v) => updateImported("manipuleoDestino", v)} />
                <NumberInput label="Despachante de aduanas" suffix="USD" value={imported.despachanteAduana} onChange={(v) => updateImported("despachanteAduana", v)} />
                <NumberInput label="Almacén aduana Bolivia" suffix="USD" value={imported.almacenAduana} onChange={(v) => updateImported("almacenAduana", v)} />
              </div>
              {hasVM && computed?.desglose?.otrosDetTotalUsd > 0 && (
                <p className="text-xs text-gray-500 mt-1">Total otros gastos: ${fmt(computed.desglose.otrosDetTotalUsd)} USD</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium mb-1">Notas de logística</label>
        <textarea
          value={imported.logisticsNotes}
          onChange={(e) => updateImported("logisticsNotes", e.target.value)}
          rows={2}
          className="w-full border rounded px-3 py-2"
          placeholder="Notas sobre envío, aduana, etc."
        />
      </div>
    </div>
  );
}

/* ============================================================
   RESUMEN DE PRECIOS (nueva versión)
============================================================ */
function PriceSummary({ computed, imported, wholesaleMarginPct, unitMinMarginPct, unitSuggestedMarginPct, bobPerUsd, baseCurrency = "USD", onUseSuggestedPrice, wholesaleEnabled = false }) {
  if (!computed || computed.costUsd <= 0) return null;

  const isBob = baseCurrency === "BOB";
  const sym = isBob ? "Bs." : "$";
  const cur = isBob ? "BOB" : "USD";
  // Los computed están en la moneda base (baseCost se ingresa en esa moneda)
  const show = (v) => `${sym} ${fmt(v)} ${cur}`;

  return (
    <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-600">Precios comerciales</h4>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <span className={`${wholesaleEnabled ? "text-gray-600" : "text-gray-400"}`}>Precio mayorista (gastos {computed.gastosPct}% + ganancia {wholesaleMarginPct}%):</span>
        <span className={`font-medium ${!wholesaleEnabled ? "text-gray-400" : ""}`}>{wholesaleEnabled ? show(computed.precioMayorista) : "—"}</span>

        <span className="text-gray-600">Precio unitario mínimo (gastos {computed.gastosPct}% + ganancia {unitMinMarginPct}%):</span>
        <span className="font-medium">{show(computed.precioMinUnitario)}</span>

        <span className="text-gray-600 font-semibold">Precio unitario sugerido (gastos {computed.gastosPct}% + ganancia {unitSuggestedMarginPct}%):</span>
        <span className="font-bold text-lg">{show(computed.precioSugerido)}</span>

        {!isBob && bobPerUsd > 0 && (
          <>
            <span className="text-gray-400 text-xs">Equiv. BOB (sugerido):</span>
            <span className="text-gray-400 text-xs">Bs. {fmt(computed.precioSugerido * bobPerUsd)}</span>
          </>
        )}

        <span className="text-gray-500 text-xs">Margen unitario (sugerido - costo):</span>
        <span className="text-gray-500 text-xs">{show(computed.marginUsd)}</span>
      </div>

      {onUseSuggestedPrice && (
        <button
          type="button"
          onClick={() => onUseSuggestedPrice(computed.precioSugerido)}
          className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Usar precio sugerido como precio base
        </button>
      )}
    </div>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */
export default function SalesConfigSection({
  enableSalesConfig,
  setEnableSalesConfig,
  operationType,
  setOperationType,
  imported,
  updateImported,
  manufactured,
  updateManufactured,
  wholesaleMarginPct,
  setWholesaleMarginPct,
  unitMinMarginPct,
  setUnitMinMarginPct,
  unitSuggestedMarginPct,
  setUnitSuggestedMarginPct,
  ivaPct,
  setIvaPct,
  otherTaxesPct,
  setOtherTaxesPct,
  priceIncludesTax,
  setPriceIncludesTax,
  computed,
  bobPerUsd = 0,
  baseCurrency = "USD",
  onUseSuggestedPrice,
  storeType = "IMPORTER",
  wholesaleEnabled = false,
}) {
  const showBothTypes = storeType === "MIXED";
  const showImported = showBothTypes || storeType === "IMPORTER";
  const showManufactured = showBothTypes || storeType === "MANUFACTURER";

  return (
    <div>
      <FormControlLabel
        control={
          <Switch
            checked={enableSalesConfig}
            onChange={(e) => setEnableSalesConfig(e.target.checked)}
          />
        }
        label="Activar Configuración de Venta"
      />

      {enableSalesConfig && (
        <div className="space-y-6 mt-3">
          {/* TIPO DE OPERACIÓN */}
          {showBothTypes && (
            <div>
              <p className="text-sm font-medium mb-2">Tipo de operación</p>
              <div className="flex gap-0">
                {[
                  showImported && { value: "IMPORTED", label: "Importado" },
                  showManufactured && { value: "MANUFACTURED", label: "Fabricado" },
                ].filter(Boolean).map((opt, idx, arr) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setOperationType(opt.value)}
                    className={`px-5 py-2 text-sm font-medium border transition-colors ${
                      operationType === opt.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } ${idx === 0 ? "rounded-l-md" : ""} ${idx === arr.length - 1 ? "rounded-r-md" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN CONDICIONAL */}
          {operationType === "IMPORTED" ? (
            <ImportedSection
              imported={imported}
              updateImported={updateImported}
              computed={computed}
              baseCurrency={baseCurrency}
              bobPerUsd={bobPerUsd}
            />
          ) : (
            <ManufacturedSection
              manufactured={manufactured}
              updateManufactured={updateManufactured}
              costUsd={computed?.costUsd || 0}
            />
          )}

          {/* MÁRGENES COMERCIALES */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Márgenes comerciales</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${!wholesaleEnabled ? "text-gray-400" : ""}`}>
                  Margen mayorista <span className="text-gray-400 font-normal">% ganancia</span>
                </label>
                <input
                  type="number" min="0" step="0.1"
                  value={wholesaleMarginPct}
                  onChange={(e) => setWholesaleMarginPct(e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${!wholesaleEnabled ? "bg-gray-100 text-gray-400" : ""}`}
                  placeholder="38"
                  disabled={!wholesaleEnabled}
                />
                <p className="text-xs text-gray-400 mt-1">Gastos {computed?.gastosPct ?? 0}% + ganancia</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Unitario mínimo <span className="text-gray-400 font-normal">% ganancia</span>
                </label>
                <input
                  type="number" min="0" step="1"
                  value={unitMinMarginPct}
                  onChange={(e) => setUnitMinMarginPct(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="88"
                />
                <p className="text-xs text-gray-400 mt-1">Gastos {computed?.gastosPct ?? 0}% + ganancia</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Unitario sugerido <span className="text-gray-400 font-normal">% ganancia</span>
                </label>
                <input
                  type="number" min="0" step="1"
                  value={unitSuggestedMarginPct}
                  onChange={(e) => setUnitSuggestedMarginPct(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="113"
                />
                <p className="text-xs text-gray-400 mt-1">Gastos {computed?.gastosPct ?? 0}% + ganancia</p>
              </div>
            </div>
          </div>

          {/* RESUMEN DE PRECIOS */}
          <PriceSummary
            computed={computed}
            imported={imported}
            wholesaleMarginPct={wholesaleMarginPct}
            unitMinMarginPct={unitMinMarginPct}
            unitSuggestedMarginPct={unitSuggestedMarginPct}
            bobPerUsd={bobPerUsd}
            baseCurrency={baseCurrency}
            onUseSuggestedPrice={onUseSuggestedPrice}
            wholesaleEnabled={wholesaleEnabled}
          />
        </div>
      )}
    </div>
  );
}
