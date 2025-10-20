# 📅 Calendar Application

A modern, full-stack calendar and event management application built with **React** and **Spring Boot**. Features Google OAuth authentication, event scheduling, availability checking, invitation management, time proposals, and ICS calendar import.


## Features

### Core Functionality
-  **Event Management**: Create, edit, delete, and view events
-  **Calendar Views**: Day, week, and month views with intuitive navigation
-  **Google OAuth**: Secure authentication with Google accounts
-  **Availability Checking**: Find free time slots across users
-  **Invitations**: Send and respond to event invitations (Accept/Decline/Tentative)
-  **Time Proposals**: Suggest alternative meeting times
-  **ICS Import**: Import events from `.ics` calendar files
-  **Internationalization**: i18next support (English included, extensible)

### Technical Features
-  **Redis Caching**: Optional Redis integration for performance
-  **Performance Optimized**: Lazy loading, code splitting, bundle optimization
-  **Security Hardened**: CSP, HSTS, rate limiting, secure headers
-  **Monitoring**: Spring Boot Actuator + Prometheus metrics
-  **Email Notifications**: SMTP support for invitation emails
-  **Dockerized**: Production-ready Docker containers with distroless base
-  **Accessibility**: WCAG 2.1 AA compliant (85%)

---

##  Prerequisites

### Local Development
- **Java 17** or higher ([Download](https://adoptium.net/))
- **Node.js 20** or higher ([Download](https://nodejs.org/))
- **MySQL 8.0** or higher ([Download](https://dev.mysql.com/downloads/))
- **Maven 3.9+** (or use included wrapper `mvnw`)
  

### External Services
- **Google Cloud Console** account for OAuth credentials ([Setup](https://console.cloud.google.com/))

---

##  Setup & Installation



1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/calendar.git
   cd calendar
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Google OAuth credentials
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8443
   - Health: http://localhost:8443/actuator/health


#### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API endpoint:**
   ```bash
   # Create .env.local
   VITE_API_BASE_URL=https://localhost:8443
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

Frontend runs on http://localhost:5173

---



##  Google OAuth Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a new project** (or select existing)

3. **Enable Google+ API:**
   - APIs & Services → Library → Search "Google+ API" → Enable

4. **Create OAuth 2.0 credentials:**
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:8443/login/oauth2/code/google` (development)
     - `https://yourdomain.com/login/oauth2/code/google` (production)

5. **Copy Client ID and Client Secret** to your `.env` or `application.properties`

---
