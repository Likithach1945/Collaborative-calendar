# 📦 Complete Project Dependencies List

## Overview
This document lists ALL dependencies needed to run the Calendar Application.

---

## 🖥️ System Requirements

### Operating System
- ✅ **Windows 10/11** (64-bit)
- ✅ **macOS** 10.15+
- ✅ **Linux** (Ubuntu 20.04+, Debian, Fedora, etc.)

### Hardware Minimum
- **CPU**: 2+ cores
- **RAM**: 4GB (8GB recommended)
- **Disk**: 5GB free space
- **Internet**: Required for downloading dependencies

---

## 1️⃣ Core Development Tools

### Java Development Kit (JDK) 17+

**Required for**: Backend (Spring Boot)

**Download**:
- **Recommended**: Eclipse Temurin (AdoptOpenJDK)
  - https://adoptium.net/
  - Download "JDK 17 LTS" for Windows (x64)
  - Run installer → Install to default location
  - Installer adds to PATH automatically

**Alternative JDK Providers**:
- Oracle JDK 17: https://www.oracle.com/java/technologies/downloads/#java17
- Amazon Corretto 17: https://aws.amazon.com/corretto/
- Microsoft Build of OpenJDK 17: https://www.microsoft.com/openjdk

**Verify Installation**:
```powershell
java -version
# Should show: openjdk version "17.0.x"

javac -version
# Should show: javac 17.0.x
```

**Set JAVA_HOME** (if needed):
```powershell
# Check current JAVA_HOME
$env:JAVA_HOME

# Set temporarily (this session only)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot"

# Add to PATH
$env:PATH += ";$env:JAVA_HOME\bin"
```

---

### Node.js 20+ & npm

**Required for**: Frontend (React/Vite)

**Download**:
- https://nodejs.org/
- Download **LTS version** (20.x.x)
- Run installer → Use default settings
- Installer adds to PATH automatically

**Verify Installation**:
```powershell
node --version
# Should show: v20.x.x

npm --version
# Should show: 10.x.x
```

**Note**: npm comes bundled with Node.js

---

### Maven 3.9+

**Required for**: Building/running backend

**Option A: Bundled with IDE** (Recommended)
- IntelliJ IDEA includes Maven
- VS Code with Java extensions includes Maven
- No separate installation needed!

**Option B: Manual Installation**

1. **Download**:
   - https://maven.apache.org/download.cgi
   - Download "Binary zip archive" (apache-maven-3.9.9-bin.zip)

2. **Extract**:
   - Extract to `C:\Maven\apache-maven-3.9.9`

3. **Add to PATH**:
   - Windows: Environment Variables → System PATH → Add `C:\Maven\apache-maven-3.9.9\bin`
   - Or temporarily: `$env:PATH += ";C:\Maven\apache-maven-3.9.9\bin"`

4. **Verify**:
   ```powershell
   mvn --version
   # Should show: Apache Maven 3.9.9
   ```

---

### MySQL 8.0+

**Required for**: Database

**See detailed setup**: **MYSQL-SETUP.md**

**Quick Download**:
- **Option 1**: MySQL Installer - https://dev.mysql.com/downloads/installer/
- **Option 2**: XAMPP (easier) - https://www.apachefriends.org/

**Default Port**: 3306

**Database Name**: `calendardb`

**Username**: `calendaruser`

**Password**: (choose a strong password, e.g., `REPLACE_ME_STRONG_PASSWORD`)

---

### Git (Optional but Recommended)

**Required for**: Version control, cloning repository

**Download**:
- https://git-scm.com/downloads
- Run installer → Use default settings

**Verify**:
```powershell
git --version
# Should show: git version 2.x.x
```

---

## 2️⃣ IDE (Choose One)

### Option A: IntelliJ IDEA Community Edition (Recommended)

**Why**: Best for Java/Spring Boot, includes Maven, excellent debugging

**Download**:
- https://www.jetbrains.com/idea/download/
- Choose **Community Edition** (FREE)
- ~900MB download
- Includes: Maven, Git integration, Spring Boot support

**Plugins Needed** (auto-installed):
- Spring Boot
- Database Tools
- Maven

---

### Option B: Visual Studio Code

**Why**: Lightweight, good for both frontend and backend

**Download**:
- https://code.visualstudio.com/

**Required Extensions**:
```
# Java Development
- Extension Pack for Java (Microsoft)
- Spring Boot Extension Pack (VMware)
- Maven for Java (Microsoft)

# Frontend Development
- ESLint
- Prettier
- Vite

# Database
- MySQL (Weijan Chen)
```

Install via: Ctrl+Shift+X → Search → Install

---

### Option C: Eclipse IDE

