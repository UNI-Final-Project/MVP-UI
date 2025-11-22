/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // 👇 AUMENTA EL LÍMITE DEL BODY
  experimental: {
    serverActions: {
      bodySizeLimit: "80mb", // súbelo a 50mb si tus videos son grandes
    },
  },
}

export default nextConfig
