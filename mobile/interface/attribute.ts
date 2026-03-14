export interface AttributeInterface {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  fieldType: "string" | "number" | "boolean" | "select" | "text";
  unit?: string | null;
  options?: string[] | null;
  isFilterable?: boolean;
  isRequired?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}
