/**
 * Medusa seed script — Phases 4 & 5
 *
 * Establishes everything the Sugar Store needs to take an order end-to-end:
 *
 *   Phase 4 (catalog)        Phase 5 (money path)
 *   ─────────────────        ────────────────────
 *   - Store (USD)            - Sales channel + publishable API key
 *   - US region (USD)        - Stock location
 *   - Product categories     - Manual fulfillment + manual payment providers
 *   - Demo products          - Shipping profile, fulfillment set, service zone
 *                            - Standard + Express shipping options (USD)
 *                            - Tax region (US sales tax)
 *
 * The demo products give a freshly seeded store a populated storefront out of
 * the box. Replace/extend them with your real catalog via `pnpm catalog:import`.
 *
 * Run after the DB has been migrated (`pnpm --filter @sugar-store/backend dev`):
 *   pnpm backend:seed
 *
 * The script is idempotent — re-running skips resources that already exist.
 * Note the publishable key printed at the end and copy it into your storefront
 * `.env` as NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.
 *
 * Create an admin user separately (Medusa CLI):
 *   pnpm dlx medusa user -e admin@sugar-store.com -p <password>
 */
import {
  ContainerRegistrationKeys,
  Modules,
  ModuleRegistrationName,
} from '@medusajs/framework/utils'
import type { MedusaContainer } from '@medusajs/framework/types'
import type {
  IStoreModuleService,
  IRegionModuleService,
  IProductModuleService,
  ISalesChannelModuleService,
  IStockLocationService,
  IFulfillmentModuleService,
  IApiKeyModuleService,
} from '@medusajs/framework/types'
import {
  createApiKeysWorkflow,
  createPricePreferencesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from '@medusajs/medusa/core-flows'

// BodyScent's fragrance categories — lower-kebab-case handles for Medusa.
// These match the storefront nav (apps/storefront/lib/catalog/nav.ts).
const STORE_CATEGORIES = [
  { name: 'For Her',     handle: 'for-her'     },
  { name: 'For Him',     handle: 'for-him'     },
  { name: 'Unisex',      handle: 'unisex'      },
  { name: 'Bestsellers', handle: 'bestsellers' },
  { name: 'Gifting',     handle: 'gifting'     },
  { name: 'Combos',      handle: 'combos'      },
] as const

// ── Demo catalog ──────────────────────────────────────────────────────────────
// A small, presentable product set so a freshly seeded store renders a populated
// storefront immediately (instead of "No products found"). For a real catalog,
// leave these in place and layer your products on top via `pnpm catalog:import`
// — the importer upserts by handle and won't clash with these demo handles.
//
// Prices are tax-exclusive cents (USD × 100). Variants set manage_inventory:false
// so demo products are always purchasable without an inventory-level setup.
// Thumbnails use picsum.photos (seeded per handle) so the grid renders without
// the R2 media pipeline configured; swap these for real R2/Sanity images later.
interface DemoVariant {
  title: string
  sku: string
  /** Selling price in cents (USD × 100). */
  price: number
}

interface DemoProduct {
  title: string
  handle: string
  description: string
  /** Primary category handle from STORE_CATEGORIES (the product's genre). */
  category: string
  /** Extra category handles (e.g. 'bestsellers', 'gifting') to also list under. */
  extraCategories?: string[]
  /** Variant option label — 'Size' for the roll-on volume options. */
  optionLabel: string
  variants: DemoVariant[]
  is_bestseller?: boolean
  is_new_launch?: boolean
  badge?: string
  review_count?: number
}

/** Standard roll-on size tiers (cents). Used to build "From $8.00" pricing. */
function sizes(prefix: string, base: number): DemoVariant[] {
  return [
    { title: '3 ml Roll-On', sku: `${prefix}-03`, price: base },
    { title: '6 ml Roll-On', sku: `${prefix}-06`, price: Math.round(base * 1.75) },
    { title: '12 ml Roll-On', sku: `${prefix}-12`, price: Math.round(base * 3) },
  ]
}

const DEMO_PRODUCTS: DemoProduct[] = [
  // ── For Her ──────────────────────────────────────────────────────────────
  {
    title: 'Velvet Oud',
    handle: 'velvet-oud',
    description:
      'A warm, opulent blend of oud, rose and amber — a signature scent for evenings out.',
    category: 'for-her',
    extraCategories: ['bestsellers'],
    optionLabel: 'Size',
    is_bestseller: true,
    badge: '12H Wear',
    review_count: 1284,
    variants: sizes('HER-OUD', 1200),
  },
  {
    title: 'Rose Saffron',
    handle: 'rose-saffron',
    description:
      'Bulgarian rose lifted by saffron and a soft musk drydown. Romantic and long-lasting.',
    category: 'for-her',
    optionLabel: 'Size',
    is_new_launch: true,
    review_count: 642,
    variants: sizes('HER-RSF', 900),
  },
  {
    title: 'Vanilla Orchid',
    handle: 'vanilla-orchid',
    description:
      'Creamy Madagascar vanilla wrapped around white orchid and sandalwood.',
    category: 'for-her',
    extraCategories: ['bestsellers'],
    optionLabel: 'Size',
    is_bestseller: true,
    review_count: 980,
    variants: sizes('HER-VNL', 800),
  },
  {
    title: 'Cherry Blossom',
    handle: 'cherry-blossom',
    description:
      'A fresh, fruity-floral of cherry blossom, peony and a whisper of white musk.',
    category: 'for-her',
    optionLabel: 'Size',
    review_count: 418,
    variants: sizes('HER-CBL', 800),
  },
  // ── For Him ──────────────────────────────────────────────────────────────
  {
    title: 'Aqua Marine',
    handle: 'aqua-marine',
    description:
      'Crisp bergamot and sea salt over cedar — a clean, aquatic scent for every day.',
    category: 'for-him',
    extraCategories: ['bestsellers'],
    optionLabel: 'Size',
    is_bestseller: true,
    badge: 'Bestseller',
    review_count: 1530,
    variants: sizes('HIM-AQM', 800),
  },
  {
    title: 'Noir Extreme',
    handle: 'noir-extreme',
    description:
      'Spicy cardamom, nutmeg and amber wood for a bold, magnetic trail.',
    category: 'for-him',
    optionLabel: 'Size',
    is_new_launch: true,
    review_count: 731,
    variants: sizes('HIM-NRX', 1000),
  },
  {
    title: 'Tobacco Vanille',
    handle: 'tobacco-vanille',
    description:
      'Rich tobacco leaf, tonka and vanilla — a warm, smoky cold-weather favourite.',
    category: 'for-him',
    optionLabel: 'Size',
    badge: '12H Wear',
    review_count: 612,
    variants: sizes('HIM-TBV', 1200),
  },
  {
    title: 'Sport Intense',
    handle: 'sport-intense',
    description:
      'Energising grapefruit and mint grounded by vetiver. Fresh, athletic, modern.',
    category: 'for-him',
    optionLabel: 'Size',
    review_count: 389,
    variants: sizes('HIM-SPT', 800),
  },
  // ── Unisex ───────────────────────────────────────────────────────────────
  {
    title: 'Oud Royale',
    handle: 'oud-royale',
    description:
      'A regal, smoky oud with leather and incense. Deep, complex and unforgettable.',
    category: 'unisex',
    extraCategories: ['bestsellers'],
    optionLabel: 'Size',
    is_bestseller: true,
    review_count: 1102,
    variants: sizes('UNI-ODR', 1500),
  },
  {
    title: 'Santal Mist',
    handle: 'santal-mist',
    description:
      'Velvety sandalwood, cardamom and violet — a serene, skin-like everyday scent.',
    category: 'unisex',
    optionLabel: 'Size',
    is_new_launch: true,
    review_count: 540,
    variants: sizes('UNI-SNT', 1000),
  },
  {
    title: 'Musk Al Tahara',
    handle: 'musk-al-tahara',
    description:
      'A soft, clean white musk — powdery, comforting and beautifully subtle.',
    category: 'unisex',
    optionLabel: 'Size',
    review_count: 877,
    variants: sizes('UNI-MSK', 800),
  },
  {
    title: 'Neroli Sun',
    handle: 'neroli-sun',
    description:
      'Sunlit neroli and orange blossom over warm amber. Bright, golden, uplifting.',
    category: 'unisex',
    optionLabel: 'Size',
    review_count: 463,
    variants: sizes('UNI-NRL', 900),
  },
  // ── Gifting & Combos ─────────────────────────────────────────────────────
  {
    title: 'Discovery Gift Set — 5 Minis',
    handle: 'discovery-gift-set',
    description:
      'Five 3 ml roll-ons in a keepsake box — the perfect introduction to BodyScent.',
    category: 'gifting',
    optionLabel: 'Size',
    is_bestseller: true,
    badge: 'Gift Ready',
    review_count: 754,
    variants: [{ title: '5 × 3 ml Set', sku: 'GIFT-DISCO-5', price: 3500 }],
  },
  {
    title: 'Signature Duo Box',
    handle: 'signature-duo-box',
    description:
      'Two 6 ml bestsellers, gift-wrapped — one for day, one for night.',
    category: 'gifting',
    optionLabel: 'Size',
    is_new_launch: true,
    review_count: 311,
    variants: [{ title: '2 × 6 ml Set', sku: 'GIFT-DUO-2', price: 2400 }],
  },
  {
    title: 'Build-Your-Own Trio',
    handle: 'build-your-own-trio',
    description:
      'Pick any three 6 ml roll-ons and save — layer them to craft your signature.',
    category: 'combos',
    optionLabel: 'Size',
    is_bestseller: true,
    badge: 'Save 20%',
    review_count: 588,
    variants: [{ title: '3 × 6 ml Combo', sku: 'COMBO-TRIO-3', price: 3300 }],
  },
  {
    title: 'Date Night Combo',
    handle: 'date-night-combo',
    description:
      'A his-and-hers pairing of Velvet Oud and Noir Extreme in travel-friendly 6 ml.',
    category: 'combos',
    optionLabel: 'Size',
    review_count: 244,
    variants: [{ title: '2 × 6 ml Combo', sku: 'COMBO-DATE-2', price: 2600 }],
  },
]

const SALES_CHANNEL_NAME = 'Sugar Online Store'
const STOCK_LOCATION_NAME = 'Sugar Warehouse — New Jersey'
const API_KEY_TITLE = 'Sugar Storefront'
const COUNTRY = 'us'
const CURRENCY = 'usd'

// Manual providers ship with Medusa core and require no external config.
const MANUAL_FULFILLMENT_PROVIDER = 'manual_manual'
const MANUAL_PAYMENT_PROVIDER = 'pp_system_default'

// Square is registered (and added to the region) only when configured.
const SQUARE_ENABLED = Boolean(
  process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID,
)
const SQUARE_PAYMENT_PROVIDER = 'pp_square_square'

// US sales tax is destination-based and varies by state; this single default
// rate is a placeholder — configure per-state nexus in production. Prices are
// stored tax-exclusive (the US convention: tax is added on top at checkout).
const SALES_TAX_RATE = 7.25

export default async function seed({
  container,
}: {
  container: MedusaContainer
}): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  logger.info('Seeding Sugar Store…')

  // ── 1. Sales channel ────────────────────────────────────────────────────
  const salesChannelService = container.resolve<ISalesChannelModuleService>(
    Modules.SALES_CHANNEL,
  )
  let [salesChannel] = await salesChannelService.listSalesChannels({
    name: SALES_CHANNEL_NAME,
  })
  if (!salesChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: SALES_CHANNEL_NAME }] },
    })
    salesChannel = result[0]!
    logger.info(`  ✓  Sales channel "${SALES_CHANNEL_NAME}" created`)
  } else {
    logger.info(`  ─  Sales channel "${SALES_CHANNEL_NAME}" already exists`)
  }

  // ── 2. Store: USD currency + default sales channel ──────────────────────
  const storeService = container.resolve<IStoreModuleService>(Modules.STORE)
  const [store] = await storeService.listStores()
  if (store) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          name: 'Sugar Store',
          supported_currencies: [{ currency_code: CURRENCY, is_default: true }],
          default_sales_channel_id: salesChannel.id,
        },
      },
    })
    logger.info('  ✓  Store configured (USD, default sales channel)')
  }

  // ── 3. Region: United States (USD) with the manual payment provider ─────
  const regionService = container.resolve<IRegionModuleService>(Modules.REGION)
  const paymentProviders = [
    MANUAL_PAYMENT_PROVIDER,
    ...(SQUARE_ENABLED ? [SQUARE_PAYMENT_PROVIDER] : []),
  ]
  let [region] = await regionService.listRegions({ name: 'United States' })
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: 'United States',
            currency_code: CURRENCY,
            countries: [COUNTRY],
            payment_providers: paymentProviders,
          },
        ],
      },
    })
    region = result[0]!
    logger.info(
      `  ✓  Region "United States" (USD) created — payment: ${paymentProviders.join(', ')}`,
    )
  } else {
    logger.info('  ─  Region "United States" already exists')
    if (SQUARE_ENABLED) {
      logger.info(
        '     (Square enabled — add it to the region in Admin if not already present)',
      )
    }
  }

  // ── 4. Tax region (US sales tax) + tax-exclusive USD pricing ─────────────
  try {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: COUNTRY,
          // Bind the region to the system tax provider. Without this the
          // provider_id is null and cart tax-line calculation (add-to-cart →
          // upsert-tax-lines) fails with "Could not resolve 'null'".
          provider_id: 'tp_system',
          default_tax_rate: {
            name: `Sales Tax ${SALES_TAX_RATE}%`,
            code: 'sales',
            rate: SALES_TAX_RATE,
          },
        },
      ],
    })
    logger.info(`  ✓  Tax region (US, sales tax ${SALES_TAX_RATE}%) created`)
  } catch {
    logger.info('  ─  Tax region (US) already exists')
  }

  // US prices are entered tax-exclusive — sales tax is added on top at checkout.
  const pricingService = container.resolve(Modules.PRICING)
  const existingPrefs = await pricingService.listPricePreferences({
    attribute: 'currency_code',
    value: CURRENCY,
  })
  if (existingPrefs.length === 0) {
    await createPricePreferencesWorkflow(container).run({
      input: [
        { attribute: 'currency_code', value: CURRENCY, is_tax_inclusive: false },
      ],
    })
    logger.info('  ✓  USD pricing set to tax-exclusive')
  } else {
    logger.info('  ─  USD price preference already exists')
  }

  // ── 5. Stock location ────────────────────────────────────────────────────
  const stockLocationService = container.resolve<IStockLocationService>(
    Modules.STOCK_LOCATION,
  )
  let [stockLocation] = await stockLocationService.listStockLocations({
    name: STOCK_LOCATION_NAME,
  })
  if (!stockLocation) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: STOCK_LOCATION_NAME,
            address: {
              city: 'Edison',
              country_code: COUNTRY,
              address_1: '100 Distribution Way',
              province: 'NJ',
              postal_code: '08817',
            },
          },
        ],
      },
    })
    stockLocation = result[0]!
    logger.info(`  ✓  Stock location "${STOCK_LOCATION_NAME}" created`)
  } else {
    logger.info(`  ─  Stock location "${STOCK_LOCATION_NAME}" already exists`)
  }

  // Link stock location → manual fulfillment provider
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: MANUAL_FULFILLMENT_PROVIDER,
    },
  })

  // Link sales channel → stock location
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [salesChannel.id],
    },
  })

  // ── 6. Shipping: profile, fulfillment set, service zone, options ─────────
  const fulfillmentService = container.resolve<IFulfillmentModuleService>(
    Modules.FULFILLMENT,
  )

  // Default shipping profile
  let [shippingProfile] = await fulfillmentService.listShippingProfiles({
    type: 'default',
  })
  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [{ name: 'Default Shipping Profile', type: 'default' }],
      },
    })
    shippingProfile = result[0]!
    logger.info('  ✓  Default shipping profile created')
  } else {
    logger.info('  ─  Default shipping profile already exists')
  }

  // Fulfillment set with a service zone covering the United States
  let [fulfillmentSet] = await fulfillmentService.listFulfillmentSets(
    { name: 'Sugar Delivery' },
    { relations: ['service_zones'] },
  )
  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentService.createFulfillmentSets({
      name: 'Sugar Delivery',
      type: 'shipping',
      service_zones: [
        {
          name: 'United States',
          geo_zones: [{ country_code: COUNTRY, type: 'country' }],
        },
      ],
    })
    logger.info('  ✓  Fulfillment set + US service zone created')
  } else {
    logger.info('  ─  Fulfillment set "Sugar Delivery" already exists')
  }

  // Link stock location → fulfillment set
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  })

  const serviceZone = fulfillmentSet.service_zones?.[0]
  if (serviceZone) {
    const existingOptions = await fulfillmentService.listShippingOptions({
      service_zone: { id: serviceZone.id },
    })
    if (existingOptions.length === 0) {
      // Prices are in cents (USD × 100) to match the catalog price convention.
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: 'Standard Delivery (3–5 days)',
            price_type: 'flat',
            provider_id: MANUAL_FULFILLMENT_PROVIDER,
            service_zone_id: serviceZone.id,
            shipping_profile_id: shippingProfile.id,
            type: {
              label: 'Standard',
              description: 'Delivered in 3–5 business days',
              code: 'standard',
            },
            prices: [{ currency_code: CURRENCY, amount: 599 }],
            rules: [
              { attribute: 'enabled_in_store', value: 'true', operator: 'eq' },
              { attribute: 'is_return', value: 'false', operator: 'eq' },
            ],
          },
          {
            name: 'Express Delivery (1–2 days)',
            price_type: 'flat',
            provider_id: MANUAL_FULFILLMENT_PROVIDER,
            service_zone_id: serviceZone.id,
            shipping_profile_id: shippingProfile.id,
            type: {
              label: 'Express',
              description: 'Delivered in 1–2 business days',
              code: 'express',
            },
            prices: [{ currency_code: CURRENCY, amount: 1499 }],
            rules: [
              { attribute: 'enabled_in_store', value: 'true', operator: 'eq' },
              { attribute: 'is_return', value: 'false', operator: 'eq' },
            ],
          },
        ],
      })
      logger.info('  ✓  Standard ($5.99) + Express ($14.99) shipping options created')
    } else {
      logger.info('  ─  Shipping options already exist')
    }
  }

  // ── 7. Publishable API key (linked to the sales channel) ────────────────
  const apiKeyService = container.resolve<IApiKeyModuleService>(
    ModuleRegistrationName.API_KEY,
  )
  let [publishableKey] = await apiKeyService.listApiKeys({
    title: API_KEY_TITLE,
    type: 'publishable',
  })
  if (!publishableKey) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          { title: API_KEY_TITLE, type: 'publishable', created_by: 'seed' },
        ],
      },
    })
    publishableKey = result[0]!
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: publishableKey.id, add: [salesChannel.id] },
    })
    logger.info('  ✓  Publishable API key created and linked to sales channel')
  } else {
    logger.info('  ─  Publishable API key already exists')
  }

  // ── 8. Product categories ────────────────────────────────────────────────
  const productService = container.resolve<IProductModuleService>(
    Modules.PRODUCT,
  )
  // `handle` must be selected explicitly — module-service list methods return
  // only `id` by default, which would make every category look new and break
  // idempotency (createProductCategories then throws on the duplicate handle).
  const existingCategories = await productService.listProductCategories(
    {},
    { select: ['handle'], take: 1000 },
  )
  const existingHandles = new Set(existingCategories.map((c) => c.handle))

  let categoriesCreated = 0
  for (const cat of STORE_CATEGORIES) {
    if (existingHandles.has(cat.handle)) continue
    await productService.createProductCategories({
      name: cat.name,
      handle: cat.handle,
      is_active: true,
      is_internal: false,
    })
    categoriesCreated++
  }
  logger.info(
    categoriesCreated > 0
      ? `  ✓  ${categoriesCreated} product categories created`
      : '  ─  All product categories already exist',
  )

  // ── 9. Demo products ──────────────────────────────────────────────────────
  // Resolve category ids by handle so demo products land in the right category.
  const allCategories = await productService.listProductCategories(
    {},
    { select: ['id', 'handle'], take: 1000 },
  )
  const categoryIdByHandle = new Map(
    allCategories.map((c) => [c.handle, c.id]),
  )

  // Skip any demo product whose handle already exists (idempotent re-runs).
  const existingProducts = await productService.listProducts(
    { handle: DEMO_PRODUCTS.map((p) => p.handle) },
    { select: ['handle'], take: 1000 },
  )
  const existingProductHandles = new Set(existingProducts.map((p) => p.handle))
  const productsToCreate = DEMO_PRODUCTS.filter(
    (p) => !existingProductHandles.has(p.handle),
  )

  if (productsToCreate.length > 0) {
    await createProductsWorkflow(container).run({
      input: {
        products: productsToCreate.map((p) => {
          // A product's genre plus any extra categories (bestsellers, etc.).
          const categoryIds = [p.category, ...(p.extraCategories ?? [])]
            .map((h) => categoryIdByHandle.get(h))
            .filter((id): id is string => Boolean(id))
          // Grayscale placeholder so cards read as cohesive product photography
          // without the R2 media pipeline; swap for real imagery later.
          const img = `https://picsum.photos/seed/${p.handle}/800/1000?grayscale`
          return {
            title: p.title,
            handle: p.handle,
            description: p.description,
            status: 'published' as const,
            thumbnail: img,
            images: [{ url: img }],
            shipping_profile_id: shippingProfile.id,
            sales_channels: [{ id: salesChannel.id }],
            ...(categoryIds.length ? { category_ids: categoryIds } : {}),
            options: [
              {
                title: p.optionLabel,
                values: p.variants.map((v) => v.title),
              },
            ],
            variants: p.variants.map((v) => ({
              title: v.title,
              sku: v.sku,
              // No inventory levels are seeded, so don't gate on stock.
              manage_inventory: false,
              prices: [{ amount: v.price, currency_code: CURRENCY }],
              options: { [p.optionLabel]: v.title },
            })),
            metadata: {
              category: p.category,
              ...(p.is_bestseller ? { is_bestseller: true } : {}),
              ...(p.is_new_launch ? { is_new_launch: true } : {}),
              ...(p.badge ? { badge: p.badge } : {}),
              ...(p.review_count ? { review_count: p.review_count } : {}),
            },
          }
        }),
      },
    })
    logger.info(`  ✓  ${productsToCreate.length} demo products created`)
  } else {
    logger.info('  ─  Demo products already exist')
  }

  // ── Done ─────────────────────────────────────────────────────────────────
  logger.info('\nSeed complete!')
  logger.info('━'.repeat(64))
  logger.info('  PUBLISHABLE API KEY (copy into storefront .env):')
  logger.info(`  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey.token}`)
  logger.info('━'.repeat(64))
  logger.info('Next steps:')
  logger.info('  1. Paste the publishable key above into .env, then restart the storefront')
  logger.info('     so it can read products (otherwise the grid shows "No products found").')
  logger.info('  2. Create an admin user whose credentials match MEDUSA_ADMIN_EMAIL')
  logger.info('     + MEDUSA_ADMIN_PASSWORD in .env, e.g.:')
  logger.info('     pnpm dlx medusa user -e admin@sugarcosmetics.com -p <password>')
  logger.info('  3. (Optional) Replace the demo products with your real catalog:')
  logger.info('     pnpm catalog:import')
}
