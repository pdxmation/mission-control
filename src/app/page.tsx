import { prisma } from "../lib/prisma"
import { KanbanBoard } from "@/components/kanban"
import { TaskWithRelations } from "@/components/kanban/types"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MissionControl() {
  const tasks = await prisma.task.findMany({
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          avatar: true,
          image: true,
        }
      },
      project: {
        select: {
          id: true,
          name: true,
          color: true,
        }
      },
      labels: {
        include: {
          label: true
        }
      }
    },
    orderBy: [
      { position: 'asc' },
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  // Transform dates to strings for client component
  const serializedTasks: TaskWithRelations[] = tasks.map(task => ({
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }))

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Mission Control</h1>
              <p className="text-sm text-muted-foreground">Task management for R2</p>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="max-w-[1600px] mx-auto p-6">
        <KanbanBoard initialTasks={serializedTasks} />
      </div>
    </main>
  )
}
