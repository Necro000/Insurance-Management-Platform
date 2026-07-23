const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('⚡ Switching to Zero-Config SQLite database...');

const sqliteSchemaPath = path.join(__dirname, 'prisma', 'schema.sqlite.prisma');
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const envPath = path.join(__dirname, '.env');

// 1. Copy SQLite schema to schema.prisma
fs.copyFileSync(sqliteSchemaPath, schemaPath);
console.log('✅ Updated prisma/schema.prisma to SQLite provider');

// 2. Update .env file DATABASE_URL
let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(/DATABASE_URL=.*/g, 'DATABASE_URL="file:./dev.db"');
fs.writeFileSync(envPath, envContent);
console.log('✅ Updated DATABASE_URL in .env to "file:./dev.db"');

// 3. Generate Prisma client & push schema
try {
  console.log('⚙️ Generating Prisma Client and pushing SQLite database...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', cwd: __dirname });
  console.log('🌱 Seeding database...');
  execSync('node prisma/seed.js', { stdio: 'inherit', cwd: __dirname });
  console.log('\n🎉 Zero-Config SQLite setup completed successfully!');
  console.log('You can now run `npm run dev` and log in immediately!');
} catch (err) {
  console.error('❌ Failed to push SQLite schema or seed database:', err.message);
}
