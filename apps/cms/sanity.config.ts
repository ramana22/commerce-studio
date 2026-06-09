// Full block schemas added in Phase 6.
// Schemas: heroVideo, categoryTiles, productCarousel, reelCarousel,
//          offerBanner, announcementBar, categoryBanner, cartUpsells.
const config = {
  name: 'sugar-store' as const,
  title: 'Sugar Store CMS',
  projectId: process.env['SANITY_STUDIO_PROJECT_ID'] ?? '',
  dataset: process.env['SANITY_STUDIO_DATASET'] ?? 'production',
  plugins: [] as unknown[],
  schema: { types: [] as unknown[] },
}

export default config
