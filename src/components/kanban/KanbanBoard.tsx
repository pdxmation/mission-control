'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { TaskWithRelations, KANBAN_COLUMNS, TaskStatus } from './types'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { TaskModal, TaskFormData } from './TaskModal'
import { StatsBar } from './StatsBar'
import { FilterBar } from './FilterBar'

interface User {
  id: string
  name: string
  avatar: string | null
}

interface Project {
  id: string
  name: string
  color: string
}

interface KanbanBoardProps {
  initialTasks: TaskWithRelations[]
  users?: User[]
  projects?: Project[]
}

export function KanbanBoard({ initialTasks, users = [], projects = [] }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('BACKLOG')
  
  // Filters
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Extract unique assignees and projects from tasks if not provided
  const assigneeOptions = useMemo(() => {
    if (users.length > 0) return users
    const seen = new Set<string>()
    return tasks
      .filter((t) => t.assignee && !seen.has(t.assignee.id) && seen.add(t.assignee.id))
      .map((t) => ({
        id: t.assignee!.id,
        name: t.assignee!.name,
        avatar: t.assignee!.avatar || t.assignee!.image,
      }))
  }, [tasks, users])

  const projectOptions = useMemo(() => {
    if (projects.length > 0) return projects
    const seen = new Set<string>()
    return tasks
      .filter((t) => t.project && !seen.has(t.project.id) && seen.add(t.project.id))
      .map((t) => ({
        id: t.project!.id,
        name: t.project!.name,
        color: t.project!.color,
      }))
  }, [tasks, projects])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedAssignee && t.assigneeId !== selectedAssignee) return false
      if (selectedProject && t.projectId !== selectedProject) return false
      return true
    })
  }, [tasks, selectedAssignee, selectedProject])

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => {
      return filteredTasks
        .filter((t) => t.status === status)
        .sort((a, b) => a.position - b.position)
    },
    [filteredTasks]
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Check if dropped over a column
    const overColumn = KANBAN_COLUMNS.find((c) => c.id === overId)
    if (overColumn && activeTask.status !== overColumn.id) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: overColumn.id } : t
        )
      )
      return
    }

    // Check if dropped over another task
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask && activeTask.status !== overTask.status) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: overTask.status } : t
        )
      )
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const task = tasks.find((t) => t.id === activeId)
    if (!task) return

    // Determine final status
    let newStatus = task.status
    const overColumn = KANBAN_COLUMNS.find((c) => c.id === over.id)
    if (overColumn) {
      newStatus = overColumn.id
    } else {
      const overTask = tasks.find((t) => t.id === over.id)
      if (overTask) {
        newStatus = overTask.status
      }
    }

    // Update in database
    try {
      await fetch(`/api/tasks/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (error) {
      console.error('Failed to update task:', error)
      // Revert on error
      setTasks(initialTasks)
    }
  }

  const handleTaskClick = (task: TaskWithRelations) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleAddTask = (status: TaskStatus) => {
    setEditingTask(null)
    setDefaultStatus(status)
    setModalOpen(true)
  }

  const handleSaveTask = async (data: TaskFormData) => {
    try {
      if (editingTask) {
        // Update existing task
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const updated = await res.json()
        setTasks((prev) =>
          prev.map((t) =>
            t.id === editingTask.id ? { ...t, ...updated } : t
          )
        )
      } else {
        // Create new task
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const created = await res.json()
        setTasks((prev) => [...prev, { ...created, labels: [], assignee: null, project: null }])
      }
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <StatsBar tasks={tasks} />
      
      {/* Filter Bar */}
      <FilterBar
        assignees={assigneeOptions}
        projects={projectOptions}
        selectedAssignee={selectedAssignee}
        selectedProject={selectedProject}
        onAssigneeChange={setSelectedAssignee}
        onProjectChange={setSelectedProject}
      />

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 px-1">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={getTasksByStatus(column.id)}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
        defaultStatus={defaultStatus}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}
