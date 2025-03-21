'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";

export default function Home() {
    const [botStatus, setBotStatus] = useState('checking');
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_APPLICATION_ID}&permissions=0&scope=bot%20applications.commands`;

    useEffect(() => {
        fetch('/api/bot')
            .then(res => res.json())
            .then(() => setBotStatus('online'))
            .catch(() => setBotStatus('offline'));
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-8 grid grid-cols-2 gap-16 relative">
                {/* Left Side */}
                <div>
                    <div className="mb-12">
                        <div className="absolute -top-4 -left-4 w-20 h-20 bg-emerald-100 -z-10" />
                        <h1 className="text-6xl font-normal mb-6 tracking-tight">
                            Discord <span className="text-emerald-500">Triage</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-md">
                            Convert Discord messages into GitHub issues with a single click.
                        </p>
                        {botStatus === 'online' ? (
                            <a
                                href={inviteUrl}
                                className="inline-block bg-black text-white px-6 py-3 hover:bg-emerald-500 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Add to Discord
                            </a>
                        ) : (
                            <button
                                className="inline-block bg-gray-300 text-gray-600 px-6 py-3 cursor-not-allowed"
                                disabled
                            >
                                {botStatus === 'checking' ? 'Checking Bot Status...' : 'Bot Offline'}
                            </button>
                        )}
                    </div>

                    <a
                        href="/settings"
                        className="text-sm uppercase tracking-widest hover:text-emerald-500 transition-colors inline-flex items-center mt-8"
                    >
                        Configure Settings 
                        <span className="ml-2">→</span>
                    </a>
                </div>

                {/* Right Side - Steps */}
                <div className="space-y-8">
                    <div className="border-l-2 border-black pl-6 group hover:border-emerald-500 transition-colors">
                        <span className="text-sm uppercase tracking-widest mb-2 block text-emerald-500">01</span>
                        <h2 className="text-xl mb-2 group-hover:text-emerald-500 transition-colors">Add the Bot</h2>
                        <p className="text-gray-600 text-sm">
                            Click "Add to Discord" and select your server.
                        </p>
                    </div>

                    <div className="border-l-2 border-black pl-6 group hover:border-emerald-500 transition-colors">
                        <span className="text-sm uppercase tracking-widest mb-2 block text-emerald-500">02</span>
                        <h2 className="text-xl mb-2 group-hover:text-emerald-500 transition-colors">Connect GitHub</h2>
                        <p className="text-gray-600 text-sm">
                            Right-click any message to connect your GitHub account.
                        </p>
                    </div>

                    <div className="border-l-2 border-black pl-6 group hover:border-emerald-500 transition-colors">
                        <span className="text-sm uppercase tracking-widest mb-2 block text-emerald-500">03</span>
                        <h2 className="text-xl mb-2 group-hover:text-emerald-500 transition-colors">Create Issues</h2>
                        <p className="text-gray-600 text-sm">
                            Instantly convert messages into GitHub issues.
                        </p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-8 right-8 w-32 h-32 bg-emerald-50 -z-10 rotate-12" />
                <div className="absolute top-1/2 right-32 w-16 h-16 bg-emerald-100 -z-10 -rotate-12" />
            </div>
        </div>
    );
}
