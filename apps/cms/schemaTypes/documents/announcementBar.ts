import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * The thin bar above the header. A singleton holding a rotating set of
 * messages, each with an optional link.
 */
export const announcementBar = defineType({
  name: 'announcementBar',
  title: 'Announcement bar',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'messages',
      title: 'Messages',
      type: 'array',
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'message',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Link (optional)',
              type: 'string',
            }),
          ],
          preview: { select: { title: 'text', subtitle: 'href' } },
        }),
      ],
    }),
    defineField({
      name: 'rotateIntervalMs',
      title: 'Rotation interval (ms)',
      type: 'number',
      initialValue: 4000,
      validation: (rule) => rule.min(1000).max(20000),
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background colour',
      type: 'string',
      initialValue: '#000000',
      validation: (rule) =>
        rule.regex(/^#([0-9A-Fa-f]{6})$/, { name: 'hex' }).error('6-digit hex'),
    }),
    defineField({
      name: 'textColor',
      title: 'Text colour',
      type: 'string',
      initialValue: '#FFFFFF',
      validation: (rule) =>
        rule.regex(/^#([0-9A-Fa-f]{6})$/, { name: 'hex' }).error('6-digit hex'),
    }),
  ],
  preview: {
    select: { enabled: 'enabled', messages: 'messages' },
    prepare({ enabled, messages }) {
      const count = Array.isArray(messages) ? messages.length : 0
      return {
        title: 'Announcement bar',
        subtitle: `${enabled ? 'On' : 'Off'} · ${count} message${count === 1 ? '' : 's'}`,
      }
    },
  },
})
