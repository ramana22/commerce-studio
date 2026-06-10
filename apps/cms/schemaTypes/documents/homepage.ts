import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * The homepage — a singleton whose `blocks` array composes the page from the
 * reusable block schemas in any order.
 */
export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      description: 'Not shown on the site — for editor reference only',
      initialValue: 'Homepage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'blocks',
      title: 'Content blocks',
      type: 'array',
      of: [
        defineArrayMember({ type: 'heroCarousel' }),
        defineArrayMember({ type: 'heroVideo' }),
        defineArrayMember({ type: 'valueProps' }),
        defineArrayMember({ type: 'marqueeStrip' }),
        defineArrayMember({ type: 'categoryTiles' }),
        defineArrayMember({ type: 'productCarousel' }),
        defineArrayMember({ type: 'brandStory' }),
        defineArrayMember({ type: 'reelCarousel' }),
        defineArrayMember({ type: 'newsletter' }),
        defineArrayMember({ type: 'offerBanner' }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    select: { title: 'title', blocks: 'blocks' },
    prepare({ title, blocks }) {
      const count = Array.isArray(blocks) ? blocks.length : 0
      return {
        title: title ?? 'Homepage',
        subtitle: `${count} block${count === 1 ? '' : 's'}`,
      }
    },
  },
})
