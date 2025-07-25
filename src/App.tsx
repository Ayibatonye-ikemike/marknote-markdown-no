import { useState, useMemo, useCallback, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Plus, MagnifyingGlass, Trash, PencilSimple, Tag, X, Check } from '@phosphor-icons/react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { marked } from 'marked'
import { toast } from 'sonner'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

function App() {
  const [notes, setNotes] = useKV<Note[]>('notes', [])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false)

  // Migrate existing notes to include tags if they don't have them
  useEffect(() => {
    const needsMigration = notes.some(note => !note.hasOwnProperty('tags'))
    if (needsMigration) {
      setNotes(currentNotes => 
        currentNotes.map(note => ({
          ...note,
          tags: note.tags || []
        }))
      )
    }
  }, [notes, setNotes])

  const selectedNote = useMemo(() => 
    notes.find(note => note.id === selectedNoteId) || null, 
    [notes, selectedNoteId]
  )

  // Get all unique tags from all notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach(note => {
      note.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [notes])

  const filteredNotes = useMemo(() => {
    let filtered = notes
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        selectedTags.every(tag => note.tags?.includes(tag))
      )
    }
    
    return filtered
  }, [notes, searchQuery, selectedTags])

  const createNote = useCallback(() => {
    const now = Date.now()
    const newNote: Note = {
      id: `note-${now}`,
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: now,
      updatedAt: now
    }
    
    setNotes(currentNotes => [newNote, ...currentNotes])
    setSelectedNoteId(newNote.id)
    setIsEditing(true)
    toast.success('New note created')
  }, [setNotes])

  const updateNote = useCallback((id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) => {
    setNotes(currentNotes => 
      currentNotes.map(note => 
        note.id === id 
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note
      )
    )
  }, [setNotes])

  const addTagToNote = useCallback((noteId: string, tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return
    
    setNotes(currentNotes => 
      currentNotes.map(note => 
        note.id === noteId 
          ? { 
              ...note, 
              tags: note.tags?.includes(trimmedTag) 
                ? note.tags 
                : [...(note.tags || []), trimmedTag],
              updatedAt: Date.now() 
            }
          : note
      )
    )
  }, [setNotes])

  const removeTagFromNote = useCallback((noteId: string, tagToRemove: string) => {
    setNotes(currentNotes => 
      currentNotes.map(note => 
        note.id === noteId 
          ? { 
              ...note, 
              tags: note.tags?.filter(tag => tag !== tagToRemove) || [],
              updatedAt: Date.now() 
            }
          : note
      )
    )
  }, [setNotes])

  const toggleTagFilter = useCallback((tag: string) => {
    setSelectedTags(current => 
      current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag]
    )
  }, [])

  const clearTagFilters = useCallback(() => {
    setSelectedTags([])
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes(currentNotes => currentNotes.filter(note => note.id !== id))
    if (selectedNoteId === id) {
      setSelectedNoteId(null)
      setIsEditing(false)
    }
    toast.success('Note deleted')
  }, [setNotes, selectedNoteId])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderMarkdown = (content: string) => {
    return { __html: marked(content) }
  }

  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={300} minSize={250} maxSize={400}>
          <div className="h-full flex flex-col border-r border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Notes</h1>
                <Button 
                  onClick={createNote}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                {/* Tag Filters */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Tags</span>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearTagFilters}
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  {allTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {allTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "secondary"}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleTagFilter(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No tags yet</p>
                  )}
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || selectedTags.length > 0 ? 'No notes found' : 'No notes yet'}
                    <div className="text-sm mt-1">
                      {searchQuery || selectedTags.length > 0 
                        ? 'Try a different search term or clear tag filters' 
                        : 'Create your first note to get started'
                      }
                    </div>
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <Card
                      key={note.id}
                      className={`p-3 cursor-pointer transition-all hover:bg-accent/50 ${
                        selectedNoteId === note.id ? 'bg-accent/30 border-accent' : ''
                      }`}
                      onClick={() => {
                        setSelectedNoteId(note.id)
                        setIsEditing(false)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {note.title || 'Untitled Note'}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {note.content || 'No content'}
                          </p>
                          
                          {/* Note Tags */}
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {note.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {note.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{note.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(note.updatedAt)}
                          </p>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Note</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{note.title}"? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button 
                                variant="destructive"
                                onClick={() => deleteNote(note.id)}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel>
          <div className="h-full flex flex-col">
            {selectedNote ? (
              <>
                <div className="p-6 border-b border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {isEditing ? (
                        <Input
                          value={selectedNote.title}
                          onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                          className="text-xl font-semibold border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          placeholder="Note title..."
                        />
                      ) : (
                        <h2 className="text-xl font-semibold">
                          {selectedNote.title || 'Untitled Note'}
                        </h2>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Last updated {formatDate(selectedNote.updatedAt)}
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <PencilSimple className="h-4 w-4 mr-2" />
                      {isEditing ? 'Preview' : 'Edit'}
                    </Button>
                  </div>
                  
                  {/* Tags Management */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tags</span>
                      
                      <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3">
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Input
                                placeholder="Add new tag..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    if (tagInput.trim()) {
                                      addTagToNote(selectedNote.id, tagInput.trim())
                                      setTagInput('')
                                      setIsTagPopoverOpen(false)
                                    }
                                  }
                                }}
                              />
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => {
                                  if (tagInput.trim()) {
                                    addTagToNote(selectedNote.id, tagInput.trim())
                                    setTagInput('')
                                    setIsTagPopoverOpen(false)
                                  }
                                }}
                              >
                                Add Tag
                              </Button>
                            </div>
                            
                            {allTags.length > 0 && (
                              <>
                                <Separator />
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">Existing tags:</p>
                                  <div className="max-h-32 overflow-y-auto">
                                    {allTags
                                      .filter(tag => !selectedNote.tags?.includes(tag))
                                      .map(tag => (
                                        <div
                                          key={tag}
                                          className="flex items-center justify-between p-1 hover:bg-accent rounded cursor-pointer"
                                          onClick={() => {
                                            addTagToNote(selectedNote.id, tag)
                                            setIsTagPopoverOpen(false)
                                          }}
                                        >
                                          <span className="text-sm">{tag}</span>
                                          <Plus className="h-3 w-3" />
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {/* Display Current Tags */}
                    <div className="flex flex-wrap gap-1">
                      {selectedNote.tags && selectedNote.tags.length > 0 ? (
                        selectedNote.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeTagFromNote(selectedNote.id, tag)}
                            >
                              <X className="h-2 w-2" />
                            </Button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-6">
                  {isEditing ? (
                    <textarea
                      value={selectedNote.content}
                      onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                      placeholder="Start writing your note in Markdown..."
                      className="w-full h-full resize-none border-none outline-none bg-transparent text-base leading-relaxed placeholder:text-muted-foreground"
                    />
                  ) : (
                    <div 
                      className="markdown-content"
                      dangerouslySetInnerHTML={renderMarkdown(selectedNote.content || '*No content*')}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PencilSimple className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No note selected</h3>
                  <p className="text-sm">Choose a note from the sidebar or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default App