import { useEffect, useState } from "react";
import { fetchDataFromApi } from "../utils/api";

const FALLBACK_BOB_PER_USD = 6.96;

export function useFxRate() {
  const [bobPerUsd, setBobPerUsd] = useState(FALLBACK_BOB_PER_USD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchDataFromApi("/api/fx")
      .then((res) => {
        if (cancelled) return;
        const rate = res?.data?.fx?.rate ?? res?.data?.bobPerUsd ?? res?.data?.rate;
        if (rate && Number(rate) > 0) setBobPerUsd(Number(rate));
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("useFxRate: using fallback", err?.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { bobPerUsd, loading };
}
