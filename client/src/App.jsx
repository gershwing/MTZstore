import React, { useEffect, useState, createContext } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import "./responsive.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./Pages/Home";
import ProductListing from "./Pages/ProductListing";
import { ProductDetails } from "./Pages/ProductDetails";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import CartPage from "./Pages/Cart";
import Verify from "./Pages/Verify";
import ForgotPassword from "./Pages/ForgotPassword";
import Checkout from "./Pages/Checkout";
import MyAccount from "./Pages/MyAccount";
import MyList from "./Pages/MyList";
import Orders from "./Pages/Orders";

import toast, { Toaster } from "react-hot-toast";
import { fetchDataFromApi, postData } from "./utils/api";
import Address from "./Pages/MyAccount/address";
import { OrderSuccess } from "./Pages/Orders/success";
import { OrderFailed } from "./Pages/Orders/failed";
import SearchPage from "./Pages/Search";
import StorePage from "./Pages/StorePage";
import SellerApplicationModal from "./components/SellerApplicationModal";

const MyContext = createContext();

function App() {
  const [openProductDetailsModal, setOpenProductDetailsModal] = useState({
    open: false,
    item: {},
  });
  const [isLogin, setIsLogin] = useState(() => {
    const t = localStorage.getItem("accessToken");
    return !!t && t !== "undefined" && t !== "null";
  });
  const [userData, setUserData] = useState(null);
  const [catData, setCatData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [myListData, setMyListData] = useState([]);

  const [openCartPanel, setOpenCartPanel] = useState(false);
  const [openAddressPanel, setOpenAddressPanel] = useState(false);

  const [addressMode, setAddressMode] = useState("add");
  const [addressId, setAddressId] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [openFilter, setOpenFilter] = useState(false);
  const [isFilterBtnShow, setisFilterBtnShow] = useState(false);

  const [openSearchPanel, setOpenSearchPanel] = useState(false);

  const [sellerAppData, setSellerAppData] = useState(null);
  const [showSellerModal, setShowSellerModal] = useState(false);

  const handleOpenProductDetailsModal = (status, item) => {
    setOpenProductDetailsModal({ open: status, item });
  };

  const handleCloseProductDetailsModal = () => {
    setOpenProductDetailsModal({ open: false, item: {} });
  };

  const toggleCartPanel = (newOpen) => () => setOpenCartPanel(newOpen);

  const toggleAddressPanel = (newOpen) => () => {
    if (newOpen === false) setAddressMode("add");
    setOpenAddressPanel(newOpen);
  };

  useEffect(() => {
    localStorage.removeItem("userEmail");
    const token = localStorage.getItem("accessToken");

    if (token === "undefined" || token === "null") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLogin(false);
      return;
    }

    if (token !== undefined && token !== null && token !== "") {
      setIsLogin(true);
      getCartItems();
      getMyListData("BOB"); // ⭐ carga Mi Lista en BOB
      getUserDetails();
    } else {
      setIsLogin(false);
    }
  }, [isLogin]);

  const getUserDetails = () => {
    fetchDataFromApi(`/api/user/user-details`).then((res) => {
      // Manejar errores (axios error o server error)
      if (res?.response?.data?.error === true || res?.error === true) {
        const errMsg = res?.response?.data?.message || res?.message;
        if (errMsg === "You have not login" || errMsg === "No autorizado" || errMsg === "Token inválido o expirado") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          alertBox("error", "Your session is closed please login again");
          setIsLogin(false);
        }
        return;
      }

      // Extraer el user real del wrapper res.ok()
      const user = res?.data?.data?.user || res?.data?.user || res?.data;
      setUserData(user);

      // El modal de vendedor ya NO se abre automáticamente.
      // El usuario puede acceder desde "Ser vendedor" en Mi Cuenta.
    });
  };

  const checkSellerApplication = () => {
    fetchDataFromApi("/api/seller-applications/me").then((res) => {
      if (res?.error === false) {
        const app = res.data;
        if (!app) {
          setSellerAppData(null);
          setShowSellerModal(true);
        } else if (app.status === "PENDING") {
          setSellerAppData(app);
          setShowSellerModal(true);
        } else if (app.status === "REJECTED") {
          setSellerAppData(app);
          setShowSellerModal(true);
        } else {
          setShowSellerModal(false);
        }
      } else {
        setSellerAppData(null);
        setShowSellerModal(true);
      }
    });
  };

  useEffect(() => {
    fetchDataFromApi("/api/category").then((res) => {
      const cats = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
      if (cats.length) setCatData(cats);
    });

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const alertBox = (type, msg) => {
    if (type === "success") toast.success(msg);
    if (type === "error") toast.error(msg);
  };

  const addToCart = (product, userId, quantity) => {
    if (userId === undefined) {
      alertBox("error", "you are not login please login first");
      return false;
    }

    const data = {
      productTitle: product?.name,
      image: product?.image,
      rating: product?.rating,
      price: product?.price,
      oldPrice: product?.oldPrice,
      discount: product?.discount,
      quantity,
      subTotal: parseInt(product?.price * quantity),
      productId: product?._id,
      countInStock: product?.countInStock,
      brand: product?.brand,
      size: product?.size,
      weight: product?.weight,
      ram: product?.ram,
    };

    postData("/api/cart/add", data).then((res) => {
      if (res?.error === false) {
        alertBox("success", res?.message);
        getCartItems();
      } else {
        alertBox("error", res?.message);
      }
    });
  };

  const getCartItems = () => {
    fetchDataFromApi(`/api/cart/get`).then((res) => {
      if (res?.error === false) {
        const items = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
        setCartData(items);
      }
    });
  };

  const getMyListData = (viewerCurrency = "BOB") => {
    fetchDataFromApi(`/api/myList?currency=${viewerCurrency}`).then((res) => {
      if (res?.error === false) {
        const items = Array.isArray(res?.data) ? res.data : (res?.data?.data || res?.data?.items || []);
        setMyListData(items);
      }
    });
  };

  const values = {
    openProductDetailsModal,
    setOpenProductDetailsModal,
    handleOpenProductDetailsModal,
    handleCloseProductDetailsModal,
    setOpenCartPanel,
    toggleCartPanel,
    openCartPanel,
    setOpenAddressPanel,
    toggleAddressPanel,
    openAddressPanel,
    isLogin,
    setIsLogin,
    alertBox,
    setUserData,
    userData,
    setCatData,
    catData,
    addToCart,
    cartData,
    setCartData,
    getCartItems,
    myListData,
    setMyListData,
    getMyListData, // <- expone con moneda
    getUserDetails,
    setAddressMode,
    addressMode,
    addressId,
    setAddressId,
    setSearchData,
    searchData,
    windowWidth,
    setOpenFilter,
    openFilter,
    setisFilterBtnShow,
    isFilterBtnShow,
    setOpenSearchPanel,
    openSearchPanel,
    checkSellerApplication,
    setShowSellerModal,
  };

  return (
    <>
      <BrowserRouter>
        <MyContext.Provider value={values}>
          <Header />
          <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/checkout" element={isLogin ? <Checkout /> : <Navigate to="/" />} />
            <Route path="/my-account" element={isLogin ? <MyAccount /> : <Navigate to="/" />} />
            <Route path="/my-list" element={isLogin ? <MyList /> : <Navigate to="/" />} />
            <Route path="/my-orders" element={isLogin ? <Orders /> : <Navigate to="/" />} />
            <Route path="/order/success" element={<OrderSuccess />} />
            <Route path="/order/failed" element={<OrderFailed />} />
            <Route path="/address" element={isLogin ? <Address /> : <Navigate to="/" />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/store/:id" element={<StorePage />} />
          </Routes>
          <Footer />
          </div>

          <SellerApplicationModal
            open={showSellerModal}
            onClose={() => setShowSellerModal(false)}
            sellerAppData={sellerAppData}
            onSubmitSuccess={(data) => {
              setSellerAppData(data || { status: "PENDING" });
            }}
          />
        </MyContext.Provider>
      </BrowserRouter>

      <Toaster />
    </>
  );
}

export default App;
export { MyContext };
