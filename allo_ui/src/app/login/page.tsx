"use client";

import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";
import { routes } from "@/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const accessToken = useAuthStore((state) => state.accessToken);
	const hydrated = useAuthStore((state) => state.hydrated);

	useEffect(() => {
		if (!hydrated || !accessToken) {
			return;
		}

		const nextPath = searchParams.get("next") || routes.products;
		router.replace(nextPath);
	}, [accessToken, hydrated, router, searchParams]);

	return (
		<div className="min-h-screen bg-[#f5f7fb] p-4 sm:p-8">
			<div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl items-center justify-center">
				<div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
					<section className="rounded-[28px] bg-gradient-to-br from-[#6c63ff] to-[#7b61ff] p-8 text-white sm:p-10">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-90">
							Allo Inventory
						</p>
						<h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
							Concurrency-safe stock reservations for checkout.
						</h1>
						<p className="mt-6 max-w-md text-sm text-white/90 sm:text-base">
							Sign in to reserve inventory, confirm payment, and prevent overselling
							across warehouses.
						</p>
					</section>

					<Card className="space-y-5 bg-white/95">
						<div>
							<h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
							<p className="mt-1 text-sm text-slate-600">
								Use your account to continue to the dashboard.
							</p>
						</div>
						<LoginForm />
					</Card>
				</div>
			</div>
		</div>
	);
}
