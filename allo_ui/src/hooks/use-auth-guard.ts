"use client";

import { routes } from "@/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuthGuard = (): void => {
	const router = useRouter();
	const token = useAuthStore((state) => state.accessToken);
	const hydrated = useAuthStore((state) => state.hydrated);

	useEffect(() => {
		if (!hydrated) {
			return;
		}

		if (!token) {
			router.replace(routes.login);
		}
	}, [hydrated, router, token]);
};
