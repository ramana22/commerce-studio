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
 *                            - Shipping profile, fulfillment set, service zone
 *                            - Standard + Express shipping options (USD)
 *                            - Tax region (US sales tax)
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
  { name: 'Lips',        handle: 'lips'        },
  { name: 'Eyes',        handle: 'eyes'        },
  { name: 'Face',        handle: 'face'        },
  { name: 'Nails',       handle: 'nails'       },
  { name: 'Skin',        handle: 'skin'        },
  { name: 'Gifting',     handle: 'gifting'     },
  { name: 'Sugar Pop',   handle: 'sugar-pop'   },
  { name: 'Value Store', handle: 'value-store' },
  { name: 'Kits',        handle: 'kits'        },
] as const

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
  logger.info('  1. Create an admin user whose credentials match MEDUSA_ADMIN_EMAIL')
  logger.info('     + MEDUSA_ADMIN_PASSWORD in .env, e.g.:')
  logger.info('     pnpm dlx medusa user -e admin@sugarcosmetics.com -p <password>')
  logger.info('  2. pnpm catalog:import')
}
