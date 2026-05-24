import { AppShell } from "@/components/layouts/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const metrics = [
	{ label: "Conversion", value: "78.4%" },
	{ label: "Reserved stock", value: "1,240" },
	{ label: "Open checkout flows", value: "34" },
];

export default function AnalyticsPage() {
	return (
		<AppShell>
			<div className="mb-6 flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Analytics</h1>
					<p className="text-sm text-slate-600 dark:text-slate-300">
						Quick operational snapshot for demand and checkout flow.
					</p>
				</div>
				<Button asChild variant="outline">
					<Link href="/">Back to dashboard</Link>
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{metrics.map((metric) => (
					<Card key={metric.label} className="space-y-2">
						<p className="text-sm text-slate-600 dark:text-slate-300">
							{metric.label}
						</p>
						<h2 className="text-3xl font-bold">{metric.value}</h2>
					</Card>
				))}
			</div>
		</AppShell>
	);
}
