# Zenith Scorz - Neon + Drizzle ORM Integration

This project is configured to use **Neon Postgres** database with **Drizzle ORM** and the **Neon WebSocket driver**.

## 🚀 Quick Start

### 1. Configure Database Connection

Open the `.env` file and replace the placeholder values with your actual Neon database connection string:

```env
DATABASE_URL="postgresql://[user]:[password]@[neon_hostname]/[dbname]?sslmode=require"
```

**Where to find your connection string:**
- Go to [Neon Console](https://console.neon.tech)
- Select your project
- Go to Dashboard → Connect
- Copy your connection string

### 2. Generate Migration Files

This creates the SQL migration files based on your schema:

```bash
npm run db:generate
```

### 3. Apply Migrations to Database

This runs the migrations against your Neon database:

```bash
npm run db:migrate
```

### 4. Test the CRUD Example

Run the example script to test Create, Read, Update, and Delete operations:

```bash
npm run crud-example
```

Expected output:
```
Performing CRUD operations...
✅ CREATE: New user created: { id: 1, name: 'Admin User', email: 'admin@example.com', ... }
✅ READ: Found user: { id: 1, name: 'Admin User', email: 'admin@example.com', ... }
✅ UPDATE: User updated: { id: 1, name: 'Super Admin', email: 'admin@example.com', ... }
✅ DELETE: User deleted.

CRUD operations completed successfully.
Database pool closed.
```

## 📁 Project Structure

```
zenith-scorz/
├── src/
│   ├── db.js           # Database connection (Neon WebSocket)
│   ├── schema.js       # Drizzle schema definitions
│   ├── crud-example.js # CRUD operations example
│   └── index.js        # Your main application
├── drizzle/            # Generated migration files (created after db:generate)
├── drizzle.config.js   # Drizzle Kit configuration
├── .env                # Environment variables (DO NOT COMMIT)
└── package.json
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with watch mode
- `npm start` - Start production server
- `npm run db:generate` - Generate migration files from schema
- `npm run db:migrate` - Apply migrations to database
- `npm run crud-example` - Run CRUD example script

## 📚 Database Schema

Current schema includes a `demo_users` table:

```javascript
{
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}
```

## 🛠️ How to Use in Your Application

### Import the database connection:

```javascript
import { db } from './db.js';
import { demoUsers } from './schema.js';
import { eq } from 'drizzle-orm';
```

### Query examples:

```javascript
// Select all users
const users = await db.select().from(demoUsers);

// Select with conditions
const user = await db.select()
  .from(demoUsers)
  .where(eq(demoUsers.email, 'test@example.com'));

// Insert
const [newUser] = await db.insert(demoUsers)
  .values({ name: 'John', email: 'john@example.com' })
  .returning();

// Update
await db.update(demoUsers)
  .set({ name: 'John Doe' })
  .where(eq(demoUsers.id, 1));

// Delete
await db.delete(demoUsers)
  .where(eq(demoUsers.id, 1));
```

## 🔌 Driver Information

This project uses the **Neon WebSocket driver**, which is ideal for:
- Long-running Node.js servers (like Express)
- Persistent WebSocket connections
- Efficient handling of frequent queries

## 📖 Documentation

- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Neon Documentation](https://neon.tech/docs)
- [Drizzle + Neon Guide](https://orm.drizzle.team/docs/get-started-postgresql#neon)

## ⚠️ Important Notes

- Never commit your `.env` file (already in .gitignore)
- Always run migrations after schema changes
- Close the database pool in production apps when shutting down

## 🔄 Workflow for Schema Changes

1. Edit `src/schema.js` to add/modify tables
2. Run `npm run db:generate` to create migration files
3. Review the generated SQL in `drizzle/` folder
4. Run `npm run db:migrate` to apply changes
5. Use the new schema in your application code

---

Happy coding! 🎉
