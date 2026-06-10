import { defineType, defineField } from 'sanity'

/** Full-bleed hero with an autoplaying background video and overlaid copy. */
export const heroVideo = defineType({
  name: 'heroVideo',
  title: 'Hero video',
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
      name: 'video',
      title: 'Background video',
      type: 'responsiveVideo',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cta',
      title: 'Call to action',
      type: 'cta',
    }),
    defineField({
      name: 'textColor',
      title: 'Text colour',
      type: 'string',
      options: {
        list: [
          { title: 'Light (on dark video)', value: 'light' },
          { title: 'Dark (on light video)', value: 'dark' },
        ],
        layout: 'radio',
      },
      initialValue: 'light',
    }),
  ],
  preview: {
    select: { title: 'heading', media: 'video.poster' },
    prepare({ title, media }) {
      return { title: title ?? 'Hero video', subtitle: 'Hero video', media }
    },
  },
})
