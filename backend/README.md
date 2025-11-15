# Backend - Cryptalk

Express.js backend with TypeScript, Drizzle ORM, and PostgreSQL.

## 🚀 Getting Started

### Using Docker (Recommended)

Start all services:

```bash
docker-compose up --build
```

The backend will automatically:

- Wait for PostgreSQL to be ready
- Sync database schema
- Start the development server with nodemon

## 📦 Database Commands

All database commands can be run using `docker exec` when the containers are running:

### Schema Management

```bash
# Generate migration files based on schema changes
docker-compose exec backend npm run db:generate

# Push schema changes directly to database (development)
docker-compose exec backend npm run db:push

# Run migrations (production approach)
docker-compose exec backend npm run db:migrate

# Setup database (generate + push)
docker-compose exec backend npm run db:setup
```

### Data Management

```bash
# Seed the database with sample users
docker-compose exec backend npm run db:seed

# Clear all data from the database
docker-compose exec backend npm run db:clear

# Clear and re-seed in one command
docker-compose exec backend npm run db:clear && docker-compose exec backend npm run db:seed
```

### Database Tools

```bash
# Open Drizzle Studio (database browser)
docker-compose exec backend npm run db:studio
# Then visit: http://localhost:4000

```

## 🔧 Development Commands

```bash
# Start development server with hot reload
docker-compose exec backend npm run dev

# Build TypeScript to JavaScript
docker-compose exec backend npm run build

# Start production server
docker-compose exec backend npm run start
```

## 🐳 Docker Services

- **Backend**: `http://localhost:3001` - Express API server
- **Database**: `localhost:5432` - PostgreSQL database
- **Drizzle Studio**: `http://localhost:4000` - Database browser

## 📁 Project Structure

```
backend/
├── src/
│   ├── handlers/         # Request handlers
│   ├── repo/             # Database configuration
│   │   ├── db.ts         # Database connection
│   │   └── schema.ts     # Database schema
│   ├── repository/       # Data access layer
│   ├── routes/           # API routes
│   ├── scripts/          # Utility scripts
│   │   ├── seed.ts       # Database seeding
│   │   └── clear.ts      # Database clearing
│   └── index.ts          # Main application entry
├── drizzle.config.ts     # Drizzle ORM configuration
└── package.json          # Dependencies and scripts
```

## 🔄 Typical Workflow

1. **Start the application:**

   ```bash
   docker-compose up --build
   ```

2. **Seed the database:**

   ```bash
   docker-compose exec backend npm run db:seed
   ```

3. **Make schema changes** in `src/repo/schema.ts`

4. **Push schema changes:**

   ```bash
   docker-compose exec backend npm run db:push
   ```

5. **View data in Drizzle Studio:**
   Open `http://localhost:4000`

## 🔧 Environment Variables

The following environment variables are configured in docker-compose.yml:

- `NODE_ENV=development`
- `PORT=3000`
- `DATABASE_URL=postgresql://postgres:password@postgres:5432/cryptalk_db`

## 📝 Notes

- The server automatically restarts when you make code changes (nodemon)
- Database schema is automatically synced on container startup
- Seeding is manual to prevent data loss during development
- Use `db:clear` before `db:seed` to reset data completely
