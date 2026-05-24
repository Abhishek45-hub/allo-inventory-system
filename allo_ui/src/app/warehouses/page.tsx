import { AppShell } from "@/components/layouts/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const warehouses = [
	{
		name: "Mumbai Warehouse",
		city: "Mumbai, MH",
		stock: "8,450",
		utilization: "52%",
	},
	{
		name: "Delhi Warehouse",
		city: "Delhi, DL",
		stock: "6,780",
		utilization: "45%",
	},
	{
		name: "Bangalore Warehouse",
		city: "Bangalore, KA",
		stock: "5,320",
		utilization: "48%",
	},
];

export default function WarehousesPage() {
	return (
		<AppShell>
			<div className="mb-6 flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Warehouses</h1>
					<p className="text-sm text-slate-600 dark:text-slate-300">
						Track storage, utilization, and movement by site.
					</p>
				</div>
				<Button asChild variant="outline">
					<Link href="/products">Back to products</Link>
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{warehouses.map((warehouse) => (
					<Card key={warehouse.name} className="space-y-3">
						<h2 className="text-lg font-semibold">{warehouse.name}</h2>
						<p className="text-sm text-slate-600 dark:text-slate-300">
							{warehouse.city}
						</p>
						<p className="text-sm">Stock: {warehouse.stock}</p>
						<p className="text-sm">Utilization: {warehouse.utilization}</p>
						<div className="flex gap-2">
							<Button asChild>
								<Link href="/reservations">Open reservations</Link>
							</Button>
							<Button asChild variant="outline">
								<Link href="/products">Inventory</Link>
							</Button>
						</div>
					</Card>
				))}
			</div>
		</AppShell>
	);
}
