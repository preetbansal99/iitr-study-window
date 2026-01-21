'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-slate-50 dark:bg-slate-900">
            <div className="mb-6 rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                Something went wrong
            </h2>
            <p className="mb-6 max-w-md text-slate-600 dark:text-slate-400">
                We apologize for the inconvenience. An unexpected error occurred while loading this page.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
                    Go Home
                </Button>
                <Button onClick={() => reset()}>
                    Try Again
                </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 max-w-lg overflow-auto rounded bg-slate-950 p-4 text-left text-xs text-red-400">
                    <p className="font-mono">{error.toString()}</p>
                    {error.digest && <p className="mt-2 text-slate-500">Digest: {error.digest}</p>}
                </div>
            )}
        </div>
    );
}
