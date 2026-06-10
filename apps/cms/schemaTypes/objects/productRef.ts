import { defineType, defineField } from 'sanity'

/**
 * Reference to a Medusa product by handle. Sanity and Medusa are separate
 * systems, so merchandised products are linked by their stable handle; the
 * storefront resolves the live product (price, stock, media) at request time.
 */
export const productRef = defineType({
  name: 'productRef',
  title: 'Product',
  type: 'object',
  fields: [
    defineField({
      name: 'handle',
      title: 'Product handle',
      type: 'string',
      description: 'The Medusa product handle, e.g. matte-lipstick-ruby',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9-]+$/, {
            name: 'handle',
            invert: false,
          })
          .error('Must be lowercase kebab-case (letters, numbers, hyphens)'),
    }),
    defineField({
      name: 'label',
      title: 'Display label (optional)',
      type: 'string',
      description: 'Overrides the product title in this placement',
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'handle' },
    prepare({ title, subtitle }) {
      return { title: title ?? subtitle, subtitle: title ? subtitle : undefined }
    },
  },
})
