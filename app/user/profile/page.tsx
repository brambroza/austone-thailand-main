"use client";
import { updateUser } from "@/actions/queries/users.action";
import { sendOTP, verifyOTP } from "@/actions/twilio.action";
import { useUserProtectedRoute } from "@/components/protected/UserProtectedRoute";
import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signOut } from "@/features/auth/services/auth.service";
import { useFetchUserInfo } from "@/hooks/fetch-data/useFetchUserInfo";
import { useSyncFormData } from "@/hooks/useSyncFormData";
import { cn } from "@/lib/utils";
import {
  hasUserVerifiedPhoneNumber,
  isUserAdmin,
  isUserBillManager,
} from "@/lib/utils/auth.util";
import { getCalendarDateFromDate } from "@/lib/utils/date.util";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { convertPhoneNumberToE164Format } from "@/lib/utils/twilio.util";
import { getUserId, getUserProfileImage } from "@/lib/utils/user.util";
import { ServerActionResponse } from "@/models/api.model";
import { getLocalTimeZone } from "@internationalized/date";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { LogOut, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import OTPModal from "./_components/OTPModal";
import { INITIAL_FORM_STATE, THAILAND_PROVINCES } from "./_constant";
import { useTrackFormEditionState, useUpdateBirthDayInput } from "./_hook";
import { useProfilePageStore } from "./_store";
import { FormFields } from "./_type";

// การแปลง calendar date เป็น date มันจะหักเดือนออกไป 1 (ไม่รู้ว่าทำไม)
const CALENDAR_TO_DATE_MONTH_OFFSET = 1;
const CALENDAR_TO_DATE_DAY_OFFSET = 1;
export default function ProfilePage() {
  const [otp, setOtp] = useState("");

  const setIsVerifying = useProfilePageStore((state) => state.setIsVerifying);

  const setIsSendingOTP = useProfilePageStore((state) => state.setIsSendingOTP);

  const isOTPModalOpen = useProfilePageStore((state) => state.isOTPModalOpen);

  const reset = useProfilePageStore((state) => state.reset);

  const router = useRouter();

  const { user } = useUserProtectedRoute();

  const {
    data: userInfo,
    isFetching: isFetchingUserInfo,
    refetch: refreshUserInfo,
  } = useFetchUserInfo(getUserId(user));


  const [formData, setFormData] = useState<FormFields>(INITIAL_FORM_STATE);

  const [selectedYear, setSelectedYear] = useState<string>("");

  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const [selectedDay, setSelectedDay] = useState<string>("");

  const [initialData, setInitialData] =
    useState<FormFields>(INITIAL_FORM_STATE);

  const setIsOTPModalOpen = useProfilePageStore(
    (state) => state.setIsOTPModalOpen
  );

  const hasChangedPhoneNumber =
    formData.phone_number !== userInfo?.phone_number;

  useSyncFormData(
    {
      full_name: userInfo?.full_name || "",
      phone_number: userInfo?.phone_number || "",
      province: userInfo?.province || "",
      gender: userInfo?.gender || "",
      date_of_birth: userInfo?.date_of_birth
        ? new Date(userInfo.date_of_birth)
        : null,
      store_name: userInfo?.store_name || "",
      agent_store_name: userInfo?.agent_store_name || "",
    },
    (data) => {
      setFormData(data);
      setInitialData(data);
    },
    [JSON.stringify(userInfo)]
  );

  useUpdateBirthDayInput({
    formData,
    setSelectedYear,
    setSelectedMonth,
    setSelectedDay,
  });


  const currentYear = new Date().getFullYear();




  // ✅ จำนวนวันในเดือนที่เลือก (รวม leap year)
  const daysInMonth = useMemo(() => {
    if (!selectedYear || !selectedMonth) return 31;
    const year = Number(selectedYear);
    const month = Number(selectedMonth);

    return new Date(year, month + 1, 0).getDate(); // วันที่ 0 ของเดือนถัดไป = วันสุดท้ายของเดือนนี้
  }, [selectedYear, selectedMonth]);



  const { hasEdited, setHasEdited } = useTrackFormEditionState(
    formData,
    initialData
  );

  const handleInputChange = (
    field: keyof FormFields,
    value: string | Date | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleYearChange = (year: string) => {
    setSelectedYear(year);

    const currentDate = formData.date_of_birth
      ? new Date(formData.date_of_birth)
      : new Date();

    // ใช้ค่า month/day จาก state ปัจจุบัน (ถ้ามี)
    const month = selectedMonth ? parseInt(selectedMonth) : currentDate.getMonth();
    const day = selectedDay ? parseInt(selectedDay) : currentDate.getDate();

    const newDate = new Date(parseInt(year), month, day);

    handleInputChange("date_of_birth", newDate);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);

    const currentDate = formData.date_of_birth
      ? new Date(formData.date_of_birth)
      : new Date();

    const year = selectedYear
      ? parseInt(selectedYear)
      : currentDate.getFullYear();
    const day = selectedDay ? parseInt(selectedDay) : currentDate.getDate();

    const newDate = new Date(year, parseInt(month), day);

    handleInputChange("date_of_birth", newDate);
  };

  const handleDayChange = (day: string) => {
    setSelectedDay(day);

    const currentDate = formData.date_of_birth
      ? new Date(formData.date_of_birth)
      : new Date();

    const year = selectedYear
      ? parseInt(selectedYear)
      : currentDate.getFullYear();
    const month = selectedMonth
      ? parseInt(selectedMonth)
      : currentDate.getMonth();

    const newDate = new Date(year, month, parseInt(day));

    handleInputChange("date_of_birth", newDate);
  };
  const handleAdminPage = () => {
    router.push("/admin");
  };

  const handleBillManagerPage = () => {
    router.push("/admin/bills");
  };

  async function handleSendOTPCode() {
    try {
      setIsSendingOTP(true);

      setIsOTPModalOpen(true);

      const otpResult = await sendOTP({
        phoneNumber: convertPhoneNumberToE164Format(formData.phone_number),
      });

      if (otpResult?.isError) throw new Error(otpResult.error);
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsSendingOTP(false);
    }
  }

  async function handleVerifyOTP() {
    try {
      setIsVerifying(true);

      const verificationResult = await verifyOTP({
        to: convertPhoneNumberToE164Format(formData.phone_number),
        code: otp,
        userId: getUserId(user),
      });

      if (verificationResult?.isError)
        throw new Error(
          verificationResult?.error ?? "ล้มเหลวระหว่างการยืนยัน OTP"
        );

      setIsOTPModalOpen(false);

      Alert.success("ยืนยันเบอร์โทรศัพท์สำเร็จ");

      await updateUser({
        user_id: getUserId(user),
        phone_number: formData.phone_number,
      });

      await handleSaveProfile();

      reset();

      setOtp("");

      refreshUserInfo();
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleSaveProfile() {
    try {
      if (!selectedYear || !selectedMonth || !selectedDay) {
        throw new Error("กรุณาเลือกวันเกิดให้ครบถ้วน");
      }

      if (!formData.date_of_birth) throw new Error("กรุณาเลือกวันเกิด");

      const actionResult = await updateUser({
        user_id: getUserId(user),
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        province: formData.province,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth
          ? getCalendarDateFromDate(formData.date_of_birth)
            .add({
              months: CALENDAR_TO_DATE_MONTH_OFFSET,
              days: CALENDAR_TO_DATE_DAY_OFFSET,
            })
            .toDate(getLocalTimeZone())
          : null,
        store_name: formData.store_name,
        agent_store_name: formData.agent_store_name,
      });

      SafeActionUtil.validateErrors(actionResult);

      if (actionResult?.isError)
        throw new Error(actionResult?.error ?? "ล้มเหลวระหว่างการบันทึกข้อมูล");

      Alert.success("บันทึกข้อมูลเรียบร้อย");

      refreshUserInfo();

      setHasEdited(false);
    } catch (error: any) {
      Alert.error(error.message);
    }
  }

  const handleConfirmButton = async () => {
    try {
      if (hasChangedPhoneNumber) {
        await handleSendOTPCode();
        return;
      }

      await handleSaveProfile();

      window.location.assign("/user/points");
    } catch (error: any) {
      Alert.error(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.assign("/login");
  };

  useEffect(() => {
    setOtp("");
  }, [isOTPModalOpen]);

  if (isFetchingUserInfo) {
    return <Loader label="ดึงข้อมูลผู้ใช้..." />;
  }

  return (
    <div className="container max-w-3xl mx-auto space-y-8 py-8">
      <OTPModal onVerifyOTP={handleVerifyOTP} otp={otp} onSetOtp={setOtp} />

      <Card className="shadow-lg">
        <div className="md:grid md:grid-cols-[300px_1fr]">
          <div className="border-b md:border-b-0 md:border-r">
            <CardHeader className="text-center pb-6">
              <div className="w-28 h-28 mx-auto relative mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 ring-4 ring-gray-50">
                  <Image
                    src={getUserProfileImage(user) || "/placeholder.svg"}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="object-cover"
                  />
                </div>
              </div>
              <CardTitle className="text-2xl">โปรไฟล์</CardTitle>
            </CardHeader>
          </div>

          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
              <Input
                className="bg-white"
                id="name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">ชื่อร้านค้า/บจก *</Label>
              <Input
                className="bg-white"
                id="companyName"
                value={formData.store_name}
                onChange={(e) =>
                  handleInputChange("store_name", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">ร้านตัวแทน</Label>
              <Input
                className="bg-white"
                id="companyName"
                value={formData.agent_store_name || ""}
                onChange={(e) =>
                  handleInputChange("agent_store_name", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>เพศ *</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">ชาย</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">หญิง</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">อื่นๆ</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>วันเกิด *</Label>
              <div className="flex gap-4">
                {/* 🗓 ปี (พ.ศ.) */}
                <Select required value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="ปี" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {Array.from({ length: 100 }, (_, i) => {
                      const yearCE = currentYear - i;
                      const yearBE = yearCE + 543;
                      return (
                        <SelectItem key={yearCE} value={yearCE.toString()}>
                          {yearBE}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* 📅 เดือน */}
                <Select required value={selectedMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="เดือน" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date(2024, i, 1);
                      return (
                        <SelectItem key={i} value={i.toString()}>
                          {format(date, "MMMM", { locale: th })}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* 🔢 วัน */}
                <Select required value={selectedDay} onValueChange={handleDayChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="วัน" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>




            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  handleInputChange("phone_number", e.target.value)
                }
                className={cn(
                  !userInfo?.verified_at ? "border-red-500" : "",
                  "bg-white"
                )}
              />
              {!userInfo?.verified_at && (
                <p className="text-sm text-red-500">
                  กรุณายืนยันหมายเลขโทรศัพท์ของท่าน
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">จังหวัด *</Label>
              <Select
                value={formData.province || ""}
                onValueChange={(value) => handleInputChange("province", value)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="เลือกจังหวัด" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {THAILAND_PROVINCES.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!hasUserVerifiedPhoneNumber(userInfo) || hasChangedPhoneNumber ? (
              <Button className="w-full" onClick={handleSendOTPCode}>
                ยืนยันเบอร์โทรศัพท์
              </Button>
            ) : (
              <Button
                disabled={!hasEdited}
                className="w-full"
                onClick={handleConfirmButton}
              >
                บันทึก
              </Button>
            )}

            {isUserAdmin(userInfo) && (
              <Button
                endIcon={<ShieldCheck className="w-4 h-4" />}
                onClick={handleAdminPage}
                className="w-full bg-blue-500"
              >
                หน้าแอดมิน
              </Button>
            )}

            {isUserBillManager(userInfo) && (
              <Button
                endIcon={<ShieldCheck className="w-4 h-4" />}
                onClick={handleBillManagerPage}
                className="w-full bg-blue-500"
              >
                หน้าบิล
              </Button>
            )}

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </Button>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
