// admin/src/Pages/Products/ProductDetails.jsx
import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Typography, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

import ProductForm from "./ProductForm";
import InventoryTab from "./InventoryTab";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);

  /* =========================
     LOAD PRODUCT
  ========================= */
  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/product/${id}`);
      setProduct(res?.data || null);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  if (loading) {
    return <Box p={3}>Cargando producto…</Box>;
  }

  if (!product) {
    return (
      <Box p={3}>
        <Typography>No se pudo cargar el producto</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.catName} · {product.subCat}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => navigate("/admin/products")}
        >
          Volver a productos
        </Button>
      </Box>

      {/* TABS */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Resumen" />
        <Tab label="Configuración" />
        <Tab label="Inventario" />
      </Tabs>

      <Box mt={3}>
        {/* ================= RESUMEN ================= */}
        {tab === 0 && (
          <Box className="space-y-2">
            <Typography><b>Marca:</b> {product.brand || "—"}</Typography>
            <Typography><b>Precio base:</b> {product.basePrice || "—"}</Typography>
            <Typography><b>Estado:</b> {product.status || "—"}</Typography>
            <Typography>
              <b>Variantes:</b>{" "}
              {product.variants?.length || 0}
            </Typography>
          </Box>
        )}

        {/* ================= CONFIGURACIÓN ================= */}
        {tab === 1 && (
          <ProductForm
            initialData={product}
            onSubmit={async (payload) => {
              await api.put(`/api/product/${id}`, payload);
              alert("Producto actualizado correctamente");
              loadProduct();
            }}
          />
        )}

        {/* ================= INVENTARIO ================= */}
        {tab === 2 && (
          <InventoryTab
            productId={id}
            stockMinimo={product.stockMinimo || 0}
          />
        )}
      </Box>
    </Box>
  );
};

export default ProductDetails;
