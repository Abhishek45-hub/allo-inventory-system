export { routeProtectionMiddleware as middleware } from '@/middleware/route-protection';

export const config = {
  matcher: ['/reservations/:path*']
};
