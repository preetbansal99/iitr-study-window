import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-slate-50 dark:bg-slate-900">
            <div className="mb-6 rounded-full bg-indigo-100 p-4 dark:bg-indigo-900/30">
                <FileQuestion className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                Page Not Found
            </h2>
            <p className="mb-6 max-w-md text-slate-600 dark:text-slate-400">
                The page you are looking for does not exist or has been moved.
            </p>
            <Link href="/dashboard">
                <Button>
                    Return to Dashboard
                </Button>
            </Link>
        </div>
    );
}