**Why**: Free, open-source, good Java support

**Download**:
- https://www.eclipse.org/downloads/
- Choose "Eclipse IDE for Enterprise Java and Web Developers"

---

## 3️⃣ Backend Dependencies (Auto-downloaded by Maven)

These are **automatically downloaded** when you build the backend with Maven. No manual installation needed!

### Spring Boot Dependencies

```xml
<!-- Core Framework -->
- spring-boot-starter-web (3.2.0)           # REST API, embedded Tomcat
- spring-boot-starter-security (3.2.0)     # Authentication, authorization
- spring-boot-starter-oauth2-client (3.2.0) # Google OAuth
- spring-boot-starter-data-jpa (3.2.0)     # Database ORM
- spring-boot-starter-validation (3.2.0)   # Input validation

<!-- Caching -->
- spring-boot-starter-cache (3.2.0)        # Caching abstraction
- spring-boot-starter-data-redis (3.2.0)   # Redis integration (optional)

<!-- Monitoring -->
- spring-boot-starter-actuator (3.2.0)     # Health checks, metrics
- micrometer-registry-prometheus           # Prometheus metrics export

<!-- Email -->
- spring-boot-starter-mail (3.2.0)         # Email support
- jakarta.mail (2.0.1)                     # SMTP implementation
```

### Database Dependencies

```xml
- mysql-connector-j (8.x)                  # MySQL JDBC driver
- flyway-core (9.x)                        # Database migrations
- flyway-mysql (9.x)                       # MySQL-specific migrations
```

### Utility Libraries

```xml
- lombok (1.18.30)                         # Reduce boilerplate code
- mapstruct (1.5.5.Final)                  # DTO mapping
- ical4j (3.2.14)                          # ICS calendar file parsing
- jackson (2.15.x)                         # JSON processing
- jjwt (0.12.3)                           # JWT token handling
```

### Testing Dependencies

```xml
- spring-boot-starter-test (3.2.0)         # Unit testing
- spring-security-test (6.2.0)             # Security testing
- testcontainers-mysql (1.19.3)            # Integration testing
- rest-assured (5.4.0)                     # API testing
- h2 (2.2.224)                            # In-memory test database
```

**Total backend dependencies**: ~60 JARs (~150MB)

---

## 4️⃣ Frontend Dependencies (Auto-downloaded by npm)

These are **automatically downloaded** when you run `npm install`. No manual installation needed!

### Core Framework

```json
"react": "^18.2.0"              // UI framework
"react-dom": "^18.2.0"          // DOM rendering
"react-router-dom": "^6.20.1"   // Client-side routing
```

### State Management & Data Fetching

```json
"@tanstack/react-query": "^5.14.2"  // Server state management
"axios": "^1.6.2"                    // HTTP client
```

### UI & Styling

```json
"date-fns": "^3.0.6"            // Date manipulation
"lucide-react": "^0.294.0"      // Icons
```

### Build Tools

```json
"vite": "^5.0.7"                // Build tool & dev server
"@vitejs/plugin-react": "^4.2.1" // React support for Vite
```

### Development Dependencies

```json
"@types/react": "^18.2.43"           // TypeScript types
"@types/react-dom": "^18.2.17"       // TypeScript types
"eslint": "^8.55.0"                  // Linting
"eslint-plugin-react": "^7.33.2"     // React linting rules
"vitest": "^1.0.4"                   // Testing framework
"@testing-library/react": "^14.1.2"  // React testing utilities
"@axe-core/react": "^4.8.2"          // Accessibility testing
```

### Internationalization

```json
"i18next": "^23.7.0"                 // i18n framework
"react-i18next": "^13.5.0"           // React i18n bindings
```

### Performance & PWA

```json
"workbox-webpack-plugin": "^7.0.0"   // Service worker
"vite-plugin-pwa": "^0.17.4"         // PWA support
```

**Total frontend dependencies**: ~400 packages (~250MB in node_modules)

---

## 5️⃣ Optional Dependencies

### Redis (For Caching)

**Purpose**: Improves performance with caching

**Download**:
- **Windows**: https://github.com/microsoftarchive/redis/releases
- **Or use Docker**: `docker run -d -p 6379:6379 redis:7-alpine`
- **Or use Memurai**: https://www.memurai.com/ (Redis for Windows)

**Default Port**: 6379

**Enable in application.properties**:
```properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
app.cache.redis.enabled=true
```

---

### Docker Desktop (For Containerized Deployment)

**Purpose**: Run entire app in containers

**Download**:
- https://www.docker.com/products/docker-desktop/

**System Requirements**:
- Windows 10 64-bit Pro/Enterprise/Education
- OR Windows 11
- WSL 2 enabled
- Virtualization enabled in BIOS

