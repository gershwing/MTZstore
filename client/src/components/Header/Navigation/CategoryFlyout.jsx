import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { LiaAngleRightSolid } from "react-icons/lia";
import { getCategoryIcon } from "../../../utils/categoryIcons";

const CategoryFlyout = ({ data, isOpen, onClose }) => {
  const [hoveredL1, setHoveredL1] = useState(null);
  const [topOffset, setTopOffset] = useState(0);
  const closeTimer = useRef(null);
  const flyoutRef = useRef(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose, cancelClose]);

  // Click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Reset hover when closing + calculate top offset
  useEffect(() => {
    if (!isOpen) {
      setHoveredL1(null);
    } else if (flyoutRef.current?.parentElement) {
      const rect = flyoutRef.current.parentElement.getBoundingClientRect();
      setTopOffset(rect.bottom);
    }
  }, [isOpen]);

  // Cleanup timer
  useEffect(() => () => cancelClose(), [cancelClose]);

  if (!isOpen || !data?.length) return null;

  const handleNavigate = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/10 z-[9998]"
        onClick={onClose}
      />

      {/* Flyout container */}
      <div
        ref={flyoutRef}
        className="fixed left-0 bottom-0 flex bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] z-[9999] category-flyout"
        style={{ top: topOffset }}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        {/* L1 - Left panel */}
        <div className="w-[260px] border-r border-gray-100 overflow-y-auto py-2">
          {data.map((cat, idx) => {
            const Icon = getCategoryIcon(cat?.name);
            const isActive = hoveredL1?._id === cat?._id;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-[10px] cursor-pointer transition-colors duration-150 ${
                  isActive ? "bg-gray-50 text-[#ff5252]" : "text-gray-700 hover:bg-gray-50 hover:text-[#ff5252]"
                }`}
                onMouseEnter={() => setHoveredL1(cat)}
              >
                <Link
                  to={`/products?catId=${cat?._id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={handleNavigate}
                >
                  <Icon className="text-[18px] flex-shrink-0 opacity-70" />
                  <span className="text-[13px] font-[500] truncate">{cat?.name}</span>
                </Link>
                {cat?.children?.length > 0 && (
                  <LiaAngleRightSolid className="text-[10px] flex-shrink-0 opacity-40" />
                )}
              </div>
            );
          })}
        </div>

        {/* L2/L3 - Right panel */}
        {hoveredL1?.children?.length > 0 && (
          <div className="w-[480px] overflow-y-auto p-5">
            <h3 className="text-[15px] font-[600] text-gray-800 mb-4 pb-2 border-b border-gray-100">
              {hoveredL1.name}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {hoveredL1.children.map((subCat, idx) => (
                <div key={idx}>
                  <Link
                    to={`/products?subCatId=${subCat?._id}`}
                    className="text-[13px] font-[600] text-gray-800 hover:text-[#ff5252] transition-colors block mb-1"
                    onClick={handleNavigate}
                  >
                    {subCat?.name}
                  </Link>
                  {subCat?.children?.length > 0 && (
                    <ul className="space-y-0.5">
                      {subCat.children.map((thirdCat, idx2) => (
                        <li key={idx2}>
                          <Link
                            to={`/products?thirdLavelCatId=${thirdCat?._id}`}
                            className="text-[12px] text-gray-500 hover:text-[#ff5252] transition-colors"
                            onClick={handleNavigate}
                          >
                            {thirdCat?.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryFlyout;
