'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Todo } from '@/types/todo'
import AuthButton from '@/components/AuthButton'
import TodoList from '@/components/TodoList'
import TodoForm from '@/components/TodoForm'

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      fetchTodos()
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/auth/login')
      } else {
        setUser(session.user)
        fetchTodos()
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      }
    } catch (error) {
      console.error('Todoの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTodoCreated = (newTodo: Todo) => {
    setTodos([newTodo, ...todos])
  }

  const handleTodoUpdated = (updatedTodo: Todo) => {
    setTodos(todos.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo))
  }

  const handleTodoDeleted = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="navbar bg-base-100 rounded-lg shadow-lg mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Todo App</h1>
          </div>
          <div className="flex-none">
            <AuthButton />
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">新しいTodoを追加</h2>
            <TodoForm onTodoCreated={handleTodoCreated} />
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Todo一覧</h2>
            <TodoList
              todos={todos}
              onTodoUpdated={handleTodoUpdated}
              onTodoDeleted={handleTodoDeleted}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
