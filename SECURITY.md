# Security Guidelines

## 🔒 Environment Variables and Secrets Management

### Critical Security Rules

1. **NEVER commit real credentials to version control**
   - No API keys, passwords, tokens, or database URLs
   - Use `.env` files for local development (already gitignored)
   - Use environment variables in production

2. **Use .env.sample files as templates only**
   - Contains placeholder values and documentation
   - Never put real credentials in sample files
   - Update samples when adding new environment variables

### Required Environment Variables

#### CDK Deployment
```bash
CDK_DEFAULT_ACCOUNT=your_aws_account_id
CDK_DEFAULT_REGION=eu-central-1
DOMAIN_NAME=your-domain.com
HOSTED_ZONE_ID=your_route53_zone_id
CERTIFICATE_ARN=your_certificate_arn
DATABASE_DEV_URL=postgresql://user:pass@host:port/db
DATABASE_PROD_URL=postgresql://user:pass@host:port/db
LOCALS_ACCESS_TOKEN=your_locals_api_token
VALID_API_KEYS=key1,key2,key3
SUPABASE_JWT_SECRET=your_jwt_secret
```

#### Lambda Functions
- `DATABASE_URL`: PostgreSQL connection string
- `LOCALS_ACCESS_TOKEN`: API token for Locals service
- `JWT_DISCOVERY_URL`: Supabase JWT discovery endpoint
- `VALID_API_KEYS`: Comma-separated API keys for authentication

### Development Setup

1. **Copy sample environment files:**
   ```bash
   cp lambda/server-app/.env.sample lambda/server-app/.env
   cp lambda/user-fetch/.env.sample lambda/user-fetch/.env
   cp lambda/user-fetch-go/.env.sample lambda/user-fetch-go/.env
   cp cdk/.env.sample cdk/.env  # Create this if needed
   ```

2. **Fill in real values in your local .env files**
   - Get API tokens from respective service dashboards
   - Use local database for development
   - Generate secure random strings for API keys

3. **Start local services:**
   ```bash
   npm run dev:setup  # Starts Docker containers
   ```

### Production Deployment

1. **Set environment variables in your deployment platform**
   - AWS Lambda: Use environment variables in function configuration
   - CDK: Set variables in your deployment environment
   - Never hardcode production credentials

2. **Rotate credentials regularly**
   - Database passwords
   - API tokens
   - JWT secrets
   - API keys

### Security Best Practices

#### For Developers
- Use strong, unique passwords for all services
- Enable 2FA on all accounts
- Regularly rotate API keys and tokens
- Review code for hardcoded credentials before committing
- Use environment variables for all configuration

#### For Repository
- Keep `.env` files in `.gitignore`
- Use clear placeholders in `.env.sample` files
- Document all required environment variables
- Add security warnings in documentation
- Consider pre-commit hooks for credential detection

#### For Production
- Use managed secrets services (AWS Secrets Manager, etc.)
- Implement least-privilege access policies
- Monitor for credential usage and anomalies
- Have incident response procedures ready
- Regular security audits and penetration testing

### Incident Response

If credentials are accidentally committed:

1. **Immediately rotate the exposed credentials**
2. **Remove credentials from git history** (if possible)
3. **Check access logs** for unauthorized usage
4. **Notify team members** about the incident
5. **Review and improve** security practices

### Tools and Resources

- [git-secrets](https://github.com/awslabs/git-secrets) - Prevent committing secrets
- [truffleHog](https://github.com/trufflesecurity/trufflehog) - Find secrets in repositories
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) - Managed secrets service
- [Supabase Security](https://supabase.com/docs/guides/platform/security) - Supabase security best practices

## 🚨 Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT create a public issue**
2. **Contact the team privately** via secure channels
3. **Provide detailed information** about the vulnerability
4. **Allow time for remediation** before public disclosure

Remember: Security is everyone's responsibility! 🛡️