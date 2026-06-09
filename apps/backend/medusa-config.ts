// Full provider configuration added in Phase 4.
// Manual payment provider used until Phase 9 (Razorpay/Cashfree swap).
const config = {
  projectConfig: {
    databaseUrl: process.env['DATABASE_URL'],
    redisUrl: process.env['REDIS_URL'],
    http: {
      storeCors: process.env['STORE_CORS'] ?? 'http://localhost:3000',
      adminCors: process.env['ADMIN_CORS'] ?? 'http://localhost:9000',
      authCors: process.env['AUTH_CORS'] ?? 'http://localhost:3000,http://localhost:9000',
      jwtSecret: process.env['JWT_SECRET'] ?? 'supersecret-change-in-production',
      cookieSecret: process.env['COOKIE_SECRET'] ?? 'supersecret-change-in-production',
    },
  },
  modules: [] as unknown[],
  plugins: [] as unknown[],
}

export default config
