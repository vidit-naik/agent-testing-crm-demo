#!/usr/bin/env node

/**
 * Database switching script for Prisma
 * Usage: node scripts/use-db.js sqlite|postgres
 *
 * This modifies the datasource block in prisma/schema.prisma to switch
 * between SQLite (local development) and PostgreSQL (Supabase).
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

const SQLITE_DATASOURCE = `// SQLite configuration (local development)
datasource db {
  provider = "sqlite"
  url      = env("SQLITE_URL")
}`;

const POSTGRES_DATASOURCE = `// PostgreSQL configuration (Supabase)
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_URL")
  directUrl = env("POSTGRES_DIRECT_URL")
}`;

const provider = process.argv[2];

if (!provider || !['sqlite', 'postgres'].includes(provider)) {
  console.error('Usage: node scripts/use-db.js sqlite|postgres');
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace the datasource block (matches from comment to closing brace)
const datasourceRegex = /\/\/.*configuration.*\ndatasource db \{[\s\S]*?\n\}/;

if (provider === 'sqlite') {
  schema = schema.replace(datasourceRegex, SQLITE_DATASOURCE);
  console.log('✓ Switched to SQLite (using SQLITE_URL)');
} else {
  schema = schema.replace(datasourceRegex, POSTGRES_DATASOURCE);
  console.log('✓ Switched to PostgreSQL (using POSTGRES_URL)');
}

fs.writeFileSync(schemaPath, schema, 'utf8');

// Run prisma generate
console.log('\nGenerating Prisma client...');
const { execSync } = require('child_process');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('\n✓ Ready to use');
} catch (error) {
  console.error('Failed to generate Prisma client');
  process.exit(1);
}
