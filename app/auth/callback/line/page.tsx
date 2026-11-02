"use client";
import {
  getLineUserProfile,
  retrieveLineIdToken,
  signInLineUser,
} from "@/actions/auth.action";
import { doesUserExist, initUser } from "@/actions/queries/users.action";
import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { StatusCodes } from "http-status-codes";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const LOGIN_FAILED_MESSAGE = "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

const Page = () => {
  const searchParams = useSearchParams();

  const code = searchParams.get("code");

  const [data, setData] = useState<{
    idToken: string | null;
    status: number | null;
  }>({
    idToken: null,
    status: null,
  });

  const { idToken } = data;

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!code) return;

        if (!idToken) {
          const { id_token, status } = await retrieveLineIdToken(code);

          if (status === StatusCodes.INTERNAL_SERVER_ERROR) {
            setErrorMessage(LOGIN_FAILED_MESSAGE);
            return;
          }

          setData({
            idToken: id_token,
            status: status,
          });
          return;
        }

        await signInLineUser(idToken);

        const { data: userProfile } = await getLineUserProfile(idToken);

        if (!(await doesUserExist(userProfile.sub))) {
          await initUser(userProfile.sub);
        }

        Alert.success("เข้าสู่ระบบสำเร็จ");

        setTimeout(() => {
          router.push("/user/profile");
        }, 1000);

        setIsLoading(false);
      } catch (error) {
        console.log(error);
        Alert.error("เข้าสู่ระบบไม่สำเร็จ");
        setErrorMessage(LOGIN_FAILED_MESSAGE);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [code, idToken]);


  return (
    <main className="w-full h-full min-h-lvh flex flex-col gap-y-5 items-center justify-center">
      {isLoading && <h1>loading...</h1>}
      {errorMessage && (
        <>
          <p className="text-red-500 font-semibold text-xl">{errorMessage}</p>
          <Button
            className="w-[200px]"
            color="primary"
            onClick={() => router.push("/")}
          >
            หน้าหลัก
          </Button>
        </>
      )}
    </main>
  );
};

export default Page;
