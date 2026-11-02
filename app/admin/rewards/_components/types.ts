export interface Reward {
  id: number;
  name: string;
  description: string;
  points: number;
  image: string | null;
  isActive: boolean;
  expirationDate: Date | null;
  availableAt: Date | null;
  amount: number;
  isAlertEnabled: boolean;
} 