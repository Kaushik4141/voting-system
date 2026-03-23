import type { Context } from 'hono'
import type { AppEnv } from '../types'
import { fetchProgress } from '../services/progress.Service'

export const getProgress = async (c: Context<AppEnv>) => {
  const userId = c.get('userId')
  
  try {
    const data = await fetchProgress(c.env, userId)
    return c.json(data)
  } catch (e: any) {
    console.error('Progress error:', e)
    return c.json({ success: false, message: 'Internal Server Error' }, 500)
  }
}
