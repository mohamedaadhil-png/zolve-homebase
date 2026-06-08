/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.greenhouse.io' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' }],
      },
    ]
  },
}

export default nextConfig
