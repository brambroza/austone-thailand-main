import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ลอง retry แค่ครั้งเดียว ค่า default 3 ครั้งทำให้ spinner ค้างนานขึ้นอีกหลายวินาทีเมื่อโหลดไม่สำเร็จ
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

const QueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
