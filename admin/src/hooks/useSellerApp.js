// admin/src/hooks/useSellerApp.js
import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";

export function useMySellerApplication() {
  return useQuery({
    queryKey: ["sellerApp"],
    queryFn: async () => {
      const { data } = await api.get("/api/seller-applications/me", { withCredentials: true });
      return data?.data || null;
    },
    staleTime: 60_000,
  });
}
