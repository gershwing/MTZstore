import { useState } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";
import SalesGroupTable from "./SalesGroupTable";

export default function SalesGrouped({ grouped, onRefresh = () => {}, isSuper = false }) {
  const [expanded, setExpanded] = useState({ platform: true });

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!grouped) {
    return <p className="text-center text-gray-500">Sin ventas</p>;
  }

  return (
    <div className="space-y-4">
      {/* Ventas de plataforma (solo super admin) */}
      {isSuper && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div
            className="p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
            onClick={() => toggleExpand("platform")}
          >
            <div className="flex items-center gap-3 flex-1">
              {expanded["platform"] ? (
                <FaAngleDown size={16} className="text-gray-600" />
              ) : (
                <FaAngleRight size={16} className="text-gray-600" />
              )}
              <h2 className="font-semibold text-gray-900">
                {grouped.platform.label}
              </h2>
              <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                {grouped.platform.count}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-600">
              Bs. {grouped.platform.total.toFixed(2)}
            </div>
          </div>

          {expanded["platform"] && grouped.platform.sales.length > 0 && (
            <div className="border-t">
              <SalesGroupTable onRefresh={onRefresh} sales={grouped.platform.sales} />
            </div>
          )}

          {expanded["platform"] && grouped.platform.sales.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Sin ventas de plataforma
            </div>
          )}
        </div>
      )}

      {/* Ventas por tienda */}
      {Object.keys(grouped.stores).map((storeId) => {
        const storeGroup = grouped.stores[storeId];
        const isExpanded = expanded[storeId] ?? true;

        return (
          <div key={storeId} className="bg-white border rounded-lg overflow-hidden">
            <div
              className="p-4 cursor-pointer bg-blue-50 hover:bg-blue-100 flex items-center justify-between"
              onClick={() => toggleExpand(storeId)}
            >
              <div className="flex items-center gap-3 flex-1">
                {isExpanded ? (
                  <FaAngleDown size={16} className="text-blue-600" />
                ) : (
                  <FaAngleRight size={16} className="text-blue-600" />
                )}
                <h2 className="font-semibold text-blue-900">
                  {storeGroup.label}
                </h2>
                <span className="ml-2 bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {storeGroup.count}
                </span>
              </div>
              <div className="text-sm font-medium text-blue-700">
                Bs. {storeGroup.total.toFixed(2)}
              </div>
            </div>

            {isExpanded && storeGroup.sales.length > 0 && (
              <div className="border-t">
                <SalesGroupTable onRefresh={onRefresh} sales={storeGroup.sales} />
              </div>
            )}

            {isExpanded && storeGroup.sales.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                Sin ventas en esta tienda
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
