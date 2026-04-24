/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a minimal server bundle for container deploys. `next build` will
  // produce `.next/standalone/` (server.js + trimmed node_modules). The
  // Dockerfile copies that plus `public/` and `.next/static/` into the
  // runner image — resulting image is ~150 MB instead of ~400 MB.
  output: "standalone",
};

export default nextConfig;
