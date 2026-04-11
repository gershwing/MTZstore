import Button from "@mui/material/Button";
import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { RiMenu2Fill } from "react-icons/ri";
import { LiaAngleDownSolid } from "react-icons/lia";
import { Link } from "react-router-dom";
import { GoRocket } from "react-icons/go";
import CategoryFlyout from "./CategoryFlyout";
import CategoryDrawerMobile from "./CategoryDrawerMobile";

import "../Navigation/style.css";
import { MyContext } from "../../../App";
import MobileNav from "./MobileNav";

const Navigation = (props) => {
  const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);
  const [catData, setCatData] = useState([]);
  const [hoveredCat, setHoveredCat] = useState(null);
  const [hoveredSubCat, setHoveredSubCat] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [subMenuPos, setSubMenuPos] = useState({ top: 0, left: 0 });
  const closeTimer = useRef(null);

  const context = useContext(MyContext);

  useEffect(() => {
    setCatData(context?.catData);
  }, [context?.catData]);

  useEffect(() => {
    setIsOpenCatPanel(props.isOpenCatPanel);
  }, [props.isOpenCatPanel]);

  const toggleCategoryPanel = () => {
    setIsOpenCatPanel((prev) => !prev);
  };

  const closeCategoryPanel = () => {
    setIsOpenCatPanel(false);
    props.setIsOpenCatPanel(false);
  };

  // Cancelar cierre pendiente
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // Cerrar con delay (da tiempo al cursor para llegar al submenu)
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setHoveredCat(null);
      setHoveredSubCat(null);
    }, 150);
  }, []);

  const handleCatHover = useCallback((e, cat) => {
    cancelClose();
    const rect = e.currentTarget.getBoundingClientRect();
    let left = rect.left;
    const menuWidth = 220;
    if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth - 8;
    setMenuPos({ top: rect.bottom, left });
    setHoveredCat(cat);
    setHoveredSubCat(null);
  }, []);

  const handleSubCatHover = useCallback((e, subCat) => {
    cancelClose();
    const rect = e.currentTarget.getBoundingClientRect();
    let left = rect.right;
    const menuWidth = 200;
    if (left + menuWidth > window.innerWidth) left = rect.left - menuWidth;
    setSubMenuPos({ top: rect.top, left });
    setHoveredSubCat(subCat);
  }, []);

  // Limpiar timer al desmontar
  useEffect(() => () => cancelClose(), []);

  return (
    <>
      <nav className="navigation" onMouseLeave={scheduleClose}>
        <div className="w-full px-3 flex items-center gap-2">
          {/* TODAS LAS CATEGORIAS */}
          {context?.windowWidth > 992 && (
            <div className="shrink-0 relative">
              <Button
                className="!text-black gap-1 whitespace-nowrap !text-[12px] !px-2 !normal-case"
                onClick={toggleCategoryPanel}
              >
                <RiMenu2Fill className="text-[15px]" />
                Todas las categorias
                <LiaAngleDownSolid className={`text-[10px] font-bold transition-transform duration-200 ${isOpenCatPanel ? "rotate-180" : ""}`} />
              </Button>

              {/* Desktop flyout */}
              <CategoryFlyout
                data={catData}
                isOpen={isOpenCatPanel}
                onClose={closeCategoryPanel}
              />
            </div>
          )}

          {/* CATEGORIAS */}
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            <ul className="flex items-center gap-0 whitespace-nowrap">
              <li className="list-none shrink-0">
                <Link to="/">
                  <Button className="!font-[500] !text-[12px] !min-w-0 !px-2 !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-2.5 !normal-case">
                    Inicio
                  </Button>
                </Link>
              </li>

              {catData?.length > 0 && catData.map((cat, index) => (
                <li
                  key={index}
                  className="list-none shrink-0"
                  onMouseEnter={(e) => handleCatHover(e, cat)}
                >
                  <Link to={`/products?catId=${cat?._id}`}>
                    <Button className={`!font-[500] !text-[12px] !min-w-0 !px-2 !py-2.5 !normal-case ${hoveredCat?._id === cat?._id ? '!text-[#ff5252]' : '!text-[rgba(0,0,0,0.8)]'} hover:!text-[#ff5252]`}>
                      {cat?.name}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ENVIO GRATIS */}
          <div className="shrink-0 hidden lg:block">
            <p className="text-[12px] font-[500] flex items-center gap-2 mb-0 mt-0 whitespace-nowrap">
              <GoRocket className="text-[15px]" />
              Envio gratis a nivel local
            </p>
          </div>
        </div>
      </nav>

      {/* ====== SUBMENU NIVEL 2 (fixed, fuera del scroll) ====== */}
      {hoveredCat?.children?.length > 0 && (
        <div
          className="fixed bg-white shadow-lg rounded-md z-[9999] min-w-[220px] max-h-[400px] overflow-y-auto py-1 border"
          style={{ top: menuPos.top, left: menuPos.left }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {hoveredCat.children.map((subCat, idx) => (
            <div
              key={idx}
              className="relative"
              onMouseEnter={(e) => handleSubCatHover(e, subCat)}
            >
              <Link to={`/products?subCatId=${subCat?._id}`} className="block">
                <Button className={`w-full !text-left !justify-start !rounded-none !text-[12px] !normal-case !py-1.5 ${hoveredSubCat?._id === subCat?._id ? '!text-[#ff5252] !bg-gray-50' : '!text-[rgba(0,0,0,0.8)]'} hover:!text-[#ff5252] hover:!bg-gray-50`}>
                  {subCat?.name}
                  {subCat?.children?.length > 0 && <LiaAngleDownSolid className="ml-auto text-[10px] -rotate-90" />}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ====== SUBMENU NIVEL 3 (fixed, fuera del scroll) ====== */}
      {hoveredSubCat?.children?.length > 0 && (
        <div
          className="fixed bg-white shadow-lg rounded-md z-[10000] min-w-[200px] max-h-[350px] overflow-y-auto py-1 border"
          style={{ top: subMenuPos.top, left: subMenuPos.left }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {hoveredSubCat.children.map((thirdCat, idx) => (
            <Link key={idx} to={`/products?thirdLavelCatId=${thirdCat?._id}`} className="block">
              <Button className="w-full !text-left !justify-start !rounded-none !text-[12px] !normal-case !py-1.5 !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] hover:!bg-gray-50">
                {thirdCat?.name}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* Mobile drawer */}
      {context?.windowWidth <= 992 && catData?.length > 0 && (
        <CategoryDrawerMobile
          isOpenCatPanel={isOpenCatPanel}
          setIsOpenCatPanel={setIsOpenCatPanel}
          propsSetIsOpenCatPanel={props.setIsOpenCatPanel}
          data={catData}
        />
      )}

      {context?.windowWidth < 992 && <MobileNav />}
    </>
  );
};

export default Navigation;
