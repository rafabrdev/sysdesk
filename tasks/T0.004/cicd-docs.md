# CI/CD Documentation - Task T0.004

## Overview

Complete CI/CD pipeline configured with GitHub Actions for the Sysdesk project, providing automated testing, security scanning, and deployment workflows.

## Workflows Configured

### 1. **CI Pipeline** (`ci.yml`)
Main continuous integration workflow that runs on every push and pull request.

**Triggers:**
- Push to: `main`, `develop`, `sprint/**`
- Pull requests to: `main`, `develop`

**Jobs:**
- **Lint**: ESLint and Prettier checks
- **Test**: Unit tests with Node.js matrix (18, 20, 22)
- **Build**: Frontend and Backend compilation
- **TypeCheck**: TypeScript validation
- **Summary**: Aggregated results

**Features:**
- ✅ pnpm cache optimization
- ✅ Parallel job execution
- ✅ Build artifacts upload
- ✅ Coverage reports (Codecov ready)

### 2. **Security Scan** (`security_T0.004.yml`)
Comprehensive security analysis workflow.

**Triggers:**
- Push to: `main`, `develop`
- Pull requests
- Daily schedule (2 AM UTC)
- Manual dispatch

**Jobs:**
- **Dependency Audit**: pnpm audit for vulnerabilities
- **CodeQL Analysis**: SAST for JavaScript/TypeScript
- **License Check**: Compliance verification
- **Container Scan**: Trivy vulnerability scanner

**Features:**
- ✅ SARIF reports for GitHub Security tab
- ✅ License allowlist enforcement
- ✅ Container vulnerability scanning
- ✅ Automated security summaries

### 3. **Dependabot Configuration**
Automated dependency updates with intelligent grouping.

**Update Schedule:**
- npm packages: Weekly (Monday 4 AM)
- GitHub Actions: Weekly
- Docker base images: Monthly

**Features:**
- ✅ Separate PRs for frontend/backend/database
- ✅ Major version protection for critical packages
- ✅ Semantic commit messages
- ✅ Auto-labeling

## GitHub Configuration Required

### Secrets to Configure
```yaml
# Required for full functionality
CODECOV_TOKEN        # For coverage reports
DOCKER_REGISTRY_URL  # Docker registry endpoint
DOCKER_USERNAME      # Registry authentication
DOCKER_PASSWORD      # Registry authentication
```

### Branch Protection Rules
Recommended settings for `main` branch:
- ✅ Require pull request reviews (1+)
- ✅ Dismiss stale reviews on new commits
- ✅ Require status checks:
  - `lint`
  - `test`
  - `build`
  - `typecheck`
  - `dependency-audit`
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict force pushes

### Labels to Create
```yaml
dependencies    # For Dependabot PRs
frontend        # Frontend-related changes
backend         # Backend-related changes
database        # Database-related changes
ci/cd          # CI/CD changes
security       # Security-related updates
docker         # Docker-related changes
```

## Local Testing

### Run CI checks locally:
```bash
# Lint
pnpm lint

# Type checking
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit

# Tests
pnpm test

# Build
pnpm build

# Security audit
pnpm audit
```

### Act for local GitHub Actions testing:
```bash
# Install act
brew install act  # macOS
choco install act  # Windows

# Run CI workflow locally
act -j lint
act -j test
act -j build
```

## Monitoring & Notifications

### GitHub Actions Dashboard
Monitor all workflows at: `https://github.com/[org]/sysdesk/actions`

### Status Badges
Add to README.md:
```markdown
![CI](https://github.com/[org]/sysdesk/workflows/CI%20Pipeline/badge.svg)
![Security](https://github.com/[org]/sysdesk/workflows/Security%20Scan/badge.svg)
```

### Slack/Discord Integration
Configure webhooks in repository settings for:
- Failed workflows
- Security alerts
- Dependabot PRs

## Best Practices

### 1. Commit Messages
Follow conventional commits:
```
feat(scope): add new feature
fix(scope): fix bug
chore(scope): maintenance task
docs(scope): documentation update
test(scope): test additions
```

### 2. PR Process
1. Create feature branch from `develop`
2. Follow naming: `sprint/S{X}_task_T{X}.{XXX}-description`
3. Open PR using template
4. Wait for all checks to pass
5. Request review
6. Merge after approval

### 3. Security Response
If security scan finds vulnerabilities:
1. Check severity level
2. Review suggested fixes
3. Update dependencies locally
4. Test thoroughly
5. Create fix PR with `security` label

## Troubleshooting

### Common Issues

**pnpm not found:**
```yaml
- uses: pnpm/action-setup@v2
  with:
    version: 8
```

**Cache not working:**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'
```

**TypeScript errors in CI but not locally:**
- Ensure `tsconfig.json` is committed
- Check Node.js version match
- Clear cache and reinstall

**Security scan timeouts:**
- Increase timeout in workflow
- Check network connectivity
- Review CodeQL query complexity

## Future Enhancements

### Phase 1 (Sprint 1-3)
- [ ] E2E testing with Playwright
- [ ] Performance testing
- [ ] Lighthouse CI for frontend

### Phase 2 (Sprint 4-6)
- [ ] Automated deployments
- [ ] Blue-green deployment strategy
- [ ] Database migration automation

### Phase 3 (Sprint 7-9)
- [ ] Kubernetes deployment workflows
- [ ] Multi-environment pipelines
- [ ] Advanced security scanning (DAST)

## Metrics & KPIs

Track these metrics monthly:
- **Build Success Rate**: Target > 95%
- **Average Build Time**: Target < 10 minutes
- **Test Coverage**: Target > 80%
- **Security Vulnerabilities**: Target 0 critical/high
- **Dependency Update Lag**: Target < 30 days

## Support

For CI/CD issues:
1. Check workflow logs in Actions tab
2. Review this documentation
3. Check GitHub Actions status page
4. Contact DevOps team

---

**Created for:** Sprint 0, Task T0.004  
**Date:** 2025-09-01  
**Author:** BR SISTEMAS DevOps Team
