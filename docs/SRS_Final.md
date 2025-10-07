# 🧩 Software Requirements Specification (SRS)  
**Project Title:** HeatH – Affordable and Healthy Eating Hub  
**Date:** 7 October 2025  
**Team:** bounswe2025group7  
**Tech Stack:** Java Spring Boot · PostgreSQL · React / React Native  

---

## 1. Introduction

### 1.1 Purpose  
This document specifies the software requirements for *HeatH – Affordable and Healthy Eating Hub*, a web and mobile platform promoting affordable, nutritious meal planning and personalized recommendations.  
It defines the functional and non-functional requirements, ethical considerations, accessibility standards, and data protection mechanisms to ensure inclusivity and interoperability.

### 1.2 Scope  
HeatH supports three primary user groups:
- **Regular Users:** create profiles, plan meals, and track affordability and nutrition.    
- **Administrators:** ensure data accuracy, monitor content, and maintain compliance.  

Core features:
- Smart **Calorie And Cost Calculator** for recipes  
- **Recipe Sharing** with social interactions  
- **Feed Page** posting posts, adding comments to posts, saving posts.  

### 1.3 Definitions and Acronyms
| Term | Definition |
|------|-------------|
| W3C | World Wide Web Consortium |
| WCAG | Web Content Accessibility Guidelines |
| JSON-LD | JavaScript Object Notation for Linked Data |
| GDPR | General Data Protection Regulation |
| ActivityStreams | W3C standard for expressing social activities in JSON-LD |

