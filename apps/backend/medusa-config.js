const path = require('path')

// Load .env from the monorepo root (two levels up from apps/backend/)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const { defineConfig } = require('@medusajs/framework')

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
})
