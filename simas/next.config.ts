import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // `next build` runs `tsc` and ESLint as part of the build. The TanStack
  // template's `vite build` is compile-only, so keep parity here: build
  // compiles, and `npm run typecheck` / `npm run lint` are the explicit gates.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
