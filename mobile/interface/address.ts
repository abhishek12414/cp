export type AddressType = 'shipping' | 'billing' | 'both';

export interface AddressInterface {
  id: number;
  documentId?: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isPrimary: boolean;
  type: AddressType;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressInput {
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isPrimary?: boolean;
  type?: AddressType;
}
