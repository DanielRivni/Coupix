
export interface Coupon {
  id: string;
  userId: string;
  store: string;
  amount: string;
  description?: string;
  link?: string;
  image?: string;
  expiryDate?: Date | null;
  isRedeemed: boolean;
  createdAt: Date;
}

export const StoreOptions = [
  "שופרסל",
  "ויקטורי",
  "BUYME",
  "עובדים בריא",
  "כללית",
  "Other"
];

export const AmountOptions = ["15", "30", "40", "50", "100", "200", "Other"];
