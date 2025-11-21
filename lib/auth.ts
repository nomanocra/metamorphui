import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { Provider } from 'next-auth/providers';

const providers: Provider[] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Invalid credentials');
      }

      const user = await prisma.user.findUnique({
        where: {
          email: credentials.email,
        },
      });

      if (!user || !user.password) {
        throw new Error('Invalid credentials');
      }

      // Check if email is verified
      if (!user.emailVerified) {
        throw new Error('Email not verified. Please check your email and click the verification link.');
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

// Add OAuth providers only if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, // Allow linking OAuth accounts with same email
    })
  );
  console.log('✅ Google OAuth provider configured');
} else {
  console.warn('⚠️ Google OAuth credentials not found in environment variables');
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.unshift(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, // Allow linking OAuth accounts with same email
    })
  );
  console.log('✅ GitHub OAuth provider configured');
} else {
  console.warn('⚠️ GitHub OAuth credentials not found in environment variables');
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  pages: {
    signIn: '/signin',
    signOut: '/signin',
    error: '/signin?error=OAuthError',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // PrismaAdapter handles user creation automatically
      // But we can add logging for debugging
      if (account?.provider === 'github' || account?.provider === 'google') {
        console.log(`OAuth sign in with ${account.provider}:`, {
          email: user.email,
          name: user.name,
          hasId: !!user.id,
        });
      }
      // Allow all sign ins
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in - when user and account are provided
      if (account && user) {
        // For OAuth, ensure we have the user ID
        // PrismaAdapter creates the user, but user.id might not be immediately available
        if (user.id) {
          token.id = user.id;
          console.log(`JWT callback: User ID from user object: ${user.id}`);
        } else if (user.email) {
          // If user.id is not available, fetch it from database using email
          // This can happen with OAuth providers when the adapter creates the user
          try {
            let dbUser = await prisma.user.findUnique({
              where: { email: user.email },
            });
            
            if (!dbUser) {
              // If user doesn't exist yet, wait a bit and try again
              // This can happen if PrismaAdapter hasn't finished creating the user
              console.log('User not found, waiting for PrismaAdapter to create user...');
              await new Promise(resolve => setTimeout(resolve, 200));
              dbUser = await prisma.user.findUnique({
                where: { email: user.email },
              });
            }
            
            if (dbUser) {
              token.id = dbUser.id;
              console.log(`JWT callback: User ID from database: ${dbUser.id}`);
            } else {
              console.error('JWT callback: User not found in database after retry');
            }
          } catch (error) {
            console.error('Error fetching user in JWT callback:', error);
          }
        }
        
        token.accessToken = account.access_token;
        if (account.provider === 'google' && profile) {
          token.picture = profile.picture;
        }
        if (account.provider === 'github' && profile) {
          token.picture = profile.avatar_url;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // If token.id is not available, try to fetch it from the database
        if (!token.id && session.user.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email },
            });
            if (dbUser) {
              session.user.id = dbUser.id;
              token.id = dbUser.id; // Update token for future requests
            }
          } catch (error) {
            console.error('Error fetching user in session callback:', error);
          }
        } else if (token.id) {
          session.user.id = token.id as string;
        }
        
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
