import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <article
      className={cn(
        'rounded-xl border border-slate-400/30 bg-white/60 p-4 sm:p-5 shadow-sm dark:bg-slate-900/40 transition-transform motion-safe:transition duration-150 ease-in-out hover:shadow-md hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </article>
  );
}
