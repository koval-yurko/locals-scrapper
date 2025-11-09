# Locals Scrapper Infrastructure

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- AWS CLI configured
- Go 1.19+ (for Go Lambda functions)

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy sample environment files
   cp lambda/server-app/.env.sample lambda/server-app/.env
   cp lambda/user-fetch/.env.sample lambda/user-fetch/.env
   cp lambda/user-fetch-go/.env.sample lambda/user-fetch-go/.env
   cp cdk/.env.sample cdk/.env
   
   # Edit each .env file with your actual values
   ```

3. **Start local services:**
   ```bash
   npm run dev:setup
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

## 🔒 Security

**⚠️ IMPORTANT**: Read [SECURITY.md](./SECURITY.md) for security guidelines and best practices.

- Never commit real credentials to version control
- Use environment variables for all configuration
- Rotate credentials regularly

## 📦 Deployment

### Development
```bash
npm run cdk:deploy:dev
```

### Production
```bash
npm run cdk:deploy:prod
```

## Useful commands

- `npm run build` - Build TypeScript Lambda functions
- `npm run build:go` - Build Go Lambda functions
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run cdk:deploy:dev` - Deploy Dev stage
- `npm run cdk:deploy:prod` - Deploy Production stage
- `npm run cdk:destroy` - Destroy all stacks

## 🏗️ Architecture

This project includes:
- **AWS CDK** for infrastructure as code
- **Lambda Functions** (TypeScript and Go)
- **API Gateway** for REST API
- **SQS** for message queuing
- **PostgreSQL** database with Prisma ORM
- **Docker Compose** for local development

## 📚 Documentation

- [Security Guidelines](./SECURITY.md)
- [Prisma Database Setup](./shared/repositories/prisma/Readme.md)
