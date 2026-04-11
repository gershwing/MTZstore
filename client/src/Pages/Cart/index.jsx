import React, { useContext, useEffect, useState } from "react";

import Button from "@mui/material/Button";
import { BsFillBagCheckFill } from "react-icons/bs";
import CartItems from "./cartItems";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatPrice";

const CartPage = () => {

  const [productSizeData, setProductSizeData] = useState([]);
  const [productRamsData, setProductRamsData] = useState([]);
  const [productWeightData, setProductWeightData] = useState([]);
  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);

    fetchDataFromApi("/api/product/productSize/get").then((res) => {
      if (res?.error === false) {
        setProductSizeData(res?.data);
      }
    });

    fetchDataFromApi("/api/product/productRAMS/get").then((res) => {
      if (res?.error === false) {
        setProductRamsData(res?.data);
      }
    });

    fetchDataFromApi("/api/product/productWeight/get").then((res) => {
      if (res?.error === false) {
        setProductWeightData(res?.data);
      }
    });
  }, []);

  const selectedSize = (item) => {
    if (item?.size !== "") return item?.size;
    if (item?.weight !== "") return item?.weight;
    if (item?.ram !== "") return item?.ram;
  };

  // Calcular subtotal, IVA, IT y total
  const items = context.cartData || [];
  let subtotalBOB = 0;
  let totalIva = 0;
  let totalIt = 0;

  items.forEach((it) => {
    const price = Number(it.price) || 0;
    const qty = Number(it.quantity) || 0;
    const itemSubtotal = price * qty;
    subtotalBOB += itemSubtotal;

    if (it.ivaEnabled && it.ivaPct > 0) {
      totalIva += itemSubtotal * (it.ivaPct / 100);
    }
    if (it.itEnabled && it.itPct > 0) {
      totalIt += itemSubtotal * (it.itPct / 100);
    }
  });

  const totalBOB = subtotalBOB + totalIva + totalIt;

  return (
    <section className="section py-4 lg:py-8 pb-10">
      <div className="container w-[80%] max-w-[80%] flex gap-5 flex-col lg:flex-row">
        <div className="leftPart w-full lg:w-[70%]">
          <div className="shadow-md rounded-md bg-white">
            <div className="py-5 px-3 border-b border-[rgba(0,0,0,0.1)]">
              <h2>Tu carrito</h2>
              <p className="mt-0 mb-0">
                Tienes{" "}
                <span className="font-bold text-primary">
                  {context?.cartData?.length}
                </span>{" "}
                productos en tu carrito
              </p>
            </div>

            {context?.cartData?.length !== 0 ? (
              context?.cartData?.map((item, index) => {
                return (
                  <CartItems
                    selected={() => selectedSize(item)}
                    qty={item?.quantity}
                    item={item}
                    key={index}
                    productSizeData={productSizeData}
                    productRamsData={productRamsData}
                    productWeightData={productWeightData}
                  />
                );
              })
            ) : (
              <>
                <div className="flex items-center justify-center flex-col py-10 gap-5">
                  <img src="/empty-cart.png" className="w-[150px]" />
                  <h4>Su carrito está vacío actualmente</h4>
                  <Link to="/"><Button className="btn-org">Continuar comprando</Button></Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="rightPart w-full lg:w-[30%]">
          <div className="shadow-md rounded-md bg-white p-5 sticky top-[155px] z-[90]">
            <h3 className="pb-3">Por pagar</h3>
            <hr />

            <p className="flex items-center justify-between">
              <span className="text-[14px] font-[500]">Subtotal</span>
              <span className="text-primary font-bold">
                {formatPrice(subtotalBOB, "BOB")}
              </span>
            </p>

            <p className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">IVA (13%)</span>
              <span className="text-[13px]">
                {formatPrice(totalIva, "BOB")}
              </span>
            </p>

            <p className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">IT (3%)</span>
              <span className="text-[13px]">
                {formatPrice(totalIt, "BOB")}
              </span>
            </p>

            <p className="flex items-center justify-between">
              <span className="text-[14px] font-[500]">Envio</span>
              <span className="font-bold">Free</span>
            </p>

            <p className="flex items-center justify-between">
              <span className="text-[14px] font-[500]">Destino</span>
              <span className="font-bold">
                {context?.userData?.address_details?.[0]?.country}
              </span>
            </p>

            <hr />

            <p className="flex items-center justify-between">
              <span className="text-[15px] font-[700]">Total</span>
              <span className="text-primary font-bold text-[15px]">
                {formatPrice(totalBOB, "BOB")}
              </span>
            </p>

            <br />

            <Link to="/checkout">
              <Button className="btn-org btn-lg w-full flex gap-2">
                <BsFillBagCheckFill className="text-[20px]" /> Pagar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
