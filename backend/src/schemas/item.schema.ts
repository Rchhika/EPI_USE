import { z } from 'zod';

export const CreateItemSchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'price must be >= 0').optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateItemSchema = z.object({
  name: z.string().min(1, 'name is required').optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'price must be >= 0').optional(),
  tags: z.array(z.string()).optional(),
});

export const createItemParser = CreateItemSchema.strict();
export const updateItemParser = UpdateItemSchema.strict();

export type CreateItemInput = z.infer<typeof createItemParser>;
export type UpdateItemInput = z.infer<typeof updateItemParser>;


