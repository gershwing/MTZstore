import { useState, useMemo, useEffect, useRef } from "react";

const r = (n, d = 2) => Math.round(Number(n || 0) * 10 ** d) / 10 ** d;

/**
 * Resuelve datos iniciales: prioriza salesConfig, fallback a importation legacy.
 */
function resolveInit(initialData) {
  const sc = initialData?.salesConfig;
  if (sc?.enableSalesConfig) {
    // Migrar datos viejos sin freightPct
    if (sc.imported && sc.imported.baseCost > 0 && sc.imported.freightPct == null) {
      sc.imported.freightPct = sc.imported.baseCost > 0
        ? r((Number(sc.imported.freight || 0) / sc.imported.baseCost) * 100)
        : 25;
      sc.imported.tariffIvaPct = sc.imported.tariffPct || 30;
      sc.imported.otherCostsPct = 7;
    }
    return sc;
  }

  const imp = initialData?.importation;
  if (imp?.enabled) {
    const baseCost = imp.costUsd || 0;
    return {
      enableSalesConfig: true,
      operationType: "IMPORTED",
      imported: {
        importCode: imp.importCode || "",
        originCountry: imp.originCountry || "",
        supplier: imp.supplierName || "",
        baseCost,
        freight: "",
        tariffPct: "",
        wastePct: "",
        customs: "",
        storage: "",
        handling: "",
        insurance: "",
        logisticsNotes: imp.logisticsNotes || "",
        freightPct: 25,
        tariffIvaPct: 30,
        otherCostsPct: 7,
      },
      marginConfig: {
        wholesaleMarginPct: 38,
        unitMinMarginPct: 88,
        unitSuggestedMarginPct: 113,
      },
      taxConfig: { ivaPct: 13, priceIncludesTax: false },
      stats: {},
    };
  }

  return {};
}

