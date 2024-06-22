/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
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
        source: '/myswap/:path*',
        destination: 'https://myswap-cl-charts.s3.amazonaws.com/:path*',
      },
    ];
  },
  // async rewrites() {
  //     return [
  //       {
  //         source: '/rpc-api',
  //         destination: 'https://rpc.nethermind.io/mainnet-juno?apikey=t1HPjhplOyEQpxqVMhpwLGuwmOlbXN0XivWUiPAxIBs0kHVK',
  //       },
  //     ]
  // },
};

export default nextConfig;
