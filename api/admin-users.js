// Serverless API route for admin user management
// Keeps SUPABASE_SERVICE_ROLE_KEY on the server side only

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SERVICE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY' })
  }

  // Verify the caller is authenticated and is admin
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' })
  }

  // Verify the user's JWT and check admin role
  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': authHeader,
      },
    })
    if (!userRes.ok) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    const user = await userRes.json()

    // Check if user is admin via profiles table
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role`,
      {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
      }
    )
    const profiles = await profileRes.json()
    if (!profiles?.[0] || profiles[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
  } catch {
    return res.status(401).json({ error: 'Authentication failed' })
  }

  const { action, userId, email, password, full_name, user_metadata } = req.body || {}

  try {
    // CREATE user
    if (req.method === 'POST' && action === 'create') {
      const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: user_metadata || {},
        }),
      })
      const data = await createRes.json()
      if (!createRes.ok) {
        return res.status(createRes.status).json({ error: data.msg || data.message || 'Error creating user' })
      }
      return res.status(200).json(data)
    }

    // UPDATE user (password)
    if (req.method === 'PUT' && action === 'update' && userId) {
      const body = {}
      if (password) body.password = password
      if (user_metadata) body.user_metadata = user_metadata

      const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const data = await updateRes.json()
      if (!updateRes.ok) {
        return res.status(updateRes.status).json({ error: data.msg || data.message || 'Error updating user' })
      }
      return res.status(200).json(data)
    }

    // DELETE user
    if (req.method === 'DELETE' || (req.method === 'POST' && action === 'delete')) {
      const targetId = userId || req.body?.userId
      if (!targetId) return res.status(400).json({ error: 'userId required' })

      const deleteRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${targetId}`, {
        method: 'DELETE',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
      })
      if (!deleteRes.ok) {
        const data = await deleteRes.json().catch(() => ({}))
        return res.status(deleteRes.status).json({ error: data.msg || data.message || 'Error deleting user' })
      }
      return res.status(200).json({ success: true })
    }

    return res.status(400).json({ error: 'Invalid action. Use: create, update, delete' })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
