# SmartVote Bharat — Cryptographic Facial Security Voting Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald.svg)](https://github.com/ManoharAkuthota/SmartVote-AI)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)

**SmartVote Bharat** is a production-ready, secure digital voting portal built to Election Commission of India (ECI) standards. It combines browser-native facial security verification, real-time anti-spoof liveness detection, two-factor OTP verification, and immutable SHA-256 digital seals to ensure verifiable and tamper-evident elections.

---

## Key Features

- **Cyber-Futuristic Dark Glassmorphism UI**: High-end SaaS aesthetic with cyan (`#00f0ff`), purple (`#8a2be2`), and emerald (`#00ffa3`) glowing accents, HUD video scanners, and floating holographic cards.
- **In-Browser Face Recognition (Face-api.js)**: 100% free client-side neural face detection without paid external APIs. Generates and matches 128-dimensional facial embeddings.
- **Anti-Spoof Liveness Protocol**: Verifies human liveness by detecting Eye Aspect Ratio (EAR) blinks and horizontal head yaw rotations before accepting authentication.
- **Two-Factor Authentication**: Automated 6-digit OTP dispatched via Gmail SMTP with a 120-second validity window.
- **Single-Vote Enforcement**: Hard database-level composite unique constraint `UNIQUE(election_id, voter_id)` preventing duplicate voting.
- **Cryptographic Receipts**: Generates a tamper-evident digital receipt with a unique ID (`SMV-2026-XXXXXXXX`), SHA-256 hash seal, dynamic QR code, and downloadable official PDF certificate.
- **Public Zero-Knowledge Verifier**: Anyone can verify receipt inclusion in the tally without disclosing the voter's private identity.
- **Comprehensive Admin Governance**:
  - Live election telemetry: Turnout percentages, candidate distribution, hourly voting bar charts.
  - Election and candidate lifecycle management (creation, scheduling, candidate nominations).
  - Voter registry with identity verification, selfie portraits, and account freeze toggles.
  - Security audit logs with device fingerprinting, suspicious login alerts, and CSV export.
- **Accessibility & Internationalization**:
  - Multilingual switcher (English, Spanish, Hindi, French).
  - Web Speech API text-to-speech voice narrator for visually impaired voters.
  - Dark / Light mode toggle.
  - Progressive Web App (PWA) manifest.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Framer Motion, Lucide Icons, jsPDF, QRCode.react, Canvas-Confetti |
| **Facial Security** | Face-api.js (TinyFaceDetector, FaceLandmark68Net, FaceRecognitionNet) |
| **Backend** | Spring Boot 3.3, Java 21, Spring Security 6 (Stateless JWT), Spring Data JPA, Hibernate, WebSocket STOMP |
| **Database** | MySQL 8.0 (Relational schema with unique constraints and foreign keys) |
| **Cloud Services** | Cloudinary (Facial portrait storage with fallback), Gmail SMTP (Two-Factor OTP) |
| **Deployment** | Docker, Docker Compose, Nginx, Render YAML, Vercel JSON |

---

## National Digital Identity Framework

> [!NOTE]
> Designed in compliance with Election Commission of India guidelines and Article 324 of the Constitution of India. SmartVote Bharat issues assigned EPIC Voter IDs (`IND-DL-XXXXXXX`) and masked Aadhaar references (`XXXX-XXXX-XXXX`) while securely binding the citizen's camera photo as the primary facial security identity.

---

## Pre-Seeded Accounts

The application automatically seeds the database on initial startup:

| Role | Email | Password | Voter ID | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@smartvote.ai` | `Admin@123` | `SMV-ADMIN-001` | Full administrative control, analytics, election CRUD, audit logs |
| **Voter** | `voter@smartvote.ai` | `Voter@123` | `SMV-8941205` | Active ballot voting, personal history, receipt generation |

---

## Quickstart Guide

### 1. Prerequisites
- **Java 21+**
- **Node.js 18+** & **npm 9+**
- **MySQL 8.0** running locally on port `3306` with database `smartvote_db` (or run via Docker)

### 2. Run with Docker Compose (Recommended)
One command spins up the MySQL database, Spring Boot backend, and React/Nginx frontend:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173` or `http://localhost:80`
- Backend REST API: `http://localhost:8080/api`

