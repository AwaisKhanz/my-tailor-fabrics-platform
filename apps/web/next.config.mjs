/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@tbms/shared-types", "@tbms/shared-constants", "@tbms/ui"],
};

export default nextConfig;
