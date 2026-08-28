const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

async function run() {
  if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is required to run database migrations.');
    console.log('Usage: DATABASE_URL="postgresql://..." node scripts/migrate_and_seed.js');
    process.exit(1);
  }

  console.log('Connecting to Supabase PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to database!');

    const sqlPath = path.join(__dirname, '../supabase/migrations/20260826000000_initial_schema.sql');
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      console.log('Executing database schema migration...');
      await client.query(sql);
      console.log('Schema migration applied successfully!');
    }

    console.log('Database initialization complete.');
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
