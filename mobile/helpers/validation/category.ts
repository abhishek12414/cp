import * as Yup from "yup";

/**
 * Validation schema for Category form
 * Based on Strapi category schema: name, description, isActive, image
 */
export const categoryValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Category name is required")
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be 100 characters or less"),

  description: Yup.string()
    .trim()
    .max(500, "Description must be 500 characters or less")
    .nullable(),

  isActive: Yup.boolean().default(true),

  image: Yup.number().nullable(),
});

/**
 * Initial values for category form
 */
export const categoryInitialValues = {
  name: "",
  description: "",
  isActive: true,
  image: null as number | null,
};

/**
 * Type for category form values
 */
export type CategoryFormValues = typeof categoryInitialValues;

export default categoryValidationSchema;
