export type OrderStatus = "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentMethod = "CARD" | "COD";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  name: string;
  priceCents: number;
  color: string | null;
  size: string | null;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: { fullName: string | null; email: string };
  items: OrderItem[];
  subtotalCents: number;
  taxCents: number;
  feeCents: number;
  totalCents: number;
  payment: PaymentMethod;
  status: OrderStatus;
  shippingFirstName: string;
  shippingLastName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  createdAt: string;
  updatedAt: string;
}
