import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import ProductItem from "../../components/ProductItem";
import CircularProgress from "@mui/material/CircularProgress";
import { IoStorefrontOutline } from "react-icons/io5";

const StorePage = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetchDataFromApi(`/api/product/store/${id}?page=${page}&limit=24`).then((res) => {
      const payload = res?.data || res;
      if (payload?.store) {
        setStore(payload.store);
        setProducts(payload.products || []);
        setTotalPages(payload.totalPages || 1);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
    window.scrollTo(0, 0);
  }, [id, page]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-lg">Tienda no encontrada</p>
      </div>
    );
  }

  return (
    <section className="bg-white pb-8">
      {/* Banner */}
      <div className="w-full h-[200px] md:h-[280px] bg-gray-100 relative overflow-hidden">
        {store.banner ? (
          <img
            src={store.banner}
            alt={store.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300" />
        )}
      </div>

      {/* Store info */}
      <div className="w-full px-4 md:px-8 -mt-12 relative z-10">
        <div className="flex items-end gap-4 mb-4">
          {/* Logo */}
          <div className="w-[90px] h-[90px] rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <IoStorefrontOutline className="text-[40px] text-gray-400" />
            )}
          </div>

          <div className="pb-1">
            <h1 className="text-[22px] md:text-[28px] font-[700] text-gray-800 leading-tight">
              {store.isPlatformStore ? "MTZstore" : store.name}
            </h1>
            {store.category && (
              <span className="text-[13px] text-gray-500">
                {store.category.name}
              </span>
            )}
          </div>
        </div>

        {store.description && (
          <p className="text-[14px] text-gray-600 mb-6 max-w-[700px]">
            {store.description}
          </p>
        )}
      </div>

      {/* Products grid */}
      <div className="w-full px-4 md:px-8 mt-4">
        <h2 className="text-[18px] font-[600] mb-4 text-gray-800">
          Productos de esta tienda ({products.length})
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            Esta tienda aun no tiene productos publicados.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {products.map((item) => (
              <ProductItem key={item._id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-[36px] h-[36px] rounded-full text-[14px] font-[500] transition-all ${
                  p === page
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default StorePage;
