import { routes } from "@/constants/routes";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const routeProtectionMiddleware = (request: NextRequest) => {
	if (request.nextUrl.pathname === routes.login) {
		return NextResponse.next();
	}

	const token = request.cookies.get("access_token")?.value;

	if (token) {
		return NextResponse.next();
	}

	const loginUrl = request.nextUrl.clone();
	loginUrl.pathname = routes.login;
	loginUrl.searchParams.set("next", request.nextUrl.pathname);

	return NextResponse.redirect(loginUrl);
};
