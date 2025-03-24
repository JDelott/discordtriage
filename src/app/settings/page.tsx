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
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="container mx-auto max-w-2xl px-4">
                <div className="relative">
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-emerald-100 -z-10 rounded-lg" />
                    <h1 className="text-4xl font-normal mb-6 tracking-tight">
                        Configure <span className="text-emerald-500">GitHub Repository</span>
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-gray-600 mb-2 block">Repository (owner/name):</label>
                            <input 
                                type="text"
                                value={repo}
                                onChange={(e) => setRepo(e.target.value)}
                                placeholder="owner/repository"
                                className="border p-3 w-full rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        <button type="submit" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-emerald-500 transition-colors">
                            Save Settings
                        </button>
                        {status && <div className={`text-${status.includes('success') ? 'emerald' : 'red'}-500`}>{status}</div>}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SettingsContent />
        </Suspense>
    );
}
