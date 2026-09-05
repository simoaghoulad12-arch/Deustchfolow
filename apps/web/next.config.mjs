import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@deutschflow/ui', '@deutschflow/types'],
  // pnpm workspace: without this, Next's serverless-function file
  // tracing anchors at apps/web and misses @deutschflow/database's
  // generated Prisma Client (and its native Query Engine binary) which
  // lives up in the repo-root pnpm store. Left unset, the client
  // imports fine at build time but the engine binary isn't copied into
  // the deployed function on Vercel, producing
  // PrismaClientInitializationError at request time (build succeeds,
  // only the runtime request fails, since Vercel's build step doesn't
  // exercise this path — see DEPLOYMENT_STAGING.md).
  outputFileTracingRoot: path.join(__dirname, '../../'),
  experimental: {
    // Default Server Action body limit (1MB) is too small for tutor
    // verification document uploads (base64-encoded, up to ~5MB raw —
    // see apps/api's own MAX_DOCUMENT_BYTES). 7mb keeps headroom above
    // the ~6.7MB base64 expansion of a 5MB file.
    serverActions: { bodySizeLimit: '7mb' },
    // outputFileTracingRoot alone isn't enough: Prisma's generated
    // client resolves its Query Engine binary path at *runtime* (a
    // computed fs.existsSync check across candidate locations), which
    // Next's static file tracer cannot follow — confirmed by
    // inspecting the build's own .next/server/**/*.nft.json trace
    // manifests, which listed zero Prisma files even though the
    // bundled page.js references PrismaClient. Explicitly forcing the
    // engine binaries (and the rest of the generated client) into
    // every route's trace is the fix Prisma documents for this exact
    // pnpm-monorepo-on-Vercel case. On Next 14.2.x this option is only
    // read from `experimental` at build time (collect-build-traces.js
    // destructures it off `config.experimental`) even though the
    // top-level config schema also accepts it silently — top-level
    // placement is accepted but has no effect.
    outputFileTracingIncludes: {
      '/**/*': [
        '../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*',
      ],
    },
  },
};

export default nextConfig;
