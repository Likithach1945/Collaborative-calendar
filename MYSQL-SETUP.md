# 🗄️ MySQL Setup Guide for Calendar Application

## Overview
The Calendar Application requires MySQL 8.0+ to store events, users, invitations, and availability data.

---

## 📥 Option 1: MySQL Installer for Windows (Recommended)

### Step 1: Download MySQL

1. Go to: https://dev.mysql.com/downloads/installer/
2. Download **"Windows (x86, 32-bit), MSI Installer"** (mysql-installer-community-8.0.x.msi)
3. Choose "No thanks, just start my download" (no need to login)

### Step 2: Install MySQL

1. **Run the installer** (mysql-installer-community-8.0.x.msi)
2. Choose **"Developer Default"** setup type (includes MySQL Server + Workbench)
3. Click **Next** through dependency checks
4. Click **Execute** to download and install components

### Step 3: Configure MySQL Server

1. **Type and Networking**:
   - Config Type: **Development Computer**
   - Port: **3306** (default)
   - Click **Next**

2. **Authentication Method**:
   - Choose: **"Use Strong Password Encryption"** (recommended)
   - Click **Next**

3. **Accounts and Roles**:
   - Set **MySQL Root Password**: Choose a strong password (remember this!)
   - Example: `MySecureRootPass123!`
   - Click **Next**

4. **Windows Service**:
   - Configure as Windows Service: **Checked**
   - Service Name: **MySQL80**
   - Start at System Startup: **Checked**
   - Click **Next**

5. **Apply Configuration**:
   - Click **Execute**
   - Wait for all steps to complete
   - Click **Finish**

### Step 4: Create Database and User

1. **Open MySQL Workbench** (installed with MySQL)
   - Or open **PowerShell** and connect:
   ```powershell
   mysql -u root -p
   # Enter root password when prompted
   ```

2. **Run these SQL commands**:
   ```sql
   -- Create database
   CREATE DATABASE calendardb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   
   -- Create user for the application
   CREATE USER 'calendaruser'@'localhost' IDENTIFIED BY 'REPLACE_ME_STRONG_PASSWORD';
   
   -- Grant all privileges on calendardb to calendaruser
   GRANT ALL PRIVILEGES ON calendardb.* TO 'calendaruser'@'localhost';
   
   -- Apply changes
   FLUSH PRIVILEGES;
   
   -- Verify database exists
   SHOW DATABASES;
   
   -- Verify user exists
   SELECT user, host FROM mysql.user WHERE user = 'calendaruser';
   
   -- Exit
   EXIT;
   ```

3. **Test Connection**:
   ```powershell
   mysql -u calendaruser -p calendardb
   # Enter password: (your chosen strong password)
   # If you see mysql> prompt, success!
   ```

### Step 5: Update application.properties

Edit `backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/calendardb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=calendaruser
spring.datasource.password=REPLACE_ME_STRONG_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Flyway (handles database migrations automatically)
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
```

**Note**: Flyway will automatically create all necessary tables (events, users, invitations, etc.) when the backend starts!

---

## 📥 Option 2: XAMPP (Easier - Includes phpMyAdmin)

XAMPP is an all-in-one package that's easier for development.

### Step 1: Download and Install XAMPP

1. Go to: https://www.apachefriends.org/
2. Download **XAMPP for Windows** (includes MySQL 8)
3. Run installer → Install to `C:\xampp`

### Step 2: Start MySQL

1. **Open XAMPP Control Panel** (from Start menu)
2. Click **Start** next to **MySQL**
3. MySQL indicator should turn green

### Step 3: Create Database Using phpMyAdmin

