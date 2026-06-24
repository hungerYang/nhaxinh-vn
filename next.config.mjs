import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/nhaxinh' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/nhaxinh' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  allowedDevOrigins: ['run-agent-*.remote-agent.svc.cluster.local'],
};

export default withNextIntl(nextConfig);
