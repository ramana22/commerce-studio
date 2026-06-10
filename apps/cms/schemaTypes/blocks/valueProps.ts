import { defineType, defineField, defineArrayMember } from 'sanity'

/** Row of icon + title + body trust badges (Sourced Carefully, Free Shipping…). */
export const valueProps = defineType({
  name: 'valueProps',
  title: 'Value props',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      validation: (rule) => rule.min(1).max(4),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'prop',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {
                list: [
                  { title: 'Leaf (sourced)', value: 'leaf' },
                  { title: 'Clock (long lasting)', value: 'clock' },
                  { title: 'Rabbit (cruelty-free)', value: 'rabbit' },
                  { title: 'Truck (shipping)', value: 'truck' },
                ],
                layout: 'radio',
              },
              initialValue: 'leaf',
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'body', title: 'Body', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'icon' } },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Value props' }
    },
  },
})
