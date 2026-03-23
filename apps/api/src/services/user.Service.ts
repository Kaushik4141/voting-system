import { createClerkClient } from '@clerk/backend'
import { getDb } from '../db/client'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { AppEnv } from '../types'

export const ensureUserExists = async (env: AppEnv['Bindings'], userId: string) => {
  const ormDb = getDb(env.DB)
  const existingUser = await ormDb.select().from(users).where(eq(users.id, userId))
  
  if (existingUser.length === 0) {
    try {
      const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })
      const userObj = await clerkClient.users.getUser(userId)
      
      const email = userObj.emailAddresses[0]?.emailAddress || null
      const firstName = userObj.firstName || ''
      const lastName = userObj.lastName || ''
      const name = `${firstName} ${lastName}`.trim() || null

      await ormDb.insert(users).values({ id: userId, name, email }).onConflictDoNothing()
    } catch (error) {
      console.error('Failed to fetch user from Clerk:', error)
      // Fallback insert so constraints don't cause 500 crashes
      await ormDb.insert(users).values({ id: userId }).onConflictDoNothing()
    }
  }
}
