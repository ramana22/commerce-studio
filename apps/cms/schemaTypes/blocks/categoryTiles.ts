import { defineType, defineField, defineArrayMember } from 'sanity'

/** A grid of image tiles linking to categories or campaigns. */
export const categoryTiles = defineType({
  name: 'categoryTiles',
  title: 'Category tiles',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'tiles',
      title: 'Tiles',
      type: 'array',
      validation: (rule) => rule.required().min(1).max(12),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tile',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Link',
              type: 'string',
              description: 'Internal path (e.g. /lips) or full URL',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'badge',
              title: 'Badge (optional)',
              type: 'string',
              description: 'e.g. NEW, SALE',
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'href', media: 'image' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', tiles: 'tiles' },
    prepare({ title, tiles }) {
      const count = Array.isArray(tiles) ? tiles.length : 0
      return {
        title: title ?? 'Category tiles',
        subtitle: `Category tiles · ${count} tile${count === 1 ? '' : 's'}`,
      }
    },
  },
})
