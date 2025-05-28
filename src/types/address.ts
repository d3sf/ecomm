export interface Address {
  id?: number;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  addressLabel: "HOME" | "WORK" | "OTHER";
  customLabel?: string;
} 