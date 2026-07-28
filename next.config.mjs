/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_IMAGE_PROTOCOL,
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOSTNAME
      }
    ]
  },
  allowedDevOrigins: [process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGIN]
};

export default nextConfig;
