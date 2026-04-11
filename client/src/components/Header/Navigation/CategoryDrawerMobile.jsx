import React, { useContext, useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Collapse from "@mui/material/Collapse";
import { IoCloseSharp } from "react-icons/io5";
import { LiaAngleDownSolid } from "react-icons/lia";
import { Button } from "@mui/material";
import { MyContext } from "../../../App";
import { Link } from "react-router-dom";
import { fetchDataFromApi } from "../../../utils/api";
import { getCategoryIcon } from "../../../utils/categoryIcons";

const CategoryDrawerMobile = ({ isOpenCatPanel, setIsOpenCatPanel, propsSetIsOpenCatPanel, data }) => {
  const [expandedL1, setExpandedL1] = useState(null);
  const [expandedL2, setExpandedL2] = useState(null);
  const context = useContext(MyContext);

  const closeDrawer = () => {
    setIsOpenCatPanel(false);
    propsSetIsOpenCatPanel(false);
  };

  const toggleL1 = (idx) => {
    setExpandedL1(expandedL1 === idx ? null : idx);
    setExpandedL2(null);
  };

  const toggleL2 = (idx) => {
    setExpandedL2(expandedL2 === idx ? null : idx);
  };

  const handleLogout = () => {
    closeDrawer();
    fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem("accessToken")}`, { withCredentials: true }).then((res) => {
      if (res?.error === false) {
        context.setIsLogin(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        context.setUserData(null);
        context?.setCartData([]);
        context?.setMyListData([]);
      }
    });
  };

  return (
    <Drawer open={isOpenCatPanel} onClose={closeDrawer}>
      <Box sx={{ width: 300 }} className="categoryPanel flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-[16px] font-[600] text-gray-800">Categorias</h3>
          <IoCloseSharp
            onClick={closeDrawer}
            className="cursor-pointer text-[22px] text-gray-500 hover:text-gray-800 transition-colors"
          />
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto py-2">
          {data?.map((cat, idx) => {
            const Icon = getCategoryIcon(cat?.name);
            const isExpanded = expandedL1 === idx;
            const hasChildren = cat?.children?.length > 0;

            return (
              <div key={idx}>
                {/* L1 row */}
                <div className="flex items-center px-4 py-[10px] cursor-pointer hover:bg-gray-50 transition-colors">
                  <Link
                    to={`/products?catId=${cat?._id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={closeDrawer}
                  >
                    <Icon className="text-[18px] text-gray-500 flex-shrink-0" />
                    <span className="text-[13px] font-[500] text-gray-700 truncate">
                      {cat?.name}
                    </span>
                  </Link>
                  {hasChildren && (
                    <div
                      className="w-[30px] h-[30px] flex items-center justify-center"
                      onClick={() => toggleL1(idx)}
                    >
                      <LiaAngleDownSolid
                        className={`text-[12px] text-gray-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* L2 children */}
                {hasChildren && (
                  <Collapse in={isExpanded}>
                    <div className="ml-4 border-l-2 border-gray-100">
                      {cat.children.map((subCat, idx2) => {
                        const isL2Expanded = expandedL2 === `${idx}-${idx2}`;
                        const hasL3 = subCat?.children?.length > 0;

                        return (
                          <div key={idx2}>
                            <div className="flex items-center px-4 py-[8px] cursor-pointer hover:bg-gray-50 transition-colors">
                              <Link
                                to={`/products?subCatId=${subCat?._id}`}
                                className="flex-1 min-w-0"
                                onClick={closeDrawer}
                              >
                                <span className="text-[12px] font-[500] text-gray-600 truncate block">
                                  {subCat?.name}
                                </span>
                              </Link>
                              {hasL3 && (
                                <div
                                  className="w-[26px] h-[26px] flex items-center justify-center"
                                  onClick={() => toggleL2(`${idx}-${idx2}`)}
                                >
                                  <LiaAngleDownSolid
                                    className={`text-[10px] text-gray-400 transition-transform duration-200 ${
                                      isL2Expanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </div>
                              )}
                            </div>

                            {/* L3 children */}
                            {hasL3 && (
                              <Collapse in={isL2Expanded}>
                                <div className="ml-4 pb-1">
                                  {subCat.children.map((thirdCat, idx3) => (
                                    <Link
                                      key={idx3}
                                      to={`/products?thirdLavelCatId=${thirdCat?._id}`}
                                      className="block px-4 py-[6px] text-[11px] text-gray-500 hover:text-[#ff5252] transition-colors"
                                      onClick={closeDrawer}
                                    >
                                      {thirdCat?.name}
                                    </Link>
                                  ))}
                                </div>
                              </Collapse>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Collapse>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer - Login/Logout */}
        <div className="border-t border-gray-100 p-3">
          {context?.isLogin === false && (
            <Link to="/login" onClick={closeDrawer}>
              <Button className="btn-org w-full">Iniciar Sesion</Button>
            </Link>
          )}
          {context?.isLogin === true && (
            <div onClick={handleLogout}>
              <Button className="btn-org w-full">Cerrar Sesion</Button>
            </div>
          )}
        </div>
      </Box>
    </Drawer>
  );
};

export default CategoryDrawerMobile;
