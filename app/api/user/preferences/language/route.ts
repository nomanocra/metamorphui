import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveLanguagePreference, type SupportedLocale } from '@/lib/language';
import { z } from 'zod';

const languageSchema = z.object({
  language: z.enum(['fr', 'en']),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      // User not logged in - return 401 but don't throw error
      // This is expected behavior when user is not authenticated
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { language } = languageSchema.parse(body);
    
    await saveLanguagePreference(language as SupportedLocale, session.user.id);
    
    return NextResponse.json({ success: true, language });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid language. Must be "fr" or "en".' },
        { status: 400 }
      );
    }
    
    console.error('[API] Error updating language preference:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

