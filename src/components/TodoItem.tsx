'use client'

import { useState } from 'react'
import type { Todo, UpdateTodoInput } from '@/types/todo'

interface TodoItemProps {
  todo: Todo
  onTodoUpdated: (todo: Todo) => void
  onTodoDeleted: (id: string) => void
}

export default function TodoItem({ todo, onTodoUpdated, onTodoDeleted }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggleComplete = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新に失敗しました')
      }

      const updatedTodo = await response.json()
      onTodoUpdated(updatedTodo)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      const body: UpdateTodoInput = {
        title: title.trim(),
        description: description.trim() || null,
      }

      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新に失敗しました')
      }

      const updatedTodo = await response.json()
      onTodoUpdated(updatedTodo)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('このTodoを削除しますか？')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '削除に失敗しました')
      }

      onTodoDeleted(todo.id)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="card bg-base-200 shadow">
        <div className="card-body">
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">タイトル</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">説明</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-sm"
              onClick={() => {
                setIsEditing(false)
                setTitle(todo.title)
                setDescription(todo.description || '')
                setError(null)
              }}
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleSave}
              disabled={loading || !title.trim()}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card shadow ${todo.completed ? 'bg-base-300 opacity-75' : 'bg-base-100'}`}>
      <div className="card-body">
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            className="checkbox checkbox-primary mt-1"
            checked={todo.completed}
            onChange={handleToggleComplete}
            disabled={loading}
          />

          <div className="flex-1">
            <h3
              className={`text-lg font-semibold ${
                todo.completed ? 'line-through text-gray-500' : ''
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p
                className={`text-sm mt-1 ${
                  todo.completed ? 'line-through text-gray-400' : 'text-gray-600'
                }`}
              >
                {todo.description}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              作成: {new Date(todo.created_at).toLocaleString('ja-JP')}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              編集
            </button>
            <button
              className="btn btn-sm btn-error"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                '削除'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


