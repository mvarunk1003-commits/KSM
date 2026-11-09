/**
 * PostgreSQL Database Connection Module
 * Supports:
 * 1. Direct connection (Local / Docker / AWS RDS / EC2)
 * 2. SSL connection with PEM certificate support (AWS ap-south-1 RDS/EC2)
 * 3. Secure SSH Tunneling using AWS Private PEM Key (ssh2)
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const net = require('net');
require('dotenv').config();

let pool = null;
let sshClient = null;
let isConnected = false;

/**
 * Configure SSL options based on environment
 */
function getSslConfig() {
  const sslMode = process.env.DB_SSL;
  if (!sslMode || sslMode === 'false' || sslMode === '0') {
    return false;
  }

  const sslConfig = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
  };

  // Support for private PEM key / certificates
  if (process.env.DB_SSL_CA_PATH && fs.existsSync(process.env.DB_SSL_CA_PATH)) {
    sslConfig.ca = fs.readFileSync(process.env.DB_SSL_CA_PATH).toString();
  } else if (process.env.DB_SSL_CA_CONTENT) {
    sslConfig.ca = process.env.DB_SSL_CA_CONTENT;
  }

  if (process.env.DB_SSL_KEY_PATH && fs.existsSync(process.env.DB_SSL_KEY_PATH)) {
    sslConfig.key = fs.readFileSync(process.env.DB_SSL_KEY_PATH).toString();
  }

  if (process.env.DB_SSL_CERT_PATH && fs.existsSync(process.env.DB_SSL_CERT_PATH)) {
    sslConfig.cert = fs.readFileSync(process.env.DB_SSL_CERT_PATH).toString();
  }

  return sslConfig;
}

/**
 * Initialize SSH Tunnel using AWS Private PEM Key
 */
async function createSshTunnel() {
  return new Promise((resolve, reject) => {
    const { Client } = require('ssh2');
    sshClient = new Client();

    const sshHost = process.env.SSH_HOST;
    const sshPort = parseInt(process.env.SSH_PORT || '22', 10);
    const sshUser = process.env.SSH_USER || 'ec2-user';
    const remoteDbHost = process.env.REMOTE_DB_HOST || '127.0.0.1';
    const remoteDbPort = parseInt(process.env.REMOTE_DB_PORT || '5432', 10);

    // Read PEM key from file or environment variable
    let privateKey = null;
    if (process.env.SSH_PRIVATE_KEY) {
      privateKey = process.env.SSH_PRIVATE_KEY;
    } else if (process.env.SSH_KEY_PATH) {
      const resolvedPath = path.isAbsolute(process.env.SSH_KEY_PATH)
        ? process.env.SSH_KEY_PATH
        : path.join(__dirname, '..', process.env.SSH_KEY_PATH);

      if (fs.existsSync(resolvedPath)) {
        privateKey = fs.readFileSync(resolvedPath, 'utf8');
      } else {
        return reject(new Error(`SSH Private PEM key not found at ${resolvedPath}`));
      }
    }

    if (!privateKey) {
      return reject(new Error('SSH Tunnel enabled but neither SSH_KEY_PATH nor SSH_PRIVATE_KEY was provided.'));
    }

    console.log(`🔐 Establishing secure SSH tunnel via ${sshUser}@${sshHost}:${sshPort} with private PEM key...`);

    // Create a local TCP proxy server that forwards through the SSH connection
    const localServer = net.createServer((socket) => {
      sshClient.forwardOut(
        '127.0.0.1',
        socket.remotePort,
        remoteDbHost,
        remoteDbPort,
        (err, stream) => {
          if (err) {
            socket.end();
            return;
          }
          socket.pipe(stream).pipe(socket);
        }
      );
    });

    localServer.listen(0, '127.0.0.1', () => {
      const localPort = localServer.address().port;
      console.log(`🔌 Local proxy listening on 127.0.0.1:${localPort} -> forwarded to AWS ${remoteDbHost}:${remoteDbPort}`);

      sshClient
        .on('ready', () => {
          console.log(`✅ SSH tunnel connected to AWS server in ap-south-1!`);
          resolve({ localPort, localServer });
        })
        .on('error', (err) => {
          localServer.close();
          reject(err);
        })
        .connect({
          host: sshHost,
          port: sshPort,
          username: sshUser,
          privateKey: privateKey,
          passphrase: process.env.SSH_KEY_PASSPHRASE || undefined
        });
    });
  });
}

/**
 * Initialize PostgreSQL Pool
 */
async function initDbPool() {
  if (pool) return pool;

  let targetHost = process.env.DB_HOST || 'localhost';
  let targetPort = parseInt(process.env.DB_PORT || '5432', 10);

  // Check if SSH tunneling with AWS PEM key is requested
  if (process.env.SSH_TUNNEL_ENABLED === 'true') {
    try {
      const { localPort } = await createSshTunnel();
      targetHost = '127.0.0.1';
      targetPort = localPort;
    } catch (err) {
      console.error('❌ Failed to establish SSH tunnel with AWS PEM key:', err.message);
      throw err;
    }
  }

  const sslConfig = getSslConfig();

  const config = {
    host: targetHost,
    port: targetPort,
    database: process.env.DB_NAME || 'ksm_temple_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: sslConfig,
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  };

  // If full DATABASE_URL is provided
  if (process.env.DATABASE_URL && process.env.SSH_TUNNEL_ENABLED !== 'true') {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig
    });
  } else {
    pool = new Pool(config);
  }

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
  });

  return pool;
}

/**
 * Execute a query with parameters
 */
async function query(text, params) {
  const p = await initDbPool();
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text: text.slice(0, 80), duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('Database query error:', { query: text, error: err.message });
    throw err;
  }
}

/**
 * Check connection health
 */
async function testConnection() {
  try {
    const res = await query('SELECT NOW() AS current_time, current_database() AS db_name, version() AS version');
    isConnected = true;
    console.log(`✅ Connected to PostgreSQL Database: "${res.rows[0].db_name}" at ${res.rows[0].current_time}`);
    return { success: true, info: res.rows[0] };
  } catch (err) {
    isConnected = false;
    console.warn(`⚠️ PostgreSQL connection not established: ${err.message}`);
    return { success: false, error: err.message };
  }
}

function isPgConnected() {
  return isConnected;
}

module.exports = {
  query,
  initDbPool,
  testConnection,
  isPgConnected
};
