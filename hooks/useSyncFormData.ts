import { useEffect } from "react";

export function useSyncFormData<FormData extends {}>(
  data: FormData,
  formSetter: (data: FormData) => void,
  dependencies: any[]
) {
  useEffect(() => {
    formSetter(data);
  }, dependencies);
}
