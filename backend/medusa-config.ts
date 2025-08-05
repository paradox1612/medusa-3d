import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({

  admin: {
    vite: () => {
      return {
        server: {
          allowedHosts: ["localhost", "127.0.0.1", "0.0.0.0"], // replace ".medusa-server-testing.com" with ".yourdomain.com"
        },
      };
    },
  },

  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    
    // Add cookie options for better session handling
    cookieOptions: {
      secure: false, // Set to true only if using HTTPS
      httpOnly: true,
      sameSite: "lax", // Important for cross-origin authentication
      maxAge: 24 * 60 * 60 * 1000 * 7, // week
    },
    
    // Add session options
    sessionOptions: {
      resave: false,
      saveUninitialized: false,
      secret: process.env.COOKIE_SECRET || "supersecret",
      ttl: 24 * 60 * 60 * 1000 * 7, // week 
    },
  },
  
  modules: [


    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          // ...
          {
            resolve: "@medusajs/medusa/notification-sendgrid",
            id: "sendgrid",
            options: {
              channels: ["email"],
              api_key: process.env.SENDGRID_API_KEY,
              from: process.env.SENDGRID_FROM,
            },
          },
        ],
      },
    },

    
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: `@medusajs/medusa/fulfillment-manual`,
            id: "manual"
          },
        ],
      },
    },

    {
      resolve: './modules/threed-job',
    },
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/file-s3',
            id: 's3',
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
              additional_client_config: {
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    },

    {
      resolve: "./src/modules/gallery",
    },

    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              automatic_payment_methods: true,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: true,
              
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: { redis: { url: process.env.REDIS_URL } },
    },
  ]
})