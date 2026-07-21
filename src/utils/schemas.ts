import { z } from "zod"

/**
 * Zod schemas for every form. Fields match the API contract exactly — no extra
 * or renamed fields are sent to the backend (client-only fields like
 * confirmPassword / terms are stripped before submitting).
 */

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v, "You must accept the terms"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
export type RegisterValues = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
})
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})
export type ProfileValues = z.infer<typeof profileSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(7, "Enter a valid phone number"),
  line1: z.string().min(3, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  isDefault: z.boolean().optional(),
})
export type AddressValues = z.infer<typeof addressSchema>

export const reviewSchema = z.object({
  reviewerName: z.string().min(2, "Name is required"),
  rating: z.number().min(1, "Select a rating").max(5),
  comment: z.string().min(5, "Tell us a little more").max(500),
})
export type ReviewValues = z.infer<typeof reviewSchema>

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(5, "Description is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  imageUrl: z.string().min(1, "Image URL is required"),
  categoryId: z.coerce.number().int().positive("Select a category"),
})
export type ProductFormValues = z.infer<typeof productSchema>

export const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(3, "Description is required"),
})
export type CategoryFormValues = z.infer<typeof categorySchema>

export const inventorySchema = z.object({
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
})
export type InventoryFormValues = z.infer<typeof inventorySchema>

export const paymentCardSchema = z.object({
  cardNumber: z.string().min(12, "Enter a valid card number"),
  cardName: z.string().min(2, "Name on card is required"),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "MM/YY"),
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
})
export type PaymentCardValues = z.infer<typeof paymentCardSchema>

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})
export type ContactValues = z.infer<typeof contactSchema>

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email"),
})
