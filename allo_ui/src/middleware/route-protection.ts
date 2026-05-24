import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const routeProtectionMiddleware = (_request: NextRequest) => {
  return NextResponse.next();
};
