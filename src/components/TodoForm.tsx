'use client'

import { useState } from 'react'
import type { Todo, CreateTodoInput } from '@/types/todo'

interface TodoFormProps {
  onTodoCreated: (todo: Todo) => void
}

export default function TodoForm({ onTodoCreated }: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const body: CreateTodoInput = {
        title: title.trim(),
        description: description.trim() || undefined,
      }

      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Todoの作成に失敗しました')
      }

      const newTodo = await response.json()
      onTodoCreated(newTodo)
      setTitle('')
      setDescription('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="form-control">
        <label className="label">
          <span className="label-text">タイトル *</span>
        </label>
        <input
          type="text"
          placeholder="Todoのタイトルを入力"
          className="input input-bordered"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">説明（任意）</span>
        </label>
        <textarea
          placeholder="Todoの説明を入力（任意）"
          className="textarea textarea-bordered"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="form-control mt-6">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !title.trim()}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              作成中...
            </>
          ) : (
            'Todoを作成'
          )}
        </button>
      </div>
    </form>
  )
}


