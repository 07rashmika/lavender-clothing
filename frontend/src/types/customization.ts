import type { DesignLayer, GarmentPart } from "@/app/customizer/Studio";

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
  customText?: string | null;
  fontStyle?: string | null;
  designPreview?: string | null;
  designConfig?: {
    panels?: Partial<Record<GarmentPart, string>>;
    layers?: DesignLayer[];
  } | null;
  quantity?: number;
  estimatedPriceCents: number | null;
  status: CustomizationStatus;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
}
