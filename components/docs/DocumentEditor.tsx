'use client'

import { useState } from 'react'
import { X, Save, FileText, BookOpen, Lightbulb, FlaskConical, Plus, Eye, Edit } from 'lucide-react'
import { Document, DocumentType } from './DocumentList'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface DocumentEditorProps {
  document: Document | null
  onSave: (data: { title: string; content: string; type: DocumentType; tags: string[] }) => void
  onCancel: () => void
}

const typeOptions: { value: DocumentType; label: string; icon: typeof FileText; color: string }[] = [
  { value: 'journal', label: 'Journal', icon: BookOpen, color: 'text-amber-400' },
  { value: 'note', label: 'Note', icon: FileText, color: 'text-blue-400' },
  { value: 'concept', label: 'Concept', icon: Lightbulb, color: 'text-purple-400' },
  { value: 'research', label: 'Research', icon: FlaskConical, color: 'text-emerald-400' }
]

export function DocumentEditor({ document, onSave, onCancel }: DocumentEditorProps) {
  const [title, setTitle] = useState(document?.title || '')
  const [content, setContent] = useState(document?.content || '')
  const [type, setType] = useState<DocumentType>(document?.type as DocumentType || 'note')
  const [tags, setTags] = useState<string[]>(document?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), content, type, tags })
  }

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-card/30">
        <h2 className="text-lg font-semibold">
          {document ? 'Edit Document' : 'New Document'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
              showPreview
                ? 'bg-primary/10 text-primary'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {showPreview ? (
              <>
                <Edit className="h-4 w-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Preview
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            title="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 md:p-6 space-y-4 border-b border-border flex-shrink-0">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title..."
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>

          {/* Type Selection */}
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = type === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/30 text-foreground'
                      : 'bg-secondary border border-transparent text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? option.color : 'text-muted-foreground'}`} />
                  {option.label}
                </button>
              )
            })}
          </div>

          {/* Tags */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add tag..."
                  className="w-24 px-2 py-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                  className="p-1 rounded hover:bg-secondary disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Editor / Preview */}
        <div className="flex-1 overflow-hidden">
          {showPreview ? (
            <div className="h-full overflow-y-auto p-4 md:p-6 scrollbar-thin">
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
                prose-hr:border-border"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content || '*Start writing to see preview...*'}
                </ReactMarkdown>
              </article>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content in Markdown..."
              className="w-full h-full p-4 md:p-6 bg-transparent resize-none text-foreground/90 placeholder:text-muted-foreground focus:outline-none font-mono text-sm leading-relaxed"
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3 flex items-center justify-end gap-2 bg-card/30">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
