/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      encoding: "commonjs encoding",
      "zlib-sync": "commonjs zlib-sync",
    });

    // Add rule for native modules
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
      type: "javascript/auto",
    });

    return config;
  },
};

export default nextConfig;
