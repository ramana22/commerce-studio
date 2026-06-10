import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * The "LIMITED TIME BONUS" rail shown in the cart drawer. A singleton listing
 * the products merchandised as add-on upsells.
 */
export const cartUpsells = defineType({
  name: 'cartUpsells',
  title: 'Cart upsells',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'LIMITED TIME BONUS',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'products',
      title: 'Upsell products',
      type: 'array',
      of: [defineArrayMember({ type: 'productRef' })],
      validation: (rule) => rule.required().min(1).max(8),
    }),
  ],
  preview: {
    select: { heading: 'heading', enabled: 'enabled', products: 'products' },
    prepare({ heading, enabled, products }) {
      const count = Array.isArray(products) ? products.length : 0
      return {
        title: heading ?? 'Cart upsells',
        subtitle: `${enabled ? 'On' : 'Off'} · ${count} product${count === 1 ? '' : 's'}`,
      }
    },
  },
})
