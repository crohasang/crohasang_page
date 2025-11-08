import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ displayId: string }> }
) {
  try {
    const { displayId } = await params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM posts ORDER BY created_at DESC'
    );
    connection.release();
    
    const displayIdNum = parseInt(displayId);
    const postIndex = rows.length - displayIdNum;
    
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