import React from "react";
import "../bannerBoxV2/style.css";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatPrice"; // ✅ mostrar siempre en BOB

const BannerBoxV2 = (props) => {
  // ✅ Tomar BOB si viene del back, si no cae a price
  const unitBob = Number(props?.item?.priceBob ?? props?.item?.price ?? 0);

  return (
    <div className="bannerBoxV2 box w-full overflow-hidden rounded-md group relative">
      <img
        src={props.image}
        className="w-full transition-all duration-150 group-hover:scale-105"
      />

      <div
        className={`info absolute p-5 top-0 ${props.info === "left" ? "left-0" : "right-0"
          } w-[70%] h-[100%] z-50 flex items-center justify-center flex-col gap-2
         ${props.info === "left" ? "" : "pl-16"}`}
      >
        <h2 className="text-[14px] md:text-[18px] font-[600]">
          {props?.item?.bannerTitle}
        </h2>

        {/* ✅ Precio siempre en BOB */}
        <span className="text-[20px] text-primary font-[600] w-full">
          {formatPrice(unitBob, "BOB")}
        </span>

        <div className="w-full">
          {props?.item?.subCatId !== undefined && props?.item?.subCatId !== null ? (
            <Link
              to={`/products?subCatId=${props?.item?.subCatId}`}
              className="text-[16px] font-[600] link"
            >
              COMPRA AHORA
            </Link>
          ) : (
            <Link
              to={`/products?catId=${props?.item?.catId}`}
              className="text-[16px] font-[600] link"
            >
              CAOMPRA AHORA
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerBoxV2;
