/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a minimal standalone build for Docker — only includes
  // files needed to run the server, no full node_modules copy.
  output: 'standalone',
};

export default nextConfig;