### 1.4 References
- [W3C ActivityStreams 2.0](https://www.w3.org/TR/activitystreams-core/)  
- [W3C JSON-LD 1.1](https://www.w3.org/TR/json-ld11/)  
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)  
- IEEE Std 830-1998 (Software Requirements Specification)  

---

## 2. Overall Description

### 2.1 Product Perspective  
HeatH integrates web and mobile interfaces using a RESTful API.  
All user-generated activities (e.g., posting recipes, liking) follow the **W3C ActivityStreams 2.0** model for interoperability.



### 2.2 User Classes and Characteristics
| User Type | Description | Access Level |
|------------|-------------|---------------|
| Regular User | Can register, plan meals, and post/like/save meals | Basic |
| Administrator | Manages data integrity, security, and compliance | Full |

### 2.3 Operating Environment  
- **Frontend:** React (web) / React Native (mobile)  
- **Backend:** Spring Boot REST API  
- **Database:** PostgreSQL, MongoDB  
- **Hosting:** Deployed via CI/CD on GCP  

### 2.4 Design and Implementation Constraints  
- Must comply with **W3C Accessibility** and **GDPR** standards  
- Follows RESTful architecture and JSON-LD data format  
- Uses open-source frameworks with permissive licenses  

---

## 3. System Features and Requirements

---

## 3.1 Functional Requirements

### 3.1.1 User Management
| ID | Requirement | Priority |
|----|--------------|----------|
| 3.1.1.1 | Users shall create, edit, and delete profiles. | High |
| 3.1.1.2 | The system shall support both English and Turkish UIs. | Medium |

### 3.1.2 Recipe Management
| ID | Requirement | Priority |
|----|--------------|----------|
| 3.1.2.1 | The system shall allow recipe creation, editing, and sharing. | High |
| 3.1.2.2 | The system shall recommend recipes based on preferences, dietary restrictions, and ingredient availability. | High |

### 3.1.3 Meal Planning and Recommendation
| ID | Requirement | Priority |
|----|--------------|----------|
| 3.1.3.1 | The system shall recommend meals based on nutrition goals. | High |
| 3.1.3.2 | The system shall calculate meal affordability based on user budget. | High |

### 3.1.4 Social Interaction
| ID | Requirement | Priority |
|----|--------------|----------|
| 3.1.4.1 | Users shall like, comment, and follow other users' posts using ActivityStreams JSON-LD. | Medium |
| 3.1.4.2 | All actions shall generate ActivityStream events for interoperability. | Medium |

### 3.1.5 Semantic Search and Discovery
| ID | Requirement | Priority |
|----|--------------|----------|
| 3.1.5.1 | The system shall support semantic search across recipes, posts, and meal plans using natural language queries. | High |
| 3.1.5.2 | The search engine shall leverage metadata from JSON-LD to improve contextual accuracy and entity linking. | High |
| 3.1.5.3 | Semantic relationships (e.g., ingredient → nutrient → recipe) shall be stored in a knowledge graph for efficient retrieval. | Medium |



---

## 3.2 Non-Functional Requirements

| Category | Requirement |
|-----------|-------------|
| **Usability** | Interfaces shall comply with WCAG 2.1 standards, including contrast ratio, keyboard navigation, and ARIA labels for accessibility. |
| **Security** | All data shall be encrypted using TLS 1.3 in transit and AES-256 at rest. |
| **Performance** | The system shall respond to 95% of user requests within 2 seconds under normal load conditions. |
| **Reliability** | The system shall maintain 99.5% uptime and provide automated database backup replication. |
| **Ethics & Privacy** | Users must provide explicit consent for data processing and have the right to delete their data at any time. |
| **Interoperability** | The system shall use JSON-LD schemas to ensure compatibility with external health and nutrition data APIs. |

---

## 4. External Interface Requirements

### 4.1 User Interface
- Color palette meets **WCAG contrast ratio ≥ 4.5:1**.  
- Alt text provided for all media.  
- Dynamic font scaling for accessibility.  
- Multi-language toggle (English ↔ Turkish).  

### 4.2 API Interfaces
All requests use JSON-LD syntax with proper `@context` and `@type` fields.  
Endpoints follow ActivityStreams semantics for event logging:
```
POST /api/activity/create
POST /api/activity/like
GET /api/activities/{userId}
```

### 4.3 Hardware Interfaces  
Standard web browsers and mobile devices (iOS/Android ≥ 12).

### 4.4 Communication Interfaces  
HTTPS RESTful communication, JWT-based authentication, OAuth2 login (Google/Facebook optional).

---

## 5. Ethics, Data Protection, and Accessibility

### 5.1 Data Protection
- **Compliance:** GDPR + KVKK (Turkey)  
- **Principles:** Minimal data collection, encryption, anonymization, explicit consent  
- **Storage:** PostgreSQL with role-based access and hashed credentials  

### 5.2 Ethical Use
- No bias in recommendations — algorithm audited regularly.  
- Nutritionists verified manually to ensure trustworthy content.  
- Clear distinction between sponsored and organic content.  

### 5.3 Accessibility (W3C WCAG 2.1)
| Principle | Example Implementation |
|------------|-----------------------|
| Perceivable | Text alternatives for all media |
| Operable | Full keyboard navigation and gesture support |
| Understandable | Consistent layout and language toggle |
| Robust | Compatible with assistive technologies (screen readers) |

---

## 6. Future Enhancements
- Integration with **FatSecret** for verified nutrition data.  
- Implementation of the mobile application
- Expansion of **semantic search** with embeddings for recipe discovery. 
---

## 7. Traceability Matrix

| User Need | Requirement ID | Implementation Reference |
|------------|----------------|---------------------------|
| Track nutrition goals | FR-3 | `/recommendations` endpoint |
| Share and comment on recipes | FR-2, FR-6 | `/recipes` module |
| Affordable meals | FR-5 | `/affordability` calculator |
| Semantic search for recipes | 3.1.6.1 | `/semantic-search` module |

---

## 8. Appendices
- **A. W3C JSON-LD Playground Validation:** [https://json-ld.org/playground/](https://json-ld.org/playground/)  
- **B. Accessibility Test:** [https://wave.webaim.org/](https://wave.webaim.org/)  
- **C. Ethical Review Checklist:** Included under `/docs/EthicsAndAccessibility.md`  

