export type MealieSession = {
  userId: string
  householdId: string
  householdSlug: string
  groupSlug: string
}

declare module "next-auth" {
  interface Session {
    mealie?: MealieSession
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    mealie?: MealieSession
  }
}
