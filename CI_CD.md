# CI/CD Documentation

## 🔄 Continuous Integration & Deployment Pipeline

This project uses **GitHub Actions** for automated testing, linting, building, and deployment.

---

## 📋 Workflow Overview

### Trigger Events

The CI/CD pipeline runs automatically on:
- **Push** to `main` or `develop` branches
- **Pull Requests** targeting `main` or `develop`
- Manual workflow dispatch

### Workflow Jobs

The pipeline consists of **6 parallel jobs**:

1. **Test Suite** - Run comprehensive test suites
2. **Code Linting** - Solidity and TypeScript linting
3. **Build Frontend** - Vite build verification
4. **Security Audit** - Dependency vulnerability scanning
5. **Type Check** - TypeScript type validation
6. **Gas Report** - Smart contract gas usage analysis (PR only)

---

## 🧪 Test Suite Job

Runs on: **Node.js 18.x and 20.x** (matrix strategy)

### Steps:
1. Checkout code
2. Setup Node.js with npm cache
3. Install dependencies (`npm ci --legacy-peer-deps`)
4. Compile smart contracts
5. Run test suite
6. Generate coverage report
7. Upload coverage to Codecov

### Commands:
```bash
npm run compile
npm test
npm run test:coverage
```

### Coverage Requirements:
- **Project Coverage**: 80% target
- **Patch Coverage**: 70% target
- **Upload to**: Codecov

---

## 🔍 Code Linting Job

### Solidity Linting (Solhint)

**Command**: `npm run lint:sol`

**Configuration**: `solhint.json`

**Rules**:
- Compiler version: `^0.8.0`
- Function visibility checks
- Max line length: 120 characters
- State visibility warnings
- Naming conventions (camelCase)

### TypeScript/React Linting (ESLint)

**Command**: `npm run lint:ts`

**Configuration**: `eslintrc.cjs`

**Rules**:
- React hooks rules enforcement
- TypeScript recommended rules
- No unused variables (warn)
- Console warnings (allow `warn` and `error`)
- Max warnings: 0

### Manual Linting:
```bash
# Run all linters
npm run lint

# Run Solidity linter
npm run lint:sol

# Run TypeScript linter
npm run lint:ts

# Auto-fix issues
npm run lint:fix
```

---

## 🏗️ Build Frontend Job

### Steps:
1. Install dependencies
2. Run Vite build
3. Upload build artifacts

### Commands:
```bash
npm run build
```

### Output:
- **Location**: `dist/` directory
- **Retention**: 7 days
- **Size**: ~2.1 MB (compressed)

---

## 🛡️ Security Audit Job

### NPM Audit

**Commands**:
```bash
# Check moderate+ vulnerabilities
npm audit --audit-level=moderate

# Check production dependencies
npm audit --production
```

### Severity Levels:
- **Low**: Informational
- **Moderate**: Warning
- **High**: Failure
- **Critical**: Failure

---

## 📘 Type Check Job

### TypeScript Compiler

**Command**: `npx tsc --noEmit`

**Configuration**: `tsconfig.json`

**Checks**:
- Type correctness
- Import/export consistency
- Interface compliance
- Generic constraints

---

## ⛽ Gas Report Job

**Runs on**: Pull Requests only

### Steps:
1. Generate gas usage report
2. Post report as PR comment

### Command:
```bash
REPORT_GAS=true npm run test:gas
```

### Report Includes:
- Function gas costs
- Contract deployment costs
- Average gas per transaction
- Min/Max gas usage

---

## 📊 Code Coverage (Codecov)

### Configuration

**File**: `codecov.yml`

### Settings:
- **Precision**: 2 decimal places
- **Range**: 70-100%
- **Project Target**: 80%
- **Patch Target**: 70%

### Coverage Reports:
- Uploaded automatically after test runs
- Available at: `https://codecov.io/gh/YOUR_USERNAME/confidential-land-platform`

### Ignored Files:
- `test/**/*`
- `scripts/**/*`
- `**/*.d.ts`
- `typechain-types/**/*`
- Config files

---

## 🎨 Code Formatting

### Prettier

**Command**: `npm run format`

**Configuration**: `prettierrc.json`

### Settings:
- **Semi-colons**: Yes
- **Single Quotes**: No (double quotes)
- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Solidity**: 4 spaces, 120 char width

