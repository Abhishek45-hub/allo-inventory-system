"use client";

import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { AppShell } from "@/components/layouts/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useReservationStore } from "@/features/reservations/reservation-store";
import { getReservationApi } from "@/features/reservations/reservations.api";
import {
	useConfirmReservation,
	useReleaseReservation,
} from "@/features/reservations/use-reservation-actions";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useCountdown } from "@/hooks/use-countdown";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

export default function ReservationCheckoutPage() {
	useAuthGuard();
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const reservationId = Array.isArray(params.id) ? params.id[0] : params.id;
	const current = useReservationStore((state) => state.current);
	const setCurrent = useReservationStore((state) => state.setCurrent);
	const accessToken = useAuthStore((state) => state.accessToken);
	const hydrated = useAuthStore((state) => state.hydrated);
	const reservation = useQuery({
		queryKey: ["reservation", reservationId],
		queryFn: () => getReservationApi(reservationId),
		enabled: Boolean(reservationId) && hydrated && Boolean(accessToken),
		refetchInterval: (query) =>
			query.state.data?.status === "PENDING" ? 5_000 : false,
		initialData: current?.id === reservationId ? current : undefined,
	});
	const confirm = useConfirmReservation();
	const release = useReleaseReservation();
	const checkout = reservation.data;
	const countdown = useCountdown(
		checkout?.expiresAt ?? new Date().toISOString(),
	);
	const queryErrorStatus =
		axios.isAxiosError(reservation.error) && reservation.error.response
			? reservation.error.response.status
			: null;

	if (reservation.isLoading) {
		return (
			<AppShell>
				<LoadingSkeleton />
			</AppShell>
		);
	}

	if (!checkout || reservation.isError) {
		return (
			<AppShell>
				<Card className="space-y-3">
					<h1 className="text-xl font-semibold">Reservation unavailable</h1>
					{queryErrorStatus === 410 ? (
						<p className="text-sm text-danger">
							This reservation expired and inventory has been released.
						</p>
					) : queryErrorStatus === 401 ? (
						<p className="text-sm text-danger">
							Your session expired. Please sign in again.
						</p>
					) : (
						<p className="text-sm text-slate-600 dark:text-slate-300">
							This reservation was not found or has already expired.
						</p>
					)}
					<Button onClick={() => router.push("/products")}>
						Back to products
					</Button>
				</Card>
			</AppShell>
		);
	}

	return (
		<AppShell>
			<Card className="space-y-3">
				<h1 className="text-xl font-semibold">Checkout Reservation</h1>
				<p>ID: {checkout.id}</p>
				<p>Status: {checkout.status}</p>
				<p>Quantity: {checkout.quantity}</p>
				<p className={countdown.expired ? "text-danger font-semibold" : ""}>
					Expires in: {countdown.text}
				</p>

				<div className="flex gap-2">
					<Button
						disabled={
							confirm.isPending ||
							countdown.expired ||
							checkout.status !== "PENDING"
						}
						onClick={async () => {
							const next = await confirm.mutateAsync({
								id: checkout.id,
								idempotencyKey: crypto.randomUUID(),
							});
							setCurrent(next);
							router.push("/products");
						}}
					>
						Confirm purchase
					</Button>
					<Button
						variant="destructive"
						disabled={release.isPending || checkout.status !== "PENDING"}
						onClick={async () => {
							const next = await release.mutateAsync(checkout.id);
							setCurrent(next);
							router.push("/products");
						}}
					>
						Cancel reservation
					</Button>
				</div>
			</Card>
		</AppShell>
	);
}
