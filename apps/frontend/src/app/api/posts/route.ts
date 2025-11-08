import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

export async function GET(req: NextRequest) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM posts ORDER BY created_at DESC'
    );
    connection.release();
    
    // displayId 추가
    const postsWithDisplayId = (rows as any[]).map((post, index) => ({
      ...post,
      displayId: rows.length - index
    }));
    
    return NextResponse.json(postsWithDisplayId);
  } catch (error) {
    console.error('DB 에러:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}