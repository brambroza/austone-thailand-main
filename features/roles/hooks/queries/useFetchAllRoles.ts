import { useQuery } from "@tanstack/react-query";
import { getAllRoles } from "@/features/roles/actions/role.action";

export function useFetchAllRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data: roles, error } = await getAllRoles();

      if (error) throw new Error(error);

      return roles;
    },
  });
}
