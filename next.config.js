/** @type {import('next').NextConfig} */
const nextConfig = {

    webpack: (  //we need this to be able to render pdfs
        config,
        { buildId, dev, isServer, defaultLoaders, webpack }
      ) => {
        config.resolve.alias.canvas = false
        config.resolve.alias.encoding = false
        return config
      },
}

module.exports = nextConfig
