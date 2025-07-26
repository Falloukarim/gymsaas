const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore les erreurs TypeScript
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore les erreurs ESLint au build
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]
  },
}

module.exports = {
  images: {
    domains: [process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')],
    minimumCacheTTL: 60,
    formats: ['image/webp'], // Force le format moderne
  },
};