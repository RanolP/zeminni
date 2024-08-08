import { z } from 'astro/zod';
import { zArrayish, zAtValue, zIntegerString } from '../../utils';
import { decodeHTML } from 'entities';
import { groupBy } from 'remeda';

const NameSchema = z
  .object({
    '@type': z.enum(['primary', 'alternate']),
    '@value': z.string(),
  })
  .transform(({ '@type': type, '@value': value }) => ({ type, value }));

interface Name {
  primary: string | undefined;
  alternate: string[];
}

const LinkSchema = z
  .object({
    '@type': z.enum([
      'boardgamecategory',
      'boardgamemechanic',
      'boardgamefamily',
      'boardgameexpansion',
      'boardgameaccessory',
      'boardgamecompilation',
      'boardgameimplementation',
      'boardgameintegration',
      'boardgamedesigner',
      'boardgameartist',
      'boardgamepublisher',
    ]),
    '@id': zIntegerString(),
    '@value': z.string(),
  })
  .transform(({ '@type': type, '@id': id, '@value': value }) => ({
    type,
    id,
    value,
  }));

const removeType = ({ id, value }: z.output<typeof LinkSchema>) => ({
  id,
  value,
});

export const ItemSchema = z.object({
  '@type': z.literal('boardgame'),
  '@id': zIntegerString(),
  thumbnail: z.string().url(),
  image: z.string().url(),
  name: z.union([
    z.array(NameSchema).transform((array): Name => {
      const primaryIdx = array.findIndex((name) => name.type === 'primary');
      const [primary, alternate] =
        primaryIdx === -1
          ? [array[0], array.slice(1)]
          : [array[primaryIdx], array.toSpliced(primaryIdx, 1)];
      return {
        primary: primary?.value,
        alternate: alternate.map((name) => name.value),
      };
    }),
    NameSchema.transform(
      ({ value }): Name => ({
        primary: value,
        alternate: [],
      }),
    ),
  ]),
  description: z.string().transform((s) => decodeHTML(s)),
  yearpublished: zAtValue(zIntegerString()),
  minplayers: zAtValue(zIntegerString()),
  maxplayers: zAtValue(zIntegerString()),
  // poll: suggested_numplayers

  playingtime: zAtValue(zIntegerString()),
  minplaytime: zAtValue(zIntegerString()),
  maxplaytime: zAtValue(zIntegerString()),
  minage: zAtValue(zIntegerString()),

  link: zArrayish(LinkSchema),
});

export const itemTransformer = <T extends z.output<typeof ItemSchema>>({
  '@type': type,
  '@id': id,
  yearpublished,

  minplayers,
  maxplayers,

  playingtime,
  minplaytime,
  maxplaytime,

  minage,

  link,

  ...rest
}: T) => {
  const linksGrouped = groupBy(link, ({ type }) => type);
  return {
    type,
    id,

    classification: {
      categories: linksGrouped.boardgamecategory?.map(removeType) ?? [],
      mechanics: linksGrouped.boardgamemechanic?.map(removeType) ?? [],
    },
    stakeholders: {
      designers: linksGrouped.boardgamedesigner?.map(removeType) ?? [],
      artists: linksGrouped.boardgameartist?.map(removeType) ?? [],
      publishers: linksGrouped.boardgamepublisher?.map(removeType) ?? [],
    },
    supplements: {
      families: linksGrouped.boardgamefamily?.map(removeType) ?? [],
      expansions: linksGrouped.boardgameexpansion?.map(removeType) ?? [],
      accessories: linksGrouped.boardgameaccessory?.map(removeType) ?? [],
      integrations: linksGrouped.boardgameintegration?.map(removeType) ?? [],
      compilations: linksGrouped.boardgamecompilation?.map(removeType) ?? [],
    },

    publishedYear: yearpublished,
    players: {
      min: minplayers,
      max: maxplayers,
    },
    playTime: {
      common: playingtime,
      min: minplaytime,
      max: maxplaytime,
    },
    age: {
      min: minage,
    },
    ...rest,
  };
};

export type Item = ReturnType<
  typeof itemTransformer<z.output<typeof ItemSchema>>
>;
