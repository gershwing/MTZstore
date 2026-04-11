import { MdBrush, MdDirectionsCar, MdSpa, MdSportsBasketball, MdMenuBook, MdPets, MdChildCare, MdLocalGroceryStore, MdCategory } from "react-icons/md";
import { IoGameControllerOutline, IoRestaurantOutline, IoConstructOutline, IoHomeOutline, IoMusicalNotesOutline } from "react-icons/io5";
import { RiMedicineBottleLine, RiComputerLine, RiShoppingBagLine } from "react-icons/ri";
import { LuPenTool } from "react-icons/lu";
import { FiMonitor } from "react-icons/fi";

const CATEGORY_ICON_MAP = {
  "arte y manualidades": MdBrush,
  "automotriz": MdDirectionsCar,
  "belleza y salud": MdSpa,
  "deportes y aire libre": MdSportsBasketball,
  "electrónica": FiMonitor,
  "farmacia otc": RiMedicineBottleLine,
  "gaming y tecnología": IoGameControllerOutline,
  "gastronomía y delivery": IoRestaurantOutline,
  "herramientas y construcción": IoConstructOutline,
  "hogar y cocina": IoHomeOutline,
  "instrumentos musicales": IoMusicalNotesOutline,
  "libros, cine y música": MdMenuBook,
  "mascotas": MdPets,
  "moda": RiShoppingBagLine,
  "niños y bebés": MdChildCare,
  "oficina y papelería": LuPenTool,
  "servicios digitales": RiComputerLine,
  "supermercado y alimentos": MdLocalGroceryStore,
};

export const getCategoryIcon = (name) => {
  return CATEGORY_ICON_MAP[name?.toLowerCase()?.trim()] || MdCategory;
};
