import React from "react";

import RoleRedirect from "./RoleRedirect";
import Dashboard from "../Pages/Dashboard";
import Products from "../Pages/Products";
import Orders from "../Pages/Orders";
import PaymentsPage from "../Pages/Payments";
import HomeSliderBanners from "../Pages/HomeSliderBanners";
import CategoryList from "../Pages/Categegory";
import SubCategoryList from "../Pages/Categegory/subCatList";
import ThirdCatList from "../Pages/Categegory/thirdCatList";
import AddCategory from "../Pages/Categegory/addCategory";
import EditCategory from "../Pages/Categegory/editCategory";
import AddSubCategory from "../Pages/Categegory/addSubCategory";
import AddHomeSlide from "../Pages/HomeSliderBanners/addHomeSlide";
import EditHomeSlide from "../Pages/HomeSliderBanners/editHomeSlide";
import BannerV1List from "../Pages/Banners/bannerV1List";
import AddBannerV1 from "../Pages/Banners/addBannerV1";
import EditBannerV1 from "../Pages/Banners/editBannerV1";
import BannerList2 from "../Pages/Banners/bannerList2";
import BannerList2_AddBanner from "../Pages/Banners/bannerList2_AddBanner";
import BannerList2_Edit_Banner from "../Pages/Banners/bannerList2_Edit_Banner";
import BlogList from "../Pages/Blog";
import AddBlog from "../Pages/Blog/addBlog";
import EditBlog from "../Pages/Blog/editBlog";
import ManageLogo from "../Pages/ManageLogo";
import MyStore from "../Pages/Stores/MyStore";
import ManageStoreBanner from "../Pages/Stores/ManageStoreBanner";
import DeliveryList from "../Pages/Delivery/DeliveryList";
import DeliveryDetail from "../Pages/Delivery/DeliveryDetail";
import MyDeliveries from "../Pages/Delivery/MyDeliveries";
import AvailableDeliveries from "../Pages/Delivery/AvailableDeliveries";
import ReportsPage from "../Pages/Reports/ReportsPage";
import ReportsPrint from "../Pages/Reports/ReportsPrint";
import DirectSalesPage from "../Pages/DirectSales";
import SalesPage from "../Pages/Sales";
import ProfitLossPage from "../Pages/ProfitLoss";
import AccountsReceivablePage from "../Pages/AccountsReceivable";
import InventoryPage from "../Pages/Inventory";
import SettlementsPage from "../Pages/Settlements";
import AddAddress from "../Pages/Address/addAddress";
import WarehouseInboundAdminList from "../Pages/WarehouseInbound/AdminList";
import CreateWarehouseInboundRequest from "../Pages/WarehouseInbound/CreateRequest";

const SuperDashboard = () => <Dashboard scope="super" />;
const StoreDashboard = () => <Dashboard scope="store" />;
const InventoryDashboard = () => <Dashboard scope="inventory" />;
const FinanceDashboard = () => <Dashboard scope="finance" />;
const DeliveryDashboard = () => <Dashboard scope="delivery" />;
const SupportDashboard = () => <Dashboard scope="support" />;

export const tenantRoutes = [
  { path: "dashboard", element: <RoleRedirect /> },
  { path: "dashboard/super", element: <SuperDashboard /> },
  { path: "dashboard/store", element: <StoreDashboard /> },
  { path: "dashboard/inventory", element: <InventoryDashboard /> },
  { path: "dashboard/finance", element: <FinanceDashboard /> },
  { path: "dashboard/delivery", element: <DeliveryDashboard /> },
  { path: "dashboard/support", element: <SupportDashboard /> },

  { path: "my-store", element: <MyStore /> },
  { path: "my-store/banner", element: <ManageStoreBanner /> },

  { path: "products", element: <Products /> },
  { path: "direct-sales", element: <DirectSalesPage /> },
  { path: "sales-history", element: <SalesPage /> },
  { path: "profit-loss", element: <ProfitLossPage /> },
  { path: "accounts-receivable", element: <AccountsReceivablePage /> },
  { path: "orders", element: <Orders /> },
  { path: "payments", element: <PaymentsPage /> },
  { path: "settlements", element: <SettlementsPage /> },

  { path: "homeSlider/list", element: <HomeSliderBanners /> },
  { path: "category/list", element: <CategoryList /> },
  { path: "subCategory/list", element: <SubCategoryList /> },
  { path: "thirdCategory/list", element: <ThirdCatList /> },

  { path: "bannerV1/list", element: <BannerV1List /> },
  { path: "bannerlist2/List", element: <BannerList2 /> },
  { path: "blog/List", element: <BlogList /> },
  { path: "logo/manage", element: <ManageLogo /> },

  { path: "inventory", element: <InventoryPage /> },

  { path: "delivery", element: <DeliveryList /> },
  { path: "delivery/:id", element: <DeliveryDetail /> },
  { path: "available-deliveries", element: <AvailableDeliveries /> },
  { path: "my-deliveries", element: <MyDeliveries /> },

  { path: "reports", element: <ReportsPage /> },
  { path: "reports/print", element: <ReportsPrint /> },

  { path: "warehouse-inbound", element: <WarehouseInboundAdminList /> },
  { path: "warehouse-inbound/create", element: <CreateWarehouseInboundRequest /> },
];
