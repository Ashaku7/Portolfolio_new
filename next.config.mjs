/** @type {import('next').NextConfig} */
const config = { reactStrictMode: true, distDir: process.env.PORTFOLIO_BUILD_DIR || '.next', poweredByHeader: false };
export default config;
