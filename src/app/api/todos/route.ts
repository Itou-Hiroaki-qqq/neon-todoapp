import { createClient } from '@/utils/supabase/server'
import { sql } from '@/utils/db'
import { NextResponse } from 'next/server'
import type { CreateTodoInput } from '@/types/todo'

// GET: ユーザーのTodo一覧を取得
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const todos = await sql`
      SELECT * FROM todos
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json(todos)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: 新しいTodoを作成
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body: CreateTodoInput = await request.json()
    const { title, description } = body

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO todos (user_id, title, description)
      VALUES (${user.id}, ${title}, ${description || null})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


