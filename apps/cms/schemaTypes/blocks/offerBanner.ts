import { defineType, defineField } from 'sanity'

/** A promotional strip with optional background image and countdown. */
export const offerBanner = defineType({
  name: 'offerBanner',
  title: 'Offer banner',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Text',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background image (optional)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background colour',
      type: 'string',
      description: 'Hex value, e.g. #FF0F7B (used when no image is set)',
      validation: (rule) =>
        rule
          .regex(/^#([0-9A-Fa-f]{6})$/, { name: 'hex' })
          .error('Enter a 6-digit hex colour, e.g. #FF0F7B'),
      initialValue: '#FF0F7B',
    }),
    defineField({
      name: 'cta',
      title: 'Call to action',
      type: 'cta',
    }),
    defineField({
      name: 'countdownTo',
      title: 'Countdown to (optional)',
      type: 'datetime',
      description: 'Show a live countdown ending at this time',
    }),
  ],
  preview: {
    select: { title: 'text' },
    prepare({ title }) {
      return { title: title ?? 'Offer banner', subtitle: 'Offer banner' }
    },
  },
})
