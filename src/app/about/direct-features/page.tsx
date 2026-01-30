"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page has been merged with /about/features
// Redirect to the main features page
export default function DirectFeaturesRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/about/features");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <p className="text-gray-500">Redirecting to features...</p>
        </div>
    );
}
