import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { userConfigStore } from '@/storage/userConfig';

export function middleware(request: NextRequest) {
  // Only protect settings page and bot invite
  if (request.nextUrl.pathname === '/settings') {
    const discordId = request.cookies.get('discord_id')?.value;
    const githubToken = request.cookies.get('github_token')?.value;

    if (!githubToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/settings']
};
