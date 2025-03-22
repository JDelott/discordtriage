'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Settings() {
    const router = useRouter();
    const [repo, setRepo] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Check auth and get existing settings
        fetch('/api/auth/status')
            .then(res => res.json())
            .then(data => {
                if (!data.authenticated) {
                    router.push('/');
                    return;
                }
                // Get user's existing settings
                return fetch('/api/settings/get').then(res => res.json());
            })
            .then(data => {
                if (data?.repo) {
                    setRepo(data.repo);
                }
            })
            .catch(() => {
                router.push('/');
            });
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repo }),
            });
            
            setMessage(response.ok ? 'Settings updated successfully!' : 'Failed to update settings.');
        } catch (error) {
            setMessage('Error updating settings.');
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="container mx-auto px-4 md:px-8 max-w-2xl relative py-12 md:py-24">
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-16 md:w-20 h-16 md:h-20 bg-emerald-100 -z-10 rounded-lg" />
                <div className="absolute bottom-8 right-8 w-24 md:w-32 h-24 md:h-32 bg-emerald-50 -z-10 rotate-12 rounded-lg" />
                
                {/* Content */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-normal mb-4 tracking-tight text-emerald-500">
                        Settings
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Configure your GitHub repository for issue creation.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    <div>
                        <label className="block text-sm uppercase tracking-widest text-gray-600 mb-2">
                            GitHub Repository
                        </label>
                        <input
                            type="text"
                            value={repo}
                            onChange={(e) => setRepo(e.target.value)}
                            placeholder="owner/repo (e.g., octocat/Hello-World)"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-emerald-500 transition-colors"
                    >
                        Save Settings
                    </button>
                    {message && (
                        <p className={`text-sm ${message.includes('success') ? 'text-emerald-500' : 'text-red-500'}`}>
                            {message}
                        </p>
                    )}
                </form>

                <div className="mt-8 text-center">
                    <a
                        href="/"
                        className="text-sm uppercase tracking-widest hover:text-emerald-500 transition-colors"
                    >
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
