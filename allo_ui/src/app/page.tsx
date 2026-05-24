import { AppShell } from "@/components/layouts/app-shell";
import { CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const stats = [
	{ label: "Total Products", value: "128", trend: "12.5%", direction: "up" },
	{ label: "Total Stock", value: "24,560", trend: "8.3%", direction: "up" },
	{ label: "Reserved Stock", value: "1,240", trend: "4.2%", direction: "down" },
	{ label: "Available Stock", value: "23,320", trend: "9.1%", direction: "up" },
];

const warehouses = [
	{
		name: "Mumbai Warehouse",
		location: "Mumbai, MH",
		total: "8,450",
		reserved: "420",
		available: "8,030",
		utilization: 52,
		image:
			"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300&auto=format&fit=crop",
	},
	{
		name: "Delhi Warehouse",
		location: "Delhi, DL",
		total: "6,780",
		reserved: "310",
		available: "6,470",
		utilization: 45,
		image:
			"https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=300&auto=format&fit=crop",
	},
	{
		name: "Bangalore Warehouse",
		location: "Bangalore, KA",
		total: "5,320",
		reserved: "280",
		available: "5,040",
		utilization: 48,
		image:
			"https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=300&auto=format&fit=crop",
	},
];

const reservations = [
	{
		product: "iPhone 15 Pro",
		id: "#RES-8291",
		warehouse: "Mumbai",
		time: "08:24",
		image:
			"https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=400&auto=format&fit=crop",
	},
	{
		product: "Sony WH-1000XM5",
		id: "#RES-8290",
		warehouse: "Delhi",
		time: "05:47",
		image:
			"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
	},
];

export default function DashboardPage() {
	return (
		<AppShell>
			<div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
				<div>
					<h1 className="mb-3 text-4xl font-extrabold text-[#16143a] sm:text-5xl">
						Dashboard
					</h1>
					<p className="text-lg text-gray-500">
						Overview of inventory, warehouses and reservations
					</p>
				</div>

				<div className="flex flex-col gap-5 sm:flex-row sm:items-center lg:gap-6">
					<div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-[0_6px_24px_rgba(0,0,0,0.05)]">
						<CalendarDays
							className="h-5 w-5 text-[#635bff]"
							aria-hidden="true"
						/>
						<span className="font-medium text-gray-700">
							May 12 - May 19, 2025
						</span>
					</div>

					<div className="flex items-center gap-4">
						<Image
							src="https://randomuser.me/api/portraits/men/32.jpg"
							alt="John Doe"
							className="h-14 w-14 rounded-full object-cover"
							width={56}
							height={56}
						/>
						<div>
							<h3 className="font-bold">John Doe</h3>
							<p className="text-gray-500">Admin</p>
						</div>
					</div>
				</div>
			</div>

			<section className="mb-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
				{stats.map((stat) => (
					<div
						key={stat.label}
						className="rounded-[28px] bg-white p-7 shadow-[0_6px_24px_rgba(0,0,0,0.05)]"
					>
						<p className="mb-3 text-gray-500">{stat.label}</p>
						<h2 className="mb-2 text-4xl font-bold sm:text-5xl">
							{stat.value}
						</h2>
						<span
							className={
								stat.direction === "up"
									? "font-semibold text-green-500"
									: "font-semibold text-red-500"
							}
						>
							{stat.direction === "up" ? "↗" : "↘"} {stat.trend}
						</span>
					</div>
				))}
			</section>

			<div className="grid gap-8 2xl:grid-cols-3">
				<section className="overflow-hidden rounded-[30px] bg-white p-7 shadow-[0_6px_24px_rgba(0,0,0,0.05)] 2xl:col-span-2">
					<div className="mb-8 flex items-center justify-between gap-4">
						<div>
							<h2 className="mb-2 text-3xl font-bold">Stock by Warehouse</h2>
							<p className="text-gray-500">Inventory overview</p>
						</div>
						<Link href="/products" className="font-semibold text-[#635bff]">
							View all
						</Link>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full min-w-[760px]">
							<thead>
								<tr className="border-b text-left text-gray-500">
									<th className="pb-5 font-medium">Warehouse</th>
									<th className="pb-5 font-medium">Location</th>
									<th className="pb-5 font-medium">Total</th>
									<th className="pb-5 font-medium">Reserved</th>
									<th className="pb-5 font-medium">Available</th>
									<th className="pb-5 font-medium">Utilization</th>
								</tr>
							</thead>
							<tbody>
								{warehouses.map((warehouse, index) => (
									<tr
										key={warehouse.name}
										className={
											index === warehouses.length - 1 ? "" : "border-b"
										}
									>
										<td className="flex items-center gap-4 py-6 font-medium">
											<Image
												src={warehouse.image}
												alt=""
												className="h-14 w-14 rounded-2xl object-cover"
												width={56}
												height={56}
											/>
											{warehouse.name}
										</td>
										<td>{warehouse.location}</td>
										<td>{warehouse.total}</td>
										<td className="text-orange-500">{warehouse.reserved}</td>
										<td className="text-green-600">{warehouse.available}</td>
										<td>
											<div className="flex items-center gap-4">
												<progress
													className="h-2 w-32 overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[#635bff] [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[#635bff]"
													max={100}
													value={warehouse.utilization}
												/>
												{warehouse.utilization}%
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section className="rounded-[30px] bg-white p-7 shadow-[0_6px_24px_rgba(0,0,0,0.05)]">
					<div className="mb-8 flex items-center justify-between gap-4">
						<h2 className="text-3xl font-bold">Live Reservations</h2>
						<Link href="/reservations" className="font-semibold text-[#635bff]">
							View all
						</Link>
					</div>

					<div className="space-y-6">
						{reservations.map((reservation) => (
							<div
								key={reservation.id}
								className="flex gap-4 border-b pb-5 last:border-b-0 last:pb-0"
							>
								<Image
									src={reservation.image}
									alt=""
									className="h-24 w-24 rounded-2xl object-cover"
									width={96}
									height={96}
								/>
								<div className="min-w-0 flex-1">
									<div className="flex justify-between gap-3">
										<div>
											<h3 className="text-xl font-bold">
												{reservation.product}
											</h3>
											<p className="text-gray-500">Res ID: {reservation.id}</p>
										</div>
										<span className="h-fit rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-600">
											PENDING
										</span>
									</div>
									<p className="mt-2 text-gray-500">
										Warehouse: {reservation.warehouse}
									</p>
									<p className="mt-3 font-semibold text-red-500">
										⏰ {reservation.time}
									</p>
								</div>
							</div>
						))}
					</div>
				</section>
			</div>
		</AppShell>
	);
}
