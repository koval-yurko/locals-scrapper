
# Neon DB
https://console.neon.tech/app/projects/bold-haze-22712372?database=neondb

# Prisma Accelerate
https://console.prisma.io/cm5tghyew05o6wqv5gd5gzh3h/overview

export DATABASE_URL=postgresql://neondb_owner:7IaowtWc3yiL@ep-wild-boat-a2h7n0b7.eu-central-1.aws.neon.tech/neondb?sslmode=require

export DATABASE_URL=postgresql://test:test@localhost:5434/locals-scrapper

unset DATABASE_URL

npx prisma db push
npx prisma db pull

npx prisma generate

// create migration
npx prisma migrate dev

// apply migration
npx prisma migrate deploy
