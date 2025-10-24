import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM posts');
    connection.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('DB 에러:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}