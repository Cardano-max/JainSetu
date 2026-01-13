# JainSetu Production Deployment Checklist

This document provides comprehensive checklists for deploying JainSetu to production.

---

## Release Checklist

### Pre-Release

- [ ] All features tested on both Android and iOS
- [ ] All API endpoints tested and documented
- [ ] Database migrations reviewed and tested
- [ ] No console.log statements in production code (use logger)
- [ ] All TODO comments resolved or documented as known issues
- [ ] Performance testing completed (load testing, memory profiling)
- [ ] User acceptance testing completed

### Backend Deployment

- [ ] Environment variables set in production:
  - [ ] `DATABASE_URL` - Production PostgreSQL connection string
  - [ ] `JWT_SECRET` - Strong, unique secret (min 32 chars)
  - [ ] `JWT_EXPIRES_IN` - Set appropriately (e.g., "15m" for access tokens)
  - [ ] `NODE_ENV=production`
  - [ ] `RAZORPAY_KEY_ID` - Live Razorpay key
  - [ ] `RAZORPAY_KEY_SECRET` - Live Razorpay secret
  - [ ] `RAZORPAY_WEBHOOK_SECRET` - Webhook secret for verification
  - [ ] `SMS_API_KEY` - Production SMS gateway key (MSG91/Twilio)
  - [ ] `RATE_LIMIT_WINDOW_MS` - Appropriate rate limiting
  - [ ] `RATE_LIMIT_MAX` - Maximum requests per window
  - [ ] `ADMIN_URL` - Production admin panel URL
  - [ ] `CORS_ORIGINS` - Production allowed origins

- [ ] Database setup:
  - [ ] Production database provisioned (PostgreSQL 14+)
  - [ ] Connection pooling configured (PgBouncer recommended)
  - [ ] Database backups automated (daily minimum)
  - [ ] Migrations applied successfully
  - [ ] Indexes verified for query performance

- [ ] Infrastructure:
  - [ ] SSL/TLS certificates configured
  - [ ] Reverse proxy configured (nginx/Caddy)
  - [ ] Process manager set up (PM2/systemd)
  - [ ] Health check endpoint responding
  - [ ] Logging configured (file + cloud service)

### Mobile App Deployment

- [ ] Environment variables configured:
  - [ ] `EXPO_PUBLIC_ENV=production`
  - [ ] `EXPO_PUBLIC_API_URL` - Production API URL

- [ ] EAS Build configuration verified:
  - [ ] `eas.json` production profile configured
  - [ ] App signing keys secured
  - [ ] Version numbers updated

- [ ] Assets:
  - [ ] App icon finalized (all required sizes)
  - [ ] Splash screen finalized
  - [ ] Feature graphics for store listing

---

## Security Checklist

### Authentication & Authorization

- [ ] JWT secrets are strong and unique per environment
- [ ] Refresh tokens are rotated on each use
- [ ] Access tokens have short expiry (15-60 minutes)
- [ ] Failed login attempts are rate-limited
- [ ] OTP rate limiting implemented (max 5 per phone per hour)
- [ ] OTP expires after 10 minutes
- [ ] Session invalidation on password change
- [ ] All admin endpoints require proper role verification

### API Security

- [ ] HTTPS enforced on all endpoints
- [ ] CORS properly configured (no wildcards in production)
- [ ] Rate limiting active on all endpoints
- [ ] Request size limits configured
- [ ] SQL injection prevented (Prisma ORM)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection for state-changing operations
- [ ] Security headers configured (Helmet.js):
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] Strict-Transport-Security
  - [ ] Content-Security-Policy

### Data Security

- [ ] Sensitive data encrypted at rest
- [ ] PII handled according to privacy policy
- [ ] Database credentials not in source code
- [ ] Secrets not logged
- [ ] Payment data not stored locally (use Razorpay tokenization)
- [ ] User passwords hashed (bcrypt, min 10 rounds)
- [ ] Refresh tokens can be revoked

### Mobile Security

- [ ] API keys not hardcoded in app
- [ ] Sensitive data stored in SecureStore only
- [ ] Certificate pinning considered
- [ ] No sensitive data in AsyncStorage
- [ ] Debugging disabled in production builds
- [ ] ProGuard/R8 obfuscation enabled (Android)

### Infrastructure Security

