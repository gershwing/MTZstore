import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { MdOutlineDeleteOutline } from "react-icons/md";
import Button from "@mui/material/Button";
import { MyContext } from "../../App";
import { deleteData } from "../../utils/api";
import { formatPrice } from "../../utils/formatPrice";

const CartPanel = (props) => {
  const context = useContext(MyContext);

  const removeItem = (id) => {
    deleteData(`/api/cart/delete-cart-item/${id}`).then(() => {
      context.alertBox("success", "Item Removed");
      context?.getCartItems();
    });
  };

  // Calcular totales con impuestos
  const items = context.cartData || [];
  let subtotal = 0;
  let totalIva = 0;
  let totalIt = 0;

  items.forEach((it) => {
    const price = Number(it.price) || 0;
    const qty = Number(it.quantity) || 0;
    const itemSubtotal = price * qty;
    subtotal += itemSubtotal;

    if (it.ivaEnabled && it.ivaPct > 0) {
      totalIva += itemSubtotal * (it.ivaPct / 100);
    }
    if (it.itEnabled && it.itPct > 0) {
      totalIt += itemSubtotal * (it.itPct / 100);
    }
  });

  const grandTotal = subtotal + totalIva + totalIt;
  const hasTaxes = totalIva > 0 || totalIt > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Items list */}
      <div className="flex-1 overflow-y-auto py-3 px-4 space-y-3">
        {props?.data?.map((item, index) => {
          const priceBob = Number(item?.price) || 0;

          return (
            <div
              key={item?._id || index}
              className="flex items-start gap-3 pb-3 border-b border-gray-100"
            >
              <div
                className="w-[70px] h-[70px] flex-shrink-0 overflow-hidden rounded-md bg-gray-50"
                onClick={context.toggleCartPanel(false)}
              >
                <Link to={`/product/${item?.productId}`} className="block">
                  <img src={item?.image} className="w-full h-full object-cover" />
                </Link>
              </div>

              <div className="flex-1 min-w-0 pr-6 relative">
                <h4
                  className="text-[13px] font-[500] text-gray-800 truncate"
                  onClick={context.toggleCartPanel(false)}
                >
                  <Link to={`/product/${item?.productId}`} className="hover:text-[#ff5252] transition-colors">
                    {item?.productTitle?.substr(0, 30)}
                  </Link>
                </h4>

                {/* Atributos de variante */}
                {item?.variantAttrs && Object.keys(item.variantAttrs).length > 0 && (
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {Object.entries(item.variantAttrs).map(([k, v]) => `${v}`).join(" / ")}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[12px] text-gray-500">
                    Cant: {item?.quantity}
                  </span>
                  <span className="text-[13px] text-[#ff5252] font-[600]">
                    {formatPrice(priceBob, "BOB")}
                  </span>
                </div>

                <MdOutlineDeleteOutline
                  className="absolute top-0 right-0 cursor-pointer text-[18px] text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => removeItem(item?._id)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 px-4 py-3 space-y-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-600">
            Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})
          </span>
          <span className="text-[13px] font-[600]">
            {formatPrice(subtotal, "BOB")}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">IVA (13%)</span>
          <span className="text-[12px] text-gray-600">
            {formatPrice(totalIva, "BOB")}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">IT (3%)</span>
            <span className="text-[12px] text-gray-600">
              {formatPrice(totalIt, "BOB")}
            </span>
          </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-[14px] font-[700] text-gray-800">Total</span>
          <span className="text-[15px] font-[700] text-[#ff5252]">
            {formatPrice(grandTotal, "BOB")}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Link to="/cart" className="w-[50%]" onClick={context.toggleCartPanel(false)}>
            <Button className="btn-org btn-lg w-full !text-[12px]">Ver Carrito</Button>
          </Link>
          <Link to="/checkout" className="w-[50%]" onClick={context.toggleCartPanel(false)}>
            <Button className="btn-org btn-border btn-lg w-full !text-[12px]">Pagar Ahora</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPanel;
