import React, { useContext, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Search from "../Search";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa6";
import Tooltip from "@mui/material/Tooltip";
import Navigation from "./Navigation";
import { MyContext } from "../../App";
import { Button, CircularProgress } from "@mui/material";
import { FaRegUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IoBagCheckOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import { fetchDataFromApi, postData } from "../../utils/api";
import { LuMapPin } from "react-icons/lu";
import { useEffect } from "react";
import { HiOutlineMenu } from "react-icons/hi";
import { googleSignInInteractive } from "../../firebase";


const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);

  // Login dropdown state
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const loginRef = useRef(null);
  const loginTimeout = useRef(null);

  const context = useContext(MyContext);
  const history = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Logo fetch only (no forced redirect)
  useEffect(() => {
    fetchDataFromApi("/api/logo").then((res) => {
      localStorage.setItem('logo', res?.logo?.[0]?.logo || '');
    });
  }, []);

  // Login dropdown hover handlers
  const openLoginDropdown = () => {
    clearTimeout(loginTimeout.current);
    setLoginOpen(true);
  };
  const closeLoginDropdown = () => {
    loginTimeout.current = setTimeout(() => setLoginOpen(false), 200);
  };

  // Close login dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) {
        setLoginOpen(false);
      }
    };
    if (loginOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [loginOpen]);

  // Login submit from dropdown
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      context?.alertBox("error", "Ingresa correo y contraseña");
      return;
    }
    setLoginLoading(true);
    const res = await postData("/api/user/login", { email: loginEmail, password: loginPassword }, { withCredentials: true });
    if (res?.error !== true) {
      localStorage.setItem("accessToken", res?.data?.accessToken);
      localStorage.setItem("refreshToken", res?.data?.refreshToken);
      context.setIsLogin(true);
      setLoginOpen(false);
      setLoginEmail("");
      setLoginPassword("");
      context?.alertBox("success", res?.message);
    } else {
      context?.alertBox("error", res?.message);
    }
    setLoginLoading(false);
  };

  // Google login from dropdown
  const handleGoogleLogin = async () => {
    try {
      const result = await googleSignInInteractive();
      if (!result) return;
      const user = result.user;
      const fields = {
        name: user.providerData[0].displayName,
        email: user.providerData[0].email,
        password: null,
        avatar: user.providerData[0].photoURL,
        mobile: user.providerData[0].phoneNumber,
        role: "USER"
      };
      const res = await postData("/api/user/authWithGoogle", fields);
      if (res?.error !== true) {
        localStorage.setItem("accessToken", res?.data?.accessToken);
        localStorage.setItem("refreshToken", res?.data?.refreshToken);
        context.setIsLogin(true);
        setLoginOpen(false);
        context?.alertBox("success", res?.message);
      } else {
        context?.alertBox("error", res?.message);
      }
    } catch {
      context?.alertBox("error", "Error al iniciar sesión con Google");
    }
  };

  const logout = () => {
    setAnchorEl(null);
    fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem('accessToken')}`, { withCredentials: true }).then((res) => {
      if (res?.error === false) {
        context.setIsLogin(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        context.setUserData(null);
        context?.setCartData([]);
        context?.setMyListData([]);
        history("/");
      }
    });
  };

  return (
    <>
      <header className="bg-white fixed lg:sticky left-0 w-full top-0 lg:-top-[47px] z-[101]">
        <div className="top-strip hidden lg:block py-2 border-t-[1px] border-gray-250  border-b-[1px]">
          <div className="container">
            <div className="flex items-center justify-between">
              <div className="col1 w-[50%] hidden lg:block">
                <p className="text-[12px] font-[500] mt-0 mb-0">
                  Obtenga hasta un 50 % de descuento en productos de remate, solo por tiempo limitado
                </p>
              </div>

              <div className="col2 flex items-center justify-between w-full lg:w-[50%] lg:justify-end">
                <ul className="flex items-center gap-3 w-full justify-between lg:w-[200px]">
                  <li className="list-none">
                    <Link
                      to="/help-center"
                      className="text-[11px] lg:text-[13px] link font-[500] transition"
                    >
                      Ayuda{" "}
                    </Link>
                  </li>
                  <li className="list-none">
                    <Link
                      to="/order-tracking"
                      className="text-[11px] lg:text-[13px] link font-[500] transition"
                    >
                      Seguimiento
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="header py-2 lg:py-4 border-b-[1px] border-gray-250">
          <div className="container flex items-center justify-between">
            {
              context?.windowWidth < 992 &&
              <Button className="!w-[35px] !min-w-[35px] !h-[35px] !rounded-full !text-gray-800" onClick={() => setIsOpenCatPanel(true)}><HiOutlineMenu size={22} /></Button>
            }

            <div className="col1 w-[40%] lg:w-[25%]">
              <Link to={"/"}>
                <img src={localStorage.getItem('logo')} className="max-w-[140px] lg:max-w-[200px]" />
              </Link>
            </div>

            <div className={`col2 fixed top-0 left-0 w-full h-full lg:w-[40%] lg:static p-2 lg:p-0 bg-white z-50 ${context?.windowWidth > 992 && '!block'} ${context?.openSearchPanel === true ? 'block' : 'hidden'}`}>
              <Search />
            </div>

            <div className="col3 w-[10%] lg:w-[30%] flex items-center pl-7">
              <ul className="flex items-center justify-end gap-0 lg:gap-3 w-full">
                {/* Usuario: dropdown login o menú de cuenta */}
                {context?.windowWidth > 992 && (
                  <li className="relative">
                    {context.isLogin === false ? (
                      /* ── No autenticado: icono + dropdown login ── */
                      <div
                        ref={loginRef}
                        onMouseEnter={openLoginDropdown}
                        onMouseLeave={closeLoginDropdown}
                      >
                        <Button
                          className="!text-[#000] flex items-center gap-2 cursor-pointer"
                          onClick={() => setLoginOpen(!loginOpen)}
                        >
                          <FaRegUser className="text-[17px] text-[rgba(0,0,0,0.7)]" />
                          <span className="text-[14px] font-[500] normal-case">Iniciar sesión</span>
                        </Button>

                        {loginOpen && (
                          <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-lg shadow-2xl border border-gray-200 p-5 z-[200]">
                            {/* Flecha */}
                            <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45" />

                            <h3 className="text-[16px] font-[600] mb-4">Inicia sesión en tu cuenta</h3>

                            <form onSubmit={handleLoginSubmit} className="space-y-3">
                              <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2.5 text-[14px] focus:outline-none focus:border-primary"
                                autoComplete="email"
                              />
                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Contraseña"
                                  value={loginPassword}
                                  onChange={(e) => setLoginPassword(e.target.value)}
                                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-[14px] focus:outline-none focus:border-primary pr-10"
                                  autoComplete="current-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                  {showPassword ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
                                </button>
                              </div>

                              <Button
                                type="submit"
                                disabled={loginLoading}
                                className="btn-org w-full !py-2.5 flex gap-2"
                              >
                                {loginLoading ? <CircularProgress size={18} color="inherit" /> : "Iniciar sesión"}
                              </Button>
                            </form>

                            <div className="flex items-center justify-between mt-3 text-[13px]">
                              <Link to="/register" className="text-primary font-[500]" onClick={() => setLoginOpen(false)}>
                                Crear cuenta
                              </Link>
                              <Link to="/login" className="text-gray-500 hover:text-primary" onClick={() => setLoginOpen(false)}>
                                Olvidé mi contraseña
                              </Link>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Button
                                className="w-full !bg-gray-100 !text-black !py-2 flex gap-2 !normal-case"
                                onClick={handleGoogleLogin}
                              >
                                <FcGoogle size={18} /> Iniciar sesión con Google
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* ── Autenticado: menú de cuenta ── */
                      <>
                        <Button
                          className="!text-[#000] myAccountWrap flex items-center gap-3 cursor-pointer"
                          onClick={handleClick}
                        >
                          <div className="!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !bg-gray-200 flex items-center justify-center">
                            <FaRegUser className="text-[17px] text-[rgba(0,0,0,0.7)]" />
                          </div>
                          <div className="info flex flex-col">
                            <h4 className="leading-3 text-[14px] text-[rgba(0,0,0,0.6)] font-[500] mb-0 capitalize text-left justify-start">
                              {context?.userData?.name}
                            </h4>
                            <span className="text-[13px] text-[rgba(0,0,0,0.6)] font-[400] capitalize text-left justify-start">
                              {context?.userData?.email}
                            </span>
                          </div>
                        </Button>

                        <Menu
                          anchorEl={anchorEl}
                          id="account-menu"
                          open={open}
                          onClose={handleClose}
                          onClick={handleClose}
                          slotProps={{
                            paper: {
                              elevation: 0,
                              sx: {
                                overflow: "visible",
                                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                                mt: 1.5,
                                "&::before": {
                                  content: '""',
                                  display: "block",
                                  position: "absolute",
                                  top: 0,
                                  right: 14,
                                  width: 10,
                                  height: 10,
                                  bgcolor: "background.paper",
                                  transform: "translateY(-50%) rotate(45deg)",
                                  zIndex: 0,
                                },
                              },
                            },
                          }}
                          transformOrigin={{ horizontal: "right", vertical: "top" }}
                          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                        >
                          <Link to="/my-account" className="w-full block">
                            <MenuItem onClick={handleClose} className="flex gap-2 !py-2">
                              <FaRegUser className="text-[18px]" />
                              <span className="text-[14px]">Mi cuenta</span>
                            </MenuItem>
                          </Link>
                          <Link to="/address" className="w-full block">
                            <MenuItem onClick={handleClose} className="flex gap-2 !py-2">
                              <LuMapPin className="text-[18px]" />
                              <span className="text-[14px]">Dirección</span>
                            </MenuItem>
                          </Link>
                          <Link to="/my-orders" className="w-full block">
                            <MenuItem onClick={handleClose} className="flex gap-2 !py-2">
                              <IoBagCheckOutline className="text-[18px]" />
                              <span className="text-[14px]">Pedidos</span>
                            </MenuItem>
                          </Link>
                          <Link to="/my-list" className="w-full block">
                            <MenuItem onClick={handleClose} className="flex gap-2 !py-2">
                              <IoMdHeartEmpty className="text-[18px]" />
                              <span className="text-[14px]">Lista de deseos</span>
                            </MenuItem>
                          </Link>
                          <MenuItem onClick={logout} className="flex gap-2 !py-2">
                            <IoIosLogOut className="text-[18px]" />
                            <span className="text-[14px]">Cerrar Sesión</span>
                          </MenuItem>
                        </Menu>
                      </>
                    )}
                  </li>
                )}

                {
                  context?.windowWidth > 992 &&
                  <li>
                    <Tooltip title="Wishlist">
                      {context.isLogin ? (
                        <Link to="/my-list">
                          <IconButton aria-label="wishlist">
                            <StyledBadge badgeContent={context?.myListData?.length || 0} color="secondary">
                              <FaRegHeart />
                            </StyledBadge>
                          </IconButton>
                        </Link>
                      ) : (
                        <IconButton aria-label="wishlist" onClick={openLoginDropdown}>
                          <FaRegHeart />
                        </IconButton>
                      )}
                    </Tooltip>
                  </li>
                }

                <li>
                  <Tooltip title="Cart">
                    <IconButton
                      aria-label="cart"
                      onClick={() => {
                        if (context.isLogin) {
                          context.setOpenCartPanel(true);
                        } else {
                          openLoginDropdown();
                        }
                      }}
                    >
                      <StyledBadge badgeContent={context.isLogin ? (context?.cartData?.length || 0) : 0} color="secondary">
                        <MdOutlineShoppingCart />
                      </StyledBadge>
                    </IconButton>
                  </Tooltip>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Navigation isOpenCatPanel={isOpenCatPanel} setIsOpenCatPanel={setIsOpenCatPanel} />
      </header>

      <div className="afterHeader mt-[115px] lg:mt-0"></div>
    </>
  );
};

export default Header;
