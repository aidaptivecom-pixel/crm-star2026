import { useState, useEffect, useCallback, useRef } from 'react'
import { Notification } from '../types'

// Mock notifications for demo - will be replaced with Supabase realtime
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'escalation',
    title: 'Escalado a humano',
    message: 'María González solicita hablar con un asesor',
    leadId: 'lead-1',
    conversationId: 'conv-1',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    avatar: 'MG'
  },
  {
    id: '2',
    type: 'high_score',
    title: 'Lead caliente',
    message: 'Carlos Ruiz alcanzó score 85 - Interesado en Roccatagliata',
    leadId: 'lead-2',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    avatar: 'CR'
  },
  {
    id: '3',
    type: 'new_lead',
    title: 'Nuevo lead',
    message: 'Ana Martínez desde WhatsApp - Voie Cañitas',
    leadId: 'lead-3',
    read: true,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    avatar: 'AM'
  },
  {
    id: '4',
    type: 'message',
    title: 'Nuevo mensaje',
    message: 'Pedro López respondió en la conversación',
    conversationId: 'conv-4',
    read: true,
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    avatar: 'PL'
  }
]

// Sound frequencies for notification alert
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Create a pleasant two-tone notification sound
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      // Smooth envelope
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }
    
    const now = audioContext.currentTime
    playTone(880, now, 0.15)        // A5
    playTone(1108.73, now + 0.15, 0.2)  // C#6 - pleasant major third
    
  } catch (error) {
    console.warn('Could not play notification sound:', error)
  }
}

// Request browser notification permission
const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  return false
}

// Show browser notification
const showBrowserNotification = (notification: Notification) => {
  if (Notification.permission === 'granted') {
    const browserNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/star-logo.png', // Add your logo here
      tag: notification.id,
      requireInteraction: notification.type === 'escalation'
    })
    
    browserNotif.onclick = () => {
      window.focus()
      browserNotif.close()
      // Navigate to relevant page based on notification type
      if (notification.conversationId) {
        window.location.href = `/inbox/${notification.conversationId}`
      } else if (notification.leadId) {
        window.location.href = `/pipeline`
      }
    }
  }
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false)
  const lastNotificationCount = useRef(notifications.filter(n => !n.read).length)
  
  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden)
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
  
  // Request browser notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then(granted => {
      setBrowserNotificationsEnabled(granted)
    })
  }, [])
  
  // Handle new notifications (play sound, show browser notification)
  const handleNewNotification = useCallback((notification: Notification) => {
    // Play sound if enabled (especially useful when tab is not visible)
    if (soundEnabled) {
      playNotificationSound()
    }
    
    // Show browser notification if tab is not visible and permission granted
    if (!isTabVisible && browserNotificationsEnabled) {
      showBrowserNotification(notification)
    }
    
    setNotifications(prev => [notification, ...prev])
  }, [soundEnabled, isTabVisible, browserNotificationsEnabled])
  
  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])
  
  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])
  
  // Clear a notification
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])
  
  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev)
  }, [])
  
  // Test sound (for settings)
  const testSound = useCallback(() => {
    playNotificationSound()
  }, [])
  
  // Unread count
  const unreadCount = notifications.filter(n => !n.read).length
  
  // Effect to detect new notifications and trigger alerts
  useEffect(() => {
    if (unreadCount > lastNotificationCount.current) {
      // New notification arrived
      const newNotification = notifications.find(n => !n.read)
      if (newNotification && soundEnabled) {
        playNotificationSound()
        if (!isTabVisible && browserNotificationsEnabled) {
          showBrowserNotification(newNotification)
        }
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
    testSound
  }
}
