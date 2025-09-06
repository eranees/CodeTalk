# CodeTalk Database Setup

This guide will help you set up PostgreSQL database for the CodeTalk application.

## Prerequisites

1. **PostgreSQL** installed on your system
2. **Node.js** and **pnpm** installed
3. **CodeTalk backend** dependencies installed

## Database Setup

### 1. Install PostgreSQL

#### Windows:
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Install with default settings
- Remember the password you set for the `postgres` user

#### macOS:
```bash
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database

Connect to PostgreSQL as the `postgres` user:

```bash
psql -U postgres
```

Run the setup script:

```sql
-- Create database
CREATE DATABASE code_talk_db;

-- Connect to the database
\c code_talk_db;

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exit psql
\q
```

Or use the provided script:

```bash
psql -U postgres -f scripts/setup-database.sql
```

### 3. Environment Configuration

The `.env` file is already configured with the following settings:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=secret password
DB_NAME=code_talk_db
TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=true
```

**Important:** Update the `DB_PASSWORD` in `.env` to match your PostgreSQL password.

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Start the Application

```bash
pnpm run dev
```

The application will automatically:
- Connect to the database
- Create tables if they don't exist (due to `TYPEORM_SYNCHRONIZE=true`)
- Start the server on port 3001

## Database Schema

The application uses the following entities:

### Users Table
- `id` (UUID, Primary Key)
- `username` (VARCHAR, Unique)
- `socketId` (VARCHAR, Nullable)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Groups Table
- `id` (UUID, Primary Key)
- `code` (VARCHAR, Unique)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Messages Table
- `id` (UUID, Primary Key)
- `message` (TEXT)
- `username` (VARCHAR)
- `timestamp` (TIMESTAMP)
- `groupCode` (VARCHAR)
- `userId` (UUID, Foreign Key)
- `groupId` (UUID, Foreign Key)

### User_Groups Table (Many-to-Many)
- `userId` (UUID, Foreign Key)
- `groupId` (UUID, Foreign Key)

## Troubleshooting

### Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # Windows
   services.msc
   
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   ```

2. **Verify database exists:**
   ```bash
   psql -U postgres -l
   ```

3. **Check connection:**
   ```bash
   psql -U postgres -d code_talk_db -c "SELECT version();"
   ```

### Permission Issues

If you get permission errors:

```sql
-- Grant permissions to postgres user
GRANT ALL PRIVILEGES ON DATABASE code_talk_db TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

### Reset Database

To reset the database:

```sql
-- Drop and recreate database
DROP DATABASE IF EXISTS code_talk_db;
CREATE DATABASE code_talk_db;
```

## Production Considerations

For production deployment:

1. **Disable auto-sync:**
   ```env
   TYPEORM_SYNCHRONIZE=false
   ```

2. **Use migrations instead:**
   ```bash
   pnpm run typeorm migration:generate -- -n InitialSchema
   pnpm run typeorm migration:run
   ```

3. **Use connection pooling:**
   ```typescript
   // In database.ts
   extra: {
     max: 20,
     min: 5,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   }
   ```

4. **Enable SSL for production:**
   ```env
   DB_SSL=true
   ```

## Health Check

Once the application is running, you can check the database connection:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "activeGroups": 0,
  "totalUsers": 0,
  "totalMessages": 0
}
```
