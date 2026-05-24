import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-md border border-slate-400/40 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary dark:bg-slate-900/60 dark:text-slate-100',
        props.className,
      )}
    />
  );
}
