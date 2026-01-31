'use client'

import { useState, useEffect } from 'react'
import { X, Activity, ChevronUp } from 'lucide-react'
import { ActivityFeed } from './ActivityFeed'

interface ActivityItem {
  id: string
  action: string
  details: string | null
  createdAt: string
  task: {
    id: string
    title: string
  } | null
  user: {
    id: string
    name: string
    avatar: string | null
    image: string | null
  } | null
}

interface MobileActivityPanelProps {
  initialActivities?: ActivityItem[]
}

export function MobileActivityPanel({ initialActivities = [] }: MobileActivityPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Floating Action Button - only visible on mobile/tablet (below xl) */}
      <button
        onClick={() => setIsOpen(true)}
        className="xl:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
        aria-label="Open Activity Feed"
      >
        <Activity className="h-5 w-5" />
        <span className="text-sm font-medium">Activity</span>
        <ChevronUp className="h-4 w-4" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-up Panel */}
      <div
        className={`
          xl:hidden fixed inset-x-0 bottom-0 z-50
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="bg-background rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col">
          {/* Handle bar */}
          <div className="flex justify-center py-2">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Recent Activity</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Activity Content */}
          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 100px)' }}>
            <ActivityFeedMobile initialActivities={initialActivities} />
          </div>
        </div>
      </div>
    </>
  )
}

// Simplified activity feed for mobile (reuses logic but different styling)
function ActivityFeedMobile({ initialActivities = [] }: { initialActivities: ActivityItem[] }) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)
  const [loading, setLoading] = useState(initialActivities.length === 0)

  useEffect(() => {
    if (initialActivities.length === 0) {
      fetchActivities()
    }
  }, [])

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activity?limit=30')
      const data = await res.json()
      setActivities(data)
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const actionColors: Record<string, string> = {
    created: 'border-l-green-500 bg-green-500/5',
    moved: 'border-l-blue-500 bg-blue-500/5',
    completed: 'border-l-emerald-500 bg-emerald-500/5',
    deleted: 'border-l-red-500 bg-red-500/5',
    updated: 'border-l-amber-500 bg-amber-500/5',
  }

  const formatAction = (action: string, details: string | null): string => {
    if (action === 'moved' && details) {
      try {
        const parsed = JSON.parse(details)
        const to = parsed.to?.replace('_', ' ').toLowerCase()
        return `moved to ${to}`
      } catch {
        return action
      }
    }
    return action
  }

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No activity yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className={`
            p-4 rounded-lg border-l-4 border border-border
            ${actionColors[activity.action] || 'border-l-border bg-background'}
          `}
        >
          <p className="font-medium text-foreground line-clamp-2">
            {activity.task?.title || 'Task'}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-muted-foreground capitalize">
              {formatAction(activity.action, activity.details)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(activity.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
