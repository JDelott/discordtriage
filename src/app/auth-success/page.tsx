'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccess() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to settings after a short delay
        setTimeout(() => {
            router.push('/settings');
        }, 1500);
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Authentication Successful!</h1>
                <p>Redirecting you to settings...</p>
            </div>
        </div>
    );
}
