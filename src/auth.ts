import NextAuth from "next-auth";
import { findMealieUserByEmail } from "@/lib/mealie-users";
import type { MealieSession } from "@/types/next-auth";

export const authEnabled = Boolean(process.env.AUTH_OIDC_ISSUER);

// Opt-in: map each logged-in user to their Mealie user and household.
export const mapUsersEnabled =
  authEnabled && process.env.MEALIE_MAP_USERS === "true";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: authEnabled
    ? [
      {
        id: "oidc",
        name: process.env.AUTH_OIDC_NAME || "SSO",
        type: "oidc",
        issuer: process.env.AUTH_OIDC_ISSUER,
        clientId: process.env.AUTH_OIDC_CLIENT_ID,
        clientSecret: process.env.AUTH_OIDC_CLIENT_SECRET,
      },
    ]
    : [],
  pages: { signIn: "/signin" },
  session: { strategy: "jwt" },
  callbacks: {
    // Runs once at login: block users who have no Mealie account.
    async signIn({ profile }) {
      if (!mapUsersEnabled) return true;
      if (
        process.env.MEALIE_REQUIRE_VERIFIED_EMAIL === "true" &&
        profile?.email_verified !== true
      ) {
        return "/signin?error=EmailNotVerified";
      }
      const mealieUser = profile?.email
        ? await findMealieUserByEmail(profile.email)
        : null;
      if (!mealieUser) return "/signin?error=NoHousehold";
      return true;
    },
    // `profile` is only present at login, so the lookup is not repeated per request.
    async jwt({ token, profile }) {
      if (mapUsersEnabled && profile?.email) {
        const mealieUser = await findMealieUserByEmail(profile.email);
        if (mealieUser) {
          token.mealie = {
            userId: mealieUser.id,
            householdId: mealieUser.householdId,
            householdSlug: mealieUser.householdSlug,
            groupSlug: mealieUser.groupSlug,
          };
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.mealie) session.mealie = token.mealie as MealieSession;
      return session;
    },
  },
});
