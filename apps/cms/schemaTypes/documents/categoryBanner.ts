import { defineType, defineField } from 'sanity'

/**
 * A per-category hero shown at the top of a collection listing page. Linked to
 * Medusa by the category handle; one document per category.
 */
export const categoryBanner = defineType({
  name: 'categoryBanner',
  title: 'Category banner',
  type: 'document',
  fields: [
    defineField({
      name: 'categoryHandle',
      title: 'Category handle',
      type: 'string',
      description: 'Medusa category handle this banner belongs to, e.g. lips',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9-]+$/, { name: 'handle' })
          .error('Must be lowercase kebab-case'),
    }),
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
      name: 'mediaType',
      title: 'Media type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'image',
      title: 'Banner image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== 'image',
    }),
    defineField({
      name: 'video',
      title: 'Banner video',
      type: 'responsiveVideo',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'cta',
      title: 'Call to action',
      type: 'cta',
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'categoryHandle', media: 'image' },
  },
})
