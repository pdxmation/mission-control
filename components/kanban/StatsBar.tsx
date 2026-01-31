'use client'

import { TaskWithRelations } from './types'
import { startOfWeek, isAfter } from 'date-fns'

interface StatsBarProps {
  tasks: TaskWithRelations[]
}

export function StatsBar({ tasks }: StatsBarProps) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
  
  const thisWeekCompleted = tasks.filter(
    (t) => t.status === 'COMPLETED' && isAfter(new Date(t.updatedAt), weekStart)
  ).length
  
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const stats = [
    {
      label: 'This Week',
      value: thisWeekCompleted,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: 'In Progress',
      value: inProgress,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Total',
      value: total,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
    },
    {
      label: 'Completion',
      value: `${completionRate}%`,
      color: completionRate >= 50 ? 'text-emerald-500' : 'text-amber-500',
      bg: completionRate >= 50 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bg} rounded-lg p-3 border border-border/50`}
        >
          <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