**Alternative**: Use local installation (no Docker needed)

---

### SMTP Server (For Email Notifications)

**Purpose**: Send invitation emails

**Options**:
1. **Gmail SMTP** (easiest for testing):
   - Use your Gmail account
   - Enable "App Passwords" in Google Account settings
   - Configure in application.properties

2. **Mailtrap** (testing):
   - https://mailtrap.io/ (free tier)
   - Catches emails without sending

3. **SendGrid/Mailgun** (production):
   - Professional email services

**Configuration** (Gmail example):
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

---

### Playwright (For E2E Testing)

**Purpose**: End-to-end browser testing

**Install**:
```powershell
cd frontend
npm install @playwright/test
npx playwright install
```

**Browsers downloaded**: Chromium, Firefox, WebKit (~500MB)

---

## 6️⃣ External Services (Required)

### Google OAuth Credentials

**Purpose**: User authentication via Google

**Setup**:
1. Go to: https://console.cloud.google.com/
2. Create project
3. Enable "Google+ API"
4. Create OAuth 2.0 Client ID
5. Add redirect URI: `http://localhost:8443/login/oauth2/code/google`
6. Copy Client ID & Secret to application.properties

**Free Tier**: Yes, unlimited for authentication

**See detailed guide**: **QUICKSTART.md** section "Google OAuth Setup"

---

## 📊 Download Size Summary

| Component | Size | Notes |
|-----------|------|-------|
| **JDK 17** | ~180MB | One-time install |
| **Node.js 20** | ~50MB | One-time install |
| **Maven** | ~10MB | Optional if using IDE |
| **MySQL** | ~300MB | One-time install |
| **IntelliJ IDEA** | ~900MB | Optional but recommended |
| **Backend Dependencies** | ~150MB | Downloaded by Maven |
| **Frontend Dependencies** | ~250MB | Downloaded by npm |
| **Docker Images** (optional) | ~1GB | MySQL + app containers |
| **Redis** (optional) | ~50MB | If using caching |
| **Playwright** (optional) | ~500MB | If running E2E tests |
| **Total (Required)** | **~930MB** | JDK + Node + MySQL + deps |
| **Total (All)** | **~2.5GB** | Including all optional |

---

## ⚡ Quick Installation Order

For fastest setup:

1. ✅ **Install JDK 17** (5 minutes)
2. ✅ **Install Node.js 20** (3 minutes)
3. ✅ **Install MySQL** (10 minutes) - See MYSQL-SETUP.md
4. ✅ **Install IntelliJ IDEA** (5 minutes) - Includes Maven
5. ✅ **Setup Google OAuth** (5 minutes) - Get credentials
6. ✅ **Open project in IntelliJ** → Wait for dependency download (5-10 minutes)
7. ✅ **Run backend** → Flyway creates tables automatically
8. ✅ **Run frontend** → `npm install` then `npm run dev`

**Total time**: ~40-50 minutes including downloads

---

## ✅ Dependencies Checklist

Before running the application:

### Required
- [ ] JDK 17+ installed (`java -version`)
- [ ] Node.js 20+ installed (`node --version`)
- [ ] Maven 3.9+ installed or IDE with Maven
- [ ] MySQL 8.0+ running
- [ ] Database `calendardb` created
- [ ] User `calendaruser` created
- [ ] Google OAuth credentials obtained
- [ ] `application.properties` configured

### Optional
- [ ] Redis installed (for caching)
- [ ] Docker Desktop (for containerized deployment)
- [ ] SMTP configured (for email notifications)
- [ ] Playwright installed (for E2E testing)
- [ ] Git installed (for version control)

---

## 🆘 Troubleshooting

### "JAVA_HOME not set"
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot"
$env:PATH += ";$env:JAVA_HOME\bin"
```

### "npm not recognized"
- Restart PowerShell after Node.js installation
- Verify PATH includes: `C:\Program Files\nodejs\`

### "mvn not recognized"
- Use IntelliJ IDEA (includes Maven)
- Or add Maven bin to PATH

### "Cannot connect to MySQL"
```powershell
# Check MySQL is running
Get-Service MySQL80

# Start if not running
Start-Service MySQL80
```

---

## 📚 Additional Resources

- **MySQL Setup**: See MYSQL-SETUP.md
- **Running the App**: See QUICKSTART.md
- **Docker Issues**: See DOCKER-TROUBLESHOOTING.md
- **Network Issues**: See NETWORK-TROUBLESHOOTING.md
- **Full README**: See README.md

---

**Summary**: Install JDK 17, Node.js 20, MySQL 8, and optionally IntelliJ IDEA. All other dependencies are downloaded automatically!
