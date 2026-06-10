import { defineType, defineField } from 'sanity'

/**
 * A video with a required poster image (used as the LCP frame and as a
 * fallback) plus an optional mobile-specific cut for portrait viewports.
 */
export const responsiveVideo = defineType({
  name: 'responsiveVideo',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'desktop',
      title: 'Desktop video (MP4)',
      type: 'file',
      options: { accept: 'video/mp4' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mobile',
      title: 'Mobile video (MP4, optional)',
      type: 'file',
      options: { accept: 'video/mp4' },
    }),
    defineField({
      name: 'poster',
      title: 'Poster image',
      type: 'image',
      options: { hotspot: true },
      description: 'Shown before the video loads — also the LCP frame',
      validation: (rule) => rule.required(),
    }),
  ],
})
