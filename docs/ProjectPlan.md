# 🗂️ Project Plan — HeatH (Affordable and Healthy Eating Hub) 
**Date:** 07 October 2025  
**Team:** bounswe2025group7  
**Repository:** [https://github.com/bounswe/bounswe2025group7](https://github.com/bounswe/bounswe2025group7)  

---

## 1. Overview
This Project Plan outlines the complete development roadmap, milestones, and deliverables for the *HeatH – Affordable and Healthy Eating Hub* project.  
It aligns with the course’s Agile iteration model and incorporates participatory, ethical, and accessible design principles following **W3C**, **WCAG**, and **JSON-LD ActivityStreams** standards.

---

## 2. Objectives
- Deliver an accessible and ethical web/mobile platform for affordable healthy eating.  
- Integrate participatory UX principles involving users.  
- Ensure semantic interoperability through **W3C ActivityStreams 2.0**.  
- Integrate external nutritional intelligence via **FatSecret API** for real-time calorie and macro data.  
- Provide clear milestones, issue tracking, and CI/CD monitoring through GitHub.

---

## 3. Methodology
The project follows an **Agile–Scrum** methodology:
- **Sprint Length:** 2 weeks  
- **Tools:** GitHub Projects (Kanban), Issues, Pull Requests, Milestones  
- **Roles:**
  - *Backend Developer:* Handles backend development, API integration (including FatSecret), and deployment.  
  - *Frontend Web Developer:* Handles frontend web development and testing tasks.  
  - *Frontend Mobile Developer:* Handles mobile development, UI integration, and testing.  

---

## 4. Deliverables and Milestones

| Week     | Milestone                                                       | Deliverables                                                                                  |
|----------|------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| **1–3**  | **Phase 0: Setup & Requirements**                                | • Repository structure (frontend/, backend/, docs/) <br> • Project charter / mission & vision document <br> • Draft SRS (with user stories, initial requirements) <br> • Initial wireframes & UI mockups <br> • Issue/branching strategy and GitHub project board set up |
| **4–5**  | **Initial Milestone: Mobile App Development, Semantic Search & FatSecret API Integration** | • Basic mobile app skeleton (login/signup, profile) <br> • Semantic search engine backend module <br> • **FatSecret API integration module** (fetch calories, macros, and food data) <br> • API endpoints for search + nutrition queries <br> • Integration of search UI in the mobile app <br> • Unit tests for mobile & search components |
| **6–8**  | **MVP: Enhancements on Web & Mobile + Nutrition-based Features** | • Web app core features: meal planner, recipe listing <br> • Shared API used by both web & mobile <br> • **Nutrition-based features**: calorie and macro breakdowns from FatSecret <br> • Affordability calculator & recommendation logic <br> • User interactions (like, comment, share) via ActivityStreams JSON-LD <br> • Basic accessibility support (contrast, ARIA, keyboard) <br> • Integration tests & user feedback demo |
| **9–10** | **Final Milestone: Refinements & Testing**                       | • UI/UX polishing & bug fixes <br> • Full accessibility audit + fixes <br> • Security & privacy review, consent handling for API data <br> • CI/CD pipeline setup, staging & production deployment <br> • Final documentation (SRS, Ethics & Accessibility, Project Plan) <br> • Final demo & presentation materials |

---

## 5. GitHub Milestones

| Milestone | Description | Target Weeks | Status |
|-----------|-------------|---------------|---------|
| 🏁 **Phase 0 – Setup & Requirements** | Repo structure setup, project charter, SRS draft, wireframes, GitHub board | Weeks 1–3 | ✅ Completed |
| ⚙️ **Phase 1 – Mobile + Semantic Search + FatSecret Integration** | Basic mobile app skeleton, semantic search backend, nutrition API adapter | Weeks 4–5 | ⏳ In Progress |
| 🎨 **Phase 2 – MVP Enhancement** | Web & mobile core features, FatSecret-powered nutrition data, affordability & recommendations | Weeks 6–8 | Planned |
| 🔗 **Phase 3 – Integration & Testing** | Full frontend-backend integration, nutrition module testing, WCAG audit | Weeks 9–10 | Planned |
| 🚀 **Phase 4 – Final Refinements & Deployment** | UI polish, privacy/ethics review, CI/CD pipeline, final documentation & presentation | Weeks 11–12 | Planned |

---

## 6. Task Breakdown by Component

### 6.1 Backend (Spring Boot)
- Implement RESTful endpoints for users, recipes, and activities.  
- Integrate **FatSecret API** for external food and nutrition data.  
- Use JSON-LD for ActivityStreams event modeling.  
- Connect PostgreSQL with schema validation and ORM (JPA).  
- Cache nutrition responses and handle API rate limits gracefully.

### 6.2 Frontend (React / React Native)
- Develop responsive UI using Material UI.  
- Integrate **nutrition lookup and display** (calories, macros) for recipes.  
- Implement meal planner, affordability calculator, and recipe feed.  
- Ensure WCAG 2.1 compliance (contrast, ARIA, keyboard navigation).  

### 6.3 Database (PostgreSQL)
- Extend schema to include nutrition data fields (calories, protein, carbs, fat).  
- Cache frequently accessed nutrition queries with TTL expiration.  
- Ensure encrypted storage of user preferences and API tokens.  

### 6.4 Ethics & Accessibility
- Implement user consent flow for third-party API (FatSecret) usage.  
- Document external data source and data processing transparency.  
- Maintain accessibility best practices (labels, contrast, ARIA).  

### 6.5 CI/CD 
- Linting, unit testing, and API mock tests.  
- Docker-based staging environment with GitHub Actions workflow.  
- Secure handling of FatSecret API credentials using environment variables.  

---

## 7. Risk Management

| Risk | Mitigation Strategy |
|------|----------------------|
| Delays in backend integration | Parallel frontend mock API testing |
| Delays in frontend & mobile integration | Backend support with temporary endpoints |
| FatSecret API rate limits or downtime | Local caching of results; mock API fallback |
| API schema or token changes | Encapsulated adapter layer and scheduled health checks |
| Ethical or privacy concerns | Instructor review of consent flow and third-party data usage |

---

## 8. Participation & Communication Plan
- **Weekly Meetings:** Every Tuesday during Lab Hours.  
- **Issue Tracking:** GitHub Issues with labels `backend`, `frontend`, `api`, `documentation`, `accessibility`.  
- **Progress Tracking:** GitHub Project Kanban board.  
- **Communication Channels:** WhatsApp + GitHub Discussions.  

---

## 9. Deliverable Review Checklist
✅ All milestones linked to GitHub issues.  
✅ FatSecret API integrated and validated.  
✅ WCAG accessibility audit completed.  
✅ Final documentation uploaded to `/docs`.  
✅ Presentation and demo ready by Week 10.

---
