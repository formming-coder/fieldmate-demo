export interface Env {
  DB: D1Database
  ASSETS: R2Bucket
  ENVIRONMENT: string
  CORS_ORIGIN?: string
  JWT_AUDIENCE?: string
  JWT_ISSUER?: string
  JWT_SECRET?: string
  ENTRA_TENANT_ID: string
  ENTRA_CLIENT_ID: string
  ENTRA_CLIENT_SECRET: string
  ENTRA_REDIRECT_URI: string
}

type AppRole = 'Administrator' | 'Manager' | 'Reviewer' | 'Officer' | 'Viewer'

type AuthContext = {
  userId: string
  role: AppRole
  email: string
}

function securityHeaders(origin = '*') {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(self), geolocation=(self)',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'",
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-Request-Id',
  }
}

function json(data: unknown, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: securityHeaders(origin),
  })
}

function normalizeRole(input?: string | null): AppRole {
  const value = (input || '').toLowerCase()
  if (value === 'administrator' || value === 'admin') return 'Administrator'
  if (value === 'manager') return 'Manager'
  if (value === 'reviewer') return 'Reviewer'
  if (value === 'viewer') return 'Viewer'
  return 'Officer'
}

function canAccess(role: AppRole, allowed: AppRole[]) {
  return allowed.includes(role)
}

