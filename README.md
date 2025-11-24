


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

3. Now, we have **docker-compose-local.yaml** file for local development.
4. In the **docker-compose-local.yaml**, you need to modify 2 keys.
5. The following keys should be modified:
   
```bash
    Line: 69  - OPENAI_API_KEY=${OPENAI_API_KEY} // Please ask the students for openai key
    Line: 70  - SENDGRID_API_KEY=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
```
6. After modifying those file, we have still 1 last step:
```bash
    Add gcp-connection.json file to the directory of "heatHBack/src/main/resources"
	This step is necessary because our project is using Cloud Storage to handle large files such as high quality photos
	Please contact us to get the gcp-connection.json file.
```
7. Now, deploy app on locally by using docker compose:
```bash
    docker-compose -f docker-compose-local.yaml up --build
```
8. After deploying the docker-compose file, you can look at the localhost:3000 for Web Application.
9.  We have tried this deployment procedure on 4 different computers and they worked succesfully. In case of any error or misunderstanding, please contact us to help you.

