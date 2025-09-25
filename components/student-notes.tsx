"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Save, X, FileText } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

interface StudentNotesProps {
  notes: Note[]
  onNotesChange: () => void
}

export function StudentNotes({ notes, onNotesChange }: StudentNotesProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({ title: "", content: "" })
  const [editNote, setEditNote] = useState({ title: "", content: "" })
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("notes").insert({
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        user_id: user.id,
      })

      if (!error) {
        setNewNote({ title: "", content: "" })
        setIsCreating(false)
        onNotesChange()
      }
    } catch (error) {
      console.error("Error creating note:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateNote = async (id: string) => {
    if (!editNote.title.trim() || !editNote.content.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("notes")
        .update({
          title: editNote.title.trim(),
          content: editNote.content.trim(),
        })
        .eq("id", id)

      if (!error) {
        setEditingId(null)
        onNotesChange()
      }
    } catch (error) {
      console.error("Error updating note:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("notes").delete().eq("id", id)

      if (!error) {
        onNotesChange()
      }
    } catch (error) {
      console.error("Error deleting note:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (note: Note) => {
    setEditingId(note.id)
    setEditNote({ title: note.title, content: note.content })
  }

  return (
    <div className="space-y-6">
      {/* Create Note Button */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Keep track of important information and study notes.</p>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Create New Note
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreating(false)
                  setNewNote({ title: "", content: "" })
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
            <Textarea
              placeholder="Write your note here..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="min-h-32"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCreateNote}
                disabled={isLoading || !newNote.title.trim() || !newNote.content.trim()}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  setNewNote({ title: "", content: "" })
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notes yet</p>
            <p className="text-gray-400 text-sm mt-2">Create your first note to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note.id} className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {editingId === note.id ? (
                    <Input
                      value={editNote.title}
                      onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                      className="font-semibold"
                    />
                  ) : (
                    <CardTitle className="text-lg text-gray-900 text-balance">{note.title}</CardTitle>
                  )}
                  <div className="flex gap-1">
                    {editingId === note.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateNote(note.id)}
                          disabled={isLoading}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => startEditing(note)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === note.id ? (
                  <Textarea
                    value={editNote.content}
                    onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                    className="min-h-24"
                  />
                ) : (
                  <p className="text-gray-700 text-sm leading-relaxed text-pretty">
                    {note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-3">
                  {editingId === note.id ? "Editing..." : `Updated ${new Date(note.updated_at).toLocaleDateString()}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
