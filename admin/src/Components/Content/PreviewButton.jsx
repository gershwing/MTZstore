// admin/src/components/Content/PreviewButton.jsx
import React, { useState } from "react";
import { Button } from "@mui/material";

/**
 * Props:
 * - id: string (document id)
 * - buildUrl: async (id) => string  // devuelve URL final a abrir
 * - label?: string
 * - disabled?: boolean
 */
export default function PreviewButton({ id, buildUrl, label = "Ver previa", disabled = false }) {
  const [loading, setLoading] = useState(false);

  const openPreview = async () => {
    if (!id || !buildUrl || loading) return;
    try {
      setLoading(true);
      const url = await buildUrl(id);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="btn"
      variant="outlined"
      onClick={openPreview}
      disabled={disabled || !id || !buildUrl || loading}
    >
      {loading ? "Abriendo..." : label}
    </Button>
  );
}
