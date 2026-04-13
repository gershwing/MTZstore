import { Button } from '@mui/material'
import React, { useContext, useEffect } from 'react';
import { IoHomeOutline } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { LuHeart } from "react-icons/lu";
import { BsBagCheck } from "react-icons/bs";
import { FiUser } from "react-icons/fi";
import { NavLink } from "react-router";
import { MdOutlineFilterAlt } from "react-icons/md";
import { MyContext } from '../../../App';
import { useLocation } from "react-router-dom";

const MobileNav = () => {

    const context = useContext(MyContext)

    const location = useLocation();

    // Ocultar MobileNav en pagina de producto (tiene su propia barra)
    const isProductPage = location.pathname.startsWith("/product/");

    useEffect(() => {

        if (location.pathname === "/products" || location.pathname === "/search") {
            context?.setisFilterBtnShow(true)
            // Perform your action here
        } else {
            context?.setisFilterBtnShow(false)
        }
    }, [location]);

    const openFilters = () => {
        context?.setOpenFilter(true);
        context?.setOpenSearchPanel(false)
    }


    if (isProductPage) return null;

    return (
        <div className='mobileNav bg-white p-1 px-3 w-full flex items-center justify-between fixed bottom-0 left-0 gap-0 z-[51] border-t border-gray-100'>
            <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "isActive" : "")}
                onClick={() => context?.setOpenSearchPanel(false)}
            >
                <Button className="flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-500 !p-1">
                    <IoHomeOutline size={20} />
                    <span className="text-[9px] leading-tight">Inicio</span>
                </Button>
            </NavLink>

            {
                context?.isFilterBtnShow === true &&
                <Button className="flex-col !w-[36px] !h-[36px] !min-w-[36px] !capitalize !text-gray-700 !bg-primary !rounded-full !p-0" onClick={openFilters}>
                    <MdOutlineFilterAlt size={18} className='text-white' />
                </Button>
            }

            <Button className="flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-500 !p-1"
                onClick={() => context?.setOpenSearchPanel(true)}>
                <IoSearch size={20} />
                <span className='text-[9px] leading-tight'>Buscar</span>
            </Button>

            <NavLink
                to="/my-list"
                className={({ isActive }) => (isActive ? "isActive" : "")}
                onClick={() => context?.setOpenSearchPanel(false)}
            >
                <Button className="flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-500 !p-1">
                    <LuHeart size={20} />
                    <span className="text-[9px] leading-tight">Favoritos</span>
                </Button>
            </NavLink>

            <NavLink
                to="/my-orders"
                className={({ isActive }) => (isActive ? "isActive" : "")}
                onClick={() => context?.setOpenSearchPanel(false)}
            >
                <Button className="flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-500 !p-1">
                    <BsBagCheck size={20} />
                    <span className="text-[9px] leading-tight">Pedidos</span>
                </Button>
            </NavLink>

            <NavLink
                to="/my-account"
                className={({ isActive }) => (isActive ? "isActive" : "")}
                onClick={() => context?.setOpenSearchPanel(false)}
            >
                <Button className="flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-500 !p-1">
                    <FiUser size={20} />
                    <span className="text-[9px] leading-tight">Cuenta</span>
                </Button>
            </NavLink>

        </div>
    )
}

export default MobileNav