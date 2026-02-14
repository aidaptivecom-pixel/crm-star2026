import { AgentType } from '../types'

interface AvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  agentType?: AgentType
  className?: string
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const agentColors: Record<AgentType, { bg: string; text: string }> = {
  emprendimientos: { bg: 'bg-blue-500', text: 'text-white' },
  inmuebles: { bg: 'bg-purple-500', text: 'text-white' },
  tasaciones: { bg: 'bg-amber-500', text: 'text-white' },
}

const getColorFromName = (name: string): { bg: string; text: string } => {
  const colors = [
    { bg: 'bg-blue-500', text: 'text-white' },
    { bg: 'bg-emerald-500', text: 'text-white' },
    { bg: 'bg-purple-500', text: 'text-white' },
    { bg: 'bg-amber-500', text: 'text-white' },
    { bg: 'bg-rose-500', text: 'text-white' },
    { bg: 'bg-cyan-500', text: 'text-white' },
    { bg: 'bg-indigo-500', text: 'text-white' },
    { bg: 'bg-teal-500', text: 'text-white' },
    { bg: 'bg-orange-500', text: 'text-white' },
    { bg: 'bg-pink-500', text: 'text-white' },
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export const Avatar = ({ name, size = 'md', agentType, className = '' }: AvatarProps) => {
  const initials = getInitials(name)
  const { bg, text } = agentType ? agentColors[agentType] : getColorFromName(name)
  
  return (
    <div
      className={`${sizeClasses[size]} ${bg} ${text} rounded-full flex items-center justify-center font-semibold ${className}`}
      title={name}
    >
      {initials}
    </div>
  )
}
