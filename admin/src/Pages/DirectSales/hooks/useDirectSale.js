import { useState, useCallback, useMemo } from "react";
import { useFxRate } from "../../../hooks/useFxRate";

const r = (n, d = 2) => Math.round(Number(n || 0) * 10 ** d) / 10 ** d;

export function useDirectSale() {
  const { bobPerUsd } = useFxRate();
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: "", phone: "", document: "", email: "" });
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [isCredit, setIsCredit] = useState(false);
  const [initialPayment, setInitialPayment] = useState(0);
  const [creditNote, setCreditNote] = useState("");
  const [ivaEnabled, setIvaEnabled] = useState(true);
  const [ivaPct, setIvaPct] = useState(13);
  const [itEnabled, setItEnabled] = useState(true);
  const [itPct, setItPct] = useState(3);
  const [taxInitialized, setTaxInitialized] = useState(false);

  // Convertir a BOB según moneda base del producto
  const priceToBob = useCallback((price, currency) => {
    if (currency === "BOB") return r(price); // ya está en Bs
    return r(Number(price || 0) * bobPerUsd); // USD → Bs
  }, [bobPerUsd]);

  // Agregar item (producto o variante)
  const addItem = useCallback((product, variant = null, qty = 1, pricingMode = "RETAIL") => {
    const stock = variant ? (variant.stock || 0) : (product.stock || 0);
    if (qty > stock) {
      alert(`Stock insuficiente. Disponible: ${stock}`);
      return;
    }

    // Al primer producto, inicializar impuestos desde la config del producto
    if (!taxInitialized) {
      setIvaEnabled(product.ivaEnabled !== false);
      setIvaPct(product.ivaPct ?? 13);
      setItEnabled(product.itEnabled !== false);
      setItPct(product.itPct ?? 3);
      setTaxInitialized(true);
    }

    const cur = product.baseCurrency || "USD";
    const retailPriceBase = variant?.price || product.basePrice || 0;
    // Mayorista por variante: usar propio si existe, si no, calcular proporcional
    let wholesalePriceBase = retailPriceBase;
    if (variant?.wholesalePrice > 0) {
      wholesalePriceBase = variant.wholesalePrice;
    } else if (product.wholesalePrice > 0 && product.basePrice > 0) {
      // Calcular proporcionalmente: si producto base tiene 25% descuento, aplicar mismo % a esta variante
      const discountRatio = product.wholesalePrice / product.basePrice;
      wholesalePriceBase = r(retailPriceBase * discountRatio);
    } else if (!variant && product.wholesalePrice > 0) {
      wholesalePriceBase = product.wholesalePrice;
    }

    let unitPriceBase = retailPriceBase;
    if (pricingMode === "WHOLESALE") {
      unitPriceBase = wholesalePriceBase;
    }
    const unitPriceBob = priceToBob(unitPriceBase, cur);

    const variantLabel = variant?.attributes
      ? Object.entries(variant.attributes).map(([, v]) => `${v}`).join(" / ")
      : "";

    const uniqueKey = variant ? `${product._id}-${variant._id}` : String(product._id);

    setItems((prev) => {
      const existing = prev.findIndex((i) => i._uniqueKey === uniqueKey);
      if (existing >= 0) {
        const updated = [...prev];
        const newQty = updated[existing].qty + qty;
        updated[existing] = {
          ...updated[existing],
          qty: newQty,
          subtotalBob: r(newQty * updated[existing].unitPriceBob),
        };
        return updated;
      }
      return [...prev, {
        _tempId: Math.random().toString(36).slice(2, 11),
        _uniqueKey: uniqueKey,
        productId: product._id,
        variantId: variant?._id || null,
        nameSnapshot: product.name + (variantLabel ? ` (${variantLabel})` : ""),
        imageSnapshot: variant?.image || product.image || "",
        brand: product.brand || "",
        baseCurrency: cur,
        stock,
        qty,
        pricingMode,
        unitPriceBase: r(unitPriceBase),
        unitPriceBob,
        subtotalBob: r(qty * unitPriceBob),
        costSnapshotUsd: product.costUsd || 0,
        wholesalePriceBase: r(wholesalePriceBase),
        basePriceBase: r(retailPriceBase),
      }];
    });
  }, [bobPerUsd, priceToBob]);

  const updateItemQty = useCallback((tempId, newQty) => {
    setItems((prev) => prev.map((i) =>
      i._tempId === tempId
        ? { ...i, qty: newQty, subtotalBob: r((Number(newQty) || 0) * i.unitPriceBob) }
        : i
    ));
  }, []);

  const updateItemPricing = useCallback((tempId, mode, customPriceBob = null) => {
    setItems((prev) => prev.map((i) => {
      if (i._tempId !== tempId) return i;
      let priceBob = i.unitPriceBob;
      if (mode === "RETAIL") priceBob = priceToBob(i.basePriceBase, i.baseCurrency);
      if (mode === "WHOLESALE") priceBob = priceToBob(i.wholesalePriceBase || i.basePriceBase, i.baseCurrency);
      if (mode === "MANUAL" && customPriceBob !== null) priceBob = r(customPriceBob);
      return { ...i, pricingMode: mode, unitPriceBob: priceBob, subtotalBob: r(i.qty * priceBob) };
    }));
  }, [priceToBob]);

  const removeItem = useCallback((tempId) => {
    setItems((prev) => prev.filter((i) => i._tempId !== tempId));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    setCustomer({ name: "", phone: "", document: "", email: "" });
    setPaymentBreakdown([]);
    setPaymentNotes("");
    setNotes("");
    setIsCredit(false);
    setInitialPayment(0);
    setCreditNote("");
    setTaxInitialized(false);
  }, []);

  const totals = useMemo(() => {
    const subtotalBob = r(items.reduce((s, i) => s + i.subtotalBob, 0));
    const ivaAmount = ivaEnabled ? r(subtotalBob * (ivaPct / 100)) : 0;
    const itAmount = itEnabled ? r(subtotalBob * (itPct / 100)) : 0;
    const totalBob = r(subtotalBob + ivaAmount + itAmount);
    const totalCostBob = r(items.reduce((s, i) => {
      const costBob = i.baseCurrency === "BOB" ? i.costSnapshotUsd : i.costSnapshotUsd * bobPerUsd;
      return s + costBob * (Number(i.qty) || 0);
    }, 0));
    const profit = r(subtotalBob - totalCostBob);
    const marginPct = subtotalBob > 0 ? r((profit / subtotalBob) * 100) : 0;
    return { subtotalBob, ivaAmount, itAmount, totalBob, totalCostBob, profit, marginPct, count: items.length, totalQty: items.reduce((s, i) => s + i.qty, 0) };
  }, [items, bobPerUsd, ivaEnabled, ivaPct, itEnabled, itPct]);

  return {
    items, addItem, updateItemQty, updateItemPricing, removeItem, clearAll,
    ivaEnabled, setIvaEnabled, ivaPct, setIvaPct,
    itEnabled, setItEnabled, itPct, setItPct,
    customer, setCustomer,
    paymentMethod, setPaymentMethod,
    paymentBreakdown, setPaymentBreakdown,
    paymentNotes, setPaymentNotes,
    notes, setNotes,
    isCredit, setIsCredit,
    initialPayment, setInitialPayment,
    creditNote, setCreditNote,
    totals, bobPerUsd, priceToBob,
  };
}
