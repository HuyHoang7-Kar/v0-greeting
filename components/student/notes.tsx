"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Save, X, FileText } from "lucide-react"

interface Note {
  id: string
  content: string
  created_at: string
  updated_at: string
  user_id: string
}

export function StudentNotes() {
  const supabase = createClient()

  const [notes, setNotes] = useState<Note[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newNoteContent, setNewNoteContent] = useState("")
  const [editNoteContent, setEditNoteContent] = useState("")
  const [loading, setLoading] = useState(false)

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (err) {
      console.error("❌ Error fetching notes:", err)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  // Create note
  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error("User not authenticated")

      const { error } = await supabase.from("notes").insert({
        content: newNoteContent.trim(),
        user_id: user.id,
      })

      if (error) throw error

      setNewNoteContent("")
      setIsCreating(false)
      fetchNotes()
    } catch (err) {
      console.error("❌ Error creating note:", err)
    } finally {
      setLoading(false)
    }
  }

  // Update note
  const handleUpdateNote = async (id: string) => {
    if (!editNoteContent.trim()) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from("notes")
        .update({
          content: editNoteContent.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
      setEditingId(null)
      fetchNotes()
    } catch (err) {
      console.error("❌ Error updating note:", err)
    } finally {
      setLoading(false)
    }
  }

  // Delete note
  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return
    setLoading(true)
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id)
      if (error) throw error
      fetchNotes()
    } catch (err) {
      console.error("❌ Error deleting note:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Keep track of your study notes.</p>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* Create Note */}
      {isCreating && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="flex justify-between items-center">
            <p>Create New Note</p>
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write your note..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="min-h-24"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCreateNote}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
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
              <CardHeader className="flex justify-between items-start">
                {editingId === note.id ? (
                  <Textarea
                    value={editNoteContent}
                    onChange={(e) => setEditNoteContent(e.target.value)}
                    className="min-h-24 w-full"
                  />
                ) : (
                  <p className="text-gray-900 break-words">
                    {note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content}
                  </p>
                )}
                <div className="flex gap-1">
                  {editingId === note.id ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleUpdateNote(note.id)} disabled={loading}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(note.id); setEditNoteContent(note.content); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteNote(note.id)} disabled={loading}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mt-2">
                  Updated {new Date(note.updated_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
