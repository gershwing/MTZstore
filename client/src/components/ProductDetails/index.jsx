import React, { useContext, useEffect, useState, useMemo } from "react";
import Button from "@mui/material/Button";
import { QtyBox } from "../QtyBox";
import Rating from "@mui/material/Rating";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import { MyContext } from "../../App";
import CircularProgress from '@mui/material/CircularProgress';
import { postData, fetchDataFromApi } from "../../utils/api";
import { FaCheckDouble } from "react-icons/fa";
import { IoMdHeart } from "react-icons/io";
import { formatPrice } from "../../utils/formatPrice";

export const ProductDetailsComponent = (props) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isAddedInMyList, setIsAddedInMyList] = useState(false);
  const [shippingRates, setShippingRates] = useState([]);

  // Variantes: seleccion de atributos
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);

  const context = useContext(MyContext);
  const variants = props?.variants || [];

  // Extraer atributos unicos de las variantes
  // Ej: variants = [{attributes: {talla: "L", color: "Rojo"}}, {attributes: {talla: "M", color: "Azul"}}]
  // → attrOptions = { talla: ["L", "M"], color: ["Rojo", "Azul"] }
  const attrOptions = useMemo(() => {
    const opts = {};
    for (const v of variants) {
      if (!v.attributes) continue;
      for (const [key, val] of Object.entries(v.attributes)) {
        if (!opts[key]) opts[key] = new Set();
        opts[key].add(val);
      }
    }
    // Convertir Sets a Arrays
    const result = {};
    for (const [key, set] of Object.entries(opts)) {
      result[key] = [...set];
    }
    return result;
  }, [variants]);

  const hasVariants = Object.keys(attrOptions).length > 0;

  // Factor de conversion: si baseCurrency=USD, cuanto vale 1 USD en BOB segun el enrich
  const baseCurrency = props?.item?.baseCurrency || "USD";
  const basePrice = Number(props?.item?.basePrice || 0);
  const productPriceBob = Number(props?.item?.priceBob || 0);
  const fxFactor = (baseCurrency === "USD" && basePrice > 0 && productPriceBob > 0)
    ? (productPriceBob / basePrice) // bobPerUsd aproximado
    : 1; // BOB = 1:1

  // Convertir precio de variante a BOB
  const variantToBob = (variantPrice) => {
    if (!variantPrice) return 0;
    return baseCurrency === "BOB" ? variantPrice : Math.round(variantPrice * fxFactor * 100) / 100;
  };

  // Ratio para precio anterior proporcional (mantiene % descuento)
  const oldPriceRatio = (Number(props?.item?.oldBasePrice || 0) > 0 && basePrice > 0)
    ? (Number(props?.item?.oldBasePrice) / basePrice)
    : 0;

  // Auto-seleccionar primera variante activa al cargar
  useEffect(() => {
    if (!hasVariants || Object.keys(selectedAttrs).length > 0) return;
    const firstActive = variants.find(v => v.stock > 0) || variants[0];
    if (firstActive?.attributes) {
      setSelectedAttrs({ ...firstActive.attributes });
    }
  }, [hasVariants, variants]);

  // Cargar tarifas de envío
  useEffect(() => {
    fetchDataFromApi("/api/shipping/rates?zone=DEFAULT").then((res) => {
      const data = res?.data || res;
      if (Array.isArray(data)) setShippingRates(data);
      else if (Array.isArray(data?.data)) setShippingRates(data.data);
    }).catch(() => {});
  }, []);

  // Cuando se selecciona variante desde imagen (clic en thumbnail)
  useEffect(() => {
    if (!props.variantFromImage?.attributes) return;
    setSelectedAttrs({ ...props.variantFromImage.attributes });
  }, [props.variantFromImage]);

  // Encontrar variante que matchea todas las selecciones
  useEffect(() => {
    if (!hasVariants) { setSelectedVariant(null); return; }

    const attrKeys = Object.keys(attrOptions);
    const allSelected = attrKeys.every(k => selectedAttrs[k] != null);

    if (!allSelected) { setSelectedVariant(null); return; }

    const match = variants.find(v => {
      return attrKeys.every(k => {
        const vVal = typeof v.attributes[k] === "string" ? v.attributes[k] : String(v.attributes[k]);
        const sVal = typeof selectedAttrs[k] === "string" ? selectedAttrs[k] : String(selectedAttrs[k]);
        return vVal === sVal;
      });
    });

    setSelectedVariant(match || null);

    // Notificar al padre para cambiar imagen
    if (match && props.onVariantSelect) {
      props.onVariantSelect(match);
    }
  }, [selectedAttrs, variants, attrOptions, hasVariants]);

  // Precios en BOB (convertidos si baseCurrency=USD)
  const displayPrice = selectedVariant
    ? variantToBob(selectedVariant.price)
    : productPriceBob;

  const displayOldPrice = selectedVariant
    ? (oldPriceRatio > 0 ? Math.round(variantToBob(selectedVariant.price) * oldPriceRatio * 100) / 100 : null)
    : (Number(props?.item?.oldPriceBob || 0) > 0 ? Number(props.item.oldPriceBob) : null);

  const displayStock = selectedVariant
    ? selectedVariant.stock
    : (props?.item?.countInStock ?? 0);

  // Precios mayoristas por niveles
  const wholesaleTiers = props?.item?.wholesaleTiers;
  const resolveTierPrice = (qty) => {
    if (!wholesaleTiers?.enabled) return null;
    const { tier1, tier2 } = wholesaleTiers;
    // Tier 2 primero (mayor cantidad = menor precio)
    if (tier2?.minQty > 0 && tier2?.bob > 0 && qty >= tier2.minQty) {
      return { price: tier2.bob, tier: 2, label: "Mayorista" };
    }
    if (tier1?.minQty > 0 && tier1?.bob > 0 && qty >= tier1.minQty) {
      if (tier1.maxQty > 0 && qty > tier1.maxQty) return null;
      return { price: tier1.bob, tier: 1, label: "Semi-mayorista" };
    }
    return null;
  };

  const tierResult = resolveTierPrice(quantity);
  const effectivePrice = tierResult ? tierResult.price : displayPrice;

  const handleSelecteQty = (qty) => setQuantity(qty);

  const handleSelectAttr = (key, val) => {
    setSelectedAttrs(prev => ({ ...prev, [key]: val }));
  };

  // Cart check
  useEffect(() => {
    const item = context?.cartData?.filter((cartItem) =>
      cartItem?.productId?.includes(props?.item?._id)
    );
    setIsAdded(item?.length > 0);
  }, [context?.cartData, props?.item?._id]);

  // MyList check
  useEffect(() => {
    const myListItem = context?.myListData?.filter((item) =>
      item?.productId?.includes(props?.item?._id)
    );
    setIsAddedInMyList(myListItem?.length > 0);
  }, [context?.myListData, props?.item?._id]);

  const addToCart = (product, userId, quantity) => {
    if (userId === undefined) {
      context?.alertBox("error", "No has iniciado sesion, por favor inicia sesion primero");
      return;
    }

    // Si hay variantes, debe seleccionar una
    if (hasVariants && !selectedVariant) {
      context?.alertBox("error", "Selecciona las opciones del producto");
      return;
    }

    const productItem = {
      _id: product?._id,
      productTitle: product?.name,
      image: selectedVariant?.images?.[0]?.url || selectedVariant?.images?.[0] || product?.images?.[0],
      rating: product?.rating,
      price: effectivePrice,
      oldPrice: tierResult ? displayPrice : displayOldPrice,
      discount: product?.discount,
      quantity: quantity,
      subTotal: parseInt((effectivePrice || 0) * quantity),
      productId: product?._id,
      variantId: selectedVariant?._id || null,
      countInStock: displayStock,
      brand: product?.brand,
      // Atributos seleccionados para mostrar en carrito
      variantAttrs: selectedVariant ? selectedAttrs : {},
    };

    setIsLoading(true);
    postData("/api/cart/add", productItem).then((res) => {
      if (res?.error === false) {
        context?.alertBox("success", res?.message);
        context?.getCartItems();
        setTimeout(() => {
          setIsLoading(false);
          setIsAdded(true);
        }, 500);
      } else {
        context?.alertBox("error", res?.message);
        setTimeout(() => setIsLoading(false), 500);
      }
    });
  };

  const handleAddToMyList = (item) => {
    if (!context?.userData) {
      context?.alertBox("error", "No has iniciado sesion, por favor inicia sesion primero");
      return;
    }
    const obj = {
      productId: item?._id,
      userId: context?.userData?._id,
      productTitle: item?.name,
      image: item?.images?.[0],
      rating: item?.rating,
      price: displayPrice,
      oldPrice: displayOldPrice,
      brand: item?.brand,
      discount: item?.discount,
    };

    postData("/api/myList/add", obj).then((res) => {
      if (res?.error === false) {
        context?.alertBox("success", res?.message);
        setIsAddedInMyList(true);
        context?.getMyListData();
      } else {
        context?.alertBox("error", res?.message);
      }
    });
  };

  return (
    <>
      <h1 className="text-[18px] sm:text-[22px] font-[600] mb-2">
        {props?.item?.name}
      </h1>

      <div className="flex items-start sm:items-center flex-col sm:flex-row gap-3 justify-start">
        <span className="text-gray-400 text-[13px]">
          Marca: <span className="font-[500] text-black opacity-75">{props?.item?.brand}</span>
        </span>
        <Rating name="size-small" value={props?.item?.rating} size="small" readOnly />
        <span className="text-[13px] cursor-pointer" onClick={props.gotoReviews}>
          Resenas ({props.reviewsCount})
        </span>
      </div>

      {/* PRECIOS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
        <div className="flex items-center gap-4">
          {tierResult ? (
            <>
              <span className="oldPrice line-through text-gray-500 text-[20px] font-[500]">
                {formatPrice(displayPrice, "BOB")}
              </span>
              <span className="price text-primary text-[20px] font-[600]">
                {formatPrice(effectivePrice, "BOB")}
              </span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                {tierResult.label}
              </span>
            </>
          ) : (
            <>
              {displayOldPrice > 0 && (
                <span className="oldPrice line-through text-gray-500 text-[20px] font-[500]">
                  {formatPrice(displayOldPrice, "BOB")}
                </span>
              )}
              <span className="price text-primary text-[20px] font-[600]">
                {formatPrice(displayPrice, "BOB")}
              </span>
            </>
          )}
        </div>
        <span className="text-[14px]">
          Disponible en stock: <span className="text-green-600 font-bold">{displayStock} items</span>
        </span>
      </div>

      {/* Precios por mayor — estilo Alibaba */}
      {wholesaleTiers?.enabled && (() => {
        const t1 = wholesaleTiers.tier1;
        const t2 = wholesaleTiers.tier2;
        const hasT1 = t1?.minQty > 0 && t1?.bob > 0;
        const hasT2 = t2?.minQty > 0 && t2?.bob > 0;
        if (!hasT1 && !hasT2) return null;

        // Construir columnas dinámicamente
        const cols = [];

        // Columna 0: precio unitario normal (siempre)
        const unitMax = hasT1 ? t1.minQty - 1 : hasT2 ? t2.minQty - 1 : 0;
        cols.push({
          range: unitMax > 1 ? `1 - ${unitMax}` : "1",
          label: "unidades",
          price: displayPrice,
          active: !tierResult,
        });

        // Columna 1: tier 1 semi-mayorista
        if (hasT1) {
          const t1Max = t1.maxQty > 0 ? t1.maxQty : hasT2 ? t2.minQty - 1 : null;
          cols.push({
            range: t1Max ? `${t1.minQty} - ${t1Max}` : `${t1.minQty}+`,
            label: "unidades",
            price: t1.bob,
            active: tierResult?.tier === 1,
          });
        }

        // Columna 2: tier 2 mayorista/caja
        if (hasT2) {
          cols.push({
            range: `${t2.minQty}+`,
            label: "unidades",
            price: t2.bob,
            active: tierResult?.tier === 2,
          });
        }

        return (
          <div className="mt-4 border border-amber-200 rounded-lg overflow-hidden">
            <div className={`grid divide-x divide-amber-200 ${cols.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {cols.map((col, i) => (
                <div
                  key={i}
                  className={`p-3 text-center transition-colors ${
                    col.active
                      ? "bg-amber-100 border-b-2 border-amber-500"
                      : "bg-amber-50 hover:bg-amber-100/50"
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1">
                    {col.range} {col.label}
                  </p>
                  <p className={`text-lg font-bold ${col.active ? "text-amber-800" : "text-gray-700"}`}>
                    {formatPrice(col.price, "BOB")}
                  </p>
                  {col.active && (
                    <p className="text-[10px] text-amber-600 mt-0.5 font-medium">Precio aplicado</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <p className="mt-3 pr-10 mb-4">{props?.item?.description}</p>

      {/* SELECTOR DE VARIANTES (dinamico desde variants[].attributes) */}
      {hasVariants && (
        <div className="space-y-3 mb-4">
          {Object.entries(attrOptions).map(([attrKey, options]) => (
            <div key={attrKey} className="flex items-center gap-3 flex-wrap">
              <span className="text-[14px] font-[600] capitalize min-w-[60px]">{attrKey}:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {options.map((opt, idx) => {
                  const optStr = typeof opt === "string" ? opt : (opt?.label || opt?.value || String(opt));
                  const isSelected = selectedAttrs[attrKey] === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAttr(attrKey, opt)}
                      className={`px-3 py-1.5 text-[13px] border rounded-md transition-all capitalize ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {optStr}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Variante seleccionada info */}
          {selectedVariant && (
            <p className="text-[12px] text-green-600">
              SKU: {selectedVariant.sku || "—"} | Stock: {selectedVariant.stock}
            </p>
          )}
          {hasVariants && !selectedVariant && Object.keys(selectedAttrs).length > 0 && (
            <p className="text-[12px] text-orange-500">Selecciona todas las opciones</p>
          )}
        </div>
      )}

      {/* Métodos de envío disponibles */}
      {(() => {
        const ship = props?.item?.shipping;
        const storeName = props?.storeInfo?.isPlatformStore ? "MTZstore" : props?.storeInfo?.name;

        const METHOD_MAP = {
          mtzExpress: { key: "MTZSTORE_EXPRESS", label: "MTZstore Express" },
          mtzStandard: { key: "MTZSTORE_STANDARD", label: "MTZstore Estándar" },
          storeSelf: { key: "STORE", label: storeName || "Tienda" },
        };

        // Métodos activos del producto
        const activeMethods = [];
        if (ship?.mtzExpress) activeMethods.push(METHOD_MAP.mtzExpress);
        if (ship?.mtzStandard) activeMethods.push(METHOD_MAP.mtzStandard);
        if (ship?.storeSelf) activeMethods.push({ ...METHOD_MAP.storeSelf });

        // Fallback legacy
        if (activeMethods.length === 0) {
          const legacy = props?.item?.shippedBy;
          if (legacy === "MTZSTORE_EXPRESS") activeMethods.push(METHOD_MAP.mtzExpress);
          else if (legacy === "MTZSTORE_STANDARD") activeMethods.push(METHOD_MAP.mtzStandard);
          else activeMethods.push({ ...METHOD_MAP.storeSelf });
        }

        return (
          <div className="mt-3 mb-2">
            {/* Vendido por */}
            {props?.storeInfo && (
              <p className="text-[13px] text-gray-500 mb-1.5">
                Vendido por: <span className="font-[600] text-gray-700">{props.storeInfo.isPlatformStore ? "MTZstore" : props.storeInfo.name}</span>
              </p>
            )}

            {/* Opciones de envío */}
            <p className="text-[12px] text-gray-400 mb-1">Enviado por:</p>
            <div className="space-y-1.5">
              {activeMethods.map((m) => {
                const rate = shippingRates.find((r) => r.method === m.key);
                const days = rate?.estimatedDays;
                const cost = rate?.baseRate || 0;
                const isMtz = ["MTZSTORE_EXPRESS", "MTZSTORE_STANDARD"].includes(m.key);
                const isFree = !isMtz && cost === 0;

                return (
                  <div key={m.key} className="flex items-center gap-2 text-[13px]">
                    <span className="text-green-600 font-medium">✓</span>
                    <span className="font-[500] text-gray-800">{m.label}</span>
                    {days && (
                      <span className="text-gray-400">
                        {days.min === 0 ? `menos de ${days.max * 24}h` : `${days.min}-${days.max} días`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div className="flex items-center gap-4 py-4">
        <div className="qtyBoxWrapper w-[70px]">
          <QtyBox handleSelecteQty={handleSelecteQty} max={displayStock || 99} />
        </div>

        <Button
          className="btn-org flex gap-2 !min-w-[150px]"
          onClick={() => addToCart(props?.item, context?.userData?._id, quantity)}
          disabled={hasVariants && !selectedVariant}
        >
          {isLoading ? (
            <CircularProgress size={20} />
          ) : isAdded ? (
            <><FaCheckDouble /> Agregado</>
          ) : (
            <><MdOutlineShoppingCart className="text-[22px]" /> Agregar al carrito</>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <span
          className="flex items-center gap-2 text-[14px] link cursor-pointer font-[500]"
          onClick={() => handleAddToMyList(props?.item)}
        >
          {isAddedInMyList ? (
            <IoMdHeart className="text-[18px] !text-primary" />
          ) : (
            <FaRegHeart className="text-[18px] !text-black" />
          )}
          Agregar a la lista de deseos
        </span>

        <span className="flex items-center gap-2 text-[14px] link cursor-pointer font-[500]">
          <IoGitCompareOutline className="text-[18px]" /> Comparar
        </span>
      </div>
    </>
  );
};
