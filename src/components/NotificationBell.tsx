import { useState, useRef, useEffect } from 'react'
import { Bell, Volume2, VolumeX, Check, CheckCheck, Trash2, User, TrendingUp, MessageSquare, AlertCircle } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { Notification, NotificationType } from '../types'
import { useNavigate } from 'react-router-dom'

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'escalation':
      return <AlertCircle className="w-4 h-4 text-orange-500" />
    case 'high_score':
      return <TrendingUp className="w-4 h-4 text-green-500" />
    case 'new_lead':
      return <User className="w-4 h-4 text-blue-500" />
    case 'message':
      return <MessageSquare className="w-4 h-4 text-purple-500" />
    default:
      return <Bell className="w-4 h-4 text-gray-500" />
  }
}

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'escalation':
      return 'border-l-orange-500 bg-orange-50'
    case 'high_score':
      return 'border-l-green-500 bg-green-50'
    case 'new_lead':
      return 'border-l-blue-500 bg-blue-50'
    case 'message':
      return 'border-l-purple-500 bg-purple-50'
    default:
      return 'border-l-gray-500 bg-gray-50'
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  return `Hace ${diffDays}d`
}

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  
  const {
    notifications,
    unreadCount,
    soundEnabled,
    markAsRead,
    markAllAsRead,
    clearNotification,
    toggleSound,
    testSound
  } = useNotifications()
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    setIsOpen(false)
    
    if (notification.conversationId) {
      navigate(`/inbox/${notification.conversationId}`)
    } else if (notification.leadId) {
      navigate('/pipeline')
    }
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <button
                onClick={() => {
                  toggleSound()
                  if (!soundEnabled) testSound()
                }}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                title={soundEnabled ? 'Silenciar notificaciones' : 'Activar sonido'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-gray-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {/* Mark All Read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
          
          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50 bg-white'} hover:bg-gray-50 transition-colors cursor-pointer`}
                >
                  <div 
                    className="px-4 py-3"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar or Icon */}
                      {notification.avatar ? (
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                          {notification.avatar}
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Marcar como leída"
                      >
                        <Check className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        clearNotification(notification.id)
                      }}
                      className="p-1 rounded hover:bg-gray-100"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/configuracion')
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Configurar notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
