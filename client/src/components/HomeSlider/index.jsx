import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation, Autoplay } from "swiper/modules";
import { MyContext } from "../../App";

const HomeSlider = (props) => {
  const context = useContext(MyContext);

  // Normaliza y revierte solo si hay data
  const slides = Array.isArray(props?.data) ? props.data.slice().reverse() : [];
  const slidesCount = slides.length;

  // ✅ Solo activa loop/autoplay si hay al menos 2 slides
  const canLoop = slidesCount > 1;
  const autoplay = canLoop
    ? { delay: 2500, disableOnInteraction: false }
    : false;

  return (
    <div className="homeSlider pb-3 pt-3 lg:pb-5 lg:pt-5 relative z-[99]">
      <div className="w-full px-3">
        <Swiper
          loop={canLoop}
          spaceBetween={10}
          navigation={context?.windowWidth < 992 ? false : true}
          modules={[Navigation, Autoplay]}
          autoplay={autoplay}
          className="sliderHome"
        >
          {slidesCount > 0 &&
            slides.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="item rounded-[10px] overflow-hidden max-h-[400px]">
                  <img
                    src={item?.images?.[0]}
                    alt="Banner slide"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </div>
  );
};

export default HomeSlider;
