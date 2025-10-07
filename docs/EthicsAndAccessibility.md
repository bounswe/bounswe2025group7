# Ethics & Accessibility — HeatH

**Date:** 07 October 2025  
**Team:** bounswe2025group7  

---

## 1. Introduction & Purpose

This document outlines the ethical principles and accessibility commitments guiding the development of **HeatH**.  
It ensures our design and implementation respect user rights, safeguard data privacy, support inclusion, and follow W3C / WCAG standards.

Key goals:  
- Protect users’ autonomy and informed consent  
- Prevent algorithmic bias and ensure fairness  
- Guarantee usability for persons with disabilities  
- Align with legal norms (GDPR, KVKK, accessibility legislation)

---

## 2. Ethical Principles

### 2.1 User Consent & Autonomy  
- Users must explicitly **opt in** before any personal data collection (e.g. diet preferences, demographic info).  
- Consent forms must use clear, non-technical language explaining data usage (e.g., “We use your diet goals to suggest meals”).  
- Users may **revoke consent** and request complete deletion of their data at any time.

### 2.2 Data Minimization & Purpose Limitation  
- Collect only the minimal data necessary for core functionality (meal planning, recommendations).  
- Avoid collecting sensitive personal data unless explicitly needed and consented.  
- Use pseudonymization or anonymization when using data in analytics or aggregate form.

### 2.3 Transparency & Explainability  
- Provide brief explanations of how recommendations are made (e.g., “This meal matches your calorie goal and budget”).  
- Allow users to view, export, or delete stored preferences and profile data.

### 2.4 Fairness & Bias Mitigation  
- Nutritionist accounts must be **verified** to reduce misinformation risk.  
- The recommendation logic should be audited for bias — e.g. avoid always favoring expensive ingredients, or excluding low-budget users.  
- Maintain logs of algorithmic decisions to support review and debugging.

### 2.5 Accountability & Oversight  
- Store audit trails (immutable logs) for critical operations (data deletion, changes to preferences, recommendation decisions).  
- Assign a **Privacy & Ethics Lead** responsible for reviewing sensitive modules and flows.  
- Require peer or instructor review on modules involving user data or algorithmic logic.

### 2.6 Legal & Regulatory Compliance  
- Comply with **GDPR** (EU) and **KVKK** (Turkey) concerning data rights (access, correction, deletion).  
- Encrypt data in transit (TLS 1.3 or similar) and at rest (AES-256 or equivalent).  
- Enforce role-based access control so only authorized modules or users access sensitive data.

---

## 3. Accessibility Commitment

We commit to achieving **WCAG 2.1 Level AA** compliance (or higher) for both web and mobile platforms to ensure accessibility for users with disabilities.

### 3.1 WCAG Implementation Requirements

| Principle | Success Criteria | Implementation Strategy |
|-----------|-------------------|---------------------------|
| **Perceivable** | 1.1.1 Non-text Content | Provide `alt` text, ARIA labels, descriptive captions for images, charts, icons |
|  | 1.4.3 Contrast (Minimum) | Ensure contrast ratio ≥ 4.5:1 between text and background |
|  | 1.3.1 Info & Relationships | Use semantic HTML (headings, lists) and ARIA roles to convey structure |
| **Operable** | 2.4.4 Link Purpose (In Context) | Use descriptive link text (e.g. “View recipe: Chickpea Bowl”) |
|  | 2.1.4 Character Key Shortcuts | Support standard keyboard navigation; avoid conflicting shortcuts |
| **Understandable** | 3.1.1 Language of Page | Mark language (e.g., `lang="en"` / `lang="tr"`) in HTML or metadata |
|  | 3.3.1 Error Identification | When form errors occur, clearly identify which field and why, and how to fix |
| **Robust** | 4.1.2 Name, Role, Value | Use proper ARIA attributes so assistive technologies understand UI elements |

We will use automated tools (e.g. axe, Lighthouse, WAVE) plus manual testing to validate compliance.

### 3.2 Mobile / React Native Considerations  
- Ensure **touch targets** are large enough (e.g. ~44×44 dp)  
- Handle screen orientation changes gracefully  
- Use `accessibilityLabel`, `accessible`, and other React Native props for assistive tech  
- Avoid motion or animation that may trigger discomfort  

### 3.3 Documentation & Developer Training  
- Each UI component should include an **accessibility note** (e.g. “This menu uses ARIA role `menu`”)  
- Train all team members (frontend, QA) in accessibility best practices  
- Maintain a checklist to verify accessibility before merging any pull request  

---

## 4. QA, Testing & Validation

### 4.1 Accessibility Testing  
- Integrate accessibility checks into CI (e.g. axe-core, jest-axe)  
- Use screen readers (NVDA, VoiceOver) for end-to-end flows (login, meal planning, recipe viewing)  
- Test with keyboard-only navigation (Tab / Shift+Tab)  
- Use contrast checking tools to validate color pairs

### 4.2 Ethics & Privacy Testing  
- Test deletion and revocation flows to confirm complete data removal  
- Simulate user consent withdrawal and verify system behavior  
- Audit recommendation logs for anomalies or bias  

### 4.3 Acceptance Criteria for UI Features  
For each feature or page, require:  
- All images / media have alternative text / accessible descriptions  
- No contrast violations  
- All interactive controls reachable and operable via keyboard  
- ARIA roles / labels correctly defined  
- Core flows (login, planner, recipe browse) usable through assistive tech

---

## 5. Responsibilities & Governance

| Role | Responsibility |
|------|----------------|
| UX / UI Lead | Ensure designs meet WCAG ratios, choose accessible components |
| Frontend Developer | Implement accessibility props, test keyboard and ARIA flows |
| Backend Developer | Enforce data minimization, audit logs, consent logic |
| QA / Testing Lead | Write tests (accessibility + ethics), perform manual audits |
| Documentation Lead | Maintain this doc, update ethics / accessibility sections, produce user-facing statements |

---

## 6. Compliance, Resources & References

- **WCAG 2.1** (W3C) — accessibility guidelines  
- **W3C Web Accessibility Initiative (WAI)** resources  
- **GDPR** / **KVKK** — legal frameworks for data rights  

---

## 7. Future Enhancements & Audits

- Plan external **accessibility audit** by third-party experts  
- Review and upgrade to **WCAG 2.2 / 3.0** when available  
- Conduct **periodic ethics reviews** especially when modifying recommendation logic  
- Perform **user testing involving users with disabilities** to validate real-world usability  

---
