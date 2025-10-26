import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

export async function GET(
  req: NextRequest,
  { params }: { params: { displayId: string } }
) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM posts ORDER BY created_at DESC'
    );
    connection.release();
    
    const displayId = parseInt(params.displayId);
    const postIndex = rows.length - displayId;
    
    if (postIndex < 0 || postIndex >= rows.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    return NextResponse.json(rows[postIndex]);
  } catch (error) {
    console.error('DB 에러:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}