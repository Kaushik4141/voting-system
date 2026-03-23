import { getDb } from '../db/client'
import { ratings, users } from '../db/schema'
import { eq, count } from 'drizzle-orm'
import type { AppEnv } from '../types'
import { ensureUserExists } from './user.Service'

export const fetchProgress = async (env: AppEnv['Bindings'], userId: string) => {
  const ormDb = getDb(env.DB)
  
  //ensure the user exists and grab profile data via Clerk
  await ensureUserExists(env, userId)

  const userRecord = await ormDb.select({ isCompleted: users.isCompleted }).from(users).where(eq(users.id, userId))
  const isCompleted = userRecord[0]?.isCompleted || false

  const countResult = await ormDb.select({ count: count() }).from(ratings).where(eq(ratings.userId, userId))
  const progressCount = countResult[0]?.count || 0

  return { progress: progressCount, isCompleted }
}
