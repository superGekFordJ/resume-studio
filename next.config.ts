import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Tells Next.js not to bundle `express` in the server-side build.
   * This is necessary because:
   * 1. A dependency (`genkit`) uses `express`.
   * 2. `express` contains dynamic `require()` calls that Next.js's bundler (Webpack/Turbopack)
   *    cannot resolve at build time, causing a "Module not found" error.
   * By marking it as external, we tell Next.js to use a standard `require('express')` at runtime.
   *
   * IMPORTANT: For this to work, `express` must also be listed as a direct
   * dependency in `package.json` to ensure it's available in the final build.
   */
  serverExternalPackages: ['express'],
};

export default nextConfig;
