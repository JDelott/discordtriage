/** @type {import('next').NextConfig} */
const nextConfig = {
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
  env: {
    NEXT_PUBLIC_DISCORD_APPLICATION_ID: "1352461270561062975",
  },
};

export default nextConfig;
