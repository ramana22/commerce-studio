// PM2 process definition for running the Medusa backend without Docker.
//
//   pnpm --filter @sugar-store/backend build
//   pm2 start infra/ecosystem.config.js
//   pm2 save && pm2 startup
//
// Runs the compiled server in apps/backend/.medusa/server.
module.exports = {
  apps: [
    {
      name: 'sugar-backend',
      cwd: './apps/backend/.medusa/server',
      script: 'npx',
      args: 'medusa start',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '9000',
      },
    },
  ],
}
