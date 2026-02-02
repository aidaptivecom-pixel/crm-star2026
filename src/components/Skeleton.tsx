import { cn } from '../lib/utils'
import { CSSProperties } from 'react'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
}

export const Skeleton = ({ className, style }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
      style={style}
    />
  )
}

// Skeleton for metric cards
export const MetricCardSkeleton = () => (
  <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
)

// Skeleton for attention alert cards
export const AttentionCardSkeleton = () => (
  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
    <div className="flex items-start gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="w-8 h-6 rounded-full" />
    </div>
  </div>
)

// Skeleton for chart
export const ChartSkeleton = () => (
  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 h-full">
    <div className="flex justify-between items-center mb-6">
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-16 h-8 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
    <div className="h-[300px] sm:h-[380px] flex items-end gap-2 px-4">
      {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 45, 90].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
)

// Skeleton for live conversations
export const LiveConversationsSkeleton = () => (
  <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 h-full">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="w-6 h-5 rounded-full" />
      </div>
      <Skeleton className="w-20 h-4" />
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-28 mb-1" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  </div>
)

// Skeleton for activity table
export const ActivityTableSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100">
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
      ))}
    </div>
  </div>
)

// Skeleton for pipeline column
export const PipelineColumnSkeleton = () => (
  <div className="flex-1 min-w-[280px] max-w-[320px]">
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex items-center gap-2">
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="w-5 h-5 rounded-full" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-start gap-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="w-8 h-5 rounded-full" />
          </div>
          <Skeleton className="h-3 w-16 mt-3" />
        </div>
      ))}
    </div>
  </div>
)
