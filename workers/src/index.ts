export interface Env {
  DB: D1Database
  ASSETS: R2Bucket
  ENVIRONMENT: string
  ENTRA_TENANT_ID: string
  ENTRA_CLIENT_ID: string
  ENTRA_CLIENT_SECRET: string
  ENTRA_REDIRECT_URI: string
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function listProperties(env: Env) {
  const { results } = await env.DB.prepare('SELECT * FROM properties ORDER BY updated_at DESC LIMIT 200').all()
  return results
}

async function getPropertyById(id: string, env: Env) {
  const result = await env.DB.prepare('SELECT * FROM properties WHERE id = ?1').bind(id).first()
  return result
}

async function listTasks(env: Env) {
  const { results } = await env.DB.prepare('SELECT * FROM tasks ORDER BY scheduled_at ASC LIMIT 200').all()
  return results
}

async function listNotifications(env: Env) {
  const { results } = await env.DB.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 200').all()
  return results
}

async function markNotificationRead(id: string, env: Env) {
  await env.DB.prepare("UPDATE notifications SET read = 1 WHERE id = ?1").bind(id).run()
}

async function deleteNotification(id: string, env: Env) {
  await env.DB.prepare('DELETE FROM notifications WHERE id = ?1').bind(id).run()
}

async function currentOfficer(env: Env) {
  const first = await env.DB.prepare('SELECT * FROM officers ORDER BY updated_at DESC LIMIT 1').first()
  return first || null
}

async function createProperty(request: Request, env: Env) {
  const payload = (await request.json()) as Record<string, unknown>
  const id = String(payload.id || `prop-${Date.now()}`)

  await env.DB.prepare(
    `INSERT INTO properties (id, owner, province, latitude, longitude, market_price, appraisal_price, status, type, last_inspection, images, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, datetime('now'))`
  )
    .bind(
      id,
      String(payload.owner || ''),
      String(payload.province || ''),
      Number(payload.latitude || 0),
      Number(payload.longitude || 0),
      Number(payload.marketPrice || 0),
      Number(payload.appraisalPrice || 0),
      String(payload.status || 'pending'),
      String(payload.type || ''),
      String(payload.lastInspection || new Date().toISOString()),
      JSON.stringify(Array.isArray(payload.images) ? payload.images : [])
    )
    .run()

  const created = await env.DB.prepare('SELECT * FROM properties WHERE id = ?1').bind(id).first()
  return created
}

async function createAssessment(request: Request, env: Env) {
  const payload = (await request.json()) as Record<string, unknown>
  await env.DB.prepare(
    `INSERT INTO assessments (id, property_id, recommendation, score, note, checklist, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'))`
  )
    .bind(
      String(payload.id || `asm-${Date.now()}`),
      String(payload.propertyId || ''),
      Number(payload.recommendation || 0),
      Number(payload.score || 0),
      String(payload.note || ''),
      JSON.stringify(payload.checklist || [])
    )
    .run()

  return { ok: true }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname
    const propertyMatch = path.match(/^\/api\/properties\/([^/]+)$/)
    const markReadMatch = path.match(/^\/api\/notifications\/([^/]+)\/read$/)
    const deleteNotificationMatch = path.match(/^\/api\/notifications\/([^/]+)$/)

    if (request.method === 'GET' && path === '/api/properties') return json(await listProperties(env))
    if (request.method === 'GET' && propertyMatch) {
      const entity = await getPropertyById(propertyMatch[1], env)
      if (!entity) return json({ error: 'Not found' }, 404)
      return json(entity)
    }
    if (request.method === 'POST' && path === '/api/properties') return json(await createProperty(request, env), 201)
    if (request.method === 'GET' && path === '/api/tasks') return json(await listTasks(env))
    if (request.method === 'GET' && path === '/api/notifications') return json(await listNotifications(env))
    if (request.method === 'PATCH' && markReadMatch) {
      await markNotificationRead(markReadMatch[1], env)
      return json({ ok: true })
    }
    if (request.method === 'DELETE' && deleteNotificationMatch) {
      await deleteNotification(deleteNotificationMatch[1], env)
      return json({ ok: true })
    }
    if (request.method === 'GET' && path === '/api/officers/me') return json(await currentOfficer(env))
    if (request.method === 'POST' && path === '/api/assessments') return json(await createAssessment(request, env), 201)

    if (request.method === 'POST' && path === '/api/auth/login') {
      return json({
        accessToken: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        expiresIn: 3600,
        userId: 'officer-1',
      })
    }

    if (request.method === 'POST' && path === '/api/auth/entra/login') {
      return json({
        accessToken: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        expiresIn: 3600,
        userId: 'officer-1',
      })
    }

    if (request.method === 'POST' && path === '/api/auth/refresh') {
      return json({
        accessToken: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        expiresIn: 3600,
      })
    }

    if (request.method === 'POST' && path === '/api/ocr/extract') {
      return json({ lines: ['OCR extracted from uploaded asset'] })
    }

    if (request.method === 'PUT' && path.startsWith('/uploads/')) {
      const objectKey = path.replace('/uploads/', '')
      await env.ASSETS.put(objectKey, request.body)
      return json({ key: objectKey })
    }

    return json({ error: 'Not found' }, 404)
  },
} satisfies ExportedHandler<Env>
