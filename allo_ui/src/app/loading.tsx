import { LoadingSkeleton } from '@/components/feedback/loading-skeleton';

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <LoadingSkeleton />
    </main>
  );
}
