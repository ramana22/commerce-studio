import { defineType, defineField, defineArrayMember } from 'sanity'

/** Editorial split section — story copy, animated gradient art, and stats. */
export const brandStory = defineType({
  name: 'brandStory',
  title: 'Brand story',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'highlight',
      title: 'Highlighted word',
      type: 'string',
      description: 'Rendered in the gold italic accent',
    }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
    defineField({
      name: 'artWord',
      title: 'Art word',
      type: 'string',
      description: 'Large italic word shown inside the gradient art panel',
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      validation: (rule) => rule.max(3),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          fields: [
            defineField({ name: 'value', title: 'Value', type: 'string' }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
    }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string' }),
    defineField({
      name: 'ctaHref',
      title: 'Button link',
      type: 'string',
      description: 'Internal path (e.g. /bestsellers) or full URL',
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return { title: title ?? 'Brand story', subtitle: 'Brand story' }
    },
  },
})
