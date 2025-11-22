import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveThemePreference, determineTheme, type SupportedTheme } from '@/lib/theme';
import { z } from 'zod';
import { headers } from 'next/headers';

const themeSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
});

export async function GET() {
  try {
    // Get prefers-color-scheme header
    const headersList = await headers();
    const prefersColorScheme = headersList.get('prefers-color-scheme');
    
    // Determine theme with priority: user preference > cookies > system
    const theme = await determineTheme(prefersColorScheme);
    
    return NextResponse.json({ theme });
  } catch (error) {
    console.error('[API] Error getting theme:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // More strict check: ensure session exists, has user, and user has id
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { theme } = themeSchema.parse(body);
    
    await saveThemePreference(theme as SupportedTheme, session.user.id);
    
    return NextResponse.json({ success: true, theme });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be "light", "dark", or "system".' },
        { status: 400 }
      );
    }
    
    console.error('[API] Error updating theme preference:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

