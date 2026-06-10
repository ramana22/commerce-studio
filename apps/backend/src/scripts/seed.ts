/**
 * Medusa seed script — Phase 4
 *
 * Creates the minimum data required for the Sugar Store backend:
 *   - Store with INR as the supported currency
 *   - India region (INR, country code "in")
 *   - Product categories matching Sugar's 9 catalog categories
 *
 * Run after `pnpm --filter @sugar-store/backend dev` has migrated the DB:
 *   pnpm backend:seed
 *
 * Create an admin user separately (Medusa CLI):
 *   pnpm dlx medusa user -e admin@sugar-store.com -p <password>
 */
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { MedusaContainer } from '@medusajs/framework/types'
import type {
  IStoreModuleService,
  IRegionModuleService,
  IProductModuleService,
} from '@medusajs/framework/types'

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

export default async function seed({
  container,
}: {
  container: MedusaContainer
}): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info('Seeding Sugar Store…')

  // ── 1. Store: add INR as a supported currency ─────────────────────────────
  const storeService = container.resolve<IStoreModuleService>(Modules.STORE)

  const stores = await storeService.listStores()
  if (stores.length === 0) {
    await storeService.createStores({
      name: 'Sugar Store',
      supported_currencies: [{ currency_code: 'inr', is_default: true }],
    })
    logger.info('  ✓  Store created with INR currency')
  } else {
    const store = stores[0]!
    await storeService.updateStores(store.id, {
      name: 'Sugar Store',
      supported_currencies: [{ currency_code: 'inr', is_default: true }],
    })
    logger.info('  ✓  Store updated — INR currency enabled')
  }

  // ── 2. Region: India with INR ─────────────────────────────────────────────
  const regionService = container.resolve<IRegionModuleService>(Modules.REGION)

  const existingRegions = await regionService.listRegions({ name: 'India' })
  if (existingRegions.length === 0) {
    await regionService.createRegions({
      name: 'India',
      currency_code: 'inr',
      countries: ['in'],
    })
    logger.info('  ✓  Region "India" (INR) created')
  } else {
    logger.info('  ─  Region "India" already exists — skipping')
  }

  // ── 3. Product categories ─────────────────────────────────────────────────
  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT)

  const existingCategories = await productService.listProductCategories()
  const existingHandles = new Set(existingCategories.map((c) => c.handle))

  let categoriesCreated = 0
  for (const cat of SUGAR_CATEGORIES) {
    if (existingHandles.has(cat.handle)) {
      logger.info(`  ─  Category "${cat.name}" already exists — skipping`)
      continue
    }
    await productService.createProductCategories({
      name: cat.name,
      handle: cat.handle,
      is_active: true,
      is_internal: false,
    })
    logger.info(`  ✓  Category "${cat.name}" created`)
    categoriesCreated++
  }

  if (categoriesCreated === 0) {
    logger.info('  ─  All categories already exist')
  }

  logger.info('\nSeed complete!')
  logger.info('Next: create an admin user with:')
  logger.info('  pnpm dlx medusa user -e admin@sugar-store.com -p <password>')
  logger.info('Then run: pnpm catalog:import')
}
