/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://www.googleapis.com",
              "frame-src 'self' https://*.supabase.co https://accounts.google.com",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
