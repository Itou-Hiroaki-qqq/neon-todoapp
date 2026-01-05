import { createClient } from '@/utils/supabase/server'
import { sql } from '@/utils/db'
import { NextResponse } from 'next/server'
import type { UpdateTodoInput } from '@/types/todo'

// PATCH: Todoを更新
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params
    const body: UpdateTodoInput = await request.json()

    // ユーザーがこのTodoの所有者か確認
    const existing = await sql`
      SELECT user_id FROM todos WHERE id = ${id}
    `

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Todoが見つかりません' }, { status: 404 })
    }

    if (existing[0].user_id !== user.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    // Todoを更新（指定されたフィールドのみ更新）
    const updated = await sql`
      UPDATE todos
      SET 
        title = COALESCE(${body.title || null}, title),
        description = COALESCE(${body.description !== undefined ? body.description : null}, description),
        completed = COALESCE(${body.completed !== undefined ? body.completed : null}, completed)
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `

    return NextResponse.json(updated[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Todoを削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params

    // ユーザーがこのTodoの所有者か確認して削除
    const result = await sql`
      DELETE FROM todos
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Todoが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ message: '削除しました' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

