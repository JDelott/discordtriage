'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SettingsContent() {
    const [repo, setRepo] = useState('');
    const [status, setStatus] = useState('');
    const searchParams = useSearchParams();
    const guildId = searchParams.get('guild');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

    return (
        <div className="p-4">
            <h1>Configure GitHub Repository</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label>Repository (owner/name):</label>
                    <input 
                        type="text"
                        value={repo}
                        onChange={(e) => setRepo(e.target.value)}
                        placeholder="owner/repository"
                        className="border p-2 w-full"
                    />
                </div>
                <button type="submit" className="bg-black text-white px-4 py-2 rounded">
                    Save Settings
                </button>
                {status && <div className="text-red-500">{status}</div>}
            </form>
        </div>
    );
}

// Wrap in Suspense boundary
export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="p-4">Loading...</div>}>
            <SettingsContent />
        </Suspense>
    );
}
