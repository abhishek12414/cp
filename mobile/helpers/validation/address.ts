import * as Yup from "yup";

/**
 * Validation schema for Address form
 * Based on Strapi address schema
 */
export const addressValidationSchema = Yup.object().shape({
  label: Yup.string().trim().max(50, "Label must be 50 characters or less").default("Home"),

  fullName: Yup.string()
    .required("Full name is required")
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be 100 characters or less"),

  phone: Yup.string()
    .required("Phone number is required")
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be 20 characters or less"),

  addressLine1: Yup.string()
    .required("Address line 1 is required")
    .trim()
    .min(5, "Address line 1 must be at least 5 characters")
    .max(255, "Address line 1 must be 255 characters or less"),

  addressLine2: Yup.string()
    .trim()
    .max(255, "Address line 2 must be 255 characters or less")
    .nullable()
    .transform((value) => (value === "" ? null : value)),

  city: Yup.string()
    .required("City is required")
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be 100 characters or less"),

  state: Yup.string()
    .required("State is required")
    .trim()
    .min(2, "State must be at least 2 characters")
    .max(100, "State must be 100 characters or less"),

  pincode: Yup.string()
    .required("Pincode is required")
    .trim()
    .min(4, "Pincode must be at least 4 characters")
    .max(10, "Pincode must be 10 characters or less"),

  country: Yup.string()
    .required("Country is required")
    .trim()
    .max(100, "Country must be 100 characters or less")
    .default("India"),

  isPrimary: Yup.boolean().default(false),

  type: Yup.string()
    .oneOf(["shipping", "billing", "both"], "Invalid address type")
    .default("shipping"),
});

/**
 * Initial values for address form
 */
export const addressInitialValues = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isPrimary: false,
  type: "shipping" as const,
};

/**
 * Type for address form values
 */
export type AddressFormValues = typeof addressInitialValues;

export default addressValidationSchema;
