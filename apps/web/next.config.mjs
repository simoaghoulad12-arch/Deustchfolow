/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@deutschflow/ui', '@deutschflow/types'],
  experimental: {
    // Default Server Action body limit (1MB) is too small for tutor
    // verification document uploads (base64-encoded, up to ~5MB raw —
    // see apps/api's own MAX_DOCUMENT_BYTES). 7mb keeps headroom above
    // the ~6.7MB base64 expansion of a 5MB file.
    serverActions: { bodySizeLimit: '7mb' },
  },
};

export default nextConfig;
