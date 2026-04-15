import React, { useContext, useEffect, useRef, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ProductZoom } from "../../components/ProductZoom";
import ProductsSlider from '../../components/ProductsSlider';
import { ProductDetailsComponent } from "../../components/ProductDetails";
import { QtyBox } from "../../components/QtyBox";

import { fetchDataFromApi } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { Button } from "@mui/material";
import { Reviews } from "./reviews";
import { IoStorefrontOutline } from "react-icons/io5";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaCheckDouble, FaRegHeart } from "react-icons/fa";
import { IoMdHeart } from "react-icons/io";
import { FiShare2 } from "react-icons/fi";
import { MyContext } from "../../App";

export const ProductDetails = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [actions, setActions] = useState(null);
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
      <section className="bg-white py-5 pb-[70px] xl:pb-5">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="w-full px-3 flex gap-5 flex-col xl:flex-row items-start">
              {/* Col 1: Imágenes */}
              <div className="productZoomContainer w-full xl:w-[35%]">
                <ProductZoom
                  images={displayImages?.length > 0 ? displayImages : productData?.images}
                  activeIndex={activeImageIndex}
                  onImageClick={(index) => {
                    setActiveImageIndex(index);
                    const variant = imageToVariantMap[index];
                    if (variant) {
                      setVariantFromImage(variant);
                    }
                  }}
                />
              </div>

              {/* Col 2: Detalles del producto */}
              <div className="productContent w-full xl:w-[40%]">
                <ProductDetailsComponent
                  item={productData}
                  variants={variantsData}
                  variantFromImage={variantFromImage}
                  storeInfo={storeInfo}
                  reviewsCount={reviewsCount}
                  gotoReviews={gotoReviews}
                  onActionsReady={setActions}
                  onVariantSelect={(variant) => {
                    if (variant?.images?.length > 0) {
                      const varImg = typeof variant.images[0] === "string" ? variant.images[0] : variant.images[0]?.url;
                      const idx = displayImages.indexOf(varImg);
                      if (idx >= 0) setActiveImageIndex(idx);
                    }
                  }}
                />
              </div>

              {/* Col 3: Panel lateral (estilo AliExpress) */}
              <div className="w-full xl:w-[25%]">
                <div className="sticky top-[80px] space-y-4">
                  {/* Vendedor */}
                  {storeInfo && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <Link
                        to={`/store/${storeInfo._id}`}
                        className="flex items-center gap-3 hover:text-primary transition-all"
                      >
                        <div className="w-[36px] h-[36px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                          {storeInfo.logo ? (
                            <img src={storeInfo.logo} alt={storeInfo.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <IoStorefrontOutline className="text-[18px] text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-[600] text-gray-800">
                            {storeInfo.isPlatformStore ? "MTZstore" : storeInfo.name}
                          </p>
                          <p className="text-[11px] text-gray-500">Ver tienda</p>
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* Envío */}
                  <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    {(() => {
                      const ship = productData?.shipping;
                      const sName = storeInfo?.isPlatformStore ? "MTZstore" : storeInfo?.name;
                      const methods = [];
                      if (ship?.mtzExpress) methods.push({ label: "MTZstore Express", sub: "1-2 días" });
                      if (ship?.mtzStandard) methods.push({ label: "MTZstore Estándar", sub: "3-5 días" });
                      if (ship?.storeExpress) methods.push({ label: (sName || "Tienda") + " Express", sub: "1-2 días" });
                      if (ship?.storeStandard) methods.push({ label: (sName || "Tienda") + " Estándar", sub: "3-5 días" });
                      if (methods.length === 0 && ship?.storeSelf) methods.push({ label: sName || "Tienda", sub: "3-5 días" });
                      if (methods.length === 0) methods.push({ label: sName || "Tienda", sub: "3-5 días" });
                      return methods.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-[13px]">
                          <span className="text-green-600">✓</span>
                          <div>
                            <span className="font-[500]">{m.label}</span>
                            <span className="text-gray-400 ml-1">{m.sub}</span>
                          </div>
                        </div>
                      ));
                    })()}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex items-center gap-2 text-[12px] text-gray-500">
                        <span>🔒</span> <span>Pagos seguros</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-500">
                        <span>🛡️</span> <span>Protección al comprador</span>
                      </div>
                    </div>
                  </div>

                  {/* Cantidad + Acciones */}
                  <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-[13px] font-[600] mb-2">Cantidad</p>
                      <QtyBox
                        handleSelecteQty={(qty) => actions?.setQuantity(qty)}
                        max={actions?.displayStock || 99}
                      />
                    </div>

                    {/* Comprar + Carrito — solo desktop (mobile usa barra fija inferior) */}
                    <div className="hidden xl:block space-y-3">
                      <Button
                        className="w-full !bg-primary !text-white !py-2.5 !font-[600] !normal-case !text-[14px]"
                        disabled={actions?.hasVariants && !actions?.selectedVariant}
                        onClick={() => {
                          if (!context?.isLogin) {
                            context?.alertBox("error", "Inicia sesión para comprar");
                            return;
                          }
                          actions?.addToCart();
                          setTimeout(() => navigate("/checkout"), 500);
                        }}
                      >
                        Comprar
                      </Button>

                      <Button
                        className="w-full !border !border-gray-300 !text-gray-800 !py-2.5 !normal-case !text-[14px] flex gap-2"
                        variant="outlined"
                        disabled={actions?.hasVariants && !actions?.selectedVariant}
                        onClick={() => {
                          if (!context?.isLogin) {
                            context?.alertBox("error", "Inicia sesión para agregar al carrito");
                            return;
                          }
                          actions?.addToCart();
                        }}
                      >
                        {actions?.isLoading ? (
                          <CircularProgress size={18} />
                        ) : actions?.isAdded ? (
                          <><FaCheckDouble /> Agregado</>
                        ) : (
                          <><MdOutlineShoppingCart className="text-[18px]" /> Agregar al carrito</>
                        )}
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 !border !border-gray-200 !text-gray-600 !py-2 !normal-case !text-[12px] flex gap-1"
                        variant="outlined"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: productData?.name, url: window.location.href });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            context?.alertBox("success", "Enlace copiado");
                          }
                        }}
                      >
                        <FiShare2 className="text-[14px]" /> Compartir
                      </Button>
                      <Button
                        className="flex-1 !border !border-gray-200 !text-gray-600 !py-2 !normal-case !text-[12px] flex gap-1"
                        variant="outlined"
                        onClick={() => {
                          if (!context?.isLogin) {
                            context?.alertBox("error", "Inicia sesión");
                            return;
                          }
                          actions?.addToMyList();
                        }}
                      >
                        {actions?.isAddedInMyList ? (
                          <><IoMdHeart className="text-[14px] text-primary" /> Guardado</>
                        ) : (
                          <><FaRegHeart className="text-[14px]" /> Guardar</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

      {/* Barra inferior fija mobile — estilo AliExpress */}
      {!isLoading && productData && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center gap-2 px-3 py-2 z-[100] xl:hidden">
          {/* Tienda */}
          {storeInfo && (
            <Link
              to={`/store/${storeInfo._id}`}
              className="flex flex-col items-center justify-center px-2 text-gray-500"
            >
              <IoStorefrontOutline size={22} />
              <span className="text-[10px]">Tienda</span>
            </Link>
          )}

          {/* Carrito icono */}
          <div className="flex flex-col items-center justify-center px-2 text-gray-500 relative"
            onClick={() => {
              if (!context?.isLogin) { context?.alertBox("error", "Inicia sesión"); return; }
              context.setOpenCartPanel(true);
            }}
          >
            <MdOutlineShoppingCart size={22} />
            {context?.cartData?.length > 0 && (
              <span className="absolute -top-1 -right-0.5 bg-primary text-white text-[9px] w-[16px] h-[16px] rounded-full flex items-center justify-center font-bold">{context.cartData.length}</span>
            )}
            <span className="text-[10px]">Carrito</span>
          </div>

          {/* Agregar al carrito */}
          <button
            className="flex-1 py-2.5 text-gray-800 font-semibold text-[13px] bg-white border-2 border-gray-800 rounded-full active:bg-gray-100 transition-colors"
            onClick={() => {
              if (!context?.isLogin) { context?.alertBox("error", "Inicia sesión"); return; }
              actions?.addToCart();
            }}
          >
            {actions?.isAdded ? "Agregado" : "Agregar al carrito"}
          </button>

          {/* Comprar */}
          <button
            className="flex-1 py-2.5 text-white font-semibold text-[13px] bg-primary rounded-full active:brightness-90 transition-colors"
            onClick={() => {
              if (!context?.isLogin) { context?.alertBox("error", "Inicia sesión"); return; }
              actions?.addToCart();
              setTimeout(() => navigate("/checkout"), 500);
            }}
          >
            Comprar
          </button>
        </div>
      )}
    </>
  );
};
