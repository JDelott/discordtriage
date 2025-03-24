'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SettingsPage() {
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
