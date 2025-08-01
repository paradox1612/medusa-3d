const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: [
    '192.168.1.249',
    'localhost',
    '127.0.0.1',
    'https://backend.minimica.com',
    'https://minimica.com',
    // Add any other IPs you're accessing from
  ],
  reactStrictMode: true,
  // serverActions: {
  //   bodySizeLimit: '50mb',
  // },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Increase limit for image uploads
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "minio.mersate.com",
      },
      {
        protocol: 'https',
        hostname: 'pub-107b68c401754741b4d4ba0de2812aae.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: ["@medusajs/medusa"],
  async rewrites() {
    return [
      {
        source: '/store/:path*',
        destination: 'https://backend.minimica.com/store/:path*', // Backend API
      },
    ]
  },
}

module.exports = nextConfig
