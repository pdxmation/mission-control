'use client'

import { FileText, BookOpen, Lightbulb, FlaskConical, Search } from 'lucide-react'
import { format } from 'date-fns'

export type DocumentType = 'journal' | 'note' | 'concept' | 'research'

export interface Document {
  id: string
  title: string
  content: string
  type: DocumentType
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface DocumentListProps {
  documents: Document[]
  selectedId: string | null
  onSelect: (doc: Document) => void
  search: string
  onSearchChange: (value: string) => void
  typeFilter: DocumentType | null
  onTypeFilterChange: (type: DocumentType | null) => void
  tagFilter: string | null
  onTagFilterChange: (tag: string | null) => void
  allTags: string[]
}

const typeConfig: Record<DocumentType, { icon: typeof FileText; label: string; color: string }> = {
  journal: { icon: BookOpen, label: 'Journal', color: 'text-amber-400' },
  note: { icon: FileText, label: 'Note', color: 'text-blue-400' },
  concept: { icon: Lightbulb, label: 'Concept', color: 'text-purple-400' },
  research: { icon: FlaskConical, label: 'Research', color: 'text-emerald-400' }
}

export function DocumentList({
  documents,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  tagFilter,
  onTagFilterChange,
  allTags
}: DocumentListProps) {
  return (
    <div className="h-full flex flex-col border-r border-border bg-card/50">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-input border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Type Filters */}
      <div className="p-3 border-b border-border">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onTypeFilterChange(null)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              typeFilter === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All
          </button>
          {(Object.keys(typeConfig) as DocumentType[]).map((type) => {
            const config = typeConfig[type]
            const Icon = config.icon
            return (
              <button
                key={type}
                onClick={() => onTypeFilterChange(typeFilter === type ? null : type)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Icon className={`h-3 w-3 ${typeFilter === type ? '' : config.color}`} />
                {config.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tag Pills */}
      {allTags.length > 0 && (
        <div className="p-3 border-b border-border">
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagFilterChange(tagFilter === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-full text-xs transition-colors ${
                  tagFilter === tag
                    ? 'bg-primary/20 text-primary border border-primary/50'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {documents.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No documents found
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {documents.map((doc) => {
              const config = typeConfig[doc.type as DocumentType] || typeConfig.note
              const Icon = config.icon
              const isSelected = selectedId === doc.id
              
              return (
                <button
                  key={doc.id}
                  onClick={() => onSelect(doc)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-secondary/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(doc.updatedAt), 'MMM d, yyyy')}
                      </p>
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {doc.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-muted/50 rounded text-[10px] text-muted-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                          {doc.tags.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{doc.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