---

### 3. Run Locally from Source

#### Step A: Start the Backend (Spring Boot)
1. Verify MySQL is running on `localhost:3306` with database `smartvote_db` (username `root`, password `root`).
2. Navigate to `backend/` and run:
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux / Mac
./mvnw spring-boot:run
```
The backend will launch on `http://localhost:8080`.

#### Step B: Start the Frontend (React + Vite)
1. Navigate to `frontend/`:
```bash
npm install
npm run dev
```
The frontend will launch on `http://localhost:5173`.

---

## Environment Variables

Configure in `backend/src/main/resources/application.yml` or via system environment variables:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/smartvote_db` | MySQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `root` | MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | `root` | MySQL password |
| `JWT_SECRET` | 256-bit Hex Key | Secret key for signing JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | `demo-smartvote` | Cloudinary cloud identifier (optional) |
| `CLOUDINARY_API_KEY` | `123456789012345` | Cloudinary API Key (optional) |
| `CLOUDINARY_API_SECRET` | `demo_secret_key` | Cloudinary API Secret (optional) |
| `SPRING_MAIL_HOST` | `smtp.gmail.com` | SMTP host for OTP dispatch |
| `SPRING_MAIL_PORT` | `587` | SMTP port |
| `SPRING_MAIL_USERNAME` | `demo@smartvote.ai` | Gmail account for OTP emails |
| `SPRING_MAIL_PASSWORD` | `demo_app_password` | Gmail 16-character App Password |

> [!TIP]
> **Graceful Fallbacks**: If Cloudinary or Gmail SMTP credentials are not configured, the backend automatically logs OTP codes to the server console and uses data URIs for face snapshots, ensuring the entire workflow runs 100% smoothly without external blockers!

---

## Project Structure

```
Online voting System/
├── backend/
│   ├── src/main/java/com/smartvote/
│   │   ├── config/              # Security, CORS, WebSocket, Cloudinary
│   │   ├── controller/          # REST Controllers (Auth, Elections, Votes, Admin)
│   │   ├── dto/                 # Request & Response payloads
│   │   ├── entity/              # JPA Entities (User, Vote, Election, Candidate...)
│   │   ├── exception/           # Global exception handler & custom exceptions
│   │   ├── initializer/         # DataInitializer seeding default users & elections
│   │   ├── repository/          # Spring Data JPA repositories
│   │   ├── security/            # JWT Service & Authentication Filter
│   │   └── service/             # Business logic (Face, OTP, Vote, Admin, Audit...)
│   ├── src/main/resources/      # application.yml configuration
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI (Navbar, Footer, FaceScanner, OtpModal...)
│   │   ├── context/             # AuthContext, ThemeContext, LanguageContext
│   │   ├── pages/               # Landing, Register, Login, Dashboard, Ballot, Admin...
│   │   ├── services/            # Axios client, Face-api neural loader
│   │   ├── App.jsx              # Main router & role-based route guards
│   │   └── index.css            # Cyber-futuristic glassmorphism styling
│   ├── public/manifest.json     # PWA manifest
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml           # Multi-container orchestration
├── render.yaml                  # Render deployment descriptor
├── SmartVote_AI.postman_collection.json # Complete REST API collection
├── DATABASE_SCHEMA.md           # ER Diagram & database specifications
├── SYSTEM_ARCHITECTURE.md       # Architecture & sequence diagrams
└── API_DOCUMENTATION.md         # Full REST API endpoint reference
```

---

## Security Protocol Summary

1. **Client Face Processing**: Facial descriptor calculation and liveness verification execute entirely in the user's browser, preventing raw facial video capture from crossing the network.
2. **Stateless JWT Authorization**: Signed with HMAC-SHA256 and verified through `JwtAuthenticationFilter` on every protected route.
3. **Password Security**: Salted BCrypt hashing with automatic 15-minute lockout after 5 consecutive failed attempts.
4. **Ballot Privacy**: Public receipts verify ballot inclusion on the ledger without exposing the voter's identity.
