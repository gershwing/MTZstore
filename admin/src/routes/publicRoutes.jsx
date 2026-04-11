import React from "react";
import { Navigate } from "react-router-dom";

import Login from "../Pages/Login";
import SignUp from "../Pages/SignUp";
import ForgotPassword from "../Pages/ForgotPassword";
import VerifyAccount from "../Pages/VerifyAccount";
import ChangePassword from "../Pages/ChangePassword";

const Forbidden = () => <div className="p-6">403 • No autorizado</div>;

export const publicRoutes = [
  { path: "/", element: <Navigate to="/admin" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/verify-account", element: <VerifyAccount /> },
  { path: "/change-password", element: <ChangePassword /> },
  { path: "/403", element: <Forbidden /> },
];

export const catchAllRoute = {
  path: "*",
  element: <Navigate to="/admin" replace />,
};
