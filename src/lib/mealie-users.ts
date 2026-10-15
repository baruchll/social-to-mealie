import { env } from '@/lib/constants'

export type MealieUser = {
  id: string
  email: string
  householdId: string
  householdSlug: string
  groupSlug: string
}

type RawUser = {
  id: string
  email?: string | null
  householdId: string
  householdSlug: string
  groupSlug: string
}

// Finds the Mealie user with this email using the admin API key.
// Returns null if no user matches or Mealie can't be reached.
export async function findMealieUserByEmail(email: string): Promise<MealieUser | null> {
  const wanted = email.trim().toLowerCase()
  if (!wanted) return null

  try {
    const res = await fetch(`${env.MEALIE_URL}/api/admin/users?perPage=500`, {
      headers: { Authorization: `Bearer ${env.MEALIE_API_KEY}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      console.error(`Mealie user lookup failed: HTTP ${res.status}`)
      return null
    }
    const body = (await res.json()) as { items?: RawUser[] }
    const match = (body.items ?? []).find((u) => u.email?.trim().toLowerCase() === wanted)
    if (!match) return null

    return {
      id: match.id,
      email: wanted,
      householdId: match.householdId,
      householdSlug: match.householdSlug,
      groupSlug: match.groupSlug,
    }
  } catch (err) {
    console.error('Mealie user lookup error', err)
    return null
  }
}
