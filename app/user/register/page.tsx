"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  phone: z.string().min(10, "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง"),
  location: z.string().min(1, "กรุณากรอกสถานที่"),
  gender: z.string().nonempty("กรุณาเลือกเพศ"),
  birthDate: z.date({
    required_error: "กรุณาเลือกวันเกิด",
  }),
  profileImage: z.string().nullable(),
  companyName: z.string().min(1, "กรุณากรอกชื่อร้านค้า/บจก"),
  terms: z.boolean({
    required_error: "กรุณายอมรับข้อตกลงและเงื่อนไข",
  }),
  privacy: z.boolean({
    required_error: "กรุณายอมรับนโยบายความเป็นส่วนตัว",
  }),
});

type FormFields = z.infer<typeof formSchema>;

const provinces = [
  "กรุงเทพมหานคร",
  "กระบี่",
  "กาญจนบุรี",
  "กาฬสินธุ์",
  "กำแพงเพชร",
  "ขอนแก่น",
  "จันทบุรี",
  "ฉะเชิงเทรา",
  "ชลบุรี",
  "ชัยนาท",
  "ชัยภูมิ",
  "ชุมพร",
  "เชียงราย",
  "เชียงใหม่",
  "ตรัง",
  "ตราด",
  "ตาก",
  "นครนายก",
  "นครปฐม",
  "นครพนม",
  "นครราชสีมา",
  "นครศรีธรรมราช",
  "นครสวรรค์",
  "นนทบุรี",
  "นราธิวาส",
  "น่าน",
  "บึงกาฬ",
  "บุรีรัมย์",
  "ปทุมธานี",
  "ประจวบคีรีขันธ์",
  "ปราจีนบุรี",
  "ปัตตานี",
  "พระนครศรีอยุธยา",
  "พังงา",
  "พัทลุง",
  "พิจิตร",
  "พิษณุโลก",
  "เพชรบุรี",
  "เพชรบูรณ์",
  "แพร่",
  "พะเยา",
  "ภูเก็ต",
  "มหาสารคาม",
  "มุกดาหาร",
  "แม่ฮ่องสอน",
  "ยะลา",
  "ยโสธร",
  "ร้อยเอ็ด",
  "ระนอง",
  "ระยอง",
  "ราชบุรี",
  "ลพบุรี",
  "ลำปาง",
  "ลำพูน",
  "เลย",
  "ศรีสะเกษ",
  "สกลนคร",
  "สงขลา",
  "สตูล",
  "สมุทรปราการ",
  "สมุทรสงคราม",
  "สมุทรสาคร",
  "สระแก้ว",
  "สระบุรี",
  "สิงห์บุรี",
  "สุโขทัย",
  "สุพรรณบุรี",
  "สุราษฎร์ธานี",
  "สุรินทร์",
  "หนองคาย",
  "หนองบัวลำภู",
  "อ่างทอง",
  "อุดรธานี",
  "อุทัยธานี",
  "อุตรดิตถ์",
  "อุบลราชธานี",
  "อำนาจเจริญ"
];

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      location: "",
      gender: undefined,
      birthDate: undefined,
      profileImage: null,
      companyName: "",
      terms: false,
      privacy: false,
    },
  });

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const [otp, setOtp] = useState("");

  const profileImage = watch("profileImage");

  const birthDate = watch("birthDate");
  
  const phone = watch("phone");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("profileImage", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: FormFields) => {
    console.log(data);
    setIsOtpModalOpen(true);
  };

  const handleVerifyOtp = () => {
    console.log("Verifying OTP:", otp);
    setIsOtpModalOpen(false);
  };

  return (
    <>
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-24 h-24 mx-auto relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/placeholder.svg"
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              )}
            </div>
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90"
            >
              <Upload className="w-4 h-4" />
            </label>
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <CardTitle className="text-2xl">ลงทะเบียนสมาชิก</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ-นามสกุล</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">ชื่อร้านค้า/บจก</Label>
              <Input id="companyName" {...register("companyName")} />
              {errors.companyName && (
                <p className="text-sm text-red-500">
                  {errors.companyName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>เพศ</Label>
              <RadioGroup
                value={watch("gender")}
                onValueChange={(value) => setValue("gender", value)}
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
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>วันเกิด</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? (
                      format(birthDate, "PPP", { locale: th })
                    ) : (
                      <span>เลือกวันเกิด</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={(date: Date | undefined) =>
                      date && setValue("birthDate", date)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.birthDate && (
                <p className="text-sm text-red-500">
                  {errors.birthDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input id="phone" type="tel" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">จังหวัด</Label>
              <Select
                value={watch("location")}
                onValueChange={(value) => setValue("location", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกจังหวัด" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" {...register("terms")} />
                <Label htmlFor="terms">ยอมรับข้อตกลงและเงื่อนไข</Label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-500">{errors.terms.message}</p>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox id="privacy" {...register("privacy")} />
                <Label htmlFor="privacy">ยอมรับนโยบายความเป็นส่วนตัว</Label>
              </div>
              {errors.privacy && (
                <p className="text-sm text-red-500">{errors.privacy.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              ลงทะเบียน
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยัน OTP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>กรุณากรอกรหัส OTP ที่ส่งไปยังเบอร์โทรศัพท์ {phone}</p>
            <Input
              placeholder="กรอกรหัส OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button onClick={handleVerifyOtp} className="w-full">
              ยืนยัน OTP
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
