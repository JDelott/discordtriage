/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      encoding: "commonjs encoding",
      "zlib-sync": "commonjs zlib-sync",
    });
    return config;
  },
  experimental: {
    outputFileTracingRoot: undefined,
  },
};

export default nextConfig;
