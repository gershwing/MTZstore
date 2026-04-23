import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import { BsFillBagCheckFill } from "react-icons/bs";
import { MyContext } from '../../App';
import { FaPlus } from "react-icons/fa6";
import Radio from '@mui/material/Radio';
import { deleteData, fetchDataFromApi } from "../../utils/api";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { formatPrice } from "../../utils/formatPrice";

const VITE_APP_PAYPAL_CLIENT_ID = import.meta.env.VITE_APP_PAYPAL_CLIENT_ID;
const VITE_API_URL = import.meta.env.VITE_API_URL;

const Checkout = () => {
  const [userData, setUserData] = useState(null);
  const [isChecked, setIsChecked] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [totalAmountBOB, setTotalAmountBOB] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [shippingMethod, setShippingMethod] = useState("STORE_STANDARD");
  const [availableShippingRates, setAvailableShippingRates] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const context = useContext(MyContext);
  const history = useNavigate();

  // guardamos referencia del botón para poder cerrarlo entre renders
  const paypalButtonsRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setUserData(context?.userData);
    setSelectedAddress(context?.userData?.address_details?.[0]?._id);
  }, [context?.userData]);

  // Calcular totales con impuestos
  const [totalIva, setTotalIva] = useState(0);
  const [totalIt, setTotalIt] = useState(0);
  const [subtotalBOB, setSubtotalBOB] = useState(0);

  useEffect(() => {
    const items = context.cartData || [];
    let sub = 0, iva = 0, it = 0;

    items.forEach((item) => {
      const price = Number(item?.price) || 0;
      const qty = Number(item?.quantity) || 0;
      const itemSub = price * qty;
      sub += itemSub;
      if (item.ivaEnabled && item.ivaPct > 0) iva += itemSub * (item.ivaPct / 100);
      if (item.itEnabled && item.itPct > 0) it += itemSub * (item.itPct / 100);
    });

    setSubtotalBOB(sub);
    setTotalIva(iva);
    setTotalIt(it);
    setTotalAmountBOB(sub + iva + it + shippingCost);
  }, [context.cartData, shippingCost]);

  // Cargar tarifas de envío disponibles
  useEffect(() => {
    fetchDataFromApi("/api/shipping/rates?zone=DEFAULT").then((res) => {
      const data = res?.data || res;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setAvailableShippingRates(list);
    }).catch(() => {});
  }, []);

  // Enriquecer cart items con datos frescos del producto (shipping + stock)
  const [enrichedCart, setEnrichedCart] = useState([]);
  const [storeNames, setStoreNames] = useState({});
  useEffect(() => {
    const items = context?.cartData || [];
    if (!items.length) { setEnrichedCart([]); return; }
    const uniqueIds = [...new Set(items.map(i => i.productId?._id || i.productId).filter(Boolean))];
    Promise.all(
      uniqueIds.map(id =>
        fetchDataFromApi(`/api/product/${id}`)
          .then(r => { const raw = r?.data || r; const p = raw?.product || raw; return p ? { id: String(p._id || p.id), shipping: p.shipping, countInStock: p.countInStock, warehouseStock: p.warehouseStock, storeId: p.storeId } : null; })
          .catch(() => null)
      )
    ).then(products => {
      const map = {};
      const storeIds = new Set();
      products.filter(Boolean).forEach(p => { map[p.id] = p; if (p.storeId) storeIds.add(String(p.storeId)); });
      setEnrichedCart(items.map(i => {
        const pid = String(i.productId?._id || i.productId || "");
        const fresh = map[pid];
        return fresh ? { ...i, shipping: fresh.shipping, countInStock: fresh.countInStock, warehouseStock: fresh.warehouseStock, storeId: fresh.storeId } : i;
      }));
      // Obtener nombres de tiendas
      [...storeIds].forEach(sid => {
        fetchDataFromApi(`/api/store/by-id/${sid}`)
          .then(r => { const s = r?.row || r?.data?.row || r?.data || r; if (s?.name) setStoreNames(prev => ({ ...prev, [sid]: s.name })); })
          .catch(() => {});
      });
    });
  }, [context?.cartData]);

  // Auto-seleccionar método de envío si el actual no está disponible
  useEffect(() => {
    if (!availableShippingRates.length || !enrichedCart.length) return;
    const items = enrichedCart;
    const hasWarehouse = items.some(i => (i.warehouseStock ?? 0) > 0);
    const hasStore = items.some(i => (i.countInStock ?? 0) > 0);

    // Mapa de método de envío a campo del producto
    const SHIPPING_KEY = {
      MTZSTORE_EXPRESS: "mtzExpress",
      MTZSTORE_STANDARD: "mtzStandard",
      STORE_EXPRESS: "storeExpress",
      STORE_STANDARD: "storeStandard",
    };

    const isAvailable = (method) => {
      // Verificar stock
      if (["MTZSTORE_EXPRESS", "MTZSTORE_STANDARD"].includes(method) && !hasWarehouse) return false;
      if (["STORE_EXPRESS", "STORE_STANDARD"].includes(method) && !hasStore) return false;
      // Verificar que TODOS los productos tengan el método habilitado
      const key = SHIPPING_KEY[method];
      if (key) {
        const allEnabled = items.every(i => !i.shipping || i.shipping[key] !== false);
        if (!allEnabled) return false;
      }
      return true;
    };

    if (!isAvailable(shippingMethod)) {
      const fallback = availableShippingRates.find(r => isAvailable(r.method));
      if (fallback) setShippingMethod(fallback.method);
    }
  }, [availableShippingRates, enrichedCart, shippingMethod]);

  // Calcular costo de envío al seleccionar dirección o método
  useEffect(() => {
    if (!selectedAddress || !context?.cartData?.length) {
      setShippingCost(0);
      setShippingInfo(null);
      return;
    }

    const addr = userData?.address_details?.find((a) => a._id === selectedAddress);
    const zone = addr?.state || "DEFAULT";

    const items = context.cartData.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    fetchDataFromApi(
      `/api/shipping/calculate?method=${shippingMethod}&zone=${encodeURIComponent(zone)}&subtotal=${subtotalBOB}&items=${encodeURIComponent(JSON.stringify(items))}`
    ).then((res) => {
      const data = res?.data || res;
      if (data && !data.error) {
        setShippingCost(data.cost || 0);
        setShippingInfo(data);
      }
    }).catch(() => {
      setShippingCost(0);
      setShippingInfo(null);
    });
  }, [selectedAddress, subtotalBOB, shippingMethod]);

  // PayPal SDK + Buttons (con protección contra inicializaciones duplicadas)
  useEffect(() => {
    if (!VITE_APP_PAYPAL_CLIENT_ID) return;

    let isMounted = true;
    const scriptId = "paypal-sdk";
    const containerId = "paypal-button-container";

    const renderButtons = () => {
      if (!isMounted || !window.paypal) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      // limpiar contenedor y cerrar instancia previa
      container.innerHTML = "";
      try { paypalButtonsRef.current?.close(); } catch { }

      paypalButtonsRef.current = window.paypal.Buttons({
        createOrder: async () => {
          const headers = {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          };

          // 👉 Enviamos total en BOB; el backend convierte a USD con la tasa snapshot
          const payload = {
            userId: context?.userData?._id,
            totalBob: Number(totalAmountBOB || 0),
            currency: "BOB",
            deliveryAddressId: selectedAddress,
          };

          const response = await axios.post(
            `${VITE_API_URL}/api/order/create-order-paypal`,
            payload,
            { headers }
          );

          return response?.data?.id;
        },
        onApprove: async (data) => {
          await onApprovePayment(data);
        },
        onError: (err) => {
          console.error("PayPal Checkout onError:", err);
          history("/order/failed");
        },
      });

      paypalButtonsRef.current.render(`#${containerId}`);
    };

    const ensureSdkLoaded = () => {
      if (window.paypal) {
        renderButtons();
        return;
      }

      let script = document.getElementById(scriptId);
      if (script) {
        // ya existe: espera a que cargue si aún no disparó
        script.addEventListener("load", renderButtons, { once: true });
        return;
      }

      // Inyectar una sola vez el SDK con currency=USD
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${VITE_APP_PAYPAL_CLIENT_ID}&currency=USD&components=buttons&disable-funding=card`;
      script.async = true;
      script.onload = renderButtons;
      document.body.appendChild(script);
    };

    // Render solo si hay dirección y hay items
    if (selectedAddress && (context?.cartData?.length || 0) > 0) {
      ensureSdkLoaded();
    }

    return () => {
      isMounted = false;
      try { paypalButtonsRef.current?.close(); } catch { }
    };
    // Re-render solo cuando cambia lo mínimo necesario:
  }, [selectedAddress, context?.cartData?.length, totalAmountBOB]);

  const onApprovePayment = async (data) => {
    const user = context?.userData;

    const info = {
      userId: user?._id,
      products: context?.cartData,
      payment_status: "COMPLETE",
      delivery_address: selectedAddress,
      totalBob: Number(totalAmountBOB || 0),
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    };

    try {
      const res = await axios.post(
        `${VITE_API_URL}/api/order/capture-order-paypal`,
        { ...info, paymentId: data.orderID },
        { headers }
      );

      context.alertBox("success", res?.data?.message);
      history("/order/success");
      await deleteData(`/api/cart/emptyCart/${context?.userData?._id}`);
      context?.getCartItems();

      if (res?.data?.success) {
        context.alertBox("success", "Order completed and saved to database!");
      }
    } catch (err) {
      console.error(err);
      history("/order/failed");
    }
  };

  // Placeholder Cryptomus
  const handleCryptomusSoon = () => {
    context?.alertBox("info", "Cryptomus: próximamente");
  };

  const editAddress = (id) => {
    context?.setOpenAddressPanel(true);
    context?.setAddressMode("edit");
    context?.setAddressId(id);
  };

  const handleChange = (e, index) => {
    if (e.target.checked) {
      setIsChecked(index);
      setSelectedAddress(e.target.value);
    }
  };

  const cashOnDelivery = () => {
    const user = context?.userData;
    setIsloading(true);

    if (userData?.address_details?.length !== 0) {
      const payLoad = {
        userId: user?._id,
        products: context?.cartData,
        paymentId: '',
        payment_status: "CASH ON DELIVERY",
        delivery_address: selectedAddress,
        shippingMethod,
        shippingSettle: shippingCost,
        totalAmt: Number(totalAmountBOB || 0), // BOB
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      };

      axios.post(`${VITE_API_URL}/api/order/create`, payLoad, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      })
        .then(async (res) => {
          context.alertBox("success", res?.data?.message);
          if (res?.data?.error === false) {
            await deleteData(`/api/cart/emptyCart/${user?._id}`);
            context?.getCartItems();
          } else {
            context.alertBox("error", res?.data?.message);
          }
          setIsloading(false);
          history("/order/success");
        })
        .catch(() => {
          context.alertBox("error", "Something went wrong");
          setIsloading(false);
        });
    } else {
      context.alertBox("error", "Please add address");
      setIsloading(false);
    }
  };

  return (
    <section className="py-3 lg:py-10 px-3">
      <div className="w-full lg:w-[70%] m-auto flex flex-col md:flex-row gap-5">
        <div className="leftCol w-full md:w-[60%]">
          <div className="card bg-white shadow-md p-5 rounded-md w-full">
            <div className="flex items-center justify-between">
              <h2>Seleccionar dirección de entrega</h2>
              {userData?.address_details?.length !== 0 && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    context?.setOpenAddressPanel(true);
                    context?.setAddressMode("add");
                  }}
                  className="btn"
                >
                  <FaPlus />
                  AGREGAR {context?.windowWidth < 767 ? "" : "NUEVA DIRECCIÓN"}
                </Button>
              )}
            </div>

            <br />

            <div className="flex flex-col gap-4">
              {userData?.address_details?.length !== 0 ? (
                userData?.address_details?.map((address, index) => {
                  return (
                    <label
                      className={`flex gap-3 p-4 border border-[rgba(0,0,0,0.1)] rounded-md relative ${isChecked === index && "bg-[#fff2f2]"}`}
                      key={address?._id || index}
                    >
                      <div>
                        <Radio
                          size="small"
                          onChange={(e) => handleChange(e, index)}
                          checked={isChecked === index}
                          value={address?._id}
                        />
                      </div>
                      <div className="info">
                        <span className="inline-block text-[13px] font-[500] p-1 bg-[#f1f1f1] rounded-md">
                          {address?.addressType}
                        </span>
                        <h3>{userData?.name}</h3>
                        <p className="mt-0 mb-0">
                          {address?.address_line1 + " " + address?.city + " " + address?.country + " " + address?.state + " " + address?.landmark + " " + "+ " + address?.mobile}
                        </p>
                        <p className="mb-0 font-[500]">
                          {userData?.mobile !== null ? "+" + userData?.mobile : "+" + address?.mobile}
                        </p>
                      </div>

                      <Button
                        variant="text"
                        className="!absolute top-[15px] right-[15px]"
                        size="small"
                        onClick={() => editAddress(address?._id)}
                      >
                        EDITAR
                      </Button>
                    </label>
                  );
                })
              ) : (
                <>
                  <div className="flex items-center mt-5 justify-between flex-col p-5">
                    <img src="/map.png" width="100" />
                    <h2 className="text-center">¡No se encontraron direcciones en su cuenta!</h2>
                    <p className="mt-0">Añade una dirección de entrega</p>
                    <Button
                      className="btn-org"
                      onClick={() => {
                        context?.setOpenAddressPanel(true);
                        context?.setAddressMode("add");
                      }}
                    >
                      AGREGAR DIRECCIÓN
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="rightCol w-full  md:w-[40%]">
          <div className="card shadow-md bg-white p-5 rounded-md">
            <h2 className="mb-4">Tu Pedido</h2>

            <div className="flex items-center justify-between py-3 border-t border-b border-[rgba(0,0,0,0.1)]">
              <span className="text-[14px] font-[600]">Productos</span>
              <span className="text-[14px] font-[600]">Sub total</span>
            </div>

            <div className="mb-5 scroll max-h-[250px] overflow-y-scroll overflow-x-hidden pr-2">
              {context?.cartData?.length !== 0 &&
                context?.cartData?.map((item, index) => {
                  const lineTotalBOB =
                    (Number(item?.quantity) || 0) * (Number(item?.price) || 0);
                  return (
                    <div className="flex items-center justify-between py-2" key={item?._id || index}>
                      <div className="part1 flex items-center gap-3">
                        <div className="img w-[50px] h-[50px] object-cover overflow-hidden rounded-md group cursor-pointer">
                          <img
                            src={item?.image}
                            className="w-full transition-all group-hover:scale-105"
                          />
                        </div>

                        <div className="info">
                          <h4 className="text-[14px]" title={item?.productTitle}>
                            {item?.productTitle?.substr(0, 20) + "..."}{" "}
                          </h4>
                          {item?.variantAttrs && Object.keys(item.variantAttrs).length > 0 && (
                            <p className="text-[11px] text-gray-400 mt-0 mb-0">
                              {Object.values(item.variantAttrs).join(" / ")}
                            </p>
                          )}
                          <span className="text-[13px]">Qty : {item?.quantity}</span>
                        </div>
                      </div>

                      <span className="text-[14px] font-[500]">
                        {formatPrice(lineTotalBOB, "BOB")}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Selector de método de envío */}
            {availableShippingRates.length > 0 && (
              <div className="py-3 border-t border-[rgba(0,0,0,0.1)]">
                <p className="text-[13px] font-[600] mb-2">Método de envío</p>
                <div className="space-y-1.5">
                  {availableShippingRates.filter((rate) => {
                    // Excluir método legacy STORE (reemplazado por STORE_EXPRESS/STORE_STANDARD)
                    if (rate.method === "STORE") return false;
                    // Filtrar por stock + métodos habilitados en los productos
                    const items = enrichedCart.length ? enrichedCart : (context?.cartData || []);
                    const hasWarehouse = items.some(i => (i.warehouseStock ?? 0) > 0);
                    const hasStore = items.some(i => (i.countInStock ?? 0) > 0);
                    const SHIPPING_KEY = {
                      MTZSTORE_EXPRESS: "mtzExpress",
                      MTZSTORE_STANDARD: "mtzStandard",
                      STORE_EXPRESS: "storeExpress",
                      STORE_STANDARD: "storeStandard",
                    };
                    const isMtzMethod = ["MTZSTORE_EXPRESS", "MTZSTORE_STANDARD"].includes(rate.method);
                    const isStoreMethod = ["STORE_EXPRESS", "STORE_STANDARD"].includes(rate.method);
                    // Check stock
                    if (isMtzMethod && !hasWarehouse) return false;
                    if (isStoreMethod && !hasStore) return false;
                    // Check shipping enabled on ALL products
                    const key = SHIPPING_KEY[rate.method];
                    if (key) {
                      const allEnabled = items.every(i => !i.shipping || i.shipping[key] !== false);
                      if (!allEnabled) return false;
                    }
                    return true;
                  }).map((rate) => {
                    const isSelected = shippingMethod === rate.method;
                    const isMtz = ["MTZSTORE_EXPRESS", "MTZSTORE_STANDARD"].includes(rate.method);
                    const isFree = !isMtz && rate.baseRate === 0;
                    // Obtener nombre de tienda del primer item enriquecido
                    const firstStoreId = String(enrichedCart[0]?.storeId || "");
                    const sName = storeNames[firstStoreId] || "Mi tienda";
                    const methodLabel = rate.method === "MTZSTORE_EXPRESS" ? "MTZstore Express"
                      : rate.method === "MTZSTORE_STANDARD" ? "MTZstore Estándar"
                      : rate.method === "STORE_EXPRESS" ? `${sName} Express`
                      : rate.method === "STORE_STANDARD" ? `${sName} Estándar`
                      : "Envío por tienda";

                    return (
                      <label
                        key={rate.method}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-[12px] transition-colors ${
                          isSelected ? "border-primary bg-red-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={rate.method}
                          checked={isSelected}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="accent-primary"
                        />
                        <div className="flex-1">
                          <span className="font-[500] text-[13px]">{methodLabel}</span>
                          {rate.estimatedDays && (
                            <span className="text-gray-400 ml-1">
                              · {rate.estimatedDays.min === 0
                                ? `< ${rate.estimatedDays.max * 24}h`
                                : `${rate.estimatedDays.min}-${rate.estimatedDays.max} días`}
                            </span>
                          )}
                        </div>
                        <span className="font-[600] text-[13px]">
                          {isFree ? (
                            <span className="text-green-600">Gratis</span>
                          ) : isSelected && shippingCost > 0 ? (
                            formatPrice(shippingCost, "BOB")
                          ) : (
                            <span className="text-gray-500">desde {rate.baseRate} Bs</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {/* Desglose del costo de envío */}
                {shippingInfo && shippingCost > 0 && shippingInfo.billableWeight > 0 && (
                  <p className="text-[11px] text-gray-400 mt-1.5 px-1">
                    Peso facturable: {shippingInfo.billableWeight?.toFixed(2)} kg
                    {shippingInfo.baseRate > 0 && ` · Base: ${shippingInfo.baseRate} Bs`}
                    {shippingInfo.perKgRate > 0 && ` + ${shippingInfo.perKgRate} Bs/kg`}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2 py-2 border-t border-[rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-600">Subtotal</span>
                <span className="text-[13px] font-[600]">{formatPrice(subtotalBOB, "BOB")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-500">IVA (13%)</span>
                <span className="text-[12px]">{formatPrice(totalIva, "BOB")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-500">IT (3%)</span>
                <span className="text-[12px]">{formatPrice(totalIt, "BOB")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-500">Envio</span>
                <span className="text-[12px] font-[500]">
                  {shippingInfo?.isFree ? (
                    <span className="text-green-600">Gratis</span>
                  ) : shippingCost > 0 ? (
                    formatPrice(shippingCost, "BOB")
                  ) : (
                    <span className="text-green-600">Gratis</span>
                  )}
                </span>
              </div>
              {shippingInfo?.estimatedDays && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">Entrega estimada</span>
                  <span className="text-[11px] text-gray-400">{shippingInfo.estimatedDays.min}-{shippingInfo.estimatedDays.max} dias</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-[rgba(0,0,0,0.1)]">
                <span className="text-[15px] font-[700]">Total</span>
                <span className="text-[16px] font-[700] text-primary">{formatPrice(totalAmountBOB, "BOB")}</span>
              </div>
            </div>

            <div className="flex items-center flex-col gap-3 mb-2 mt-3">
              {/* Botón placeholder para futura integración de Cryptomus */}
              <Button
                type="button"
                className="btn-dark btn-lg w-full flex gap-2 items-center"
                onClick={() => {
                  context?.alertBox("info", "Cryptomus: próximamente");
                }}
              >
                Pagar con Cryptomus (próximamente)
              </Button>

              {/* PayPal */}
              <div
                id="paypal-button-container"
                className={`${userData?.address_details?.length === 0 ? 'pointer-events-none' : ''} w-full`}
              ></div>

              {/* Cash on Delivery */}
              <Button
                type="button"
                className="btn-dark btn-lg w-full flex gap-2 items-center"
                onClick={cashOnDelivery}
              >
                {isLoading === true ? (
                  <CircularProgress />
                ) : (
                  <>
                    <BsFillBagCheckFill className="text-[20px]" />
                    Pago contra entrega
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
