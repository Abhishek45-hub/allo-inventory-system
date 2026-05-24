import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email is invalid'),
  password: z.string().min(8, 'Password must have 8+ chars'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
