'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layouts/app-shell';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Manage the visible controls and quick preferences for the workspace.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Back to dashboard</Link>
        </Button>
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Appearance</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Toggle the theme mode used across the app shell.</p>
        </div>
        <ThemeToggle />
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/products">Open products</Link>
          </Button>
          <Button asChild variant="outline">
            <a href="mailto:support@allo.com">Contact support</a>
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}