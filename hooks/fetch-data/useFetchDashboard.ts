import type { DashboardData } from "@/features/dashboard/dashboard.queries";
import { apiGet } from "@/lib/utils/api-client.util";
import { useQuery } from "@tanstack/react-query";

/**
 * โหลดข้อมูลหน้า dashboard ของ admin
 *
 * @returns query ของข้อมูล dashboard
 */
export function useFetchDashboard() {
  return useQuery({
    queryKey: ["admin dashboard"],
    queryFn: () => apiGet<DashboardData>("/api/admin/dashboard"),
    refetchOnWindowFocus: false,
  });
}
