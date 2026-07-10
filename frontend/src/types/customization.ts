export type CustomizationStatus =
  | "PENDING_REVIEW"
  | "IN_PRODUCTION"
  | "READY_FOR_DELIVERY"
  | "DELIVERED";

export interface Customization {
  id: string;
  requestNumber: string;
  userId: string;
  user?: { fullName: string | null; email: string };
  fabric: string;
  color: string;
  cut: string;
  size: string | null;
  notes: string;
  estimatedPriceCents: number | null;
  status: CustomizationStatus;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
}
