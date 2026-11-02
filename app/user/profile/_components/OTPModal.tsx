import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { useProfilePageStore } from "../_store";

type Props = {
  onVerifyOTP: () => void;
  otp: string;
  onSetOtp: (otp: string) => void;
};

const OTPModal = ({ onVerifyOTP, otp, onSetOtp }: Props) => {
  const isOTPModalOpen = useProfilePageStore((state) => state.isOTPModalOpen);

  const setIsOTPModalOpen = useProfilePageStore(
    (state) => state.setIsOTPModalOpen
  );

  const isVerifying = useProfilePageStore((state) => state.isVerifying);

  const isSendingOTP = useProfilePageStore((state) => state.isSendingOTP);

  return (
    <Dialog modal open={isOTPModalOpen} onOpenChange={setIsOTPModalOpen}>
      <DialogContent className="max-w-[90%]">
        <DialogHeader>
          <DialogTitle>ยืนยันเบอร์โทรศัพท์</DialogTitle>
        </DialogHeader>
        {isSendingOTP ? (
          <Loader label="กำลังส่ง OTP..." className="h-full mb-5" />
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>กรุณากรอกรหัส OTP ที่ได้รับทาง SMS</Label>
              <Input
                value={otp}
                onChange={(e) => onSetOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
              />
            </div>
            <Button
              className="w-full"
              onClick={onVerifyOTP}
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? <Loader /> : null}
              ยืนยัน OTP
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;