- [ ] Server firewall configured
- [ ] SSH key authentication only
- [ ] Database not publicly accessible
- [ ] Secrets managed via environment variables or secret manager
- [ ] Dependency vulnerabilities scanned (npm audit, Snyk)
- [ ] Regular security updates scheduled

---

## Play Store Readiness Checklist

### App Information

- [ ] App name finalized: "JainSetu"
- [ ] Package name: `com.jainsetu.app`
- [ ] App category: "Social" or "Lifestyle"
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Feature graphic (1024x500 px)
- [ ] App icon (512x512 px, PNG)
- [ ] Screenshots:
  - [ ] Phone screenshots (min 2, max 8) - 16:9 or 9:16 aspect ratio
  - [ ] Tablet screenshots (if supporting tablets)

### Content Rating

- [ ] Content rating questionnaire completed
- [ ] App does not contain:
  - [ ] Violence
  - [ ] Mature/suggestive themes
  - [ ] Gambling
  - [ ] Controlled substances

### Privacy & Data Safety

- [ ] Privacy policy URL provided
- [ ] Data safety form completed:
  - [ ] Data types collected declared
  - [ ] Data sharing practices disclosed
  - [ ] Data security practices documented
  - [ ] Account deletion option provided
- [ ] Terms of service URL (recommended)

### Technical Requirements

- [ ] Target API level 34+ (Android 14)
- [ ] App bundle format (.aab) used
- [ ] 64-bit support included
- [ ] Signed with upload key
- [ ] App signing by Google Play enabled
- [ ] Size optimized (under 150MB recommended)
- [ ] Deep links configured and verified

### Testing

- [ ] Internal testing completed
- [ ] Closed testing (beta) completed
- [ ] Open testing (optional)
- [ ] Pre-launch report issues resolved
- [ ] Crash-free rate > 99%
- [ ] ANR rate < 0.5%

### Compliance

- [ ] No policy violations
- [ ] Permissions justified and minimal
- [ ] No deceptive behavior
- [ ] Ads policy compliant (if applicable)
- [ ] Payment policy compliant (Razorpay)
- [ ] Family policy compliant (if targeting children - N/A for JainSetu)

### Release Management

- [ ] Staged rollout planned (start with 5-10%)
- [ ] Monitoring dashboard set up
- [ ] Crash reporting active (Sentry/Firebase)
- [ ] Performance monitoring active
- [ ] User feedback channel established
- [ ] Rollback plan documented

---

## Post-Launch Checklist

### Monitoring

- [ ] Server metrics monitored (CPU, memory, disk)
- [ ] API response times monitored
- [ ] Error rates tracked
- [ ] Database performance monitored
- [ ] Payment success rates tracked
- [ ] User signup/login rates tracked

### Alerting

- [ ] Server down alerts configured
- [ ] High error rate alerts
- [ ] Database connection alerts
- [ ] Payment failure alerts
- [ ] Security incident alerts

### Maintenance

- [ ] Regular dependency updates scheduled
- [ ] Security patches applied promptly
- [ ] Database maintenance (VACUUM, ANALYZE) scheduled
- [ ] Log rotation configured
- [ ] Backup restoration tested

### User Support

- [ ] Support email configured
- [ ] In-app feedback mechanism active
- [ ] FAQ/Help section available
- [ ] Bug reporting process documented
- [ ] User complaint handling process

---

## Emergency Procedures

### Incident Response

1. **Detection**: Monitor alerts, user reports, crash logs
2. **Assessment**: Determine severity and scope
3. **Communication**: Notify stakeholders
4. **Mitigation**: Apply immediate fixes or rollback
5. **Resolution**: Implement permanent fix
6. **Post-mortem**: Document and learn

### Rollback Procedure

**Backend:**
```bash
# Revert to previous deployment
pm2 stop all
git checkout <previous-stable-commit>
npm install
npx prisma migrate deploy
pm2 start all
```

**Mobile:**
- Use staged rollout controls in Play Store
- Halt rollout if crash rate exceeds threshold
- Push hotfix through EAS Update if possible

### Contact Information

- Technical Lead: [Your email]
- DevOps: [DevOps contact]
- Security: [Security contact]
- Business: [Business contact]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | [Date] | Initial production release |

---

*Last Updated: January 2026*