1. In XAMPP Control Panel, click **Admin** next to MySQL
2. Opens phpMyAdmin in browser (http://localhost/phpmyadmin)
3. Click **"User accounts"** tab → **"Add user account"**
4. Fill in:
   - **User name**: `calendaruser`
   - **Host name**: `localhost`
   - **Password**: `REPLACE_ME_STRONG_PASSWORD`
   - Check: **"Create database with same name and grant all privileges"**
5. Click **Go**

### Step 4: Verify Database

1. In phpMyAdmin, click **"Databases"** tab
2. You should see `calendaruser` database
3. Click on it → It's empty (Flyway will populate tables automatically)

### Step 5: Update application.properties

Same as Option 1 (Step 5 above).

---

## 🔍 Verify MySQL is Working

### Test 1: Check MySQL is Running

```powershell
# Check if MySQL service is running
Get-Service MySQL80

# Should show Status: Running
```

### Test 2: Test Connection

```powershell
# Connect to MySQL
mysql -u calendaruser -p calendardb

# If successful, you'll see:
# mysql>

# Try a command:
SHOW TABLES;

# Exit:
EXIT;
```

### Test 3: Check from Backend

When you run the backend (`mvn spring-boot:run`), look for:
```
Flyway Community Edition 9.x.x by Redgate
Database: jdbc:mysql://localhost:3306/calendardb
Successfully validated 10 migrations
Successfully applied 10 migrations to schema `calendardb`
```

This means tables were created successfully!

---

## 📊 Database Schema

Flyway migrations will create these tables:

1. **users** - User accounts (Google OAuth)
2. **events** - Calendar events
3. **invitations** - Event invitations
4. **time_proposals** - Alternative time suggestions
5. **availability_blocks** - User availability data

Migration files are in: `backend/src/main/resources/db/migration/`

---

## 🛠️ Troubleshooting

### Problem: "Access denied for user 'calendaruser'@'localhost'"

**Solution**:
```sql
-- Reconnect as root
mysql -u root -p

-- Grant privileges again
GRANT ALL PRIVILEGES ON calendardb.* TO 'calendaruser'@'localhost';
FLUSH PRIVILEGES;

-- Test password
ALTER USER 'calendaruser'@'localhost' IDENTIFIED BY 'REPLACE_ME_STRONG_PASSWORD';
```

### Problem: "Can't connect to MySQL server on 'localhost'"

**Solutions**:
```powershell
# Check if MySQL is running
Get-Service MySQL80

# If not, start it:
Start-Service MySQL80

# Or use XAMPP Control Panel to start MySQL
```

### Problem: Port 3306 already in use

```powershell
# Find what's using port 3306
netstat -ano | findstr "3306"

# If it's another MySQL instance, stop it:
Stop-Service MySQL80

# Or change port in application.properties:
# spring.datasource.url=jdbc:mysql://localhost:3307/calendardb...
```

### Problem: "Public Key Retrieval is not allowed"

Add to connection URL:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/calendardb?allowPublicKeyRetrieval=true&useSSL=false
```

---

## 🔐 Security Best Practices

### For Development:
- ✅ Use strong passwords
- ✅ Don't commit passwords to Git (use environment variables)
- ✅ Keep MySQL on localhost only

### For Production:
- 🔒 Use environment variables for credentials
- 🔒 Enable SSL for MySQL connections
- 🔒 Use managed database service (AWS RDS, Azure Database, etc.)
- 🔒 Regular backups
- 🔒 Restrict MySQL user privileges (no DROP, only CRUD)

---

## 📝 Quick Reference

### MySQL Commands

```sql
-- Show all databases
SHOW DATABASES;

-- Use database
USE calendardb;

-- Show all tables
SHOW TABLES;

-- Show table structure
DESCRIBE events;

-- Show table data
SELECT * FROM events LIMIT 10;

-- Count records
SELECT COUNT(*) FROM events;

-- Show users
SELECT * FROM users;
```

### Service Management

```powershell
# Windows Service commands
Get-Service MySQL80           # Check status
Start-Service MySQL80         # Start MySQL
Stop-Service MySQL80          # Stop MySQL
Restart-Service MySQL80       # Restart MySQL
```

### Connection Strings

```properties
# Local MySQL
jdbc:mysql://localhost:3306/calendardb

# With SSL disabled (development)
jdbc:mysql://localhost:3306/calendardb?useSSL=false&serverTimezone=UTC

# With all options
jdbc:mysql://localhost:3306/calendardb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=utf8
```

---

## ✅ Checklist

Before running the backend, ensure:

- [ ] MySQL 8.0+ installed
- [ ] MySQL service running (green in XAMPP or service status Running)
- [ ] Database `calendardb` created
- [ ] User `calendaruser` created with password
- [ ] Privileges granted to calendaruser
- [ ] Connection tested (mysql -u calendaruser -p calendardb)
- [ ] `application.properties` updated with correct credentials
- [ ] Google OAuth credentials configured

---

## 🎉 Success!

Once MySQL is set up and `application.properties` is configured, Flyway will automatically:
- ✅ Create all tables
- ✅ Set up indexes
- ✅ Apply foreign keys
- ✅ Insert initial data (if any)

You'll see this in the backend logs when it starts!

---

**Next Step**: See **PROJECT-DEPENDENCIES.md** for all other dependencies needed!
