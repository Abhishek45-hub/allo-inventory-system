import Link from 'next/link';
import { AppShell } from '@/components/layouts/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const orders = [
  { id: 'ORD-2041', product: 'iPhone 15 Pro', status: 'Ready for dispatch' },
  { id: 'ORD-2040', product: 'Sony WH-1000XM5', status: 'Awaiting pickup' },
  { id: 'ORD-2039', product: 'MacBook Air M3', status: 'Packed' },
];

export default function OrdersPage() {
  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Review fulfillment status and move completed reservations forward.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/reservations">Open reservations</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{order.id}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{order.product}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700 dark:text-slate-200">{order.status}</span>
              <Button asChild>
                <Link href="/products">View inventory</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}