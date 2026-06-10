import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * A horizontally scrolling rail of products. The source can be a hand-picked
 * list or a dynamic query resolved by the storefront (bestsellers, new
 * launches, or everything in a category).
 */
export const productCarousel = defineType({
  name: 'productCarousel',
  title: 'Product carousel',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
    }),
    defineField({
      name: 'source',
      title: 'Product source',
      type: 'string',
      options: {
        list: [
          { title: 'Hand-picked', value: 'manual' },
          { title: 'Category', value: 'category' },
          { title: 'Bestsellers', value: 'bestsellers' },
          { title: 'New launches', value: 'new' },
        ],
        layout: 'radio',
      },
      initialValue: 'manual',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'products',
      title: 'Products',
      type: 'array',
      of: [defineArrayMember({ type: 'productRef' })],
      hidden: ({ parent }) => parent?.source !== 'manual',
      validation: (rule) =>
        rule.custom((value, context) => {
          const source = (context.parent as { source?: string })?.source
          if (source === 'manual' && (!value || value.length === 0)) {
            return 'Add at least one product for a hand-picked carousel'
          }
          return true
        }),
    }),
    defineField({
      name: 'categoryHandle',
      title: 'Category handle',
      type: 'string',
      description: 'Medusa category handle, e.g. lips',
      hidden: ({ parent }) => parent?.source !== 'category',
      validation: (rule) =>
        rule.custom((value, context) => {
          const source = (context.parent as { source?: string })?.source
          if (source === 'category' && !value) {
            return 'A category handle is required for a category carousel'
          }
          return true
        }),
    }),
    defineField({
      name: 'limit',
      title: 'Max products',
      type: 'number',
      initialValue: 12,
      validation: (rule) => rule.min(1).max(24).integer(),
      hidden: ({ parent }) => parent?.source === 'manual',
    }),
    defineField({
      name: 'viewAllHref',
      title: 'View all link (optional)',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'heading', source: 'source' },
    prepare({ title, source }) {
      return {
        title: title ?? 'Product carousel',
        subtitle: `Product carousel · ${source ?? 'manual'}`,
      }
    },
  },
})
