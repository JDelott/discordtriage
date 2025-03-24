import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { userConfigStore } from '@/storage/userConfig';

export function middleware(request: NextRequest) {
  // Only protect settings page
  if (request.nextUrl.pathname === '/settings') {
    const discordId = request.cookies.get('discord_id')?.value;
    const githubToken = request.cookies.get('github_token')?.value;
    const guildId = request.nextUrl.searchParams.get('guild');

    if (!discordId || !githubToken) {
      // Redirect to Discord auth with return URL
      const returnUrl = encodeURIComponent(`/settings?guild=${guildId}`);
      return NextResponse.redirect(new URL(`/api/auth/discord?guild=${guildId}&returnUrl=${returnUrl}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/settings']
};
