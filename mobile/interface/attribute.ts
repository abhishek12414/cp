export interface AttributeInterface {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  type: string;
  unit: string | null;
  values: any[] | null;
  isFilterable: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
