import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

import { Navigation, FreeMode } from "swiper/modules";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";

const HomeCatSlider = (props) => {
  const context = useContext(MyContext);

  return (
    <div className="homeCatSlider pt-0 lg:pt-4 py-4 lg:py-8">
      <div className="w-full px-3">
        <Swiper
          slidesPerView={8}
          spaceBetween={10}
          navigation={context?.windowWidth < 992 ? false : true}
          modules={[Navigation, FreeMode]}
          freeMode={true}
          breakpoints={{
            300: {
              slidesPerView: 4,
              spaceBetween: 5,
            },
            550: {
              slidesPerView: 5,
              spaceBetween: 5,
            },
            900: {
              slidesPerView: 5,
              spaceBetween: 5,
            },
            1100: {
              slidesPerView: 8,
              spaceBetween: 5,
            },
          }}
          className="mySwiper"
        >
          {(props?.data || []).map((cat, index) => {
            const key =
              cat?._id ||
              cat?.id ||
              cat?.slug ||
              `${cat?.name || "cat"}-${index}`;

            return (
              <SwiperSlide key={key}>
                <Link to={`/products?catId=${cat?._id}`}>
                  <div className="item h-[120px] lg:h-[150px] px-3 bg-white rounded-sm text-center flex items-center justify-center flex-col">
                    <img
                      src={cat?.images?.[0]}
                      className="w-[40px] lg:w-[55px] transition-all shrink-0"
                      alt={cat?.name || "category"}
                      loading="lazy"
                    />
                    <h3 className="text-[11px] lg:text-[13px] font-[500] mt-2 leading-tight line-clamp-2">
                      {cat?.name}
                    </h3>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default HomeCatSlider;
