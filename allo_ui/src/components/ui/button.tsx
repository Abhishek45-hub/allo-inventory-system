import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-md px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-sm font-medium transition-transform transform will-change-transform motion-safe:transition duration-150 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-white hover:brightness-95 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
				outline:
					"border border-slate-400/40 bg-transparent hover:bg-slate-500/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
				destructive:
					"bg-danger text-white hover:brightness-95 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	};

export function Button({
	className,
	variant,
	asChild = false,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : "button";
	return (
		<Comp className={cn(buttonVariants({ variant }), className)} {...props} />
	);
}
