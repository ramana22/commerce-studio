import { defineType, defineField } from 'sanity'

/** Infinite scrolling marquee strip of short phrases. */
export const marqueeStrip = defineType({
  name: 'marqueeStrip',
  title: 'Marquee strip',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Phrases',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare({ items }) {
      const list = Array.isArray(items) ? items : []
      return { title: 'Marquee strip', subtitle: list.join(' · ') }
    },
  },
})
