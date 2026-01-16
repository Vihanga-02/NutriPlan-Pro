import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

// Support both DATABASE_URL and individual connection parameters
let poolConfig;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL to extract database name for logging
  try {
    const url = new URL(process.env.DATABASE_URL.replace(/^postgres:/, 'http:'));
    const databaseName = url.pathname.replace('/', '');
    console.log(`📊 Connecting to database: "${databaseName}"`);
    
    if (databaseName !== 'restaurant') {
      console.warn(`⚠️  Warning: Database name is "${databaseName}" but expected "restaurant"`);
      console.warn(`   Please check your DATABASE_URL in server/.env file`);
    }
  } catch (e) {
    console.warn('Could not parse DATABASE_URL for logging');
  }
  
  // Use DATABASE_URL if provided
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Fall back to individual parameters
  const dbName = process.env.DB_NAME || 'nutriplan_pro';
  console.log(`📊 Connecting to database: "${dbName}"`);
  
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: dbName||'restaurant',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);

  client.query = (...args) => {
    client.lastQuery = args;
    return query(...args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release();
  };

  return client;
};

export default { query, getClient, pool };
