import type { StructureResolver } from 'sanity/structure'

/** Singletons pinned to a fixed document id so only one instance exists. */
const SINGLETONS = [
  { id: 'homepage', schemaType: 'homepage', title: 'Homepage' },
  {
    id: 'announcementBar',
    schemaType: 'announcementBar',
    title: 'Announcement bar',
  },
  { id: 'cartUpsells', schemaType: 'cartUpsells', title: 'Cart upsells' },
] as const

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...SINGLETONS.map((s) =>
        S.listItem()
          .id(s.id)
          .title(s.title)
          .child(S.document().schemaType(s.schemaType).documentId(s.id)),
      ),
      S.divider(),
      S.documentTypeListItem('categoryBanner').title('Category banners'),
    ])
