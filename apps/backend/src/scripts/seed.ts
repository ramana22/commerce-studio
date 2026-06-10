/**
 * Medusa seed script — Phases 4 & 5
 *
 * Establishes everything the Sugar Store needs to take an order end-to-end:
 *
 *   Phase 4 (catalog)        Phase 5 (money path)
 *   ─────────────────        ────────────────────
 *   - Store (INR)            - Sales channel + publishable API key
 *   - India region (INR)     - Stock location
 *   - Product categories     - Manual fulfillment + manual payment providers
 *                            - Shipping profile, fulfillment set, service zone
 *                            - Standard + Express shipping options (INR)
 *                            - Tax region (India)
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

// Sugar's product categories — lower-kebab-case handles for Medusa
const SUGAR_CATEGORIES = [
  { name: 'Lips',      handle: 'lips'      },
  { name: 'Eyes',      handle: 'eyes'      },
  { name: 'Face',      handle: 'face'      },
  { name: 'Nails',     handle: 'nails'     },
  { name: 'Skin',      handle: 'skin'      },
  { name: 'Gifting',   handle: 'gifting'   },
  { name: 'Sugar Pop', handle: 'sugar-pop' },
  { name: '249 Store', handle: '249-store' },
  { name: 'Kits',      handle: 'kits'      },
] as const

const SALES_CHANNEL_NAME = 'Sugar Online Store'
const STOCK_LOCATION_NAME = 'Sugar Warehouse — Mumbai'
const API_KEY_TITLE = 'Sugar Storefront'
const COUNTRY = 'in'
const CURRENCY = 'inr'

// Manual providers ship with Medusa core and require no external config.
const MANUAL_FULFILLMENT_PROVIDER = 'manual_manual'
const MANUAL_PAYMENT_PROVIDER = 'pp_system_default'

// Razorpay is registered (and added to the region) only when configured.
const RAZORPAY_ENABLED = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
)
const RAZORPAY_PAYMENT_PROVIDER = 'pp_razorpay_razorpay'

// GST on cosmetics in India is 18%. Prices are stored tax-inclusive (MRP style).
const GST_RATE = 18

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

  // ── 2. Store: INR currency + default sales channel ──────────────────────
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
    logger.info('  ✓  Store configured (INR, default sales channel)')
  }

  // ── 3. Region: India (INR) with the manual payment provider ─────────────
  const regionService = container.resolve<IRegionModuleService>(Modules.REGION)
  const paymentProviders = [
    MANUAL_PAYMENT_PROVIDER,
    ...(RAZORPAY_ENABLED ? [RAZORPAY_PAYMENT_PROVIDER] : []),
  ]
  let [region] = await regionService.listRegions({ name: 'India' })
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: 'India',
            currency_code: CURRENCY,
            countries: [COUNTRY],
            payment_providers: paymentProviders,
          },
        ],
      },
    })
    region = result[0]!
    logger.info(
      `  ✓  Region "India" (INR) created — payment: ${paymentProviders.join(', ')}`,
    )
  } else {
    logger.info('  ─  Region "India" already exists')
    if (RAZORPAY_ENABLED) {
      logger.info(
        '     (Razorpay enabled — add it to the region in Admin if not already present)',
      )
    }
  }

  // ── 4. Tax region (GST) + tax-inclusive INR pricing ──────────────────────
  try {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: COUNTRY,
          default_tax_rate: {
            name: `GST ${GST_RATE}%`,
            code: 'gst',
            rate: GST_RATE,
          },
        },
      ],
    })
    logger.info(`  ✓  Tax region (India, GST ${GST_RATE}%) created`)
  } catch {
    logger.info('  ─  Tax region (India) already exists')
  }

  // INR prices are entered tax-inclusive (Indian MRP convention).
  const pricingService = container.resolve(Modules.PRICING)
  const existingPrefs = await pricingService.listPricePreferences({
    attribute: 'currency_code',
    value: CURRENCY,
  })
  if (existingPrefs.length === 0) {
    await createPricePreferencesWorkflow(container).run({
      input: [
        { attribute: 'currency_code', value: CURRENCY, is_tax_inclusive: true },
      ],
    })
    logger.info('  ✓  INR pricing set to tax-inclusive')
  } else {
    logger.info('  ─  INR price preference already exists')
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
              city: 'Mumbai',
              country_code: COUNTRY,
              address_1: 'Andheri East',
              province: 'Maharashtra',
              postal_code: '400069',
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

  // Fulfillment set with a service zone covering India
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
          name: 'India',
          geo_zones: [{ country_code: COUNTRY, type: 'country' }],
        },
      ],
    })
    logger.info('  ✓  Fulfillment set + India service zone created')
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
      // Prices are in paise (INR × 100) to match the catalog price convention.
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
            prices: [{ currency_code: CURRENCY, amount: 4900 }],
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
            prices: [{ currency_code: CURRENCY, amount: 9900 }],
            rules: [
              { attribute: 'enabled_in_store', value: 'true', operator: 'eq' },
              { attribute: 'is_return', value: 'false', operator: 'eq' },
            ],
          },
        ],
      })
      logger.info('  ✓  Standard (₹49) + Express (₹99) shipping options created')
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
  const existingCategories = await productService.listProductCategories()
  const existingHandles = new Set(existingCategories.map((c) => c.handle))

  let categoriesCreated = 0
  for (const cat of SUGAR_CATEGORIES) {
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

  // ── Done ─────────────────────────────────────────────────────────────────
  logger.info('\nSeed complete!')
  logger.info('━'.repeat(64))
  logger.info('  PUBLISHABLE API KEY (copy into storefront .env):')
  logger.info(`  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey.token}`)
  logger.info('━'.repeat(64))
  logger.info('Next steps:')
  logger.info('  1. pnpm dlx medusa user -e admin@sugar-store.com -p <password>')
  logger.info('  2. pnpm catalog:import')
}
