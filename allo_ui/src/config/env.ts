import { z } from "zod";

const schema = z.object({
	NEXT_PUBLIC_API_URL: z.string().url(),
	NEXT_PUBLIC_RESERVATION_TTL_MINUTES: z.coerce
		.number()
		.min(1)
		.max(120)
		.default(10),
});

export const uiEnv = schema.parse({
	NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	NEXT_PUBLIC_RESERVATION_TTL_MINUTES:
		process.env.NEXT_PUBLIC_RESERVATION_TTL_MINUTES,
});
