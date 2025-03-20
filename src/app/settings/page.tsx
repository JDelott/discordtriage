'use client';

import { useState } from 'react';

export default function Settings() {
    const [discordId, setDiscordId] = useState('');
    const [repo, setRepo] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId, repo }),
            });
            
            setMessage(response.ok ? 'Settings updated successfully!' : 'Failed to update settings.');
        } catch (error) {
            setMessage('Error updating settings.');
        }
    };

    return (
        <div className="h-screen bg-white flex items-center">
            <div className="container mx-auto px-8 max-w-xl relative">
                {/* Decorative Element */}
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-emerald-100 -z-10" />

                {/* Header */}
                <h1 className="text-6xl font-normal mb-16 tracking-tight">
                    <span className="text-emerald-500">Settings</span>
                </h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block">
                            <span className="text-sm uppercase tracking-widest mb-2 block">Discord ID</span>
                            <input
                                type="text"
                                value={discordId}
                                onChange={(e) => setDiscordId(e.target.value)}
                                className="mt-2 block w-full px-4 py-3 bg-gray-50 focus:bg-emerald-50 transition-colors outline-none text-lg"
                                placeholder="Right-click your name in Discord and copy ID"
                            />
                        </label>
                    </div>

                    <div>
                        <label className="block">
                            <span className="text-sm uppercase tracking-widest mb-2 block">GitHub Repository</span>
                            <input
                                type="text"
                                value={repo}
                                onChange={(e) => setRepo(e.target.value)}
                                className="mt-2 block w-full px-4 py-3 bg-gray-50 focus:bg-emerald-50 transition-colors outline-none text-lg"
                                placeholder="username/repository"
                            />
                        </label>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="bg-black text-white px-8 py-3 hover:bg-emerald-500 transition-colors"
                        >
                            Save Settings
                        </button>

                        {message && (
                            <p className="mt-4 text-sm text-emerald-500">{message}</p>
                        )}
                    </div>
                </form>

                {/* Back Link */}
                <div className="mt-16">
                    <a
                        href="/"
                        className="text-sm uppercase tracking-widest hover:text-emerald-500 transition-colors inline-flex items-center"
                    >
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
