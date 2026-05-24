export { routeProtectionMiddleware as middleware } from "@/middleware/route-protection";

export const config = {
	matcher: [
		"/",
		"/products/:path*",
		"/warehouses/:path*",
		"/reservations/:path*",
		"/orders/:path*",
		"/analytics/:path*",
		"/settings/:path*",
	],
};
