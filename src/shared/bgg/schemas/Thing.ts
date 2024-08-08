import { z } from 'astro/zod';
import { zArrayish } from '../utils';

export const createThingSchema = <T extends z.ZodTypeAny>(item: T) =>
  z
    .object({ items: z.object({ item: zArrayish(item) }) })
    .transform(({ items: { item } }) => item);
