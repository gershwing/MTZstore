import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { IoCloseSharp } from "react-icons/io5";
import { MyContext } from "../../App";
import { deleteData } from "../../utils/api";
import { formatPrice } from "../../utils/formatPrice";

const MyListItems = ({ item }) => {
  const context = useContext(MyContext);

  const removeItem = async (id) => {
    await deleteData(`/api/myList/${id}`);
    context?.alertBox("success", "Product remove from My List");
    // ⭐ vuelve a cargar en BOB para mantener la vista coherente
    context?.getMyListData?.("BOB");
  };

  // Moneda/precios (prioriza lo que manda el API para visualización)
  const currency = String(item?.displayCurrency ?? item?.currency ?? "BOB").toUpperCase();
  const price = item?.displayPrice ?? item?.price ?? 0;
  const oldPrice = item?.displayOldPrice ?? item?.oldPrice ?? 0;
  const ratingVal = Number.isFinite(Number(item?.rating)) ? Number(item?.rating) : 0;

  const title = item?.productTitle || "";
  const shortTitle = title.length > 80 ? title.slice(0, 80) + "..." : title;

  return (
    <div className="cartItem w-full p-3 flex items-center gap-4 pb-5 border-b border-[rgba(0,0,0,0.1)]">
      <div className="img w-[30%] sm:w-[15%] h-[150px] rounded-md overflow-hidden">
        <Link to={`/product/${item?.productId}`} className="group">
          <img
            src={item?.image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-all"
          />
        </Link>
      </div>

      <div className="info w-full md:w-[85%] relative">
        <IoCloseSharp
          className="cursor-pointer absolute top-[0px] right-[0px] text-[22px] link transition-all"
          onClick={() => removeItem(item?._id)}
          aria-label="Eliminar de Mi Lista"
        />

        <span className="text-[13px]">{item?.brand}</span>

        <h3 className="text-[13px] sm:text-[15px]">
          <Link to={`/product/${item?.productId}`} className="link">
            {shortTitle}
          </Link>
        </h3>

        <Rating name="read-only" value={ratingVal} size="small" readOnly />

        <div className="flex items-center gap-4 mt-2 mb-2">
          <span className="price text-[14px] font-[600]">
            {formatPrice(price, currency)}
          </span>

          {Number(oldPrice) > 0 && (
            <span className="oldPrice line-through text-gray-500 text-[14px] font-[500]">
              {formatPrice(oldPrice, currency)}
            </span>
          )}

          {Number(item?.discount) > 0 && (
            <span className="price text-primary text-[14px] font-[600]">
              {Number(item.discount)}% OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

MyListItems.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    productId: PropTypes.string.isRequired,
    productTitle: PropTypes.string,
    image: PropTypes.string,
    brand: PropTypes.string,
    rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    discount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    // precios base
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    oldPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    currency: PropTypes.string,
    // precios calculados opcionales
    displayPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    displayOldPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    displayCurrency: PropTypes.string,
  }).isRequired,
};

export default MyListItems;

