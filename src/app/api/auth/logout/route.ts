import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = cookies();
    
    // Clear all auth-related cookies
    cookieStore.delete('github_token');
    cookieStore.delete('discord_id');
    
    return NextResponse.json({ success: true });
}
