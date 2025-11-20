import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register validation schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    ward: z
      .number({
        message: 'Ward must be a number',
      })
      .int('Ward must be a whole number')
      .min(1, 'Ward must be between 1 and 32')
      .max(32, 'Ward must be between 1 and 32'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Report Issue validation schema
export const reportIssueSchema = z.object({
  category: z.enum(['waste', 'infrastructure', 'safety', 'environment'], {
    message: 'Please select a category',
  }),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  location: z
    .string()
    .min(1, 'Location is required')
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must not exceed 200 characters'),
  photo: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.startsWith('data:image/'),
      'Invalid image format'
    ),
});

export type ReportIssueFormData = z.infer<typeof reportIssueSchema>;

// Report Disturbance validation schema
export const reportDisturbanceSchema = z.object({
  category: z.enum(['noise', 'pollution', 'traffic', 'construction', 'public-behavior'], {
    message: 'Please select a category',
  }),
  impact: z.enum(['low', 'medium', 'high', 'critical'], {
    message: 'Please select an impact level',
  }),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  location: z
    .string()
    .min(1, 'Location is required')
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must not exceed 200 characters'),
});

export type ReportDisturbanceFormData = z.infer<typeof reportDisturbanceSchema>;

// Thread creation validation schema
export const createThreadSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  content: z
    .string()
    .min(1, 'Content is required')
    .min(10, 'Content must be at least 10 characters')
    .max(2000, 'Content must not exceed 2000 characters'),
  category: z.enum(['discussion', 'announcement', 'question', 'proposal', 'event'], {
    message: 'Please select a category',
  }),
});

export type CreateThreadFormData = z.infer<typeof createThreadSchema>;

// Micro Action log validation schema
export const microActionSchema = z.object({
  action: z.enum(
    [
      'picked-litter',
      'sorted-waste',
      'reported-issue',
      'educated-neighbor',
      'planted-tree',
      'cleaned-drain',
      'organized-cleanliness',
      'other',
    ],
    {
      message: 'Please select an action type',
    }
  ),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(5, 'Description must be at least 5 characters')
    .max(200, 'Description must not exceed 200 characters'),
});

export type MicroActionFormData = z.infer<typeof microActionSchema>;
