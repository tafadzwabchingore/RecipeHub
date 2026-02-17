// chore: no functional changes
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Comment } from '@/types/recipe'
import { MessageSquare, Pencil, Trash2, Loader2 } from 'lucide-react'

interface Props {
  recipeId: number
  userId: string | null
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function CommentsSection({ recipeId, userId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    async function fetchComments() {
      const supabase = createClient()
      const { data, error } = await supabase
        .rpc('get_comments_with_email', { p_recipe_id: recipeId })

      if (!error && data) {
        setComments(data as Comment[])
      }
      setLoading(false)
    }

    fetchComments()
  }, [recipeId, userId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || submitting) return

    setSubmitting(true)
    const content = newComment.trim()

    // Optimistic: add to list immediately
    const optimistic: Comment = {
      id: -Date.now(),
      recipe_id: recipeId,
      user_id: userId!,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_email: undefined, // will be filled by API
    }
    setComments((prev) => [optimistic, ...prev])
    setNewComment('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, content }),
      })

      if (!res.ok) throw new Error('Failed to post comment')

      const { comment } = await res.json()
      setComments((prev) => prev.map((c) => (c.id === optimistic.id ? comment : c)))
    } catch {
      // Revert optimistic add
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(commentId: number) {
    if (!editContent.trim() || submitting) return

    setSubmitting(true)
    const content = editContent.trim()

    // Optimistic: update in place
    const original = comments.find((c) => c.id === commentId)
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, content, updated_at: new Date().toISOString() } : c
      )
    )
    setEditingId(null)

    try {
      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, content }),
      })

      if (!res.ok) throw new Error('Failed to edit comment')

      const { comment } = await res.json()
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...comment, user_email: c.user_email } : c)))
    } catch {
      // Revert
      if (original) {
        setComments((prev) => prev.map((c) => (c.id === commentId ? original : c)))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId: number) {
    const original = comments.find((c) => c.id === commentId)

    // Optimistic: remove immediately
    setComments((prev) => prev.filter((c) => c.id !== commentId))

    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      })

      if (!res.ok) throw new Error('Failed to delete comment')
    } catch {
      // Revert
      if (original) {
        setComments((prev) => [...prev, original].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ))
      }
    }
  }

  function displayName(comment: Comment): string {
    if (comment.user_email) return comment.user_email.split('@')[0]
    if (comment.user_id === userId) return 'You'
    return 'User'
  }

  return (
    <div className="mt-10 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
        <MessageSquare size={20} />
        Comments {!loading && `(${comments.length})`}
      </h2>

      {/* Comment form (logged-in users only) */}
      {userId && (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this recipe..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Post Comment
            </button>
          </div>
        </form>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="text-gray-500 text-sm flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" />
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{displayName(comment)}</span>
                  <span className="text-xs text-gray-500">{timeAgo(comment.created_at)}</span>
                  {comment.created_at !== comment.updated_at && (
                    <span className="text-xs text-gray-400">(edited)</span>
                  )}
                </div>
                {userId === comment.user_id && editingId !== comment.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(comment.id)
                        setEditContent(comment.content)
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Edit comment"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Delete comment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      disabled={!editContent.trim() || submitting}
                      className="bg-orange-500 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {submitting && <Loader2 size={12} className="animate-spin" />}
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-600 text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
