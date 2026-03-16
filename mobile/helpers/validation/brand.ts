import * as Yup from "yup";

/**
 * Validation schema for Brand form
 * Based on Strapi brand schema: name, description, website, isActive, logo
 */
export const brandValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Brand name is required")
    .trim()
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must be 100 characters or less"),

  description: Yup.string()
    .trim()
    .max(500, "Description must be 500 characters or less")
    .nullable(),

  website: Yup.string()
    .trim()
    .url("Please enter a valid URL (e.g., https://example.com)")
    .max(255, "Website URL must be 255 characters or less")
    .nullable()
    .transform((value) => (value === "" ? null : value)),

  isActive: Yup.boolean().default(true),

  logo: Yup.number().nullable(),
});

/**
 * Initial values for brand form
 */
export const brandInitialValues = {
  name: "",
  description: "",
  website: "",
  isActive: true,
  logo: null as number | null,
};

/**
 * Type for brand form values
 */
export type BrandFormValues = typeof brandInitialValues;

export default brandValidationSchema;
