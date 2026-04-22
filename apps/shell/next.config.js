const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(__dirname, 'lib/generated/prisma/*.node'),
              to: path.join(__dirname, '.next/server/[name][ext]'),
              noErrorOnMissing: true,
            },
          ],
        })
      )
    }
    return config
  },
}

module.exports = nextConfig
