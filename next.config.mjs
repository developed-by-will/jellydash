import { execSync } from 'child_process';

// Fetch the git version securely during the build
let gitVersion = 'dev';
try {
  gitVersion = execSync('git describe --tags --always').toString().trim();
} catch (e) {
  console.warn('Could not fetch git version, falling back to "dev" ', e);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Exposes the dynamic version to your client components
    NEXT_PUBLIC_APP_VERSION: gitVersion
  },
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
