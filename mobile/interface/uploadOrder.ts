export type UploadOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface UploadOrderInterface {
  id: number;
  documentId: string;
  status: UploadOrderStatus;
  notes?: string;
  adminNotes?: string;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
  files?: {
    id: number;
    url: string;
    name: string;
    mime: string;
    size: number;
  }[];
  user?: {
    id: number;
    email: string;
    name?: string;
  };
  generatedOrder?: {
    id: number;
    orderNumber: string;
    totalPrice: number;
  };
}

export interface UploadOrderInput {
  files: number[];
  notes?: string;
}
