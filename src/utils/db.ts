import { neon } from '@neondatabase/serverless'

// Neonデータベース接続用のクライアント
export const sql = neon(process.env.DATABASE_URL!)


