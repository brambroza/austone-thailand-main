import { create } from "zustand";

interface ProfilePageStore {
  isOTPModalOpen: boolean;
  isVerifying: boolean;
  setIsOTPModalOpen: (isOpen: boolean) => void;
  setIsVerifying: (isVerifying: boolean) => void;
  reset: () => void;
  isSendingOTP: boolean;
  setIsSendingOTP: (isSendingOTP: boolean) => void;
}

const initialState = {
  isOTPModalOpen: false,
  isVerifying: false,
  isSendingOTP: false,
};

export const useProfilePageStore = create<ProfilePageStore>((set) => ({
  ...initialState,
  setIsOTPModalOpen: (isOpen) => set({ isOTPModalOpen: isOpen }),
  setIsVerifying: (isVerifying) => set({ isVerifying }),
  setIsSendingOTP: (isSendingOTP) => set({ isSendingOTP }),
  reset: () => set(initialState),
}));