### Manual Formatting:
```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

---

## 🔧 Local Development Workflow

### Before Committing:

```bash
# 1. Run linters
npm run lint

# 2. Run tests
npm test

# 3. Check types
npx tsc --noEmit

# 4. Format code
npm run format

# 5. Build project
npm run build
```

### Pre-commit Checklist:
- [ ] All tests passing
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Code formatted
- [ ] Build succeeds

---

## 🚀 Deployment Workflow

### Frontend Deployment (Vercel)

**Automatic** on push to `main`:
1. CI/CD tests pass
2. Build artifacts created
3. Vercel deploys to production

### Smart Contract Deployment

**Manual** deployment required:
```bash
# Deploy to Sepolia
npm run deploy

# Deploy locally
npm run deploy:local
```

---

## 📈 CI/CD Metrics

### Performance Targets:
- **Test Execution**: < 2 minutes
- **Build Time**: < 1 minute
- **Total Pipeline**: < 5 minutes

### Success Criteria:
- All tests passing
- No linting errors
- Build succeeds
- Type check passes
- Coverage ≥ 80%

---

## 🔑 Secrets & Environment Variables

### GitHub Secrets Required:

1. **CODECOV_TOKEN**
   - Get from: https://codecov.io/
   - Purpose: Upload coverage reports

2. **INFURA_PROJECT_ID** (optional)
   - Get from: https://infura.io/
   - Purpose: Sepolia RPC access

3. **PRIVATE_KEY** (optional)
   - Purpose: Contract deployment
   - **⚠️ Never commit to repository**

### Setting Secrets:
1. Go to repository Settings
2. Click on Secrets and variables > Actions
3. Add each secret with appropriate value

---

## 📝 Workflow Files

### Main Workflow

**File**: `github-workflows/test.yml`

**Jobs**:
- `test` - Test suite (Node 18.x, 20.x)
- `lint` - Code linting
- `build` - Frontend build
- `security` - Security audit
- `typecheck` - Type checking
- `gas-report` - Gas usage (PRs only)

### Future Workflows (Optional):

1. **deploy.yml** - Automated deployment
2. **release.yml** - Release automation
3. **security-scan.yml** - Advanced security scanning

---

## 🐛 Troubleshooting

### Common Issues:

#### 1. Tests Failing in CI but Pass Locally

**Cause**: Environment differences

**Solution**:
```bash
# Use same Node version as CI
nvm use 20

# Clean install dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### 2. Linting Errors in CI

**Cause**: Different ESLint/Solhint versions

**Solution**:
```bash
# Run locally with exact same config
npm run lint
npm run lint:fix
```

#### 3. Type Check Errors

**Cause**: TypeScript version mismatch

**Solution**:
```bash
# Use project TypeScript
npx tsc --noEmit

# Check tsconfig
cat tsconfig.json
```

#### 4. Build Failures

**Cause**: Missing dependencies or env variables

**Solution**:
```bash
# Check build locally
npm run build

# Verify all deps installed
npm ci --legacy-peer-deps
```

---

## 📚 Additional Resources

### Documentation:
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com/)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [ESLint Rules](https://eslint.org/docs/rules/)

### Tools:
- [Act](https://github.com/nektos/act) - Run GitHub Actions locally
- [pre-commit](https://pre-commit.com/) - Git hook framework
- [husky](https://typicode.github.io/husky/) - Git hooks

---

## ✅ CI/CD Checklist

### Initial Setup:
- [x] GitHub Actions workflow created
- [x] Solhint configured
- [x] ESLint configured
- [x] Prettier configured
- [x] Codecov integration
- [x] Test suite implemented
- [x] Build process verified

### Per Commit:
- [ ] Tests passing locally
- [ ] Linting clean
- [ ] Types valid
- [ ] Build succeeds
- [ ] Coverage maintained

### Per Pull Request:
- [ ] All CI checks green
- [ ] Gas report reviewed
- [ ] Coverage not decreased
- [ ] No new vulnerabilities

---

## 🎯 Summary

The CI/CD pipeline ensures:
- ✅ **Code Quality** - Automated linting and formatting
- ✅ **Test Coverage** - 80%+ coverage requirement
- ✅ **Type Safety** - TypeScript validation
- ✅ **Security** - Dependency auditing
- ✅ **Performance** - Gas usage monitoring
- ✅ **Reliability** - Multi-version testing

**All checks must pass before merging to main!** 🚀
