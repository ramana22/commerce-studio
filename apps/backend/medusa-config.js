const path = require('path')

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

// Register the Razorpay payment provider only when credentials are present, so
// the backend still boots (with the manual provider) in local/dev setups.
const modules = []
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  modules.push({
    resolve: '@medusajs/medusa/payment',
    options: {
      providers: [
        {
          resolve: './src/modules/razorpay',
          id: 'razorpay',
          options: {
            keyId: process.env.RAZORPAY_KEY_ID,
            keySecret: process.env.RAZORPAY_KEY_SECRET,
            webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
          },
        },
      ],
    },
  })
}

/** @type {import('@medusajs/framework/config').ConfigModule} */
module.exports = {
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
}
