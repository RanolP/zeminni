import { defineCollection, z } from 'astro:content';

const boardgameCollect6ion = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    'bgg-id': z.number(),
  }),
});

export const collections = {
  boardgame: boardgameCollect6ion,
};
