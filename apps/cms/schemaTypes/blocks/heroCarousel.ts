import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * Auto-rotating hero carousel. Each slide is fully editable — copy, links and
 * the gradient art-direction colours (hex). Renders BodyScent's animated hero.
 */
export const heroCarousel = defineType({
  name: 'heroCarousel',
  title: 'Hero carousel',
  type: 'object',
  fields: [
    defineField({
      name: 'slides',
      title: 'Slides',
      type: 'array',
      validation: (rule) => rule.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'slide',
          fields: [
            defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'highlight',
              title: 'Highlighted word',
              type: 'string',
              description: 'Rendered in the gold italic accent',
            }),
            defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 2 }),
            defineField({ name: 'ctaLabel', title: 'Button label', type: 'string' }),
            defineField({
              name: 'ctaHref',
              title: 'Button link',
              type: 'string',
              description: 'Internal path (e.g. /for-her) or full URL',
            }),
            defineField({
              name: 'bgColor',
              title: 'Background colour (hex)',
              type: 'string',
              initialValue: '#1A1310',
            }),
            defineField({
              name: 'accentColor',
              title: 'Accent colour (hex)',
              type: 'string',
              initialValue: '#B5571F',
            }),
            defineField({
              name: 'liquidColor',
              title: 'Bottle liquid colour (hex)',
              type: 'string',
              initialValue: '#C9692F',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'highlight' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { slides: 'slides' },
    prepare({ slides }) {
      const count = Array.isArray(slides) ? slides.length : 0
      return { title: 'Hero carousel', subtitle: `${count} slide${count === 1 ? '' : 's'}` }
    },
  },
})
