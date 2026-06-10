import { defineType, defineField } from 'sanity'

/** Email-capture call-to-action band with an animated success state. */
export const newsletter = defineType({
  name: 'newsletter',
  title: 'Newsletter',
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
    defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
    defineField({ name: 'placeholder', title: 'Input placeholder', type: 'string' }),
    defineField({ name: 'buttonLabel', title: 'Button label', type: 'string' }),
    defineField({ name: 'successText', title: 'Success message', type: 'string' }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return { title: title ?? 'Newsletter', subtitle: 'Newsletter' }
    },
  },
})
