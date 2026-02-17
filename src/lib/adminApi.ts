// Admin API helper — calls serverless function instead of exposing service_role key

import { supabase } from './supabase'

async function getAuthHeader(): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('No active session')
  return `Bearer ${token}`
}

export async function adminCreateUser(params: {
  email: string
  password: string
  full_name: string
}) {
  const res = await fetch('/api/admin-users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': await getAuthHeader(),
    },
    body: JSON.stringify({
      action: 'create',
      email: params.email,
      password: params.password,
      user_metadata: { full_name: params.full_name },
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error creating user')
  return data
}

export async function adminUpdatePassword(userId: string, password: string) {
  const res = await fetch('/api/admin-users', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': await getAuthHeader(),
    },
    body: JSON.stringify({
      action: 'update',
      userId,
      password,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error updating password')
  return data
}

export async function adminDeleteUser(userId: string) {
  const res = await fetch('/api/admin-users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': await getAuthHeader(),
    },
    body: JSON.stringify({
      action: 'delete',
      userId,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error deleting user')
  return data
}
