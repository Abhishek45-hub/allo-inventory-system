"use client";

import { AppShell } from "@/components/layouts/app-shell";
import { Card } from "@/components/ui/card";
import { useReservationStore } from "@/features/reservations/reservation-store";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import Link from "next/link";

export default function ReservationsLandingPage() {
	useAuthGuard();
	const current = useReservationStore((state) => state.current);

	return (
		<AppShell>
			<Card>
				<h1 className="mb-2 text-xl font-semibold">Reservation Checkout</h1>
				{current ? (
					<Link
						href={`/reservations/${current.id}`}
						className="text-primary underline"
					>
						Continue reservation {current.id}
					</Link>
				) : (
					<p className="text-sm">
						No active in-memory reservation. Reserve one from products page.
					</p>
				)}
			</Card>
		</AppShell>
	);
}
