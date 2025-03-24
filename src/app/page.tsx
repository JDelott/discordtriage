'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";

export default function Home() {
    const [botStatus, setBotStatus] = useState('checking');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [discordId, setDiscordId] = useState('');
    
    // Add guild ID to invite URL to enable auto-redirect
    const getInviteUrl = (guildId?: string) => {
        const baseUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_APPLICATION_ID}&permissions=0&scope=bot%20applications.commands`;
        return guildId ? `${baseUrl}&guild_id=${guildId}&disable_guild_select=true` : baseUrl;
    };

    useEffect(() => {
        // Check bot status
        fetch('/api/bot')
            .then(res => res.json())
            .then(() => setBotStatus('online'))
            .catch(() => setBotStatus('offline'));

        // Check auth status
        fetch('/api/auth/status')
            .then(res => res.json())
            .then(data => {
                setIsAuthenticated(data.authenticated);
                setDiscordId(data.discordId || '');
            });
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setIsAuthenticated(false);
            setDiscordId('');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 relative py-12 md:py-24">
                {/* Left Side */}
                <div className="relative text-center md:text-left">
                    <div className="mb-8 md:mb-12">
                        <div className="absolute -top-4 -left-4 w-16 md:w-20 h-16 md:h-20 bg-emerald-100 -z-10 rounded-lg hidden md:block" />
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal mb-4 md:mb-6 tracking-tight">
                            Discord <span className="text-emerald-500">Triage</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-md mx-auto md:mx-0">
                            Convert Discord messages into GitHub issues with a single click.
                        </p>
                        {botStatus === 'online' ? (
                            <a
                                href={getInviteUrl()}
                                className="inline-block bg-black text-white px-4 md:px-6 py-3 hover:bg-emerald-500 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Add to Discord
                            </a>
                        ) : (
                            <button
                                className="inline-block bg-gray-300 text-gray-600 px-4 md:px-6 py-3 cursor-not-allowed"
                                disabled
                            >
                                {botStatus === 'checking' ? 'Checking Bot Status...' : 'Bot Offline'}
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-center md:justify-start space-x-6">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <a
                                    href="/settings"
                                    className="text-sm uppercase tracking-widest hover:text-emerald-500 transition-colors"
                                >
                                    Settings
                                </a>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm uppercase tracking-widest hover:text-emerald-500 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => window.location.href = `/api/auth/github`}
                                className="text-sm uppercase tracking-widest hover:text-emerald-500 transition-colors"
                            >
                                Connect GitHub
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Side - Steps */}
                <div className="space-y-8 md:space-y-12 relative mt-12 md:mt-0">
                    <div className="border-l-2 border-black pl-4 md:pl-6 group hover:border-emerald-500 transition-colors">
                        <span className="text-sm uppercase tracking-widest mb-2 block text-emerald-500">01</span>
                        <h2 className="text-lg md:text-xl mb-2 group-hover:text-emerald-500 transition-colors">Add the Bot</h2>
                        <p className="text-gray-600 text-sm">
                            Click "Add to Discord" and select your server.
                        </p>
                    </div>

                    <div className="border-l-2 border-black pl-4 md:pl-6 group hover:border-emerald-500 transition-colors">
                        <span className="text-sm uppercase tracking-widest mb-2 block text-emerald-500">02</span>
                        <h2 className="text-lg md:text-xl mb-2 group-hover:text-emerald-500 transition-colors">Connect GitHub</h2>
                        <p className="text-gray-600 text-sm">
                            Right-click any message to connect your GitHub account.
                        </p>
                    </div>

                    <div className="border-l-2 border-black pl-4 md:pl-6 group hover:border-emerald-500 transition-colors">
                        <span className="text-sm uppercase tracking-widest mb-2 block text-emerald-500">03</span>
                        <h2 className="text-lg md:text-xl mb-2 group-hover:text-emerald-500 transition-colors">Create Issues</h2>
                        <p className="text-gray-600 text-sm">
                            Instantly convert messages into GitHub issues.
                        </p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-8 right-8 w-24 md:w-32 h-24 md:h-32 bg-emerald-50 -z-10 rotate-12 rounded-lg hidden md:block" />
                <div className="absolute top-1/2 right-32 w-12 md:w-16 h-12 md:h-16 bg-emerald-100 -z-10 -rotate-12 rounded-lg hidden md:block" />
            </div>
        </div>
    );
}
