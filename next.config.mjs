import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/nhaxinh-vn',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
};

export default withNextIntl(nextConfig);