'use client'

import { FileText, BookOpen, Lightbulb, FlaskConical, Calendar, Clock, Tag, Edit3, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Document, DocumentType } from './DocumentList'
import { useState } from 'react'

interface DocumentViewerProps {
  document: Document | null
  onClose?: () => void
  onEdit?: (doc: Document) => void
  onDelete?: (id: string) => void
  isMobile?: boolean
}

const typeConfig: Record<DocumentType, { icon: typeof FileText; label: string; color: string; bgColor: string }> = {
  journal: { icon: BookOpen, label: 'Journal', color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
  note: { icon: FileText, label: 'Note', color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  concept: { icon: Lightbulb, label: 'Concept', color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
  research: { icon: FlaskConical, label: 'Research', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' }
}

export function DocumentViewer({ document, onClose, onEdit, onDelete, isMobile }: DocumentViewerProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Select a document to view</p>
        </div>
      </div>
    )
  }

  const config = typeConfig[document.type as DocumentType] || typeConfig.note
  const Icon = config.icon

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 md:p-6 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.color}`}>
                <Icon className="h-3 w-3" />
                {config.label}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold truncate">{document.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Created {format(new Date(document.createdAt), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Updated {format(new Date(document.updatedAt), 'MMM d, yyyy')}
              </span>
            </div>
            {document.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {document.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(document)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                title="Edit document"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Delete document"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            {isMobile && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
        <article className="prose prose-invert prose-sm md:prose-base max-w-none
          prose-headings:text-foreground prose-headings:font-semibold
          prose-p:text-foreground/90
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground prose-strong:font-semibold
          prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-lg
          prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:not-italic
          prose-ul:text-foreground/90 prose-ol:text-foreground/90
          prose-li:marker:text-muted-foreground
          prose-hr:border-border
          prose-th:text-foreground prose-td:text-foreground/90
          prose-img:rounded-lg"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {document.content || '*No content*'}
          </ReactMarkdown>
        </article>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Document?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Are you sure you want to delete &ldquo;{document.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete?.(document.id)
                  setShowDeleteConfirm(false)
                }}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
