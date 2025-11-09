
# Database Configuration

⚠️ **SECURITY WARNING**: Never commit real database credentials to version control!

## Production Database Setup
1. Set up your production database (e.g., Neon DB, AWS RDS, etc.)
2. Configure your DATABASE_URL environment variable:
   ```bash
   export DATABASE_URL=postgresql://username:password@your-host:5432/your-database?sslmode=require
   ```

## Development Database Setup
For local development, use the provided Docker setup:
```bash
export DATABASE_URL=postgresql://test:test@localhost:5434/locals-scrapper
```

unset DATABASE_URL

npx prisma db push
npx prisma db pull

npx prisma generate

// create migration
npx prisma migrate dev

// apply migration
npx prisma migrate deploy
