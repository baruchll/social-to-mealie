import NextAuth from "next-auth";

export const authEnabled = Boolean(process.env.AUTH_OIDC_ISSUER);

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
  session: { strategy: "jwt" },
});
