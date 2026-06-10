const path = require('path')
const { defineConfig } = require('@medusajs/framework/utils')

// Load .env from the monorepo root (two levels up from apps/backend/)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

// Initialize backend error monitoring early, when configured.
if (process.env.SENTRY_DSN) {
  try {
    const Sentry = require('@sentry/node')
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV ?? 'development',
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    })
  } catch {
    // @sentry/node not installed — monitoring stays disabled.
  }
}

// Register the Square payment provider only when credentials are present, so
// the backend still boots (with the manual provider) in local/dev setups.
const modules = [
  // Reviews — product reviews owned in their own module (Phase 11).
  { resolve: './src/modules/review' },
]
if (
  process.env.SQUARE_ACCESS_TOKEN &&
  process.env.SQUARE_APPLICATION_ID &&
  process.env.SQUARE_LOCATION_ID
) {
  modules.push({
    resolve: '@medusajs/medusa/payment',
    options: {
      providers: [
        {
          resolve: './src/modules/square',
          id: 'square',
          options: {
            accessToken: process.env.SQUARE_ACCESS_TOKEN,
            applicationId: process.env.SQUARE_APPLICATION_ID,
            locationId: process.env.SQUARE_LOCATION_ID,
            environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
            webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
          },
        },
      ],
    },
  })
}

/** @type {import('@medusajs/framework/types').ConfigModule} */
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS ?? 'http://localhost:3000',
      adminCors: process.env.ADMIN_CORS ?? 'http://localhost:9000',
      authCors:
        process.env.AUTH_CORS ?? 'http://localhost:3000,http://localhost:9000',
      jwtSecret: process.env.JWT_SECRET ?? 'supersecret-change-in-production',
      cookieSecret:
        process.env.COOKIE_SECRET ?? 'supersecret-change-in-production',
    },
  },
  ...(modules.length > 0 ? { modules } : {}),
})
