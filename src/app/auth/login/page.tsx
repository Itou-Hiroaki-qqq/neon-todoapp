'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResendEmail, setShowResendEmail] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (error) {
          console.error('Sign up error:', error)
          throw error
        }
        // メール確認が必要な場合と不要な場合の両方に対応
        if (data.user) {
          alert('登録が完了しました。ログインしてください。')
          setIsSignUp(false)
        } else {
          alert('確認メールを送信しました。メールを確認してください。')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) {
          console.error('Sign in error:', error)
          throw error
        }
        router.push('/')
        router.refresh()
      }
      setShowResendEmail(false)
    } catch (err: any) {
      console.error('Auth error:', err)
      // より分かりやすいエラーメッセージ
      if (err.message.includes('invalid')) {
        setError('メールアドレスの形式が正しくありません。または、Supabaseの設定を確認してください。')
      } else if (err.message.includes('Email not confirmed') || err.message.includes('email_not_confirmed')) {
        setError('メールアドレスの確認が完了していません。確認メールのリンクをクリックするか、下の「確認メールを再送信」ボタンをクリックしてください。')
        setShowResendEmail(true)
      } else {
        setError(err.message || 'エラーが発生しました')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-4">
            {isSignUp ? '新規登録' : 'ログイン'}
          </h2>
          
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {showResendEmail && (
            <div className="alert alert-info">
              <div className="flex flex-col gap-2">
                <span>確認メールを再送信しますか？</span>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={async () => {
                    setLoading(true)
                    try {
                      const { error } = await supabase.auth.resend({
                        type: 'signup',
                        email: email.trim(),
                      })
                      if (error) throw error
                      alert('確認メールを再送信しました。メールボックスを確認してください。')
                      setShowResendEmail(false)
                    } catch (err: any) {
                      setError('メールの再送信に失敗しました: ' + err.message)
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading || !email.trim()}
                >
                  確認メールを再送信
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">メールアドレス</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">パスワード</span>
              </label>
              <input
                type="password"
                placeholder="パスワード"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? '処理中...' : isSignUp ? '新規登録' : 'ログイン'}
              </button>
            </div>
          </form>

          <div className="divider">または</div>

          <button
            className="btn btn-outline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'ログインに切り替え' : '新規登録に切り替え'}
          </button>
        </div>
      </div>
    </div>
  )
}

