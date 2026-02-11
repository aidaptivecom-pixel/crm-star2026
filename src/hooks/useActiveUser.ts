import { useState, useCallback } from 'react'

const KEYS = {
  id: 'star-crm-active-user-id',
  name: 'star-crm-user-name',
  role: 'star-crm-user-role',
} as const

export function useActiveUser() {
  const [activeUserId, setActiveUserId] = useState<string | null>(
    () => localStorage.getItem(KEYS.id)
  )
  const [activeUserName, setActiveUserName] = useState<string | null>(
    () => localStorage.getItem(KEYS.name)
  )
  const [activeUserRole, setActiveUserRole] = useState<string | null>(
    () => localStorage.getItem(KEYS.role)
  )

  const login = useCallback((id: string, name: string, role: string) => {
    localStorage.setItem(KEYS.id, id)
    localStorage.setItem(KEYS.name, name)
    localStorage.setItem(KEYS.role, role)
    setActiveUserId(id)
    setActiveUserName(name)
    setActiveUserRole(role)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(KEYS.id)
    localStorage.removeItem(KEYS.name)
    localStorage.removeItem(KEYS.role)
    setActiveUserId(null)
    setActiveUserName(null)
    setActiveUserRole(null)
  }, [])

  return { activeUserId, activeUserName, activeUserRole, login, logout }
}
