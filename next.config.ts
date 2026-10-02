import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // PGlite (the local and test database) loads its WebAssembly and data files relative to its own module, which
  // breaks once bundled, so it's required from node_modules at run time instead.
  serverExternalPackages: ['@electric-sql/pglite'],
}

export default nextConfig
