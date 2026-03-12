import mysql from 'mysql2/promise';
import { config } from '../config';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function query<T = unknown>(sql: string, params?: unknown[]): Promise<T> {
  const [rows] = await getPool().execute(sql, params as (string | number)[] | undefined);
  return rows as T;
}

export async function checkConnection(): Promise<boolean> {
  try {
    const conn = await getPool().getConnection();
    conn.release();
    return true;
  } catch {
    return false;
  }
}
