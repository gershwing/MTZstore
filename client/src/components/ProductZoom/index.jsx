import React, { useContext, useRef, useState, useEffect } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { MyContext } from "../../App";

export const ProductZoom = (props) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const zoomSliderBig = useRef();
  const zoomSliderSml = useRef();
  const context = useContext(MyContext);

  // Sincronizar con activeIndex externo (cuando se selecciona variante)
  useEffect(() => {
    if (props.activeIndex != null && props.activeIndex !== slideIndex) {
      goto(props.activeIndex);
    }
  }, [props.activeIndex]);

  const goto = (index) => {
    setSlideIndex(index);
    try { zoomSliderSml.current?.swiper?.slideTo(index); } catch {}
    try { zoomSliderBig.current?.swiper?.slideTo(index); } catch {}
  };

  const handleThumbClick = (index) => {
    goto(index);
    // Notificar al padre que se hizo clic en este indice
    if (props.onImageClick) props.onImageClick(index);
  };

  const images = props?.images || [];
  if (!images.length) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="slider w-full lg:w-[15%] order-2 lg:order-1">
        <Swiper
          ref={zoomSliderSml}
          direction={context?.windowWidth < 992 ? "horizontal" : "vertical"}
          slidesPerView={5}
          spaceBetween={10}
          navigation={context?.windowWidth < 992 ? false : true}
          modules={[Navigation]}
          className={`zoomProductSliderThumbs h-auto lg:h-[500px] overflow-hidden ${images.length > 5 ? 'space' : ''}`}
        >
          {images.map((item, index) => (
            <SwiperSlide key={index}>
              <div
                className={`item rounded-md overflow-hidden cursor-pointer group h-[100%] border-2 transition-all ${slideIndex === index ? 'opacity-100 border-primary' : 'opacity-50 border-transparent hover:opacity-80'}`}
                onClick={() => handleThumbClick(index)}
              >
                <img src={item} alt="" className="w-full h-full object-cover" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="zoomContainer w-full lg:w-[85%] h-auto lg:h-[500px] overflow-hidden rounded-md order-1 lg:order-2">
        <Swiper
          ref={zoomSliderBig}
          slidesPerView={1}
          spaceBetween={0}
          navigation={false}
        >
          {images.map((item, index) => (
            <SwiperSlide key={index}>
              <InnerImageZoom zoomType="hover" zoomScale={1} src={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};
