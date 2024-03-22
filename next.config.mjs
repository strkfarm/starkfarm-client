/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    compiler: {
        removeConsole: {
            exclude: ['error', 'warn'],
        },
    },
};

export default nextConfig;
