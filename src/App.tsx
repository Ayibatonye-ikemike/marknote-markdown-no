import { useState, useMemo, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, MagnifyingGlass, Trash, PencilSimple } from '@phosphor-icons/react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { marked } from 'marked'
import { toast } from 'sonner'

interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

function App() {
  const [notes, setNotes] = useKV<Note[]>('notes', [])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const selectedNote = useMemo(() => 
    notes.find(note => note.id === selectedNoteId) || null, 
    [notes, selectedNoteId]
  )

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    
    const query = searchQuery.toLowerCase()
    return notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query)
    )
  }, [notes, searchQuery])

  const createNote = useCallback(() => {
    const now = Date.now()
    const newNote: Note = {
      id: `note-${now}`,
      title: 'Untitled Note',
      content: '',
      createdAt: now,
      updatedAt: now
    }
    
    setNotes(currentNotes => [newNote, ...currentNotes])
    setSelectedNoteId(newNote.id)
    setIsEditing(true)
    toast.success('New note created')
  }, [setNotes])

  const updateNote = useCallback((id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    setNotes(currentNotes => 
      currentNotes.map(note => 
        note.id === id 
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note
      )
    )
  }, [setNotes])

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
              
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No notes found' : 'No notes yet'}
                    <div className="text-sm mt-1">
                      {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
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
                <div className="p-6 border-b border-border">
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