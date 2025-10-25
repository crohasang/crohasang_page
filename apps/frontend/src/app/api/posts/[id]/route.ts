import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM posts WHERE id = ?',
      [params.id]
    );
    connection.release();
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('DB 에러:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}