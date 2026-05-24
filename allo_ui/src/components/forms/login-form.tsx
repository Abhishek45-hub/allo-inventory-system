"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/use-login";
import { type LoginSchema, loginSchema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export function LoginForm() {
	const router = useRouter();
	const login = useLogin();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

	return (
		<form
			className="space-y-4"
			onSubmit={handleSubmit(async (data) => {
				try {
					await login.mutateAsync(data);
					router.push("/products");
				} catch {
					// Handled by useLogin.onError; prevent unhandled promise rejection in UI.
				}
			})}
		>
			<div>
				<label htmlFor="email" className="text-sm font-medium">
					Email
				</label>
				<Input id="email" {...register("email")} />
				{errors.email ? (
					<p className="text-xs text-danger">{errors.email.message}</p>
				) : null}
			</div>
			<div>
				<label htmlFor="password" className="text-sm font-medium">
					Password
				</label>
				<Input id="password" type="password" {...register("password")} />
				{errors.password ? (
					<p className="text-xs text-danger">{errors.password.message}</p>
				) : null}
			</div>
			<Button type="submit" className="w-full" disabled={login.isPending}>
				{login.isPending ? "Signing in..." : "Sign in"}
			</Button>
		</form>
	);
}
