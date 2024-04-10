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
                destination: 'https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/starknet/:path*',
            },
        ]
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
