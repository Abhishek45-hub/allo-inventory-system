"use client";

import { ThemeToggle } from "@/components/common/theme-toggle";
import { routes } from "@/constants/routes";
import {
	BarChart3,
	FileText,
	HelpCircle,
	Home,
	Menu,
	Package,
	Settings,
	ShoppingCart,
	Warehouse,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType, type PropsWithChildren, useState } from "react";

const navItems: Array<{
	label: string;
	href: Route;
	matchPath?: string;
	icon: ComponentType<{ className?: string }>;
}> = [
	{ label: "Dashboard", href: routes.dashboard, icon: Home },
	{ label: "Products", href: routes.products, icon: Package },
	{ label: "Warehouses", href: routes.warehouses, icon: Warehouse },
	{ label: "Reservations", href: routes.reservations, icon: ShoppingCart },
	{ label: "Orders", href: routes.orders, icon: FileText },
	{ label: "Analytics", href: routes.analytics, icon: BarChart3 },
	{ label: "Settings", href: routes.settings, icon: Settings },
];

export function AppShell({ children }: PropsWithChildren) {
	const pathname = usePathname();
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	const primaryNav = (
		<nav className="space-y-4" aria-label="Primary navigation">
			{navItems.map((item) => {
				const Icon = item.icon;
				const matchPath = item.matchPath ?? item.href;
				const active =
					matchPath === "/" ? pathname === "/" : pathname.startsWith(matchPath);
				return (
					<Link
						key={item.label}
						href={item.href}
						onClick={() => setMobileNavOpen(false)}
						className={
							active
								? "flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#7b61ff] px-6 py-4 font-semibold text-white"
								: "flex items-center gap-4 rounded-2xl px-6 py-4 text-gray-600 transition hover:bg-gray-100"
						}
					>
						<Icon className="h-5 w-5" aria-hidden="true" />
						{item.label}
					</Link>
				);
			})}
		</nav>
	);

	return (
		<div className="min-h-screen bg-[#f5f7fb] p-5 text-[#16143a]">
			{mobileNavOpen ? (
				<button
					type="button"
					aria-label="Close navigation"
					className="fixed inset-0 z-40 bg-black/30 xl:hidden"
					onClick={() => setMobileNavOpen(false)}
				/>
			) : null}

			<div className="flex min-h-[calc(100vh-40px)] overflow-hidden rounded-[35px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
				<aside
					className={
						mobileNavOpen
							? "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col justify-between border-r border-gray-100 bg-white p-8 shadow-2xl xl:static xl:flex xl:shadow-none"
							: "hidden w-[280px] flex-col justify-between border-r border-gray-100 bg-white p-8 xl:flex"
					}
				>
					<div>
						<div className="mb-14 flex items-center justify-between">
							<Link
								href="/"
								className="flex items-center gap-3"
								aria-label="Allo dashboard"
							>
								<div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#7b61ff]" />
								<span className="text-4xl font-bold text-[#3b2a89]">allo</span>
							</Link>
							<button
								type="button"
								aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
								className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
								onClick={() => setMobileNavOpen((value) => !value)}
							>
								<Menu className="h-7 w-7" aria-hidden="true" />
							</button>
						</div>

						{primaryNav}
					</div>

					<div className="rounded-[30px] bg-[#faf8ff] p-8 text-center">
						<div className="mb-5 flex justify-center">
							<ThemeToggle />
						</div>
						<div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-[28px] bg-white shadow-[0_6px_24px_rgba(0,0,0,0.05)]">
							<HelpCircle
								className="h-14 w-14 text-[#635bff]"
								aria-hidden="true"
							/>
						</div>
						<h3 className="mb-3 text-2xl font-bold">Need help?</h3>
						<p className="mb-6 leading-7 text-gray-500">
							Check our documentation or contact support.
						</p>
						<a
							href="mailto:support@allo.com"
							className="inline-block rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#7b61ff] px-7 py-4 font-semibold text-white"
						>
							Contact Support
						</a>
					</div>
				</aside>

				<main className="min-w-0 flex-1 bg-[#f7f8fc] p-5 sm:p-8 lg:p-10">
					<div className="mb-6 flex items-center justify-between gap-4 xl:hidden">
						<Link
							href="/"
							className="flex items-center gap-3"
							aria-label="Allo dashboard"
						>
							<div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#7b61ff]" />
							<span className="text-3xl font-bold text-[#3b2a89]">allo</span>
						</Link>
						<div className="flex items-center gap-2">
							<ThemeToggle />
							<button
								type="button"
								aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
								className="rounded-md border border-slate-300 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-slate-50"
								onClick={() => setMobileNavOpen((value) => !value)}
							>
								<Menu className="h-5 w-5" aria-hidden="true" />
							</button>
						</div>
					</div>
					{children}
				</main>
			</div>
		</div>
	);
}
