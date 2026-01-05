'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (loading) {
    return <div className="btn btn-ghost loading">読み込み中...</div>
  }

  if (!user) {
    return (
      <a href="/auth/login" className="btn btn-primary">
        ログイン
      </a>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm">こんにちは、{user.email}</span>
      <button onClick={handleLogout} className="btn btn-outline btn-sm">
        ログアウト
      </button>
    </div>
  )
}


