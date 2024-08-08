import { z } from 'astro/zod';
import { zArrayish, zAtValue, zFloatString, zIntegerString } from '../../utils';

const RankSchema = z.object({
  '@type': z.enum(['subtype', 'family']),
  '@id': zIntegerString(),
  '@name': z.string(),
  '@friendlyname': z.string(),
  '@value': zIntegerString(),
  '@bayesaverage': zFloatString(),
});

export const ItemStatisticsSchema = z.object({
  statistics: z
    .object({
      '@page': zIntegerString(),
      ratings: z.object({
        usersrated: zAtValue(zIntegerString()),
        average: zAtValue(zFloatString()),
        bayesaverage: zAtValue(zFloatString()),
        ranks: z.object({ rank: zArrayish(RankSchema) }),
        stddev: zAtValue(zFloatString()),
        median: zAtValue(zIntegerString()),
        owned: zAtValue(zIntegerString()),
        trading: zAtValue(zIntegerString()),
        wanting: zAtValue(zIntegerString()),
        wishing: zAtValue(zIntegerString()),
        numcomments: zAtValue(zIntegerString()),
        numweights: zAtValue(zIntegerString()),
        averageweight: zAtValue(zFloatString()),
      }),
    })
    .transform(({ '@page': page, ratings: { ...rest } }) => ({
      page,
      ratings: { ...rest },
    })),
});

export type ItemStatistics = z.output<typeof ItemStatisticsSchema>;
