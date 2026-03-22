import * as Yup from "yup";

/**
 * Validation schema for Product form
 * Based on Strapi product schema: name, description, price, sku, stockQuantity, category, brand, images
 */
export const productValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Product name is required")
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be 200 characters or less"),

  description: Yup.string()
    .trim()
    .max(2000, "Description must be 2000 characters or less")
    .nullable(),

  price: Yup.number()
    .required("Price is required")
    .min(0, "Price must be 0 or greater")
    .typeError("Please enter a valid price"),

  sku: Yup.string()
    .trim()
    .max(50, "SKU must be 50 characters or less")
    .nullable(),

  stockQuantity: Yup.number()
    .min(0, "Stock quantity must be 0 or greater")
    .integer("Stock quantity must be a whole number")
    .typeError("Please enter a valid stock quantity")
    .nullable(),

  category: Yup.string()
    .required("Please select a category")
    .nullable(),

  brand: Yup.string().nullable(),

  images: Yup.array().of(Yup.number()).nullable(),
});

/**
 * Initial values for product form
 */
export const productInitialValues = {
  name: "",
  description: "",
  price: 0,
  sku: "",
  stockQuantity: 0,
  category: null as string | null,
  brand: null as string | null,
  images: [] as number[],
};

/**
 * Type for product form values
 */
export type ProductFormValues = typeof productInitialValues;

export default productValidationSchema;
