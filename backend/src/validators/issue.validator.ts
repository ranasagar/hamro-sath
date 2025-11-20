import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters'),
  
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  
  category: z.enum([
    'cleanliness',
    'infrastructure', 
    'water',
    'electricity',
    'road',
    'other'
  ]),
  
  latitude: z.number().optional(),
  
  longitude: z.number().optional(),
  
  photo_urls: z.array(z.string().url())
    .max(3, 'Maximum 3 photos allowed')
    .optional(),
});

export const updateIssueSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  
  status: z.enum(['pending', 'in_progress', 'resolved', 'rejected']).optional(),
  
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export const issueQuerySchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'rejected']).optional(),
  
  category: z.string().optional(),
  
  ward_id: z.string().transform(val => parseInt(val)).optional(),
  
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  
  limit: z.string().transform(val => {
    const num = parseInt(val);
    return num > 0 && num <= 100 ? num : 20;
  }).optional(),
});
