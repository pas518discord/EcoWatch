import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getOrganization } from "@/lib/db-operations"

// Demo credentials — in production use a real users table + bcrypt
const DEMO_USERS: Record<string, { password: string; orgId: string }> = {
  "demo@ecowatch.io":  { password: "demo123",  orgId: "org_demo_001" },
  "demo2@ecowatch.io": { password: "demo456",  orgId: "org_demo_002" },
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email    = credentials?.email    as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) return null

        const user = DEMO_USERS[email.toLowerCase()]
        if (!user || user.password !== password) return null

        // Load org details from DynamoDB
        const org = await getOrganization(user.orgId)
        if (!org) return null

        return {
          id:      user.orgId,
          email,
          name:    org.name,
          // Custom fields (attached in jwt callback below)
          orgId:   org.orgId,
          orgName: org.name,
          plan:    org.plan,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, user is populated — attach org data to token
      if (user) {
        const u = user as typeof user & {
          orgId: string; orgName: string; plan: string
        }
        token.orgId   = u.orgId
        token.orgName = u.orgName
        token.plan    = u.plan
      }
      return token
    },

    async session({ session, token }) {
      // Expose org data to the client via useSession()
      session.user.orgId   = token.orgId   as string
      session.user.orgName = token.orgName as string
      session.user.plan    = token.plan    as string
      return session
    },
  },

  pages: {
    signIn: "/login",     // redirect here when unauthenticated
  },

  session: {
    strategy: "jwt",
    maxAge:   7 * 24 * 60 * 60, // 7 days
  },
})

// Extend NextAuth types so TypeScript knows about orgId, orgName, plan
declare module "next-auth" {
  interface Session {
    user: {
      email: string
      name: string
      orgId: string
      orgName: string
      plan: string
    }
  }
  interface JWT {
    orgId: string
    orgName: string
    plan: string
  }
}
