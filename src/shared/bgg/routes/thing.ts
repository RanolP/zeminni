import ky from 'ky';
import { buildUrl } from '../url';
import { XMLParser } from 'fast-xml-parser';
import { commaJoined } from '../utils';
import { createThingSchema } from '../schemas/Thing';
import {
  ItemStatisticsSchema,
  type ItemStatistics,
} from '../schemas/Item/ItemStatistics';
import { ItemSchema, itemTransformer, type Item } from '../schemas/Item';
import { z } from 'astro/zod';

interface Config {
  id?: string | string[];
  type?: ThingType | ThingType[];

  withStats?: boolean;
}

type ThingType =
  | 'boardgame'
  | 'boardgameexpansion'
  | 'boardgameaccessory'
  | 'videogame'
  | 'rpgitem'
  | 'rpgissue';

export async function thing<T extends Config>({
  id,
  type,
  withStats,
}: T): Promise<
  Array<Item & (T['withStats'] extends true ? ItemStatistics : {})>
> {
  const text = await ky
    .get(
      buildUrl('thing', {
        id: commaJoined(id),
        type: commaJoined(type),
        stats: withStats ? '1' : null,
      }),
    )
    .text();
  const obj = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
    htmlEntities: true,
  }).parse(text, true);

  let itemSchema = ItemSchema;
  if (withStats) {
    itemSchema = itemSchema.merge(ItemStatisticsSchema);
  }

  return createThingSchema(
    itemSchema.transform(itemTransformer) as unknown as z.ZodType<
      Item & (T['withStats'] extends true ? ItemStatistics : {})
    >,
  ).parse(obj);
}
