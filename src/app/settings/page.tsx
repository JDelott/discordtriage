'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SettingsContent() {
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const guildId = searchParams.get('guild');

    useEffect(() => {
        if (!guildId) {
            setError('No server selected. Please use the link from Discord.');
            return;
        }

        // Start Discord auth immediately with guild ID
        window.location.href = `/api/auth/discord?guild=${guildId}`;
    }, [guildId]);

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return <div className="p-4">Redirecting to Discord authentication...</div>;
}

// Wrap in Suspense boundary
export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="p-4">Loading...</div>}>
            <SettingsContent />
        </Suspense>
    );
}
