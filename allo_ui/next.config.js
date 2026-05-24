/** @type {import('next').NextConfig} */
const nextConfig = {
	distDir: ".next-local",
	typedRoutes: true,
	outputFileTracingRoot: __dirname,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "randomuser.me",
			},
		],
	},
};

module.exports = nextConfig;
