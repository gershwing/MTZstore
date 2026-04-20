// admin/src/App.jsx
import "./App.css";
import "./responsive.css";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { routes } from "./routes";
import { useAuth } from "./hooks/useAuth";
import UIContext from "./context/UIContext";

import toast, { Toaster } from "react-hot-toast";
import LoadingBar from "react-top-loading-bar";
import { api } from "./utils/api";

import { getSocket, updateSocketAuth } from "./utils/socket";

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

/* ============== Socket Bridge ============== */
function SocketEventsBridge({ token }) {
  const qc = useQueryClient();
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (token) {
      getSocket();
      updateSocketAuth(token);
    }

    const s = getSocket();
    s.on("seller-app:status", () => {
      qc.invalidateQueries({ queryKey: ["sellerApp"] });
    });

    return () => {
      s.off("seller-app:status");
    };
  }, [qc, token]);

  return null;
}

function InnerApp() {
  const { authReady } = useAuth();

  // ── UI state for sidebar + responsive ──
  const [isSidebarOpen, setisSidebarOpen] = React.useState(true);
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  React.useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const uiValue = React.useMemo(
    () => ({ isSidebarOpen, setisSidebarOpen, windowWidth }),
    [isSidebarOpen, windowWidth]
  );

  const router = React.useMemo(() => createBrowserRouter(routes), []);

  if (!authReady) return <div className="p-6">Inicializando…</div>;

  const token = localStorage.getItem("accessToken") || "";

  return (
    <UIContext.Provider value={uiValue}>
      <SocketEventsBridge token={token} />
      <RouterProvider router={router} />
      <Toaster />
    </UIContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InnerApp />
    </QueryClientProvider>
  );
}

export default App;
