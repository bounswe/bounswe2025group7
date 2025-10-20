


# HeatH — Affordable & Healthy Eating Hub



![logo 2627bc3787d5fd14fdbd](https://github.com/user-attachments/assets/f4777439-5604-4c6b-b707-25deb317b015)

> **Course:** CMPE 451 — 2025 Fall
> **Team:** bounswe2025group7
> **Goal:** A full‑stack web & mobile platform for affordable healthy eating with social features and W3C **ActivityStreams 2.0** interoperability.

---

## Table of Contents

* [1. Tech Stack](#1-tech-stack)
* [2. Quick Start (TL;DR)](#3-quick-start-tldr)
* [3. Configuration & Environment Variables](#4-configuration--environment-variables)

  * [3.1 Backend (.env.server)](#41-backend-envserver)
  * [3.2 Database (.env.db)](#42-database-envdb)
  * [3.3 Web (.env.web)](#43-web-envweb)
  * [3.4 Mobile (.env.mobile)](#44-mobile-envmobile)
* [4. Running with Docker (Recommended)](#5-running-with-docker-recommended)

  * [4.1 docker-compose.yml](#51-docker-composeyml)
  * [4.2 Backend Dockerfile](#52-backend-dockerfile)
  * [4.3 Web Dockerfile](#53-web-dockerfile)
  * [4.4 (Optional) Mobile in Docker](#54-optional-mobile-in-docker)
* [5. Running Without Docker](#6-running-without-docker)
* [6. Database Migrations & Seed](#7-database-migrations--seed)
* [7. ActivityStreams & WCAG Notes](#8-activitystreams--wcag-notes)
* [8. Troubleshooting FAQ](#10-troubleshooting-faq)
* [9. Makefile Shortcuts (Optional)](#11-makefile-shortcuts-optional)
* [10. CI/CD Hooks](#12-cicd-hooks)


---

## 1. Tech Stack

**Backend:** Java 17+, Spring Boot (REST, Security, WebSocket), JPA/Hibernate, JSON‑LD (ActivityStreams 2.0)
**Database:** PostgreSQL 15+
**Web:** React 
**Mobile:** React Native (Expo)
**Infra:** Docker, Docker Compose

> The guide assumes the repo layout below. If your paths differ, adjust the `context` in Dockerfiles and `build` in `docker-compose.yml` accordingly.

---

## 2. Quick Start (TL;DR)

1. **Install prerequisites:** Git, Docker Desktop (or Docker Engine + Compose).
2. **Clone repo:**

```bash
git clone https://github.com/bounswe2025group7/bounswe2025group7.git
cd bounswe2025group7
```

3. **Create `.env` files** from the examples in this README (see §4).
4. **Run everything:**

```bash
docker compose up -d --build
```

5. **Open apps:**

* Web: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:8080/api](http://localhost:8080/api)
* ActivityStreams base: [http://localhost:8080/as](http://localhost:8080/as)
* DB (Postgres): localhost:5432

6. **Mobile (Expo):**

```bash
cd mobile
npm i
npx expo start --tunnel
```

Set `EXPO_PUBLIC_API_BASE` to your **machine IP** (not `localhost`) so the phone can reach the backend.

---

## 3. Configuration & Environment Variables

Create these four files in the repository root. Do **not** commit them.

### 3.1 Backend (.env.server)

```properties
# Spring
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# Database (internal service name is `db` when using docker-compose)
DB_HOST=db
DB_PORT=5432
DB_NAME=heath
DB_USER=heath
DB_PASSWORD=heath
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/heath
SPRING_DATASOURCE_USERNAME=${DB_USER}
SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}

# JPA & Flyway (adjust to your setup)
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_SHOW_SQL=false
SPRING_FLYWAY_ENABLED=true

# Security
JWT_SECRET=change-me-please
JWT_EXP_MINUTES=60

# CORS for local dev (web on 5173, expo devtools on 8081)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081

# ActivityStreams / JSON-LD
AS_CONTEXT=https://www.w3.org/ns/activitystreams
AS_BASE_URL=http://localhost:8080/as
APP_BASE_URL=http://localhost:8080

# File uploads (optional)
UPLOAD_DIR=/data/uploads
```

### 3.2 Database (.env.db)

```properties
POSTGRES_USER=heath
POSTGRES_PASSWORD=heath
POSTGRES_DB=heath
PGDATA=/var/lib/postgresql/data/pgdata
```

### 3.3 Web (.env.web)

> For Vite, these must be prefixed with `VITE_`.

```bash
VITE_APP_NAME=HeatH
VITE_API_BASE=http://localhost:8080/api
VITE_AS_BASE=http://localhost:8080/as
```

### 3.4 Mobile (.env.mobile)

> For Expo SDK 50+, prefer `EXPO_PUBLIC_` prefix (available at runtime).

```bash
EXPO_PUBLIC_APP_NAME=HeatH
EXPO_PUBLIC_API_BASE=http://YOUR_LOCAL_IP:8080/api
EXPO_PUBLIC_WS_BASE=ws://YOUR_LOCAL_IP:8080/ws
```

* Replace `YOUR_LOCAL_IP` with your laptop’s IP (e.g., `192.168.1.34`).
* On Android emulator you may use `10.0.2.2` instead of `localhost`.

---

## 4. Running with Docker (Recommended)

### 4.1 `docker-compose.yml`

```yaml
version: "3.9"
name: heath
services:
  db:
    image: postgres:15
    container_name: heath-db
    restart: unless-stopped
    env_file: .env.db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: heath-server
    env_file: .env.server
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8080:8080"
    volumes:
      - uploads:/data/uploads

  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: heath-web
    env_file: .env.web
    depends_on:
      - backend
    ports:
      - "5173:5173"
    # If your web build is purely static, serve with nginx instead
    # and expose 80:80. For dev, Vite dev server on 5173 is fine.

volumes:
  pgdata:
  uploads:
```

### 4.2 Backend `Dockerfile`

> Multi-stage build for Maven. If you use Gradle, adapt accordingly.

```dockerfile
# ====== Build stage ======
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -e -B -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -e -B -DskipTests package

# ====== Runtime stage ======
FROM eclipse-temurin:17-jre
WORKDIR /app
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### 4.3 Web `Dockerfile`

> Dev-friendly container using Vite’s dev server. For production, build and serve with nginx.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
EXPOSE 5173
ENV HOST=0.0.0.0
CMD ["npm", "run", "dev", "--", "--host"]
```

**Production (optional) — static build with nginx**

```dockerfile
# build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

Update `docker-compose.yml` accordingly if you choose the nginx route.

### 4.4 (Optional) Mobile in Docker

> We recommend running Expo **outside** Docker for easier device debugging. If needed, you can containerize Metro bundler, but it complicates USB/ADB/Bonjour networking.

---

## 5. Running Without Docker

### 5.1 Database

Install PostgreSQL 15+, create DB and user:

```sql
CREATE DATABASE heath;
CREATE USER heath WITH ENCRYPTED PASSWORD 'heath';
GRANT ALL PRIVILEGES ON DATABASE heath TO heath;
```

### 5.2 Backend

```bash
cd server
# Maven
./mvnw spring-boot:run \
  -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=dev"
# or Gradle
# ./gradlew bootRun --args='--spring.profiles.active=dev'
```

### 5.3 Web

```bash
cd web
npm i
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5.4 Mobile (Expo)

```bash
cd mobile
npm i
npx expo start --tunnel
```

Scan the QR with Expo Go (iOS/Android). Ensure `EXPO_PUBLIC_API_BASE` points to your laptop’s IP.

---

## 6. Database Migrations & Seed

* **Migrations:** Managed by **Flyway** (typical Spring Boot default). Place SQL in `server/src/main/resources/db/migration` using versioned files like `V1__init.sql`, `V2__add_tables.sql`.
* **Seeding:** Provide `V*.sql` seed scripts or a Spring `CommandLineRunner` for dev data. Example seed path: `docker/seed/seed.sql` and mount into Postgres if preferred.

---

## 7. ActivityStreams & WCAG Notes

* **JSON‑LD / ActivityStreams 2.0:** All social actions (Create/Like/Follow, etc.) MUST serialize to valid ActivityStreams 2.0 under `AS_BASE_URL` (e.g., `/as`). Context: `https://www.w3.org/ns/activitystreams`.
* **Accessiblity (WCAG 2.1 AA):** Ensure color contrast, keyboard navigation, semantic HTML, alt text, focus states, and ARIA roles. Run automated checks (axe, Lighthouse) during CI.

---


## 8. Troubleshooting FAQ

**Q:** Containers start but backend can’t reach DB.
**A:** Verify `DB_HOST=db` in `.env.server` (matches compose service), and DB health is `healthy`.

**Q:** Web can’t call API due to CORS.
**A:** Add your web origin(s) to `CORS_ALLOWED_ORIGINS`.

**Q:** Mobile app can’t reach API.
**A:** Use your **machine IP** in `.env.mobile`, not `localhost`.

**Q:** Port already in use.
**A:** Change host ports in `docker-compose.yml` or stop the process occupying the port.

**Q:** Flyway migration errors.
**A:** Confirm DB is fresh, or fix the version order. You can drop & recreate the DB in dev.

**Q:** SSL / HTTPS.
**A:** For development we use HTTP. For production, terminate TLS at a reverse proxy (nginx/caddy) and set `X-Forwarded-*` headers. Also configure `SPRING_SECURITY_*` if applicable.

---

## 9. Makefile Shortcuts (Optional)

```Makefile
.PHONY: up down logs build clean seed
up:      ## Start all services
	docker compose up -d --build

down:    ## Stop all services
	docker compose down

logs:    ## Tail backend logs
	docker compose logs -f backend

build:   ## Build images
	docker compose build --no-cache

clean:   ## Remove volumes and images (DANGEROUS)
	docker compose down -v --rmi local

seed:    ## Example seed execution
	docker exec -i heath-db psql -U heath -d heath < docker/seed/seed.sql
```

---

## 10. CI/CD Hooks

* **Lint/Format:** run ESLint/Prettier on web/mobile; Spotless/Checkstyle on server.
* **Tests:** unit + integration; consider Testcontainers for DB.
* **Build:** produce `app.jar` artifact for server and `dist/` for web.
* **Scan:** Docker image scan (Trivy) and dependency scan (OWASP/Dependabot).
* **Deploy:** Use GitHub Actions to build/push images and update a target VM with `docker compose pull && up -d`.

---


