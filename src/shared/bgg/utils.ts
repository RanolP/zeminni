import { z } from 'astro/zod';

export function commaJoined(array?: string | string[]): string | undefined {
  if (typeof array === 'string') return array;
  return array && array.length > 0 ? array.join(',') : undefined;
}

export function zIntegerString() {
  return z
    .string()
    .regex(/^[0-9]+$/)
    .transform((s) => Number(s));
}

export function zFloatString() {
  return z
    .string()
    .regex(/^[0-9]+(\.[0-9]+)?$/)
    .transform((s) => Number(s));
}

export function zAtValue<T extends z.ZodTypeAny>(
  type: T,
): z.ZodType<z.output<T>> {
  return z.object({ '@value': type }).transform((o) => o['@value']);
}

export function zArrayish<T extends z.ZodTypeAny>(
  type: T,
): z.ZodType<z.output<T>[]> {
  return z.union([z.array(type), type.transform((value) => [value])]);
}
