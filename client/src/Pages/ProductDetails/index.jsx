import React, { useEffect, useRef, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link, useParams } from "react-router-dom";
import { ProductZoom } from "../../components/ProductZoom";
import ProductsSlider from '../../components/ProductsSlider';
import { ProductDetailsComponent } from "../../components/ProductDetails";

import { fetchDataFromApi } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { Reviews } from "./reviews";
import { IoStorefrontOutline } from "react-icons/io5";

export const ProductDetails = () => {

  const [activeTab, setActiveTab] = useState(0);
  const [productData, setProductData] = useState();
  const [variantsData, setVariantsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [relatedProductData, setRelatedProductData] = useState([]);
  const [displayImages, setDisplayImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [imageToVariantMap, setImageToVariantMap] = useState({}); // { imageIndex: variant }
  const [variantFromImage, setVariantFromImage] = useState(null); // variante seleccionada desde imagen
  const [storeInfo, setStoreInfo] = useState(null);

  const { id } = useParams();

  const reviewSec = useRef();

  // Reviews - fix: dependency es [id] no [reviewsCount]
  useEffect(() => {
    if (!id) return;
    fetchDataFromApi(`/api/user/getReviews?productId=${id}`).then((res) => {
      const reviews = res?.reviews || res?.data?.reviews || [];
      setReviewsCount(Array.isArray(reviews) ? reviews.length : 0);
    }).catch(() => {});
  }, [id]);

  // Producto + variantes + relacionados
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    // Usar endpoint publico
    fetchDataFromApi(`/api/product/detail/${id}`).then((res) => {
      const payload = res?.data || res;
      const product = payload?.product;

      if (product) {
        setProductData(product);
        const variants = payload?.variants || [];
        setVariantsData(variants);
        setRelatedProductData(payload?.relatedProducts || []);
        setStoreInfo(payload?.storeInfo || null);

        // Construir galeria: imagenes del producto + imagenes de variantes
        const productImgs = product.images || [];
        const allImages = [...productImgs];
        const imgVarMap = {};

        variants.forEach(v => {
          if (v.images?.length > 0) {
            const img = typeof v.images[0] === "string" ? v.images[0] : v.images[0]?.url;
            if (img && !allImages.includes(img)) {
              imgVarMap[allImages.length] = v; // mapear indice → variante
              allImages.push(img);
            } else if (img) {
              // Ya existe la imagen, mapear el indice existente
              const existIdx = allImages.indexOf(img);
              if (existIdx >= 0) imgVarMap[existIdx] = v;
            }
          }
        });

        setDisplayImages(allImages);
        setImageToVariantMap(imgVarMap);
      }

      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    window.scrollTo(0, 0);
  }, [id]);


  const gotoReviews = () => {
    window.scrollTo({
      top: reviewSec?.current?.offsetTop - 170,
      behavior: 'smooth',
    });
    setActiveTab(1);
  };

  return (
    <>
      <section className="bg-white py-5">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="w-full px-3 flex gap-8 flex-col lg:flex-row items-start lg:items-center">
              <div className="productZoomContainer w-full lg:w-[40%]">
                <ProductZoom
                  images={displayImages?.length > 0 ? displayImages : productData?.images}
                  activeIndex={activeImageIndex}
                  onImageClick={(index) => {
                    // Al clic en thumbnail, si esa imagen pertenece a una variante, seleccionarla
                    setActiveImageIndex(index);
                    const variant = imageToVariantMap[index];
                    if (variant) {
                      setVariantFromImage(variant);
                    }
                  }}
                />
              </div>

              <div className="productContent w-full lg:w-[60%] pr-2 pl-2 lg:pr-10 lg:pl-10">
                <ProductDetailsComponent
                  item={productData}
                  variants={variantsData}
                  variantFromImage={variantFromImage}
                  storeInfo={storeInfo}
                  reviewsCount={reviewsCount}
                  gotoReviews={gotoReviews}
                  onVariantSelect={(variant) => {
                    // Al seleccionar variante por botones, mover galeria a su imagen
                    if (variant?.images?.length > 0) {
                      const varImg = typeof variant.images[0] === "string" ? variant.images[0] : variant.images[0]?.url;
                      const idx = displayImages.indexOf(varImg);
                      if (idx >= 0) setActiveImageIndex(idx);
                    }
                  }}
                />
              </div>
            </div>

            {/* Store button */}
            {storeInfo && (
              <div className="w-full px-3 pt-6">
                <Link
                  to={`/store/${storeInfo._id}`}
                  className="inline-flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 hover:shadow-md transition-all hover:border-primary group"
                >
                  <div className="w-[42px] h-[42px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                    {storeInfo.logo ? (
                      <img
                        src={storeInfo.logo}
                        alt={storeInfo.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <IoStorefrontOutline className="text-[20px] text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-[14px] font-[600] text-gray-800 group-hover:text-primary transition-all">
                      {storeInfo.isPlatformStore ? "MTZstore" : storeInfo.name}
                    </p>
                    <p className="text-[12px] text-gray-500">Ver tienda</p>
                  </div>
                </Link>
              </div>
            )}

            <div className="w-full px-3 pt-10">
              <div className="flex items-center gap-8 mb-5">
                <span
                  className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 0 && "text-primary"}`}
                  onClick={() => setActiveTab(0)}
                >
                  Descripcion
                </span>

                <span
                  className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 1 && "text-primary"}`}
                  onClick={() => setActiveTab(1)}
                  ref={reviewSec}
                >
                  Resenas ({reviewsCount})
                </span>
              </div>

              {activeTab === 0 && (
                <div className="shadow-md w-full py-5 px-8 rounded-md text-[14px]">
                  {productData?.description}
                </div>
              )}

              {activeTab === 1 && (
                <div className="shadow-none lg:shadow-md w-full sm:w-[80%] py-0 lg:py-5 px-0 lg:px-8 rounded-md">
                  {productData?._id && <Reviews productId={productData._id} setReviewsCount={setReviewsCount} />}
                </div>
              )}
            </div>

            {relatedProductData?.length > 0 && (
              <div className="w-full px-3 pt-8">
                <h2 className="text-[20px] font-[600] pb-0">Productos relacionados</h2>
                <ProductsSlider items={6} data={relatedProductData} />
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
};
