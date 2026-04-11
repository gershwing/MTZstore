// admin/src/Pages/Dashboard/DashboardBoxes.jsx
import React, { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import { Navigation, FreeMode } from "swiper/modules";
import { GoGift } from "react-icons/go";
import { IoStatsChartSharp } from "react-icons/io5";
import { FiPieChart } from "react-icons/fi";
import { RiProductHuntLine } from "react-icons/ri";
import { MdOutlineReviews } from "react-icons/md";
import UIContext from "../../context/UIContext";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";

const DashboardBoxes = (props) => {
  const ui = useContext(UIContext) || {};
  const navigate = useNavigate();

  // ===== Auth
  const { isSuper = false, authReady = false } = (useAuth?.() || {});

  // ===== Contadores
  const [counts, setCounts] = useState({
    users: props?.users ?? null,
    orders: props?.orders ?? null,
    products: props?.products ?? null,
    categories: props?.category ?? null,
  });

  // ===== storeId reactivo (lee de localStorage y escucha eventos)
  const [storeId, setStoreId] = useState(() => {
    try {
      return localStorage.getItem("X-Store-Id") || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    const update = () => {
      try {
        const sid = localStorage.getItem("X-Store-Id") || "";
        setStoreId((prev) => {
          if (prev === sid) return prev;
          return sid;
        });
        // Si cambia de tenant, resetea contadores para forzar refetch
        setCounts((c) => ({
          users: null,
          orders: null,
          products: null,
          categories: null,
        }));
      } catch { }
    };
    try {
      window.addEventListener("tenant:changed", update);
      window.addEventListener("auth:updated", update);
    } catch { }
    return () => {
      try {
        window.removeEventListener("tenant:changed", update);
        window.removeEventListener("auth:updated", update);
      } catch { }
    };
  }, []);

  // ===== Carga protegida: sólo cuando hay auth y (tenant o super)
  useEffect(() => {
    if (!authReady) return;              // todavía no hay sesión estable
    if (!isSuper && !storeId) return;    // sin tenant => no dispares

    // ¿Ya tenemos todos los datos por props o en state?
    const needUsers = isSuper && counts.users == null;
    const needOrders = isSuper && counts.orders == null;
    const needProducts = counts.products == null;
    const needCategories = counts.categories == null;
    if (!needUsers && !needOrders && !needProducts && !needCategories) return;

    const headers = storeId ? { "X-Store-Id": storeId } : {};
    const pickCount = (res) => {
      if (!res) return null;
      return (
        res?.count ??
        res?.total ??
        res?.data?.count ??
        res?.data?.total ??
        (Array.isArray(res?.data) ? res.data.length : null)
      );
    };
    const call = async (path) => {
      try {
        const sep = path.includes("?") ? "&" : "?";
        const r = await fetchDataFromApi(`${path}${sep}_ts=${Date.now()}`, { headers });
        return pickCount(r);
      } catch {
        return null;
      }
    };

    let cancelled = false;
    (async () => {
      const [
        u1, u2,
        o1, o2,
        p1, p2,
        c1, c2,
      ] = await Promise.allSettled([
        needUsers ? call("/api/users/count") : null,
        needUsers ? call("/api/user/count") : null,

        needOrders ? call("/api/order/count") : null,
        needOrders ? call("/api/orders/count") : null,

        needProducts ? call("/api/product/count") : null,
        needProducts ? call("/api/products/count") : null,

        needCategories ? call("/api/category/get/count") : null,
        needCategories ? call("/api/categories/count") : null,
      ]);

      if (cancelled) return;
      const pick = (s) => (s?.status === "fulfilled" ? s.value : null);
      setCounts((prev) => ({
        users: prev.users ?? (pick(u1) ?? pick(u2)),
        orders: prev.orders ?? (pick(o1) ?? pick(o2)),
        products: prev.products ?? (pick(p1) ?? pick(p2)),
        categories: prev.categories ?? (pick(c1) ?? pick(c2)),
      }));
    })();

    return () => {
      cancelled = true;
    };
    // Nota: dependemos de authReady/isSuper/storeId + flags de counts
  }, [authReady, isSuper, storeId, counts.users, counts.orders, counts.products, counts.categories]);

  const fmt = (n) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString() : "–");

  return (
    <Swiper
      slidesPerView={4}
      spaceBetween={10}
      navigation={(ui?.windowWidth ?? 1200) >= 1100}
      modules={[Navigation, FreeMode]}
      freeMode
      breakpoints={{
        300: { slidesPerView: 1, spaceBetween: 10 },
        550: { slidesPerView: 2, spaceBetween: 10 },
        900: { slidesPerView: 3, spaceBetween: 10 },
        1100: { slidesPerView: 4, spaceBetween: 10 },
      }}
      className="dashboardBoxesSlider mb-5"
    >
      <SwiperSlide>
        <div
          className="box bg-[#10b981] p-5 py-6 cursor-pointer hover:bg-[#289974] rounded-md border border-[rgba(0,0,0,0.1)] flex items-center gap-4"
          onClick={() => navigate("/admin/users")}
        >
          <FiPieChart className="text-[40px] text-[#fff]" />
          <div className="info w-[80%]">
            <h3 className="text-white">Total de usuarios</h3>
            <b className="text-white text-[20px]">{fmt(counts.users)}</b>
          </div>
          <IoStatsChartSharp className="text-[45px] text-[#fff]" />
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div
          className="box bg-[#3872fa] p-5 py-6 cursor-pointer hover:bg-[#346ae8] rounded-md border border-[rgba(0,0,0,0.1)] flex items-center gap-4"
          onClick={() => navigate("/admin/orders")}
        >
          <GoGift className="text-[40px] text-[#fff]" />
          <div className="info w-[80%]">
            <h3 className="text-white">Total de pedidos</h3>
            <b className="text-white text-[20px]">{fmt(counts.orders)}</b>
          </div>
          <FiPieChart className="text-[40px] text-[#fff]" />
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div
          className="box p-5 bg-[#312be1d8] py-6 cursor-pointer hover:bg-[#423eadd8] rounded-md border border-[rgba(0,0,0,0.1)] flex items-center gap-4"
          onClick={() => navigate("/admin/products")}
        >
          <RiProductHuntLine className="text-[40px] text-[#fff]" />
          <div className="info w-[80%]">
            <h3 className="text-white">Total de productos</h3>
            <b className="text-white text-[20px]">{fmt(counts.products)}</b>
          </div>
          <IoStatsChartSharp className="text-[50px] text-[#fff]" />
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div
          className="box p-5 bg-[#f22c61] py-6 cursor-pointer hover:bg-[#d52c59] rounded-md border border-[rgba(0,0,0,0.1)] flex items-center gap-4"
          onClick={() => navigate("/admin/categories")}
        >
          <MdOutlineReviews className="text-[40px] text-[#fff]" />
          <div className="info w-[80%]">
            <h3 className="text-white">Total de categorías</h3>
            <b className="text-white text-[20px]">{fmt(counts.categories)}</b>
          </div>
          <IoStatsChartSharp className="text-[50px] text-[#fff]" />
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default DashboardBoxes;
