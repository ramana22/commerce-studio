import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * An Instagram-style rail of short vertical videos ("reels"). Each reel can be
 * made shoppable by linking it to a Medusa product.
 */
export const reelCarousel = defineType({
  name: 'reelCarousel',
  title: 'Reel carousel',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reels',
      title: 'Reels',
      type: 'array',
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'reel',
          fields: [
            defineField({
              name: 'video',
              title: 'Reel video',
              type: 'responsiveVideo',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
            defineField({
              name: 'product',
              title: 'Shoppable product (optional)',
              type: 'productRef',
            }),
          ],
          preview: {
            select: { title: 'caption', media: 'video.poster', handle: 'product.handle' },
            prepare({ title, media, handle }) {
              return {
                title: title ?? 'Reel',
                subtitle: handle ? `Shoppable · ${handle}` : 'Reel',
                media,
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', reels: 'reels' },
    prepare({ title, reels }) {
      const count = Array.isArray(reels) ? reels.length : 0
      return {
        title: title ?? 'Reel carousel',
        subtitle: `Reel carousel · ${count} reel${count === 1 ? '' : 's'}`,
      }
    },
  },
})
