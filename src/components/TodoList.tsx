'use client'

import { useState } from 'react'
import type { Todo, UpdateTodoInput } from '@/types/todo'
import TodoItem from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  onTodoUpdated: (todo: Todo) => void
  onTodoDeleted: (id: string) => void
}

export default function TodoList({ todos, onTodoUpdated, onTodoDeleted }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Todoがありません。新しいTodoを作成してください。</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onTodoUpdated={onTodoUpdated}
          onTodoDeleted={onTodoDeleted}
        />
      ))}
    </div>
  )
}


