import { useState, useMemo, useRef } from "react";
import { Button, Switch, FormControlLabel, Tabs, Tab } from "@mui/material";
import AttributeRenderer from "../../Components/Attributes/AttributeRenderer";
import VariantMatrix from "../../Components/Variants/VariantMatrix";
import CategoryCascade from "../../Components/CategoryCascade";
import UploadBox from "../../Components/UploadBox";
import SalesConfigSection from "../../Components/SalesConfig/SalesConfigSection";
import { useCategoryAttributes } from "../../hooks/useCategoryAttributes";
import { useFxRate } from "../../hooks/useFxRate";
import { useSalesConfig } from "../../hooks/useSalesConfig";

const roundMoney = (n, d = 2) => Math.round(Number(n || 0) * 10 ** d) / 10 ** d;

export default function ProductForm({
  initialData = null,
  onSubmit,
  loading = false,
  isSuper = false,
  storeCategoryId = null,
  storeCurrency = "USD",
  storeName = "",
  storeConfig = {},
  storeType = "IMPORTER",
}) {
  /* ======================================================
     TAB ACTIVO
  ====================================================== */
  const [tab, setTab] = useState(0);

  /* ======================================================
     ESTADO BASE
  ====================================================== */
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [categoryId, setCategoryId] = useState(
    initialData?.category?._id || initialData?.category || ""
  );

  /* PRECIO / MONEDA */
  const [basePrice, setBasePrice] = useState(initialData?.basePrice || "");
  const [oldBasePrice, setOldBasePrice] = useState(initialData?.oldBasePrice || "");
  const [baseCurrency, setBaseCurrency] = useState(
    initialData?.baseCurrency || storeCurrency
  );

  /* PRECIO MAYORISTA */
  const [wholesalePrice, setWholesalePrice] = useState(initialData?.wholesalePrice || "");

  /* CÓDIGO DE PRODUCTO (importCode) */
  const [importCode, setImportCode] = useState(initialData?.importation?.importCode || "");

  /* PRECIOS MAYORISTAS POR NIVELES */
  const [wholesaleTiers, setWholesaleTiers] = useState({
    enabled: initialData?.wholesaleTiers?.enabled || false,
    tier1: {
      minQty: initialData?.wholesaleTiers?.tier1?.minQty || "",
      maxQty: initialData?.wholesaleTiers?.tier1?.maxQty || "",
      price:  initialData?.wholesaleTiers?.tier1?.price || "",
    },
    tier2: {
      minQty: initialData?.wholesaleTiers?.tier2?.minQty || "",
      price:  initialData?.wholesaleTiers?.tier2?.price || "",
    },
  });
  const updateTier = (tier, field, value) =>
    setWholesaleTiers(prev => ({ ...prev, [tier]: { ...prev[tier], [field]: value } }));

  /* INVENTARIO */
  const [countInStock, setCountInStock] = useState(initialData?.countInStock || "");
  const [stockMinimo, setStockMinimo] = useState(initialData?.stockMinimo || "");

  /* IMÁGENES */
  const [images, setImages] = useState(initialData?.images || []);

  /* BANNER */
  const [isDisplayOnHomeBanner, setIsDisplayOnHomeBanner] = useState(
    initialData?.isDisplayOnHomeBanner || false
  );
  const [bannerimages, setBannerimages] = useState(initialData?.bannerimages || []);
  const [bannerTitleName, setBannerTitleName] = useState(initialData?.bannerTitleName || "");

  /* FEATURED */
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);

  /* TRAZABILIDAD */
  const [entryDate, setEntryDate] = useState(
    initialData?.entryDate ? initialData.entryDate.slice(0, 10) : ""
  );
  const [entryType, setEntryType] = useState(initialData?.entryType || "");
  const [entryReference, setEntryReference] = useState(initialData?.entryReference || "");

  /* DETALLES (TABLA KEY-VALUE) */
  const [showDetails, setShowDetails] = useState(
    (initialData?.details?.length || 0) > 0
  );
  const [details, setDetails] = useState(
    initialData?.details?.length > 0
      ? initialData.details
      : [{ key: "", value: "" }, { key: "", value: "" }, { key: "", value: "" }]
  );

  /* ENVIADO POR (legacy + nuevo) */
  const [shippedBy, setShippedBy] = useState(
    initialData?.shippedBy === "MTZSTORE" ? "MTZSTORE_STANDARD" : (initialData?.shippedBy || "STORE")
  );
  const [shipping, setShipping] = useState({
    mtzExpress: initialData?.shipping?.mtzExpress ?? false,
    mtzStandard: initialData?.shipping?.mtzStandard ?? false,
    storeSelf: initialData?.shipping?.storeSelf ?? true,
  });

  /* DIMENSIONES */
  const [dimensions, setDimensions] = useState({
    weight: initialData?.dimensions?.weight || "",
    length: initialData?.dimensions?.length || "",
    width: initialData?.dimensions?.width || "",
    height: initialData?.dimensions?.height || "",
  });

  /* ATRIBUTOS Y VARIANTES */
  const [attributes, setAttributes] = useState(initialData?.attributes || {});
  const [variants, setVariants] = useState(
    (initialData?.variants || []).map((v) => {
      // Determinar status: active solo si tiene datos reales (precio > 0 Y stock > 0)
      const hasData = Number(v.price) > 0 && Number(v.stock) > 0;
      const status = v.status || (hasData ? "active" : "inactive");
      return { ...v, status };
    })
  );

  /* CONFIGURACIÓN DE VENTA */
  const salesConfig = useSalesConfig(initialData, storeConfig);

  /* ======================================================
     ATRIBUTOS DE CATEGORÍA (DINÁMICOS)
  ====================================================== */
  const {
    attributes: categoryAttributes = [],
    loading: loadingAttrs,
  } = useCategoryAttributes(categoryId);

  const baseAttributes = categoryAttributes.filter((a) => !a.variant);
  const variantAttributes = categoryAttributes.filter((a) => a.variant);

  const selectedModel = attributes?.modelos || null;

  const filteredVariantAttributes = useMemo(() => {
    const hasModelDependency = variantAttributes.some((a) => a.modelOptions);
    if (hasModelDependency && !selectedModel) return [];
    if (!selectedModel) return variantAttributes;

    return variantAttributes.map((attr) => {
      if (!attr.modelOptions?.[selectedModel]) return attr;
      const validValues = new Set(attr.modelOptions[selectedModel]);
      return {
        ...attr,
        options: attr.options.filter((opt) => {
          const val = typeof opt === "string"
            ? opt.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-áéíóúñü\/\.\+]/g, "")
            : opt.value;
          return validValues.has(val);
        }),
      };
    });
  }, [variantAttributes, selectedModel]);

  const matrixAttributes = filteredVariantAttributes.filter(
    (a) => (a.options?.length || 0) > 1
  );
  const fixedAttributes = filteredVariantAttributes.filter(
    (a) => (a.options?.length || 0) === 1
  );

  const isVariantProduct = filteredVariantAttributes.length > 0;

  /* ======================================================
     VALORES COMPUTED
  ====================================================== */
  const { bobPerUsd } = useFxRate();
  const otherCurrency = baseCurrency === "USD" ? "BOB" : "USD";

  const convertedBasePrice =
    baseCurrency === "USD"
      ? roundMoney(Number(basePrice || 0) * bobPerUsd)
      : roundMoney(Number(basePrice || 0) / bobPerUsd);

  const convertedOldPrice =
    oldBasePrice && Number(oldBasePrice) > 0
      ? baseCurrency === "USD"
        ? roundMoney(Number(oldBasePrice) * bobPerUsd)
        : roundMoney(Number(oldBasePrice) / bobPerUsd)
      : null;

  /* Refs para detectar edición manual de precios */
  const priceEditedRef = useRef(!!initialData?.basePrice);
  const oldPriceEditedRef = useRef(!!initialData?.oldBasePrice);
  const wholesalePriceEditedRef = useRef(!!initialData?.wholesalePrice);

  // Mayorista: si no fue editado manualmente, jalar del computed
  const displayWholesalePrice = useMemo(() => {
    if (wholesalePriceEditedRef.current) return wholesalePrice;
    const mayorista = salesConfig.computed?.precioMayorista;
    if (!mayorista || mayorista <= 0) return wholesalePrice;
    return baseCurrency === "USD" ? mayorista : roundMoney(mayorista * bobPerUsd);
  }, [wholesalePrice, salesConfig.computed?.precioMayorista, baseCurrency, bobPerUsd]);

  const computedDiscount =
    oldBasePrice && Number(oldBasePrice) > Number(basePrice)
      ? Math.round(
          ((Number(oldBasePrice) - Number(basePrice)) / Number(oldBasePrice)) * 100
        )
      : 0;

  /* ======================================================
     VALIDACIONES
  ====================================================== */
  const validate = () => {
    if (!name.trim()) { setTab(0); return "El nombre es obligatorio"; }
    if (!categoryId) { setTab(0); return "La categoría es obligatoria"; }

    const missing = baseAttributes.filter(
      (a) => a.required && attributes[a.code] == null
    );
    if (missing.length) {
      setTab(0);
      return `Faltan atributos obligatorios: ${missing.map((m) => m.name).join(", ")}`;
    }

    const salesError = salesConfig.validateSalesConfig();
    if (salesError) { setTab(1); return salesError; }

    if (!basePrice || Number(basePrice) <= 0) { setTab(2); return "El precio base debe ser mayor a 0"; }

    if (images.length === 0) { setTab(0); return "Debe subir al menos una imagen"; }
    if (isVariantProduct && variants.length === 0) {
      setTab(0);
      return "Debe existir al menos una variante";
    }

    return null;
  };

  /* ======================================================
     SUBMIT
  ====================================================== */
  const handleSubmit = () => {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    const payload = {
      name: name.trim(),
      description,
      brand: brand.trim(),
      category: categoryId,
      images,
      bannerimages,
      bannerTitleName: bannerTitleName.trim(),
      isDisplayOnHomeBanner,
      basePrice: Number(basePrice),
      wholesaleEnabled: salesConfig.wholesaleEnabled,
      wholesalePrice: salesConfig.wholesaleEnabled ? (Number(displayWholesalePrice) || 0) : 0,
      oldBasePrice: Number(oldBasePrice) || 0,
      baseCurrency,
      discount: computedDiscount,
      countInStock: Number(countInStock) || 0,
      stockMinimo: Number(stockMinimo) || 0,
      isFeatured,
      entryDate: entryDate || null,
      entryType: entryType || "",
      entryReference: entryReference.trim(),
      importation: { ...(initialData?.importation || {}), importCode: importCode.trim() },
      wholesaleTiers: wholesaleTiers.enabled ? {
        enabled: true,
        tier1: {
          minQty: Number(wholesaleTiers.tier1.minQty) || 0,
          maxQty: Number(wholesaleTiers.tier1.maxQty) || 0,
          price:  Number(wholesaleTiers.tier1.price) || Number(basePrice) || 0,
        },
        tier2: {
          minQty: Number(wholesaleTiers.tier2.minQty) || 0,
          price:  Number(wholesaleTiers.tier2.price) || Number(basePrice) || 0,
        },
      } : { enabled: false, tier1: { minQty: 0, maxQty: 0, price: 0 }, tier2: { minQty: 0, price: 0 } },
      attributes,
      variants: isVariantProduct
        ? variants.map((v) => ({
            ...v,
            attributes: {
              ...v.attributes,
              ...Object.fromEntries(
                fixedAttributes.map((a) => [a.code, a.options[0]])
              ),
            },
          }))
        : [],
      details: showDetails ? details.filter((d) => d.key.trim()) : [],
      shippedBy,
      shipping,
      dimensions: {
        weight: Number(dimensions.weight) || 0,
        length: Number(dimensions.length) || 0,
        width: Number(dimensions.width) || 0,
        height: Number(dimensions.height) || 0,
      },
      ...salesConfig.getSalesConfigPayload(),
    };

    onSubmit(payload);
  };

  /* ======================================================
     HELPERS
  ====================================================== */
  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const removeBannerImage = (idx) =>
    setBannerimages((prev) => prev.filter((_, i) => i !== idx));

  const handleUseSuggestedPrice = (finalPrice) => {
    if (baseCurrency === "USD") {
      setBasePrice(finalPrice);
    } else {
      setBasePrice(roundMoney(finalPrice * bobPerUsd));
    }
    priceEditedRef.current = true;
  };

  const handleNextTab = () => {
    if (tab === 1) {
      // Auto-fill mayorista
      if (!wholesalePriceEditedRef.current) {
        const mayorista = salesConfig.computed?.precioMayorista;
        if (mayorista > 0) {
          const val = baseCurrency === "USD" ? mayorista : roundMoney(mayorista * bobPerUsd);
          setWholesalePrice(val);
          wholesalePriceEditedRef.current = true;
        }
      }
      // Auto-fill precio actual
      if (!priceEditedRef.current) {
        const sugerido = salesConfig.computed?.precioSugerido;
        if (sugerido > 0) {
          const val = baseCurrency === "USD" ? sugerido : roundMoney(sugerido * bobPerUsd);
          setBasePrice(val);
          priceEditedRef.current = true;
          if (!oldPriceEditedRef.current) {
            setOldBasePrice(roundMoney(val * 1.20));
            oldPriceEditedRef.current = true;
          }
        }
      }
    }
    setTab(tab + 1);
  };

  const addDetailRow = () =>
    setDetails((prev) => [...prev, { key: "", value: "" }]);
  const updateDetailRow = (index, field, value) =>
    setDetails((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  const removeDetailRow = (index) =>
    setDetails((prev) => prev.filter((_, i) => i !== index));

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div className="bg-white p-5 rounded-md shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {initialData ? "Editar producto" : "Crear producto"}
        </h2>
        {storeName && (
          <span className="text-sm text-gray-500">Tienda: {storeName}</span>
        )}
      </div>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Info General" />
        <Tab label="Costos y Márgenes" />
        <Tab label="Precios e Impuestos" />
      </Tabs>

      <div className="mt-4">
        {/* ========== TAB 0: INFO GENERAL ========== */}
        {tab === 0 && (
          <div className="space-y-6">
            {/* Moneda base */}
            <div>
              <h3 className="font-semibold mb-2">Moneda base</h3>
              <div className="flex gap-0">
                {["USD", "BOB"].map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setBaseCurrency(cur)}
                    className={`px-5 py-2 text-sm font-medium border transition-colors ${
                      baseCurrency === cur
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } ${cur === "USD" ? "rounded-l-md" : "rounded-r-md"}`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Todos los precios se expresan en {baseCurrency}
              </p>
            </div>

            {/* Precio rápido */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-blue-900">Precio rápido</h3>
                <p className="text-xs text-blue-500">Puedes definir aquí el precio manualmente o usar Costos y Márgenes para calcularlo automáticamente</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium">Mayorista ({baseCurrency})</label>
                    <Switch size="small" checked={salesConfig.wholesaleEnabled} onChange={(e) => salesConfig.setWholesaleEnabled(e.target.checked)} />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={displayWholesalePrice}
                    onChange={(e) => {
                      setWholesalePrice(e.target.value);
                      wholesalePriceEditedRef.current = true;
                    }}
                    className={`w-full border rounded px-3 py-2 ${!salesConfig.wholesaleEnabled ? "bg-gray-100 text-gray-400" : ""}`}
                    placeholder="0.00"
                    disabled={!salesConfig.wholesaleEnabled}
                  />
                  {salesConfig.wholesaleEnabled && displayWholesalePrice > 0 && bobPerUsd > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ≈ {baseCurrency === "USD" ? roundMoney(Number(displayWholesalePrice) * bobPerUsd) : roundMoney(Number(displayWholesalePrice) / bobPerUsd)} {otherCurrency}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Precio actual ({baseCurrency}) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => {
                      setBasePrice(e.target.value);
                      priceEditedRef.current = true;
                    }}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0.00"
                  />
                  {basePrice > 0 && (
                    <p className="text-xs text-gray-500 mt-1">≈ {convertedBasePrice} {otherCurrency}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Precio anterior ({baseCurrency})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={oldBasePrice}
                    onChange={(e) => {
                      setOldBasePrice(e.target.value);
                      oldPriceEditedRef.current = true;
                    }}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0.00"
                  />
                  {convertedOldPrice !== null && (
                    <p className="text-xs text-gray-500 mt-1">≈ {convertedOldPrice} {otherCurrency}</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium">IVA %</label>
                    <Switch size="small" checked={salesConfig.ivaEnabled} onChange={(e) => salesConfig.setIvaEnabled(e.target.checked)} />
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={salesConfig.ivaPct}
                    onChange={(e) => salesConfig.setIvaPct(e.target.value)}
                    className={`w-full border rounded px-3 py-2 ${!salesConfig.ivaEnabled ? "bg-gray-100 text-gray-400" : ""}`}
                    placeholder="13"
                    disabled={!salesConfig.ivaEnabled}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium">IT %</label>
                    <Switch size="small" checked={salesConfig.itEnabled} onChange={(e) => salesConfig.setItEnabled(e.target.checked)} />
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={salesConfig.otherTaxesPct}
                    onChange={(e) => salesConfig.setOtherTaxesPct(e.target.value)}
                    className={`w-full border rounded px-3 py-2 ${!salesConfig.itEnabled ? "bg-gray-100 text-gray-400" : ""}`}
                    placeholder="3"
                    disabled={!salesConfig.itEnabled}
                  />
                </div>
              </div>
              {computedDiscount > 0 && (
                <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {computedDiscount}% descuento
                </span>
              )}
            </div>

            {/* Venta por Mayor */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-amber-900">Venta por Mayor</h3>
                <Switch size="small" checked={wholesaleTiers.enabled} onChange={(e) => setWholesaleTiers(prev => ({ ...prev, enabled: e.target.checked }))} />
              </div>
              {wholesaleTiers.enabled && (
                <div className="space-y-3">
                  <p className="text-xs text-amber-700">Define precios especiales según cantidad. Puedes usar 1 o 2 niveles.</p>
                  {/* Nivel 1 — Semi-mayorista */}
                  <div className="bg-white rounded p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Nivel 1 — Semi-mayorista</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs mb-1">Desde (unidades)</label>
                        <input type="number" min="1" value={wholesaleTiers.tier1.minQty} onChange={(e) => updateTier("tier1", "minQty", e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Ej: 5" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Hasta (unidades)</label>
                        <input type="number" min="0" value={wholesaleTiers.tier1.maxQty} onChange={(e) => updateTier("tier1", "maxQty", e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Ej: 19 (0=sin límite)" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Precio unitario ({baseCurrency})</label>
                        <input type="number" min="0" step="0.01" value={wholesaleTiers.tier1.price} onChange={(e) => updateTier("tier1", "price", e.target.value)} className="w-full border rounded px-3 py-2" placeholder={basePrice || "0.00"} />
                        {(Number(wholesaleTiers.tier1.price) || Number(basePrice)) > 0 && bobPerUsd > 0 && (
                          <p className="text-xs text-gray-500 mt-1">≈ {baseCurrency === "USD" ? roundMoney((Number(wholesaleTiers.tier1.price) || Number(basePrice)) * bobPerUsd) : roundMoney((Number(wholesaleTiers.tier1.price) || Number(basePrice)) / bobPerUsd)} {otherCurrency}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Nivel 2 — Mayorista / Caja */}
                  <div className="bg-white rounded p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Nivel 2 — Mayorista / Caja</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs mb-1">Desde (unidades)</label>
                        <input type="number" min="1" value={wholesaleTiers.tier2.minQty} onChange={(e) => updateTier("tier2", "minQty", e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Ej: 20" />
                      </div>
                      <div className="text-xs text-gray-400 flex items-end pb-2">Hasta agotar stock</div>
                      <div>
                        <label className="block text-xs mb-1">Precio unitario ({baseCurrency})</label>
                        <input type="number" min="0" step="0.01" value={wholesaleTiers.tier2.price} onChange={(e) => updateTier("tier2", "price", e.target.value)} className="w-full border rounded px-3 py-2" placeholder={basePrice || "0.00"} />
                        {(Number(wholesaleTiers.tier2.price) || Number(basePrice)) > 0 && bobPerUsd > 0 && (
                          <p className="text-xs text-gray-500 mt-1">≈ {baseCurrency === "USD" ? roundMoney((Number(wholesaleTiers.tier2.price) || Number(basePrice)) * bobPerUsd) : roundMoney((Number(wholesaleTiers.tier2.price) || Number(basePrice)) / bobPerUsd)} {otherCurrency}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info general */}
            <div className="space-y-4">
              <h3 className="font-semibold">Información general</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Código de producto</label>
                <input
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: MED972937 (opcional)"
                />
                <p className="text-xs text-gray-400 mt-1">Código identificativo de importación</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del producto *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: Zapatilla Nike Air"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Detalles */}
              <div>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showDetails}
                      onChange={(e) => setShowDetails(e.target.checked)}
                    />
                  }
                  label="Agregar tabla de detalles"
                />
                {showDetails && (
                  <div className="space-y-2 mt-2 pl-4 border-l-2 border-blue-200">
                    {details.map((row, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          value={row.key}
                          onChange={(e) => updateDetailRow(i, "key", e.target.value)}
                          className="flex-1 border rounded px-3 py-2 text-sm"
                          placeholder="Característica"
                        />
                        <input
                          value={row.value}
                          onChange={(e) => updateDetailRow(i, "value", e.target.value)}
                          className="flex-1 border rounded px-3 py-2 text-sm"
                          placeholder="Valor"
                        />
                        <button
                          type="button"
                          onClick={() => removeDetailRow(i)}
                          className="text-red-500 hover:text-red-700 text-sm font-bold px-2"
                        >
                          x
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addDetailRow}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Agregar fila
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Marca (brand)</label>
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: Nike"
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <h3 className="font-semibold mb-2">Categoría</h3>
              <CategoryCascade
                value={categoryId}
                rootCategoryId={storeCategoryId}
                onChange={(id) => {
                  setCategoryId(id);
                  setAttributes({});
                  setVariants([]);
                }}
              />
            </div>

            {loadingAttrs ? (
              <p>Cargando atributos...</p>
            ) : (
              baseAttributes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Atributos del producto</h3>
                  <AttributeRenderer
                    attributes={baseAttributes}
                    values={attributes}
                    onChange={setAttributes}
                  />
                </div>
              )
            )}

            {/* Métodos de envío */}
            <div>
              <h3 className="font-semibold mb-2">Metodos de envio disponibles</h3>
              <p className="text-xs text-gray-500 mb-3">Activa los metodos de envio que quieres ofrecer para este producto</p>
              <div className="space-y-2">
                {[
                  { key: "mtzExpress", label: "MTZstore Express", desc: "Envio rapido por la plataforma (1-2 dias)" },
                  { key: "mtzStandard", label: "MTZstore Estandar", desc: "Envio estandar por la plataforma (3-5 dias)" },
                  { key: "storeSelf", label: storeName || "Mi tienda", desc: "El vendedor se encarga del envio" },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer transition-colors ${
                      shipping[opt.key]
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shipping[opt.key]}
                      onChange={(e) => {
                        const newShipping = { ...shipping, [opt.key]: e.target.checked };
                        // Al menos uno debe estar activo
                        if (!newShipping.mtzExpress && !newShipping.mtzStandard && !newShipping.storeSelf) return;
                        setShipping(newShipping);
                        // Sync legacy shippedBy (prioridad: express > standard > store)
                        if (newShipping.mtzExpress) setShippedBy("MTZSTORE_EXPRESS");
                        else if (newShipping.mtzStandard) setShippedBy("MTZSTORE_STANDARD");
                        else setShippedBy("STORE");
                      }}
                      className="w-5 h-5 accent-blue-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Dimensiones del producto */}
            <div>
              <h3 className="font-semibold mb-2">Dimensiones del producto</h3>
              <p className="text-xs text-gray-500 mb-3">Para calculo de costos de envio (peso volumetrico)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dimensions.weight}
                    onChange={(e) => setDimensions({ ...dimensions, weight: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Largo (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={dimensions.length}
                    onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Ancho (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Alto (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={dimensions.height}
                    onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="15"
                  />
                </div>
              </div>
              {dimensions.length > 0 && dimensions.width > 0 && dimensions.height > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  Peso volumetrico: {((Number(dimensions.length) * Number(dimensions.width) * Number(dimensions.height)) / 5000).toFixed(2)} kg
                </p>
              )}
            </div>

            {/* Visibilidad */}
            <div>
              <h3 className="font-semibold mb-2">Visibilidad</h3>
              <div className="space-y-3">
                <div>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isDisplayOnHomeBanner}
                        onChange={(e) => setIsDisplayOnHomeBanner(e.target.checked)}
                      />
                    }
                    label="Mostrar en banner del home"
                  />
                  {isDisplayOnHomeBanner && (
                    <div className="space-y-3 mt-2 pl-4 border-l-2 border-blue-200">
                      <div>
                        <label className="block text-sm font-medium mb-1">Título del banner</label>
                        <input
                          value={bannerTitleName}
                          onChange={(e) => setBannerTitleName(e.target.value)}
                          className="w-full border rounded px-3 py-2"
                          placeholder="Título para el banner"
                        />
                      </div>
                      {bannerimages.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-3">
                          {bannerimages.map((url, i) => (
                            <div key={i} className="relative group">
                              <img src={url} alt={`Banner ${i + 1}`} className="w-20 h-20 object-cover rounded border" />
                              <button
                                type="button"
                                onClick={() => removeBannerImage(i)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                x
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <UploadBox
                        url="/api/product/media/banners"
                        name="bannerimages"
                        multiple
                        maxFiles={3}
                        placeholder="Subir imágenes del banner"
                        onComplete={(newImages) =>
                          setBannerimages((prev) => [...prev, ...newImages])
                        }
                      />
                    </div>
                  )}
                </div>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                  }
                  label="Producto destacado"
                />
              </div>
            </div>

            {/* Inventario */}
            <div>
              <h3 className="font-semibold mb-2">Inventario {isVariantProduct ? "(stock base)" : ""}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock disponible</label>
                  <input
                    type="number"
                    min="0"
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alerta de stock bajo</label>
                  <input
                    type="number"
                    min="0"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0"
                  />
                </div>
              </div>
              {initialData && (
                <p className="text-sm text-gray-500 mt-3">
                  {initialData.rating > 0
                    ? `${initialData.rating}/5 estrellas`
                    : "Sin calificaciones"}
                </p>
              )}
            </div>

            {/* Trazabilidad de ingreso */}
            <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm text-gray-700">Trazabilidad de ingreso</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Fecha de ingreso</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Tipo de ingreso</label>
                  <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value)}
                    className="w-full border rounded px-3 py-2 bg-white"
                  >
                    <option value="">— Seleccionar —</option>
                    <option value="MARITIMO">Marítimo</option>
                    <option value="AEREO">Aéreo</option>
                    <option value="LOCAL">Adquisición local</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Referencia de ingreso</label>
                  <input
                    value={entryReference}
                    onChange={(e) => setEntryReference(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Ej: CONT-2026-03, AWB-987654, LOCAL-015, LOTE-22"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Opcional. Si el ingreso fue marítimo, puedes poner el contenedor; si fue aéreo, la guía aérea; si fue local, una referencia interna o del proveedor.
              </p>
            </div>

            {/* Imágenes */}
            <div>
              <h3 className="font-semibold mb-2">Imágenes del producto *</h3>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt={`Producto ${i + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <UploadBox
                url="/api/product/media/images"
                multiple
                maxFiles={6}
                placeholder="Subir imágenes del producto"
                onComplete={(newImages) => setImages((prev) => [...prev, ...newImages])}
              />
            </div>

            {/* Variantes */}
            {isVariantProduct && (
              <div>
                <h3 className="font-semibold mb-2">Variantes del producto</h3>
                {fixedAttributes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {fixedAttributes.map((a) => (
                      <span
                        key={a.code}
                        className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                      >
                        <span className="font-medium">{a.name}:</span> {a.options[0]}
                      </span>
                    ))}
                  </div>
                )}
                <VariantMatrix
                  attributes={matrixAttributes}
                  value={variants}
                  onChange={setVariants}
                  baseCurrency={baseCurrency}
                  wholesaleEnabled={salesConfig.wholesaleEnabled}
                  wholesaleDiscountPct={
                    Number(basePrice) > 0 && Number(displayWholesalePrice) > 0
                      ? Math.round(((Number(basePrice) - Number(displayWholesalePrice)) / Number(basePrice)) * 100)
                      : 0
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* ========== TAB 1: COSTOS Y MÁRGENES ========== */}
        {tab === 1 && (
          <div className="space-y-6">
            <h3 className="font-semibold mb-2">Configuración de venta</h3>
            <SalesConfigSection
              {...salesConfig}
              bobPerUsd={bobPerUsd}
              baseCurrency={baseCurrency}
              onUseSuggestedPrice={handleUseSuggestedPrice}
              storeType={storeType}
            />
          </div>
        )}

        {/* ========== TAB 2: PRECIOS E IMPUESTOS ========== */}
        {tab === 2 && (
          <div className="space-y-6">
            {/* Impuestos de venta */}
            <div>
              <h3 className="font-semibold mb-3">Impuestos de venta</h3>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">IVA %</label>
                    <Switch size="small" checked={salesConfig.ivaEnabled} onChange={(e) => salesConfig.setIvaEnabled(e.target.checked)} />
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={salesConfig.ivaPct}
                    onChange={(e) => salesConfig.setIvaPct(e.target.value)}
                    className={`w-full border rounded px-3 py-2 ${!salesConfig.ivaEnabled ? "bg-gray-100 text-gray-400" : ""}`}
                    placeholder="13"
                    disabled={!salesConfig.ivaEnabled}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">IT %</label>
                    <Switch size="small" checked={salesConfig.itEnabled} onChange={(e) => salesConfig.setItEnabled(e.target.checked)} />
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={salesConfig.otherTaxesPct}
                    onChange={(e) => salesConfig.setOtherTaxesPct(e.target.value)}
                    className={`w-full border rounded px-3 py-2 ${!salesConfig.itEnabled ? "bg-gray-100 text-gray-400" : ""}`}
                    placeholder="3"
                    disabled={!salesConfig.itEnabled}
                  />
                </div>
              </div>
            </div>

            {/* Crédito fiscal informativo */}
            {salesConfig.enableSalesConfig && salesConfig.computed && salesConfig.computed.ivaImportacionUsd > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-amber-800 mb-1">Crédito fiscal estimado (IVA importación)</h4>
                <p className="text-sm text-amber-700">
                  ${roundMoney(salesConfig.computed.ivaImportacionUsd)} USD
                  {bobPerUsd > 0 && (
                    <span className="text-amber-500 ml-2">
                      ≈ Bs. {roundMoney(salesConfig.computed.ivaImportacionUsd * bobPerUsd)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-amber-500 mt-1">Referencial — IVA pagado en importación disponible para compensación fiscal</p>
              </div>
            )}

            {/* Precio */}
            <div>
              <h3 className="font-semibold mb-2">Precio</h3>
              {salesConfig.enableSalesConfig && salesConfig.computed?.precioSugerido > 0 && (
                <p className="text-xs text-blue-600 mb-2">
                  Precio sugerido: ${roundMoney(salesConfig.computed.precioSugerido)} USD
                  {bobPerUsd > 0 && (
                    <span className="ml-2">≈ Bs. {roundMoney(salesConfig.computed.precioSugerido * bobPerUsd)}</span>
                  )}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Precio actual ({baseCurrency}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => {
                      setBasePrice(e.target.value);
                      priceEditedRef.current = true;
                    }}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0.00"
                  />
                  {basePrice > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ≈ {convertedBasePrice} {otherCurrency}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Precio anterior ({baseCurrency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={oldBasePrice}
                    onChange={(e) => {
                      setOldBasePrice(e.target.value);
                      oldPriceEditedRef.current = true;
                    }}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0.00"
                  />
                  {convertedOldPrice !== null && (
                    <p className="text-xs text-gray-500 mt-1">
                      ≈ {convertedOldPrice} {otherCurrency}
                    </p>
                  )}
                </div>
              </div>
              {computedDiscount > 0 && (
                <span className="inline-block mt-2 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {computedDiscount}% descuento
                </span>
              )}
            </div>

            {/* Resumen comercial */}
            {salesConfig.enableSalesConfig && salesConfig.computed && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3 text-gray-600 uppercase tracking-wide">Resumen comercial</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <span className="text-gray-500">Costo total importado:</span>
                  <span className="font-medium">${roundMoney(salesConfig.computed.costUsd)} USD</span>

                  {salesConfig.computed.ivaImportacionUsd > 0 && (
                    <>
                      <span className="text-gray-500">Crédito fiscal (IVA import.):</span>
                      <span className="font-medium text-amber-700">${roundMoney(salesConfig.computed.ivaImportacionUsd)} USD</span>
                    </>
                  )}

                  <span className={`text-gray-500 ${!salesConfig.wholesaleEnabled ? "text-gray-300" : ""}`}>Precio mayorista:</span>
                  <span className={`font-medium ${!salesConfig.wholesaleEnabled ? "text-gray-300" : ""}`}>
                    {salesConfig.wholesaleEnabled ? `$${roundMoney(salesConfig.computed.precioMayorista)} USD` : "—"}
                  </span>

                  <span className="text-gray-500">Precio unit. mínimo:</span>
                  <span className="font-medium">${roundMoney(salesConfig.computed.precioMinUnitario)} USD</span>

                  <span className="text-gray-500 font-semibold">Precio unit. sugerido:</span>
                  <span className="font-semibold">${roundMoney(salesConfig.computed.precioSugerido)} USD</span>

                  <span className="border-t border-gray-200 pt-1 text-gray-500">Precio actual:</span>
                  <span className="border-t border-gray-200 pt-1 font-medium">
                    {basePrice > 0 ? `$${roundMoney(Number(basePrice))} ${baseCurrency}` : "—"}
                  </span>

                  <span className="text-gray-500">Precio anterior:</span>
                  <span className="font-medium">
                    {oldBasePrice > 0 ? `$${roundMoney(Number(oldBasePrice))} ${baseCurrency}` : "—"}
                  </span>

                  <span className="text-gray-500">IVA venta:</span>
                  <span className="font-medium">{salesConfig.ivaPct}%</span>

                  <span className="text-gray-500">IT:</span>
                  <span className="font-medium">{salesConfig.otherTaxesPct}%</span>

                  {basePrice > 0 && (
                    <>
                      <span className="border-t border-gray-200 pt-1 text-gray-500">Utilidad bruta:</span>
                      <span className="border-t border-gray-200 pt-1 font-medium">
                        ${roundMoney(Number(basePrice) - salesConfig.computed.costUsd)} {baseCurrency}
                      </span>
                      <span className="text-gray-500">Utilidad después de IT:</span>
                      <span className="font-medium">
                        ${roundMoney(Number(basePrice) - salesConfig.computed.costUsd - Number(basePrice) * Number(salesConfig.otherTaxesPct || 0) / 100)} {baseCurrency}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ACCIONES (siempre visible) */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {tab > 0 && (
          <Button variant="outlined" onClick={() => setTab(tab - 1)}>
            Anterior
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={tab < 2 ? handleNextTab : handleSubmit}
          disabled={loading}
        >
          {tab < 2 ? "Siguiente" : loading ? "Guardando..." : "Guardar producto"}
        </Button>
      </div>
    </div>
  );
}
