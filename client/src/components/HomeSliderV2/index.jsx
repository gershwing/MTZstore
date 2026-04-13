import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

// import required modules
import { EffectFade, Navigation, Pagination, Autoplay } from "swiper/modules";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import { formatPrice } from "../../utils/formatPrice"; // 👈 NUEVO

const HomeBannerV2 = (props) => {
  const context = useContext(MyContext);

  // normalizamos y filtramos solo items válidos
  const slides = Array.isArray(props?.data)
    ? props.data.filter(
      (item) => item?.isDisplayOnHomeBanner === true && item?.bannerimages?.length > 0
    )
    : [];

  const slidesCount = slides.length;

  // ✅ loop y autoplay solo si hay más de 1 slide
  const canLoop = slidesCount > 1;
  const autoplay = canLoop
    ? { delay: 2500, disableOnInteraction: false }
    : false;

  return (
    <Swiper
      loop={canLoop}
      slidesPerView={1}
      spaceBetween={30}
      effect="fade"
      navigation={context?.windowWidth < 992 ? false : true}
      pagination={{ clickable: true }}
      autoplay={autoplay}
      modules={[EffectFade, Navigation, Pagination, Autoplay]}
      className="homeSliderV2"
    >
      {slides.map((item, index) => (
        <SwiperSlide key={index}>
          <div className="item w-full max-h-[400px] rounded-md overflow-hidden relative">
            <img src={item?.bannerimages?.[0]} className="w-full h-full object-cover" loading="lazy" />

            <div className="info absolute top-0 -right-[100%] opacity-0 w-[50%] h-[100%] z-50 p-8 flex items-center flex-col justify-center transition-all duration-700">
              <h4 className="text-[12px] lg:text-[18px] font-[500] w-full text-left mb-3 relative -right-[100%] opacity-0 hidden lg:block">
                {item?.bannerTitleName}
              </h4>

              {context?.windowWidth < 992 && (
                <h2 className="text-[15px] lg:text-[30px] font-[700] w-full relative -right-[100%] opacity-0">
                  {item?.name?.length > 30 ? item?.name.substr(0, 30) + "..." : item?.name}
                </h2>
              )}

              {context?.windowWidth > 992 && (
                <h2 className="text-[16px] sm:text-[20px] md:text-[25px] lg:text-[30px] font-[700] w-full relative -right-[100%] opacity-0">
                  {item?.name?.length > 70 ? item?.name.substr(0, 70) + "..." : item?.name}
                </h2>
              )}

              <h3 className="flex items-center gap-0 lg:gap-3 text-[12px] lg:text-[18px] font-[500] w-full text-left mt-3 mb-0 lg:mb-3 relative -right-[100%] opacity-0 flex-col lg:flex-row">
                <span className="w-full lg:w-max hidden lg:block">A partir de sólo</span>{" "}
                <span className="text-primary text-[16px] lg:text-[30px] font-[700] block lg:inline w-full lg:w-max">
                  {formatPrice(Number(item?.priceBob ?? item?.price ?? 0), "BOB")}
                </span>
              </h3>

              <div className="w-full relative -right-[100%] opacity-0 btn_">
                <Link to={`/product/${item?._id}`}>
                  <Button className="btn btn-org">COMPRAR AHORA</Button>
                </Link>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HomeBannerV2;
