"use client";
import { useRouter } from "next/navigation";

const NotFoundPage = () => {
  const router = useRouter();
  router.push("/user/points");
  return null;
};

export default NotFoundPage;
