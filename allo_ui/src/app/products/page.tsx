"use client";

import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { AppShell } from "@/components/layouts/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProducts } from "@/features/products/use-products";
import { useReservationStore } from "@/features/reservations/reservation-store";
import { useReserve } from "@/features/reservations/use-reservation-actions";
import Link from "next/link";
import { useState } from "react";

const catalogHighlights = [
	{ label: "Fast-moving items", value: "12" },
	{ label: "Warehouses tracked", value: "3" },
	{ label: "Low-stock alerts", value: "4" },
];

const emptySpotlight = [
	{
		name: "Sample product view",
		sku: "SKU-0001",
		stock: "Available in multiple warehouses",
	},
	{
		name: "Reservation workflow",
		sku: "Checkout reservation flow",
		stock: "Reserve, confirm, or release stock",
	},
];

export default function ProductsPage() {
	const [latestReservationId, setLatestReservationId] = useState<string | null>(
		null,
	);
	const setCurrentReservation = useReservationStore(
		(state) => state.setCurrent,
	);
	const products = useProducts();
	const reserve = useReserve();

	if (products.isLoading) {
		return (
			<AppShell>
				<LoadingSkeleton />
			</AppShell>
		);
	}

	return (
		<AppShell>
			<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<h1 className="text-3xl font-bold">Products</h1>
					<p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
						Browse inventory, check warehouse availability, and create a
						reservation in one step.
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<Button asChild>
						<Link href="/reservations">View reservations</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/analytics">See analytics</Link>
					</Button>
				</div>
			</div>

			<section className="mb-6 grid gap-4 md:grid-cols-3">
				{catalogHighlights.map((item) => (
					<Card key={item.label} className="space-y-2">
						<p className="text-sm text-slate-600 dark:text-slate-300">
							{item.label}
						</p>
						<p className="text-3xl font-bold">{item.value}</p>
					</Card>
				))}
			</section>

			{products.data && products.data.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2">
					{products.data.map((product) => (
						<Card key={product.id} className="space-y-4">
							<div>
								<h2 className="text-lg font-semibold">{product.name}</h2>
								<p className="text-sm text-slate-600 dark:text-slate-300">
									{product.sku}
								</p>
								{product.description ? (
									<p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
										{product.description}
									</p>
								) : null}
							</div>

							<div className="space-y-3">
								{product.warehouses.map((warehouse) => (
									<div
										key={warehouse.warehouseId}
										className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between transition-transform motion-safe:transition duration-150 ease-in-out hover:shadow-sm hover:scale-[1.01]"
									>
										<div>
											<p className="font-medium">{warehouse.warehouseName}</p>
											<p className="text-sm text-slate-600 dark:text-slate-300">
												Available: {warehouse.availableQuantity} · Reserved:{" "}
												{warehouse.reservedQuantity}
											</p>
										</div>
										<Button
											disabled={
												reserve.isPending || warehouse.availableQuantity < 1
											}
											onClick={async () => {
												const reservation = await reserve.mutateAsync({
													productId: product.id,
													warehouseId: warehouse.warehouseId,
													quantity: 1,
													idempotencyKey: crypto.randomUUID(),
												});
												setCurrentReservation(reservation);
												setLatestReservationId(reservation.id);
											}}
										>
											Reserve
										</Button>
									</div>
								))}
							</div>
						</Card>
					))}
				</div>
			) : (
				<div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
					<Card className="space-y-4">
						<h2 className="text-xl font-semibold">No products found</h2>
						<p className="text-sm text-slate-600 dark:text-slate-300">
							The catalog is currently empty, so here is a quick overview of
							what this page will show once inventory is loaded.
						</p>
						<div className="flex flex-wrap gap-3">
							<Button asChild>
								<Link href="/warehouses">Check warehouses</Link>
							</Button>
							<Button asChild variant="outline">
								<Link href="/reservations">Open reservations</Link>
							</Button>
						</div>
					</Card>

					<div className="space-y-4">
						{emptySpotlight.map((item) => (
							<Card key={item.name} className="space-y-2">
								<p className="text-lg font-semibold">{item.name}</p>
								<p className="text-sm text-slate-600 dark:text-slate-300">
									{item.sku}
								</p>
								<p className="text-sm text-slate-600 dark:text-slate-300">
									{item.stock}
								</p>
							</Card>
						))}
					</div>
				</div>
			)}

			{latestReservationId ? (
				<div className="mt-6">
					<Link
						href={`/reservations/${latestReservationId}`}
						className="text-primary underline underline-offset-4"
					>
						Open latest reservation checkout
					</Link>
				</div>
			) : null}
		</AppShell>
	);
}
