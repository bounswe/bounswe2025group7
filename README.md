# Affordable and Healthy Eating Hub 

#  **HeatH**

![alt text](logo.2627bc3787d5fd14fdbd.png)

**Affordable and Healthy Eating Hub** is a web and mobile application designed to help users maintain a healthy diet on a budget. It provides a platform to discover affordable, nutritious recipes, plan meals, track grocery lists, and get advice from dietitians. The project was developed as part of the CMPE352/451 Software Engineering course (Group 7) and demonstrates a full-stack implementation with a React frontend, React Native mobile app, and a Node.js backend.

## Key Features

* **User Accounts & Profiles:** Users can register an account, log in, and manage their profile (including profile photo). Different user roles (e.g., regular users and dietitians) are supported for tailored experiences.
* **Recipe Discovery:** Browse and search a large collection of healthy recipes. Each recipe has detailed information (ingredients, instructions, nutritional values) and is tailored for budget-friendly cooking. Users can save favorite recipes and share them with others.
* **Personalized Feed:** A social-style feed on the homepage shows recent recipes, blog posts, or updates from the community (e.g., new recipes added by dietitians or popular posts). Users can interact by liking or commenting on feed items, fostering community engagement.
* **Dietitian Insights & Blog:** Certified dietitian users can contribute by posting nutrition tips, meal plans, and blog articles. Regular users can read these posts to gain insights into healthy eating habits and ask questions in comments.
* **Meal Planning & Shopping List:** Tools to create meal plans for the week and automatically generate grocery shopping lists. Users can search for budget-friendly grocery items and add them to their list, helping them stay within budget while eating healthy.
* **Responsive Web & Mobile App:** The platform is accessible via a web application (for desktop browsers) and a cross-platform mobile app. Both provide a consistent user experience, allowing users to access recipes and meal plans on the go.
* **Interactive Features:** Users can **create, edit, or delete** their own recipes or posts. They can comment on recipes, see comment counts in the feed, and share recipes via a link. Pagination is implemented on lists (like the home feed) for performance.

## Technologies Used

* **Frontend (Web):** React.js (JavaScript) with React Router for navigation and Material-UI (MUI) for consistent, responsive design.
* **Frontend (Mobile):** React Native for cross-platform (iOS & Android) support, sharing core logic with the web where possible.
* **Backend:** Node.js with Express framework serving RESTful APIs.
* **Database:** PostgreSQL relational database, accessed via **Sequelize** ORM. PostgreSQL offers strong ACID guarantees and flexible relational modeling, ideal for user accounts, recipes, and meal plans.
* **Authentication & Security:** JSON Web Tokens (JWT) for API authentication; passwords hashed with bcrypt. CORS configured to allow frontend–backend communication.
* **Containerization:** Docker and Docker Compose for easy local setup. Services include the backend server, frontend dev server (optionally), and PostgreSQL database.
* **Other Libraries:** Axios for API calls; React Context or Redux for state management; Formik/Yup for form validation; Expo (if used) for React Native development.

## Project Structure

```
/bounswe2025group7
├── heatHBack/          # Backend (Express + Sequelize)
│   ├── controllers/    # Route handlers
│   ├── models/         # Sequelize models (User, Recipe, Comment, etc.)
│   ├── routes/         # Express routes
│   ├── services/       # Business logic & helpers
│   ├── config/         # DB setup, JWT secrets, etc.
│   └── .env.sample     # Sample environment variables
├── heatHFront/         # Web frontend (React)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page views
│   │   ├── services/   # API client (Axios)
│   │   └── routes/     # React Router setup
│   └── .env.sample     # Sample React env variables
├── mobile/             # (Optional) React Native app
├── docker-compose.yml  # Orchestrates backend, frontend, and PostgreSQL
├── Group7_Demo_Video.mp4
└── README.md           # This file
```

## Setup and Installation

### Prerequisites

* **Node.js** (v14+)
* **npm** or **yarn**
* **Docker** & **Docker Compose** (recommended)
* **PostgreSQL** (local or containerized)

### Using Docker Compose

1. Clone the repo:

   ```bash
   git clone https://github.com/bounswe/bounswe2025group7.git
   cd bounswe2025group7
   ```
2. Copy and update env files:

   ```bash
   cp heatHBack/.env.sample heatHBack/.env
   cp heatHFront/.env.sample heatHFront/.env
   ```

   * In `heatHBack/.env`, set:

     ```ini
     POSTGRES_HOST=postgres
     POSTGRES_PORT=5432
     POSTGRES_DB=healthyhub
     POSTGRES_USER=hubuser
     POSTGRES_PASSWORD=hubpass
     JWT_SECRET=your_jwt_secret
     ```
   * In `heatHFront/.env`, set:

     ```ini
     REACT_APP_API_URL=http://localhost:5000
     ```
3. Start services:

   ```bash
   docker-compose up --build
   ```

   * Backend on [http://localhost:5000](http://localhost:5000)
   * Frontend on [http://localhost:3000](http://localhost:3000)
   * PostgreSQL on port 5432

### Manual Setup

#### Backend

```bash
cd heatHBack
npm install
# Ensure PostgreSQL is running and env vars in heatHBack/.env are set
npm start
```

#### Frontend (Web)

```bash
cd heatHFront
npm install
# Ensure REACT_APP_API_URL in heatHFront/.env points to http://localhost:5000
npm start
```

#### Mobile (React Native)

```bash
cd mobile
npm install
expo start  # or react-native run-android / run-ios
```

## Usage

1. Sign up or log in via the web or mobile app.
2. Browse, search, and save healthy recipes.
3. Create meal plans and generate grocery lists.
4. Read dietitian blog posts and interact via comments.
5. Manage your profile and view your contributions.

Refer to **Group7\_Demo\_Video.mp4** for a walkthrough of core features.

## Contribution Guidelines

* Fork the repo and create a feature branch.
* Open an issue to propose major changes.
* Follow existing code style and write descriptive commits.
* Submit a pull request linking related issues.

## License

This project was developed for educational purposes and holds all rights with the authors. No open-source license is provided. Please contact the maintainers for reuse permissions.
