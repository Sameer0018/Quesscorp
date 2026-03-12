import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection';

dotenv.config();

const sampleEmployees = [
  { full_name: 'Alice Johnson', email: 'alice@example.com', department: 'Engineering' },
  { full_name: 'Bob Smith', email: 'bob@example.com', department: 'HR' },
  { full_name: 'Carol White', email: 'carol@example.com', department: 'Engineering' },
  { full_name: 'David Brown', email: 'david@example.com', department: 'Finance' },
  { full_name: 'Eve Davis', email: 'eve@example.com', department: 'HR' },
];

async function seed(): Promise<void> {
  const defaultUserEmail = 'admin@hrms.local';
  const defaultPassword = 'admin123';
  const hash = await bcrypt.hash(defaultPassword, 10);

  const existingUser = await query<{ id: string }[]>('SELECT id FROM users WHERE email = ?', [defaultUserEmail]);
  if (Array.isArray(existingUser) && existingUser.length === 0) {
    const userId = uuidv4();
    await query('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [userId, defaultUserEmail, hash]);
    console.log('Created default user:', defaultUserEmail, 'password:', defaultPassword);
  } else {
    await query('UPDATE users SET password_hash = ? WHERE email = ?', [hash, defaultUserEmail]);
    console.log('Reset password for default user:', defaultUserEmail, 'password:', defaultPassword);
  }

  const existingEmails = await query<{ email: string }[]>('SELECT email FROM employees');
  const existingSet = new Set(Array.isArray(existingEmails) ? existingEmails.map((r) => r.email) : []);

  for (const emp of sampleEmployees) {
    if (existingSet.has(emp.email)) continue;
    const id = uuidv4();
    await query('INSERT INTO employees (id, full_name, email, department) VALUES (?, ?, ?, ?)', [
      id,
      emp.full_name,
      emp.email,
      emp.department,
    ]);
    existingSet.add(emp.email);
    console.log('Inserted employee:', emp.email);

    const dates = ['2025-03-01', '2025-03-02', '2025-03-03', '2025-03-04', '2025-03-05', '2025-03-06', '2025-03-07'];
    for (const d of dates) {
      const aid = uuidv4();
      const status = Math.random() > 0.2 ? 'Present' : 'Absent';
      await query('INSERT IGNORE INTO attendance (id, employee_id, date, status) VALUES (?, ?, ?, ?)', [aid, id, d, status]);
    }
  }

  console.log('Seed completed.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
