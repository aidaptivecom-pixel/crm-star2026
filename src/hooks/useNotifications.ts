import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { AppNotification } from '../types'

// Notification sound using audio file
const notificationAudio = new Audio('/notification.mp3')
notificationAudio.volume = 0.5

const playNotificationSound = () => {
  try {
    // Reset and play
    notificationAudio.currentTime = 0
    notificationAudio.play().catch(err => {
      console.warn('Could not play notification sound:', err)
    })
  } catch (error) {
    console.warn('Could not play notification sound:', error)
  }
}

const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false
  if (window.Notification.permission === 'granted') return true
  if (window.Notification.permission !== 'denied') {
    const permission = await window.Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

const showBrowserNotification = (notification: AppNotification) => {
  if (window.Notification.permission === 'granted') {
    const browserNotif = new window.Notification(notification.title, {
      body: notification.message,
      icon: '/star-logo.png',
      tag: notification.id,
      requireInteraction: notification.type === 'escalation'
    })
    
    browserNotif.onclick = () => {
      window.focus()
      browserNotif.close()
      if (notification.conversationId) {
        window.location.href = `/inbox/${notification.conversationId}`
      } else if (notification.leadId) {
        window.location.href = `/pipeline`
      }
    }
  }
}

// Map Supabase notification row to AppNotification
function mapNotification(row: Record<string, unknown>): AppNotification {
  const name = typeof row.title === 'string' ? row.title : ''
  const initials = name
    .replace(/^(Lead caliente|Nuevo lead|Escalado|Nuevo mensaje):\s*/i, '')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return {
    id: row.id as string,
    type: (row.type as AppNotification['type']) || 'system',
    title: row.title as string,
    message: (row.message as string) || '',
    leadId: (row.lead_id as string) || undefined,
    conversationId: (row.conversation_id as string) || undefined,
    read: row.read as boolean,
    createdAt: (row.created_at as string) || new Date().toISOString(),
    avatar: initials || '🔔'
  }
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false)
  const lastNotificationCount = useRef(0)
  
  // Fetch notifications from Supabase
  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    if (!isSupabaseConfigured() || !supabase) {
      return
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications((data || []).map(mapNotification))
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  // Debounce ref for message sounds
  const lastMessageSoundTime = useRef(0)
  const MESSAGE_SOUND_DEBOUNCE_MS = 3000 // 3 seconds between sounds

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return

    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        const notification = mapNotification(payload.new as Record<string, unknown>)
        handleNewNotification(notification)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        const updated = mapNotification(payload.new as Record<string, unknown>)
        setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n))
      })
      .subscribe()

    return () => { supabase?.removeChannel(channel) }
  }, [])

  // Subscribe to new messages from leads
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return

    const messagesChannel = supabase
      .channel('messages-sound-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const message = payload.new as Record<string, unknown>
        // Only play sound for messages from leads (not from agent/system)
        if (message.sender === 'lead') {
          const now = Date.now()
          // Debounce: don't play sound if one played recently
          if (now - lastMessageSoundTime.current > MESSAGE_SOUND_DEBOUNCE_MS) {
            lastMessageSoundTime.current = now
            if (soundEnabled) {
              playNotificationSound()
            }
            // Show browser notification if tab is not visible
            if (!isTabVisible && browserNotificationsEnabled) {
              const senderName = (message.sender_name as string) || 'Nuevo mensaje'
              const content = (message.content as string) || ''
              showBrowserNotification({
                id: message.id as string,
                type: 'message',
                title: `💬 ${senderName}`,
                message: content.substring(0, 100),
                conversationId: message.conversation_id as string,
                read: false,
                createdAt: new Date().toISOString(),
                avatar: senderName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
              })
            }
          }
        }
      })
      .subscribe()

    return () => { supabase?.removeChannel(messagesChannel) }
  }, [soundEnabled, isTabVisible, browserNotificationsEnabled])

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => setIsTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
  
  // Request browser notification permission
  useEffect(() => {
    requestNotificationPermission().then(granted => {
      setBrowserNotificationsEnabled(granted)
    })
  }, [])
  
  const handleNewNotification = useCallback((notification: AppNotification) => {
    if (soundEnabled) playNotificationSound()
    if (!isTabVisible && browserNotificationsEnabled) showBrowserNotification(notification)
    setNotifications(prev => [notification, ...prev])
  }, [soundEnabled, isTabVisible, browserNotificationsEnabled])
  
  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() } as never).eq('id', id)
    }
  }, [])
  
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() } as never).eq('read', false)
    }
  }, [])
  
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])
  
  const toggleSound = useCallback(() => setSoundEnabled(prev => !prev), [])
  const testSound = useCallback(() => playNotificationSound(), [])
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  useEffect(() => {
    if (unreadCount > lastNotificationCount.current) {
      const newNotification = notifications.find(n => !n.read)
      if (newNotification && soundEnabled) {
        playNotificationSound()
        if (!isTabVisible && browserNotificationsEnabled) showBrowserNotification(newNotification)
      }
    }
    lastNotificationCount.current = unreadCount
  }, [unreadCount, notifications, soundEnabled, isTabVisible, browserNotificationsEnabled])
  
  return {
    notifications,
    unreadCount,
    soundEnabled,
    browserNotificationsEnabled,
    isTabVisible,
    handleNewNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    toggleSound,
    testSound,
    refetch: fetchNotifications
  }
}
