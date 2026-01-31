import { chromium } from '@playwright/test'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import pg from 'pg'

export default async function globalSetup(config) {
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://127.0.0.1:3000'
  const adminEmail = process.env.ADMIN_EMAIL || process.env.TEST_USER_EMAIL || 'playwright@example.com'
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for Playwright auth setup.')
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  const userResult = await client.query('SELECT id FROM "user" WHERE email = $1 LIMIT 1', [adminEmail])
  let userId = userResult.rows[0]?.id

  if (!userId) {
    userId = `test_${randomUUID()}`
    await client.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [userId, 'Playwright User', adminEmail, true]
    )
  }

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const sessionId = `test_${randomUUID()}`
  await client.query(
    `INSERT INTO "session" (id, "userId", token, "expiresAt", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, NOW(), NOW())`,
    [sessionId, userId, token, expiresAt]
  )

  const browser = await chromium.launch()
  const context = await browser.newContext()

  const url = new URL(baseURL)
  await context.addCookies([
    {
      name: 'better-auth.session_token',
      value: token,
      domain: url.hostname,
      path: '/',
      httpOnly: true,
      secure: url.protocol === 'https:',
      sameSite: 'Lax',
    },
  ])

  const storagePath = path.resolve(process.cwd(), 'tests', '.auth', 'state.json')
  await fs.mkdir(path.dirname(storagePath), { recursive: true })
  await context.storageState({ path: storagePath })

  await browser.close()
  await client.end()
}
