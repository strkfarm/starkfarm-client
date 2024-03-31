/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    compiler: {
        removeConsole: {
            exclude: ['error', 'warn'],
        },
    },
    async rewrites() {
        return [
          {
            source: '/rpc-api',
            destination: 'https://rpc.nethermind.io/mainnet-juno?apikey=t1HPjhplOyEQpxqVMhpwLGuwmOlbXN0XivWUiPAxIBs0kHVK',
          },
        ]
    },
};

export default nextConfig;
