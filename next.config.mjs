/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  compiler: {
    // removeConsole: {
    //   exclude: ['error'],
    // },
  },
  async rewrites() {
    return [
      {
        source: '/strk-incentives/:path*',
        destination:
          'https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/starknet/:path*',
      },
      {
        source: '/zklend/:path*',
        destination: 'https://app.zklend.com/:path*',
      },
      {
        source: '/jediswap/:path*',
        destination: 'https://api.jediswap.xyz/:path*',
      },
      {
        source: '/ekubo/:path*',
        destination: 'https://mainnet-api.ekubo.org/:path*',
      },
      {
        source: '/haiko/:path*',
        destination: 'https://app.haiko.xyz/api/v1/:path*',
      },
      {
        source: '/nostra/:path*',
        destination: 'https://us-east-2.aws.data.mongodb-api.com/:path*',
      },
      {
        source: '/carmine/:path*',
        destination: 'https://api.carmine.finance/:path*',
      },
      {
        source: '/myswap/:path*',
        destination: 'https://myswap-cl-charts.s3.amazonaws.com/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/usdc',
        destination: '/strategy/usdc_sensei',
        permanent: true,
      },
      {
        source: '/strk',
        destination: '/strategy/strk_sensei',
        permanent: true,
      },
      {
        source: '/eth',
        destination: '/strategy/eth_sensei',
        permanent: true,
      },
    ];
  },
  webpack(config, options) {
    if (options.isServer) config.devtool = 'source-map';
    return config;
  },
};

export default nextConfig;
