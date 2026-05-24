"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { reset: () => void }) {
	return (
		<main className="mx-auto mt-20 max-w-md rounded-md border border-danger bg-red-100 p-6 text-danger">
			<h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
			<p className="mb-4 text-sm">Try again or refresh the page.</p>
			<Button onClick={reset} variant="destructive">
				Retry
			</Button>
		</main>
	);
}
