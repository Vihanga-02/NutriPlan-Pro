// Quick script to check database connection and name
import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

// Parse DATABASE_URL
try {
  const url = new URL(DATABASE_URL.replace(/^postgres:/, 'http:'));
  const databaseName = url.pathname.replace('/', '');
  const host = url.hostname;
  const port = url.port;
  const user = url.username;
  
  console.log('📊 Database Connection Details:');
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);
  console.log(`   User: ${user}`);
  console.log(`   Database: "${databaseName}"`);
  console.log('');
  
  if (databaseName !== 'restaurant') {
    console.warn(`⚠️  WARNING: Database name is "${databaseName}"`);
    console.warn(`   Expected: "restaurant"`);
    console.warn(`   Please update your DATABASE_URL in server/.env file`);
    console.warn(`   Format: postgres://postgres:12345@localhost:5432/restaurant`);
    console.log('');
  }
  
  // Try to connect
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  pool.query('SELECT NOW() as current_time, current_database() as db_name')
    .then(result => {
      console.log('✅ Connection successful!');
      console.log(`   Current database: ${result.rows[0].db_name}`);
      console.log(`   Server time: ${result.rows[0].current_time}`);
      pool.end();
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Connection failed:');
      console.error(`   ${error.message}`);
      if (error.code === '3D000') {
        console.error('');
        console.error('💡 Solution:');
        console.error('   1. Open pgAdmin');
        console.error('   2. Create a database named "restaurant"');
        console.error('   3. Or update your DATABASE_URL to match your existing database name');
      }
      pool.end();
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Invalid DATABASE_URL format');
  console.error(`   Error: ${error.message}`);
  console.error('');
  console.error('Expected format: postgres://username:password@host:port/database');
  process.exit(1);
}