export function useSalesConfig(initialData = null, storeConfig = {}) {
  const {
    ivaPct: defaultIva = 13,
    otherTaxesPct: defaultOtherTaxes = 3,
    profitTaxPct: defaultProfitTax = 25,
  } = storeConfig;

  const init = resolveInit(initialData);

  const [enableSalesConfig, setEnableSalesConfig] = useState(
    init.enableSalesConfig || false
  );

  /* ---------- TIPO DE OPERACIÓN ---------- */
  const [operationType, setOperationType] = useState(
    init.operationType || "IMPORTED"
  );

  /* ---------- IMPORTADOS ---------- */
  const [imported, setImported] = useState({
    importCode: "",
    originCountry: "",
    supplier: "",
    baseCost: "",
    // Campos viejos (legacy, para detalle avanzado)
    freight: "",
    tariffPct: "",
    wastePct: "",
    customs: "",
    storage: "",
    handling: "",
    insurance: "",
    logisticsNotes: "",
    // Campos nuevos (porcentuales)
    freightPct: 25,
    tariffIvaPct: 30,
    otherCostsPct: 7,
    valorMercancia: "",
    // Desglose flete (referencia)
    fleteTerrOrigen: "",
    fleteMaritimo: "",
    fleteTerrDestino: "",
    // Desglose CIF (referencia)
    gravamenArancelarioPct: "",
    ivaCifPct: 14.94,
    // Desglose otros gastos (referencia)
    comisionConsolidacionPct: 3,
    liberacionContenedor: "",
    manipuleoOrigen: "",
    manipuleoDestino: "",
    despachanteAduana: "",
    almacenAduana: "",
    ...init.imported,
  });

  /* ---------- FABRICADOS ---------- */
  const [manufactured, setManufactured] = useState({
    rawMaterials: "",
    directLabor: "",
    packaging: "",
    overhead: "",
    qualityControl: "",
    logistics: "",
    wastePct: "",
    productionNotes: "",
    ...init.manufactured,
  });

  /* ---------- MÁRGENES (ganancia pura, sin gastos) ---------- */
  const [wholesaleMarginPct, setWholesaleMarginPct] = useState(
    init.marginConfig?.wholesaleMarginPct ?? 38
  );
  const [unitMinMarginPct, setUnitMinMarginPct] = useState(
    init.marginConfig?.unitMinMarginPct ?? 88
  );
  const [unitSuggestedMarginPct, setUnitSuggestedMarginPct] = useState(
    init.marginConfig?.unitSuggestedMarginPct ?? 113
  );
  // Legacy (kept for backward compat)
  const [marginPct] = useState(init.marginConfig?.marginPct ?? 30);
  const [minMarginPct] = useState(init.marginConfig?.minMarginPct ?? 20);

  /* ---------- MAYORISTA ---------- */
  const [wholesaleEnabled, setWholesaleEnabled] = useState(
    initialData?.wholesaleEnabled ?? storeConfig?.wholesaleEnabled ?? false
  );

  /* ---------- IMPUESTOS ---------- */
  const [ivaPct, setIvaPct] = useState(init.taxConfig?.ivaPct ?? defaultIva);
  const [ivaEnabled, setIvaEnabled] = useState(init.taxConfig?.ivaEnabled !== false);
  const [otherTaxesPct, setOtherTaxesPct] = useState(
    init.taxConfig?.otherTaxesPct ?? defaultOtherTaxes
  );
  const [itEnabled, setItEnabled] = useState(init.taxConfig?.itEnabled !== false);
  const [priceIncludesTax, setPriceIncludesTax] = useState(
    init.taxConfig?.priceIncludesTax || false
  );
  const [profitTaxPct] = useState(defaultProfitTax);

  /* ---------- PROYECCIÓN ---------- */
  const [unitsSoldExpected, setUnitsSoldExpected] = useState(
    init.stats?.unitsSoldExpected || ""
  );

  /* ---------- HELPERS ---------- */
  const updateImported = (key, val) =>
    setImported((p) => ({ ...p, [key]: val }));
  const updateManufactured = (key, val) =>
    setManufactured((p) => ({ ...p, [key]: val }));

  /* ---------- CÁLCULOS ---------- */
  const computed = useMemo(() => {
    if (!enableSalesConfig) return null;

    let costUsd = 0;
    let fleteUsd = 0, valorCif = 0, cifFactor = 0, otrosGastosUsd = 0;
    let base = 0;
    let gastosPct = 0;
    let ivaImportacionUsd = 0;
    const desgloseCalc = {};

    if (operationType === "IMPORTED") {
      base = Number(imported.baseCost || 0);
      const fPct = Number(imported.freightPct || 0);
      const tPct = Number(imported.tariffIvaPct || 0);
      const oPct = Number(imported.otherCostsPct || 0);
      gastosPct = r(fPct + tPct + oPct);

      fleteUsd = r(base * fPct / 100);
      const baseConFlete = r(base + fleteUsd);
      cifFactor = r(baseConFlete * tPct / 100);
      valorCif = r(baseConFlete + cifFactor);
      otrosGastosUsd = r(base * oPct / 100);
      costUsd = r(valorCif + otrosGastosUsd);

      // IVA de importación estimado (crédito fiscal)
      const ivaCifP = Number(imported.ivaCifPct || 14.94);
      const gaP = Number(imported.gravamenArancelarioPct || 0);
      if (ivaCifP > 0 || gaP > 0) {
        const ivaProporcion = ivaCifP / (ivaCifP + gaP || 1);
        ivaImportacionUsd = r(cifFactor * ivaProporcion);
      }

      // Desglose avanzado (cuando hay valor de mercancía)
      const vm = Number(imported.valorMercancia || 0);
      if (vm > 0) {
        const fleteDetTotal = Number(imported.fleteTerrOrigen || 0) + Number(imported.fleteMaritimo || 0) + Number(imported.fleteTerrDestino || 0);
        desgloseCalc.fleteTotalUsd = r(fleteDetTotal);
        desgloseCalc.fletePctCalc = r(fleteDetTotal / vm * 100);

        const cifVal = vm + fleteDetTotal;
        const gaP = Number(imported.gravamenArancelarioPct || 0);
        const ivaCifP = Number(imported.ivaCifPct || 0);
        const arancelUsd = r(cifVal * gaP / 100);
        const ivaCifUsd = r((cifVal + arancelUsd) * ivaCifP / 100);
        const totalImpuestos = r(arancelUsd + ivaCifUsd);
        desgloseCalc.cifValUsd = r(cifVal);
        desgloseCalc.arancelUsd = arancelUsd;
        desgloseCalc.ivaCifUsd = ivaCifUsd;
        desgloseCalc.totalImpuestos = totalImpuestos;
        desgloseCalc.cifPctCalc = r(totalImpuestos / vm * 100);
        // Usar IVA exacto del desglose
        ivaImportacionUsd = ivaCifUsd;

        const comisionUsd = r(vm * Number(imported.comisionConsolidacionPct || 0) / 100);
        const otrosDetTotal = r(
          comisionUsd +
          Number(imported.liberacionContenedor || 0) +
          Number(imported.manipuleoOrigen || 0) +
          Number(imported.manipuleoDestino || 0) +
          Number(imported.despachanteAduana || 0) +
          Number(imported.almacenAduana || 0)
        );
        desgloseCalc.comisionUsd = comisionUsd;
        desgloseCalc.otrosDetTotalUsd = otrosDetTotal;
        desgloseCalc.otrosPctCalc = r(otrosDetTotal / vm * 100);
        desgloseCalc.valorMercancia = vm;
      }
    } else {
      const rm = Number(manufactured.rawMaterials || 0);
      const dl = Number(manufactured.directLabor || 0);
      const pk = Number(manufactured.packaging || 0);
      const oh = Number(manufactured.overhead || 0);
      const qc = Number(manufactured.qualityControl || 0);
      const lg = Number(manufactured.logistics || 0);
      const waste = Number(manufactured.wastePct || 0);

      base = rm;
      const subtotal = rm + dl + pk + oh + qc + lg;
      const wasteAmount = subtotal * (waste / 100);
      costUsd = r(subtotal + wasteAmount);
    }

    // Precios comerciales (ganancia = margen puro, precio = base * (1 + (gastos + ganancia) / 100))
    const wm = Number(wholesaleMarginPct || 0);
    const umMin = Number(unitMinMarginPct || 0);
    const umSug = Number(unitSuggestedMarginPct || 0);

    const precioMayorista = r(base * (1 + (gastosPct + wm) / 100));
    const precioMinUnitario = r(base * (1 + (gastosPct + umMin) / 100));
    const precioSugerido = r(base * (1 + (gastosPct + umSug) / 100));

    // Margen basado en precio sugerido (para P&L)
    const priceBeforeTax = precioSugerido;
    const marginUsd = r(priceBeforeTax - costUsd);

    const iva = ivaEnabled ? Number(ivaPct || 0) : 0;
    const otherTax = itEnabled ? Number(otherTaxesPct || 0) : 0;
    const ivaAmount = r(priceBeforeTax * (iva / 100));
    const otherTaxAmount = r(priceBeforeTax * (otherTax / 100));
    const finalPrice = r(priceBeforeTax + ivaAmount + otherTaxAmount);

    // P&L
    const units = Number(unitsSoldExpected || 0);
    const revenue = r(priceBeforeTax * units);
    const totalRevenue = r(finalPrice * units);
    const cogs = r(costUsd * units);
    const grossProfit = r(revenue - cogs);
    const grossMarginPct = revenue > 0 ? r((grossProfit / revenue) * 100) : 0;
    const ivaTotalCollected = r(ivaAmount * units);
    const otherTaxTotal = r(otherTaxAmount * units);
    const pTax = Number(profitTaxPct || 25);
    const incomeTax = grossProfit > 0 ? r(grossProfit * (pTax / 100)) : 0;
    const netProfit = r(grossProfit - incomeTax);
    const netMarginPct = revenue > 0 ? r((netProfit / revenue) * 100) : 0;

    return {
      costUsd,
      fleteUsd,
      valorCif,
      cifFactor,
      otrosGastosUsd,
      gastosPct,
      ivaImportacionUsd,
      precioMayorista,
      precioMinUnitario,
      precioSugerido,
      priceBeforeTax,
      marginUsd,
      ivaAmount,
      otherTaxAmount,
      finalPrice,
      desglose: desgloseCalc,
      stats: {
        units,
        revenue,
        totalRevenue,
        cogs,
        grossProfit,
        grossMarginPct,
        ivaTotalCollected,
        otherTaxTotal,
        incomeTaxPct: pTax,
        incomeTax,
        netProfit,
        netMarginPct,
      },
    };
  }, [
    enableSalesConfig, operationType, imported, manufactured,
    wholesaleMarginPct, unitMinMarginPct, unitSuggestedMarginPct,
    ivaPct, ivaEnabled, otherTaxesPct, itEnabled, profitTaxPct, unitsSoldExpected,
  ]);

  /* ---------- AUTO-UPDATE % desde desglose ---------- */
  useEffect(() => {
    if (!computed?.desglose?.valorMercancia) return;
    const d = computed.desglose;
    setImported((p) => {
      const newFreight = d.fletePctCalc ?? p.freightPct;
      const newCif = d.cifPctCalc ?? p.tariffIvaPct;
      const newOtros = d.otrosPctCalc ?? p.otherCostsPct;
      if (newFreight === p.freightPct && newCif === p.tariffIvaPct && newOtros === p.otherCostsPct) {
        return p;
      }
      return { ...p, freightPct: newFreight, tariffIvaPct: newCif, otherCostsPct: newOtros };
    });
  }, [
    computed?.desglose?.fletePctCalc,
    computed?.desglose?.cifPctCalc,
    computed?.desglose?.otrosPctCalc,
    computed?.desglose?.valorMercancia,
  ]);

  /* ---------- AUTO-AJUSTAR ganancias cuando gastos cambian ---------- */
  const prevGastosPctRef = useRef(null);
  useEffect(() => {
    const newGastos = computed?.gastosPct;
    if (newGastos == null) return;
    const prev = prevGastosPctRef.current;
    prevGastosPctRef.current = newGastos;
    if (prev == null || prev === newGastos) return;

    const delta = r(prev - newGastos);
    setWholesaleMarginPct((p) => r(Number(p || 0) + delta));
    setUnitMinMarginPct((p) => r(Number(p || 0) + delta));
    setUnitSuggestedMarginPct((p) => r(Number(p || 0) + delta));
  }, [computed?.gastosPct]);

  /* ---------- PAYLOAD ---------- */
  const STRING_FIELDS = new Set([
    "importCode", "originCountry", "supplier", "logisticsNotes",
    "productionNotes",
  ]);
  const sanitizeNumbers = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    const clean = {};
    for (const [k, v] of Object.entries(obj)) {
      if (STRING_FIELDS.has(k)) {
        clean[k] = v ?? "";
      } else {
        clean[k] = v === "" || v === null || v === undefined ? 0 : Number(v) || 0;
      }
    }
    return clean;
  };

  const getSalesConfigPayload = () => {
    if (!enableSalesConfig) return {};
    return {
      salesConfig: {
        enableSalesConfig: true,
        operationType,
        imported: operationType === "IMPORTED" ? sanitizeNumbers(imported) : undefined,
        manufactured: operationType === "MANUFACTURED" ? sanitizeNumbers(manufactured) : undefined,
        marginConfig: {
          marginPct: Number(marginPct),
          minMarginPct: Number(minMarginPct),
          wholesaleMarginPct: Number(wholesaleMarginPct),
          unitMinMarginPct: Number(unitMinMarginPct),
          unitSuggestedMarginPct: Number(unitSuggestedMarginPct),
          marginUsd: computed?.marginUsd || 0,
          precioMayorista: computed?.precioMayorista || 0,
          precioMinUnitario: computed?.precioMinUnitario || 0,
          precioSugerido: computed?.precioSugerido || 0,
          costUsd: computed?.costUsd || 0,
        },
        taxConfig: {
          ivaPct: Number(ivaPct),
          ivaEnabled,
          otherTaxesPct: Number(otherTaxesPct),
          itEnabled,
          priceIncludesTax,
          ivaAmount: computed?.ivaAmount || 0,
          finalPrice: computed?.finalPrice || 0,
        },
        stats: {
          unitsSoldExpected: Number(unitsSoldExpected || 0),
          projectedRevenue: computed?.stats?.revenue || 0,
          projectedNetProfit: computed?.stats?.netProfit || 0,
        },
      },
    };
  };

  /* ---------- VALIDACIONES ---------- */
  const validateSalesConfig = () => {
    if (!enableSalesConfig) return null;

    if (operationType === "IMPORTED") {
      if (Number(imported.baseCost || 0) <= 0)
        return "El costo base de importación debe ser mayor a 0";
    } else {
      if (Number(manufactured.rawMaterials || 0) <= 0)
        return "El costo de materia prima debe ser mayor a 0";
    }

    if (computed?.costUsd < 0)
      return "El costo no puede ser negativo";

    return null;
  };

  return {
    enableSalesConfig, setEnableSalesConfig,
    operationType, setOperationType,
    imported, updateImported,
    manufactured, updateManufactured,
    wholesaleEnabled, setWholesaleEnabled,
    wholesaleMarginPct, setWholesaleMarginPct,
    unitMinMarginPct, setUnitMinMarginPct,
    unitSuggestedMarginPct, setUnitSuggestedMarginPct,
    ivaPct, setIvaPct, ivaEnabled, setIvaEnabled,
    otherTaxesPct, setOtherTaxesPct, itEnabled, setItEnabled,
    priceIncludesTax, setPriceIncludesTax,
    profitTaxPct,
    unitsSoldExpected, setUnitsSoldExpected,
    computed,
    getSalesConfigPayload,
    validateSalesConfig,
  };
}
