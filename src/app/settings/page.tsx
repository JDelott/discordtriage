'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SettingsPage() {
    const [repo, setRepo] = useState('');
    const [status, setStatus] = useState('');
    const searchParams = useSearchParams();
    const guildId = searchParams.get('guild');

    useEffect(() => {
        if (!guildId) return;

        fetch(`/api/settings/get?guild=${guildId}`)
            .then(res => res.json())
            .then(data => {
                if (data.repo) setRepo(data.repo);
            })
            .catch(console.error);
    }, [guildId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guildId) {
            setStatus('No server selected');
            return;
        }

        try {
            const res = await fetch('/api/settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repo, guildId })
            });

            const data = await res.json();
            setStatus(data.message || data.error);
        } catch (error) {
            setStatus('Failed to update settings');
        }
    };

    if (!guildId) {
        return <div>Please select a server first</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl mb-4">Server Settings</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2">GitHub Repository:</label>
                    <input
                        type="text"
                        value={repo}
                        onChange={e => setRepo(e.target.value)}
                        placeholder="owner/repo"
                        className="w-full p-2 border rounded"
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Save Settings
                </button>
                {status && <p className="mt-4">{status}</p>}
            </form>
        </div>
    );
}
