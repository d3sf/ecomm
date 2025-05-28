export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: { url: string }[];
  };
}

export interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
} 