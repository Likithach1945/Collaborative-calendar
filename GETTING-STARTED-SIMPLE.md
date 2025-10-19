# 🚀 Simplified Setup Guide - No Docker, No Maven Needed

## Current Situation
- Docker has network/proxy issues
- Maven is not installed
- You want to run the calendar application

## ✅ **Easiest Solution: Use IDE with Built-in Maven**

Since your project already has a `pom.xml`, you can use an IDE that bundles Maven:

---

## Option 1: Use IntelliJ IDEA (Recommended)

IntelliJ IDEA includes Maven built-in - no separate installation needed!

### Download & Install

1. **Download IntelliJ IDEA Community Edition** (Free):
   - Go to: https://www.jetbrains.com/idea/download/
   - Click "Download" under Community Edition (free)
   - Run installer

2. **Open Project**:
   - Launch IntelliJ IDEA
   - Click "Open"
   - Navigate to `C:\Users\ChNa395\Likitha\calendar\backend`
   - Select the `backend` folder
   - Click OK

3. **Wait for Dependencies**:
   - IntelliJ will automatically download Maven dependencies
   - Wait for indexing to complete (bottom-right status bar)

4. **Configure application.properties**:
   - Open `src/main/resources/application.properties`
   - Add your Google OAuth credentials:
   ```properties
   spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
   spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
   ```

5. **Setup MySQL Database**:
   - Install MySQL 8: https://dev.mysql.com/downloads/installer/
   - Or use XAMPP: https://www.apachefriends.org/
   - Create database:
   ```sql
   CREATE DATABASE calendardb;
   CREATE USER 'calendaruser'@'localhost' IDENTIFIED BY 'yourpassword';
   GRANT ALL PRIVILEGES ON calendardb.* TO 'calendaruser'@'localhost';
   ```
   - Update `application.properties` with your MySQL password

6. **Run Application**:
   - Find `CalendarApplication.java` in `src/main/java/com/example/calendar/`
   - Right-click → Run 'CalendarApplication'
   - Backend starts on https://localhost:8443

---

## Option 2: Use VS Code with Maven Extension

If you prefer VS Code:

1. **Install Extensions**:
   - Open VS Code
   - Install "Extension Pack for Java" (includes Maven)
   - Install "Spring Boot Extension Pack"

2. **Open Project**:
   - File → Open Folder
   - Select `C:\Users\ChNa395\Likitha\calendar\backend`

3. **Run with Maven**:
   - Open Command Palette (Ctrl+Shift+P)
   - Type "Maven: Execute commands"
   - Select "spring-boot:run"

---

## Option 3: Install Maven Manually (Quick)

If you prefer command line:

### Quick Install Steps

```powershell
# 1. Download Maven
# Go to: https://maven.apache.org/download.cgi
# Download: apache-maven-3.9.9-bin.zip

# 2. Extract to C:\Maven
# Extract the zip file to C:\Maven

# 3. Add to PATH (temporary for this session)
$env:PATH += ";C:\Maven\apache-maven-3.9.9\bin"

# 4. Set JAVA_HOME (if needed)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x"

# 5. Verify
mvn --version

# 6. Run backend
cd C:\Users\ChNa395\Likitha\calendar\backend
mvn spring-boot:run
```

### Permanent PATH Setup

1. Press Windows key → Search "Environment Variables"
2. Click "Edit the system environment variables"
3. Click "Environment Variables"
4. Under "System variables", find "Path"
5. Click "Edit" → "New"
6. Add: `C:\Maven\apache-maven-3.9.9\bin`
7. Click OK on all dialogs
8. **Restart PowerShell**

---

## Option 4: Use Pre-built JAR (If Available)

If someone has already built the backend:

```powershell
# Navigate to backend
cd C:\Users\ChNa395\Likitha\calendar\backend\target

# Run the JAR directly
java -jar calendar-backend-0.1.0-SNAPSHOT.jar
```

(This won't work yet since the project hasn't been built)

---

## 📱 For Frontend (After Backend is Running)

Frontend is easier - just needs Node.js:

```powershell
# Check if Node.js is installed
node --version

# If yes, run:
cd C:\Users\ChNa395\Likitha\calendar\frontend
npm install
npm run dev

# Frontend runs on http://localhost:5173
```

If Node.js is not installed:
- Download from: https://nodejs.org/ (LTS version)
- Install and restart PowerShell
- Then run commands above

---

## 🎯 **My Recommendation**

**Use IntelliJ IDEA Community Edition**:
- ✅ Free
- ✅ Includes Maven (no separate install)
- ✅ Best for Java development
- ✅ Easy to run/debug
- ✅ Handles all dependencies automatically

**Steps**:
1. Download IntelliJ IDEA Community: https://www.jetbrains.com/idea/download/
2. Open the `backend` folder as project
3. Wait for Maven sync
4. Setup MySQL database
5. Add Google OAuth credentials to `application.properties`
6. Click Run ▶️

---

## 🆘 Still Need Help?

If you want to try fixing Docker instead:
- See **NETWORK-TROUBLESHOOTING.md**
- Check Docker Desktop proxy settings
- Contact IT about Docker Hub access

---

**Summary**: Since Maven isn't installed and Docker has network issues, using **IntelliJ IDEA** is your fastest path to running the app. It handles everything for you!
