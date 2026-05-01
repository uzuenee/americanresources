function supabaseImagePattern() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    return {
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      port: url.port,
      pathname: '/storage/v1/object/public/content-images/**',
    };
  } catch {
    return null;
  }
}

const remotePatterns = [supabaseImagePattern()].filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns,
  },
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
