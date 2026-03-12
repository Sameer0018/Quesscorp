import * as fs from 'fs';
import * as path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { config } from '../config';

dotenv.config();

async function run(): Promise<void> {
  const schemaPath = path.join(__dirname, '../db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  const { host, user, password, database, port } = config.db;

  const poolConfig = {
    host,
    user,
    password,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  let connection = await mysql.createConnection(poolConfig);
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    if (stmt.toUpperCase().startsWith('CREATE DATABASE')) {
      try {
        await connection.query(stmt);
      } catch (e: unknown) {
        if ((e as { code?: string }).code !== 'ER_DB_CREATE_EXISTS') throw e;
      }
      await connection.end();
      connection = await mysql.createConnection({ ...poolConfig, database });
      continue;
    }
    if (stmt.toUpperCase().startsWith('USE ')) {
      await connection.query(stmt);
      continue;
    }
    await connection.query(stmt);
  }
  await connection.end();
  console.log('Migration completed.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