async function parseJsonBody(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

function parseBearerToken(request: Request) {
  const raw = request.headers.get('Authorization') || ''
  if (!raw.startsWith('Bearer ')) return null
  return raw.slice('Bearer '.length).trim()
}

function decodeTokenRole(token: string | null): AppRole {
  if (!token) return 'Officer'
  const marker = token.toLowerCase()
  if (marker.includes('admin')) return 'Administrator'
  if (marker.includes('manager')) return 'Manager'
  if (marker.includes('reviewer')) return 'Reviewer'
  if (marker.includes('viewer')) return 'Viewer'
  return 'Officer'
}

function getAuthContext(request: Request, env: Env): AuthContext | null {
  const token = parseBearerToken(request)
  if (!token && env.ENVIRONMENT === 'production') {
    return null
  }

  const role = decodeTokenRole(token)
  return {
    userId: token ? `user-${token.slice(0, 8)}` : 'dev-user',
    role,
    email: token ? `${role.toLowerCase()}@fieldmate.local` : 'dev.officer@fieldmate.local',
  }
}

async function writeAuditLog(env: Env, actorId: string, action: string, entityType: string, entityId: string, details?: Record<string, unknown>) {
  await env.DB.prepare(
    `INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'))`
  )
    .bind(crypto.randomUUID(), actorId, action, entityType, entityId, JSON.stringify(details || {}))
    .run()
}

async function listProperties(env: Env) {
  const { results } = await env.DB.prepare('SELECT * FROM properties ORDER BY updated_at DESC LIMIT 200').all()
  return results
}

async function getPropertyById(id: string, env: Env) {
  const result = await env.DB.prepare('SELECT * FROM properties WHERE id = ?1').bind(id).first()
  return result
}

async function updateProperty(id: string, request: Request, env: Env) {
  const payload = await parseJsonBody(request)
  await env.DB.prepare(
    `UPDATE properties
     SET owner = ?2,
         province = ?3,
         latitude = ?4,
         longitude = ?5,
         market_price = ?6,
         appraisal_price = ?7,
         status = ?8,
         type = ?9,
         last_inspection = ?10,
         images = ?11,
         updated_at = datetime('now')
     WHERE id = ?1`
  )
    .bind(
      id,
      String(payload.owner || ''),
      String(payload.province || ''),
      Number(payload.latitude || 0),
      Number(payload.longitude || 0),
      Number(payload.marketPrice || payload.market_price || 0),
      Number(payload.appraisalPrice || payload.appraisal_price || 0),
      String(payload.status || 'pending'),
      String(payload.type || ''),
      String(payload.lastInspection || payload.last_inspection || new Date().toISOString()),
      JSON.stringify(Array.isArray(payload.images) ? payload.images : [])
    )
    .run()

  return getPropertyById(id, env)
}

async function deleteProperty(id: string, env: Env) {
  await env.DB.prepare('DELETE FROM properties WHERE id = ?1').bind(id).run()
  return { ok: true }
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

async function markAllNotificationsRead(env: Env) {
  await env.DB.prepare('UPDATE notifications SET read = 1').run()
}

async function deleteNotification(id: string, env: Env) {
  await env.DB.prepare('DELETE FROM notifications WHERE id = ?1').bind(id).run()
}

async function currentOfficer(env: Env) {
  const first = await env.DB.prepare('SELECT * FROM officers ORDER BY updated_at DESC LIMIT 1').first()
  return first || null
}

async function currentUserProfile(env: Env, auth: AuthContext) {
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?1').bind(auth.userId).first()
  if (user) return user
  return {
    id: auth.userId,
    name: 'Field Officer',
    email: auth.email,
    role: auth.role,
    department: 'Property Valuation',
  }
}

async function createProperty(request: Request, env: Env) {
  const payload = await parseJsonBody(request)
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
  const payload = await parseJsonBody(request)
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

async function uploadPhoto(request: Request, env: Env) {
  const payload = await parseJsonBody(request)
  const propertyId = String(payload.propertyId || 'unknown')
  const key = `properties/${propertyId}/photos/${Date.now()}.jpg`
  await env.DB.prepare(
    `INSERT INTO property_photos (id, property_id, photo_url, metadata, created_at)
     VALUES (?1, ?2, ?3, ?4, datetime('now'))`
  )
    .bind(crypto.randomUUID(), propertyId, `/uploads/${key}`, JSON.stringify(payload.metadata || {}))
    .run()
  return { key, publicUrl: `/uploads/${key}` }
}

async function listSharedProperties(env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT sp.id, sp.property_id, sp.shared_with, sp.permission, sp.created_at, p.owner, p.province
     FROM shared_properties sp
     LEFT JOIN properties p ON p.id = sp.property_id
     ORDER BY sp.created_at DESC
     LIMIT 200`
  ).all()
  return results
}

async function listPropertyVersions(propertyId: string, env: Env) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM property_versions WHERE property_id = ?1 ORDER BY created_at DESC LIMIT 50'
  ).bind(propertyId).all()
  return results
}

async function listPropertyTimeline(propertyId: string, env: Env) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM property_history WHERE property_id = ?1 ORDER BY created_at DESC LIMIT 100'
  ).bind(propertyId).all()
  return results
}

async function restorePropertyVersion(propertyId: string, versionId: string, env: Env) {
  const version = await env.DB.prepare(
    'SELECT snapshot FROM property_versions WHERE id = ?1 AND property_id = ?2'
  ).bind(versionId, propertyId).first<{ snapshot: string }>()

  if (!version) {
    return null
  }

  const snapshot = JSON.parse(version.snapshot || '{}') as Record<string, unknown>
  await env.DB.prepare(
    `UPDATE properties
     SET owner = ?2,
         province = ?3,
         latitude = ?4,
         longitude = ?5,
         market_price = ?6,
         appraisal_price = ?7,
         status = ?8,
         type = ?9,
         last_inspection = ?10,
         images = ?11,
         updated_at = datetime('now')
     WHERE id = ?1`
  )
    .bind(
      propertyId,
      String(snapshot.owner || ''),
      String(snapshot.province || ''),
      Number(snapshot.latitude || 0),
      Number(snapshot.longitude || 0),
      Number(snapshot.market_price || snapshot.marketPrice || 0),
      Number(snapshot.appraisal_price || snapshot.appraisalPrice || 0),
      String(snapshot.status || 'pending'),
      String(snapshot.type || ''),
      String(snapshot.last_inspection || snapshot.lastInspection || new Date().toISOString()),
      JSON.stringify(Array.isArray(snapshot.images) ? snapshot.images : [])
    )
    .run()

  return getPropertyById(propertyId, env)
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname
    const origin = env.CORS_ORIGIN || '*'

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: securityHeaders(origin) })
    }

    const publicApi = new Set([
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/refresh',
      '/api/auth/entra/login',
      '/api/auth/entra/exchange',
    ])

    const auth = getAuthContext(request, env)
    if (path.startsWith('/api') && !publicApi.has(path) && !auth) {
      return json({ error: 'Unauthorized' }, 401, origin)
    }

    const propertyMatch = path.match(/^\/api\/properties\/([^/]+)$/)
    const propertyVersionsMatch = path.match(/^\/api\/properties\/([^/]+)\/versions$/)
    const propertyRestoreMatch = path.match(/^\/api\/properties\/([^/]+)\/versions\/([^/]+)\/restore$/)
    const propertyTimelineMatch = path.match(/^\/api\/properties\/([^/]+)\/timeline$/)
    const markReadMatch = path.match(/^\/api\/notifications\/([^/]+)\/read$/)
    const deleteNotificationMatch = path.match(/^\/api\/notifications\/([^/]+)$/)

    if (request.method === 'GET' && path === '/api/properties') return json(await listProperties(env), 200, origin)
    if (request.method === 'GET' && propertyMatch) {
      const entity = await getPropertyById(propertyMatch[1], env)
      if (!entity) return json({ error: 'Not found' }, 404, origin)
      return json(entity, 200, origin)
    }
    if (request.method === 'PUT' && propertyMatch) {
      if (!canAccess(auth!.role, ['Administrator', 'Manager', 'Reviewer', 'Officer'])) {
        return json({ error: 'Forbidden' }, 403, origin)
      }
      const updated = await updateProperty(propertyMatch[1], request, env)
      await writeAuditLog(env, auth!.userId, 'property.update', 'property', propertyMatch[1])
      return json(updated, 200, origin)
    }
    if (request.method === 'DELETE' && propertyMatch) {
      if (!canAccess(auth!.role, ['Administrator', 'Manager'])) {
        return json({ error: 'Forbidden' }, 403, origin)
      }
      await deleteProperty(propertyMatch[1], env)
      await writeAuditLog(env, auth!.userId, 'property.delete', 'property', propertyMatch[1])
      return json({ ok: true }, 200, origin)
    }
    if (request.method === 'GET' && propertyVersionsMatch) {
      return json(await listPropertyVersions(propertyVersionsMatch[1], env), 200, origin)
    }
    if (request.method === 'POST' && propertyRestoreMatch) {
      if (!canAccess(auth!.role, ['Administrator', 'Manager'])) {
        return json({ error: 'Forbidden' }, 403, origin)
      }
      const restored = await restorePropertyVersion(propertyRestoreMatch[1], propertyRestoreMatch[2], env)
      if (!restored) return json({ error: 'Version not found' }, 404, origin)
      await writeAuditLog(env, auth!.userId, 'property.restore', 'property', propertyRestoreMatch[1], { versionId: propertyRestoreMatch[2] })
      return json(restored, 200, origin)
    }
    if (request.method === 'GET' && propertyTimelineMatch) {
      return json(await listPropertyTimeline(propertyTimelineMatch[1], env), 200, origin)
    }
    if (request.method === 'POST' && path === '/api/properties') {
      if (!canAccess(auth!.role, ['Administrator', 'Manager', 'Reviewer', 'Officer'])) {
        return json({ error: 'Forbidden' }, 403, origin)
      }
      const created = await createProperty(request, env)
      await writeAuditLog(env, auth!.userId, 'property.create', 'property', String(created?.id || 'unknown'))
      return json(created, 201, origin)
    }
    if (request.method === 'GET' && path === '/api/tasks') return json(await listTasks(env), 200, origin)
    if (request.method === 'GET' && path === '/api/notifications') return json(await listNotifications(env), 200, origin)
    if (request.method === 'PATCH' && markReadMatch) {
      await markNotificationRead(markReadMatch[1], env)
      return json({ ok: true }, 200, origin)
    }
    if (request.method === 'PATCH' && path === '/api/notifications/read-all') {
      await markAllNotificationsRead(env)
      return json({ ok: true }, 200, origin)
    }
    if (request.method === 'DELETE' && deleteNotificationMatch) {
      await deleteNotification(deleteNotificationMatch[1], env)
      return json({ ok: true }, 200, origin)
    }
    if (request.method === 'GET' && path === '/api/user/profile') {
      return json(await currentUserProfile(env, auth!), 200, origin)
    }
    if (request.method === 'GET' && path === '/api/officers/me') return json(await currentOfficer(env), 200, origin)
    if (request.method === 'POST' && (path === '/api/assessments' || path === '/api/assessment')) {
      const result = await createAssessment(request, env)
      await writeAuditLog(env, auth!.userId, 'assessment.create', 'assessment', 'new')
      return json(result, 201, origin)
    }
    if (request.method === 'POST' && path === '/api/photos/upload') {
      const uploaded = await uploadPhoto(request, env)
      await writeAuditLog(env, auth!.userId, 'photo.upload', 'photo', uploaded.key)
      return json(uploaded, 201, origin)
    }
    if (request.method === 'GET' && path === '/api/shared') {
      return json(await listSharedProperties(env), 200, origin)
    }

    if (request.method === 'POST' && path === '/api/auth/login') {
      return json({
        accessToken: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        expiresIn: 3600,
        userId: 'officer-1',
      }, 200, origin)
    }

    if (request.method === 'POST' && path === '/api/auth/logout') {
      return json({ ok: true }, 200, origin)
    }

    if (request.method === 'POST' && path === '/api/auth/entra/login') {
      return json({
        accessToken: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        expiresIn: 3600,
        userId: 'officer-1',
      }, 200, origin)
    }

    if (request.method === 'POST' && path === '/api/auth/entra/exchange') {
      return json({
        accessToken: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        expiresIn: 3600,
        userId: 'officer-1',
      }, 200, origin)
    }

    if (request.method === 'POST' && path === '/api/auth/refresh') {
      return json({
        accessToken: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        expiresIn: 3600,
      }, 200, origin)
    }

    if (request.method === 'POST' && (path === '/api/ocr/extract' || path === '/api/ai/ocr')) {
      return json({ lines: ['OCR extracted from uploaded asset'] }, 200, origin)
    }

    if (request.method === 'POST' && path === '/api/ai/property-summary') {
      return json({ summary: 'AI generated summary', confidence: 0.92 }, 200, origin)
    }

    if (request.method === 'POST' && path === '/api/ai/comparable-recommendation') {
      return json({ items: ['Comparable A', 'Comparable B', 'Comparable C'] }, 200, origin)
    }

    if (request.method === 'POST' && path === '/api/ai/price-suggestion') {
      return json({ price: 7650000, confidence: 0.89 }, 200, origin)
    }

    if (request.method === 'POST' && path === '/api/ai/risk-analysis') {
      return json({ risk: 'moderate', score: 0.44 }, 200, origin)
    }

    if (request.method === 'POST' && path === '/api/ai/image-caption') {
      return json({ caption: 'Detected frontage with clear access road' }, 200, origin)
    }

    if (request.method === 'POST' && path === '/api/audit/logs') {
      const payload = await parseJsonBody(request)
      await writeAuditLog(
        env,
        String(payload.actorId || auth?.userId || 'system'),
        String(payload.action || 'unknown'),
        String(payload.entityType || 'unknown'),
        String(payload.entityId || 'unknown'),
        payload
      )
      return json({ ok: true }, 201, origin)
    }

    if (request.method === 'PUT' && path.startsWith('/uploads/')) {
      const objectKey = path.replace('/uploads/', '')
      await env.ASSETS.put(objectKey, request.body)
      return json({ key: objectKey }, 200, origin)
    }

    return json({ error: 'Not found' }, 404, origin)
  },
} satisfies ExportedHandler<Env>
