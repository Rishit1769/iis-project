# VivaAI — AI-Powered Adaptive Laboratory Viva Examination Platform

## Project Overview

| Field | Value |
|---|---|
| **Name** | `ai-viva-examiner` |
| **Display Name** | VivaAI |
| **Version** | 0.1.0 |
| **Description** | AI-powered adaptive laboratory viva examination platform |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Runtime** | Node.js |

VivaAI is a web-based platform that enables teachers to create AI-driven oral vivas (lab examinations) for students. Teachers upload experiment PDFs, configure examination parameters, and students join via session codes to answer AI-generated questions. The system adapts question difficulty based on student performance and generates comprehensive assessment reports.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Database Architecture](#database-architecture)
4. [User Roles & Authentication](#user-roles--authentication)
5. [Backend Architecture](#backend-architecture)
6. [AI Integration](#ai-integration)
7. [API Endpoints](#api-endpoints)
8. [Frontend Architecture](#frontend-architecture)
9. [UI/UX Design System](#uiux-design-system)
10. [Pages & Routing](#pages--routing)
11. [Core Features](#core-features)
12. [User Flows](#user-flows)
13. [Configuration & Environment](#configuration--environment)
14. [Scripts](#scripts)

---

## Technology Stack

### Core

| Technology | Version | Purpose |
|---|---|---|
| Next.js | ^14.2.35 | React framework (App Router) |
| React | ^18 | UI library |
| TypeScript | ^5 | Type-safe development |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Prisma | ^5.22.0 | ORM / database access |
| MySQL | — | Relational database |
| mysql2 | ^3.24.4 | MySQL driver |
| NextAuth.js | ^5.0.0-beta.32 | Authentication (JWT strategy) |
| bcryptjs | ^3.0.3 | Password hashing (12 rounds) |
| uuid | ^14.0.2 | Session code generation |

### AI / LLM

| Technology | Version | Purpose |
|---|---|---|
| OpenAI SDK | ^7.12.1 | LLM API client (custom endpoint) |
| Model | qwen3.6 | Via `ai.tcetcercd.in` gateway |

### PDF Processing

| Technology | Version | Purpose |
|---|---|---|
| pdf2json | ^4.0.3 | PDF text extraction |
| pdfkit | ^0.20.2 | PDF generation (installed, unused in source) |

### Styling & Utilities

| Technology | Version | Purpose |
|---|---|---|
| Tailwind CSS | ^3.4.1 | Utility-first CSS framework |
| clsx | ^2.1.1 | Conditional CSS classes |
| tailwind-merge | ^3.6.0 | Tailwind class deduplication |
| PostCSS | ^8 | CSS processing |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| prisma | ^5.22.0 | Prisma CLI / migrations |
| eslint | ^8 | Linting |
| eslint-config-next | 14.2.35 | Next.js ESLint rules |
| @types/bcryptjs | ^2.4.6 | Type definitions |
| @types/node | ^20 | Type definitions |
| @types/react | ^18 | Type definitions |
| @types/react-dom | ^18 | Type definitions |
| @types/uuid | ^10.0.0 | Type definitions |

---

## Project Structure

```
AI-Chatbot/
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment variable template
├── .eslintrc.json                # ESLint config
├── .gitignore                    # Git ignore rules
├── next.config.mjs               # Next.js configuration
├── package.json                  # Project manifest
├── postcss.config.mjs            # PostCSS config (Tailwind)
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
│
├── prisma/
│   ├── schema.prisma             # Database schema (7 models, 2 enums)
│   ├── seed.js                   # Database seeder (admin user)
│   └── migrations/
│       └── 20260921000000_teacher_approval/
│           └── migration.sql     # Adds approval_status + modifies role enum
│
└── src/
    ├── middleware.ts              # Next.js middleware (pass-through)
    │
    ├── lib/
    │   ├── auth.ts                # NextAuth.js v5 configuration
    │   ├── constants.ts           # Teacher email domain validation
    │   ├── db.ts                  # Prisma client singleton
    │   ├── utils.ts               # cn() utility (clsx + tailwind-merge)
    │   ├── ai/
    │   │   ├── client.ts          # OpenAI client instance
    │   │   ├── examiner.ts        # AI question generation
    │   │   ├── evaluator.ts       # AI answer evaluation
    │   │   ├── report.ts          # AI final report generation
    │   │   └── json-utils.ts      # Robust JSON extraction from LLM
    │   └── pdf/
    │       └── extract.ts         # PDF text extraction & validation
    │
    ├── components/
    │   ├── Providers.tsx           # NextAuth SessionProvider wrapper
    │   └── layout/
    │       └── Sidebar.tsx         # Dashboard sidebar navigation
    │
    └── app/
        ├── layout.tsx              # Root layout
        ├── page.tsx                # Landing page
        ├── globals.css             # Global styles + design system
        │
        ├── login/page.tsx          # Teacher login
        ├── register/page.tsx       # Teacher registration
        │
        ├── viva/
        │   ├── page.tsx            # Student session join
        │   ├── exam/[id]/page.tsx  # Live viva exam (Q&A interface)
        │   └── report/[id]/page.tsx# Student assessment report
        │
        ├── dashboard/
        │   ├── layout.tsx          # Auth-gated dashboard layout
        │   ├── page.tsx            # Dashboard overview
        │   ├── create/page.tsx     # Create viva (PDF + config)
        │   ├── vivas/
        │   │   ├── page.tsx        # List all vivas
        │   │   └── [id]/page.tsx   # Viva detail + session drill-down
        │   ├── results/page.tsx    # All completed session results
        │   ├── settings/page.tsx   # AI gateway health + system info
        │   └── admin/page.tsx      # Admin teacher approval
        │
        └── api/
            ├── auth/               # Auth endpoints
            ├── experiments/        # PDF upload
            ├── vivas/              # Viva CRUD
            ├── sessions/           # Student session management
            ├── admin/              # Admin endpoints
            ├── seed/               # Demo data seeding
            └── ai/                 # AI health check
```

---

## Database Architecture

### ORM: Prisma with MySQL

### Models (7 total)

#### 1. User
| Field | Type | Purpose |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | User's display name |
| `email` | String (unique) | Login email |
| `password` | String | Hashed password (bcrypt) |
| `role` | Enum (`TEACHER`, `STUDENT`, `ADMIN`) | User role |
| `approvalStatus` | Enum (`APPROVED`, `PENDING`, `REJECTED`) | Teacher approval state |
| `createdAt` | DateTime | Account creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

#### 2. Experiment
| Field | Type | Purpose |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | Experiment name |
| `filename` | String | Original PDF filename |
| `textContent` | String (`@db.Text`) | Extracted text from PDF |
| `teacherId` | String (FK → User) | Uploaded by |
| `createdAt` | DateTime | Upload timestamp |

#### 3. Viva
| Field | Type | Purpose |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `title` | String | Viva title |
| `sessionCode` | String (unique, 8 chars) | Student join code |
| `totalQuestions` | Int | Number of questions to ask |
| `difficulty` | String | `easy`, `medium`, `hard`, `adaptive` |
| `passingScore` | Float | Minimum pass percentage |
| `adaptiveMode` | Boolean | Enable adaptive difficulty |
| `questionTypes` | String (`@db.Text`) | JSON array of selected types |
| `teacherId` | String (FK → User) | Created by |
| `experimentId` | String (FK → Experiment) | Based on experiment |
| `createdAt` | DateTime | Creation timestamp |

#### 4. VivaSession
| Field | Type | Purpose |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `studentName` | String | Student's name |
| `currentQuestion` | Int | Current question index (0-based) |
| `totalScore` | Float | Accumulated score |
| `maxScore` | Float | Maximum possible score |
| `status` | Enum (`ACTIVE`, `COMPLETED`, `ABANDONED`) | Session state |
| `vivaId` | String (FK → Viva) | Parent viva |
| `createdAt` | DateTime | Start timestamp |
| `updatedAt` | DateTime | Last activity |

#### 5. Question
| Field | Type | Purpose |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `questionNumber` | Int | Sequence number (1-based) |
| `questionText` | String (`@db.Text`) | AI-generated question |
| `topic` | String | Topic category |
| `difficulty` | String | Difficulty level |
| `type` | String | Question type (conceptual, etc.) |
| `sessionId` | String (FK → VivaSession) | Parent session |

#### 6. Answer
| Field | Type | Purpose |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `answerText` | String (`@db.Text`) | Student's answer |
| `score` | Float | Score (0–10) |
| `maxScore` | Float | Maximum score |
| `correctness` | String | Correctness assessment |
| `conceptualUnderstanding` | Float | Conceptual depth score |
| `completeness` | Float | Completeness score |
| `strengths` | String (`@db.Text`) | JSON array of strengths |
| `weaknesses` | String (`@db.Text`) | JSON array of weaknesses |
| `missingConcepts` | String (`@db.Text`) | JSON array of missing concepts |
| `questionId` | String (FK → Question) | Associated question |
| `sessionId` | String (FK → VivaSession) | Associated session |

#### 7. Evaluation
| Field | Type | Purpose |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `topicsCovered` | String (`@db.Text`) | JSON array of covered topics |
| `weakTopics` | String (`@db.Text`) | JSON array of weak areas |
| `strongTopics` | String (`@db.Text`) | JSON array of strong areas |
| `currentDifficulty` | String | Current adaptive difficulty level |
| `sessionId` | String (FK → VivaSession) | Associated session |

### Relationships

```
User ────< Viva              (one teacher creates many vivas)
User ────< Experiment        (one teacher uploads many experiments)
Experiment ────< Viva        (one experiment used in many vivas)
Viva ────< VivaSession       (one viva has many student sessions)
VivaSession ────< Question   (one session contains many questions)
VivaSession ────< Evaluation (one session has evaluation snapshots)
Question ──── Answer          (one question has at most one answer)
```

---

## User Roles & Authentication

### Roles

| Role | Permissions |
|---|---|
| **ADMIN** | Approve/reject teacher registrations; full system access |
| **TEACHER** | Create vivas, upload experiments, view results (requires admin approval) |
| **STUDENT** | Join vivas via session code, answer questions, view own report |

### Authentication Mechanism

- **Provider:** NextAuth.js v5 (beta.32) with Credentials strategy
- **Session:** JWT-based (not database sessions)
- **Password Hashing:** bcryptjs with 12 rounds
- **Domain Restriction:** Teacher emails must be `@tcetmumbai.in`
- **Admin Approval:** Teachers start as `PENDING`; must be approved by admin before login

### Auth Flow

1. User submits credentials to `/api/auth/[...nextauth]`
2. `authorize()` looks up user by email in MySQL
3. Password verified with bcryptjs
4. Teacher-specific checks: domain validation + approval status
5. On success, JWT token created with `role`, `id`, `approvalStatus`
6. `session.user` exposes role, id, and approvalStatus on client

### Authorization Patterns

| Pattern | Usage |
|---|---|
| `auth()` call | Teacher/admin endpoints verify session |
| Ownership check | `viva.teacherId === session.user.id` |
| Role check | `requireAdmin()` helper verifies `role === "ADMIN"` |
| No auth | Student endpoints (join via session code) |

### Default Admin Account

- **Email:** `admin@tcetmumbai.in`
- **Password:** `159753`
- Seeded via `prisma/seed.js` or `POST /api/seed`

---

## Backend Architecture

### Pattern: Next.js App Router API Routes

All backend logic lives in `src/app/api/` using serverless functions.

### Key Architectural Decisions

1. **Serverless Functions** — Each API route is a standalone serverless function with no long-running process
2. **No Global Middleware Auth** — Middleware is pass-through; auth enforced per-route via `auth()` calls
3. **Role-Based Access Control** — Three roles with different permission levels and admin approval workflow
4. **Session Code Pattern** — Students join via 8-char codes (UUID fragment) without authentication
5. **Ownership Authorization** — Teachers can only access their own vivas
6. **Cascading Delete** — Manual deletion order: answers → questions → evaluations → sessions → viva
7. **JSON-in-Text Pattern** — JSON data stored as `@db.Text` columns, serialized in application layer
8. **Prisma Singleton** — Client instance cached to prevent hot-reload connection exhaustion

### File-Level Organization

| Layer | Files | Purpose |
|---|---|---|
| **Auth** | `src/lib/auth.ts` | NextAuth config, signIn, signOut, handlers |
| **Database** | `src/lib/db.ts` | Prisma client singleton |
| **AI Services** | `src/lib/ai/*.ts` | Examiner, evaluator, report generators |
| **PDF Processing** | `src/lib/pdf/extract.ts` | Text extraction from uploaded PDFs |
| **Utilities** | `src/lib/utils.ts`, `src/lib/constants.ts` | Helpers and constants |
| **API Routes** | `src/app/api/**/route.ts` | 17 serverless endpoints |

---

## AI Integration

### Configuration

| Setting | Value |
|---|---|
| **SDK** | OpenAI SDK v7.12.1 |
| **Endpoint** | `https://ai.tcetcercd.in/v1` |
| **Model** | `qwen3.6` |
| **API Key** | Environment variable `AI_KEY` |

### AI Service Modules

#### 1. AI Examiner (`src/lib/ai/examiner.ts`)
- **Purpose:** Generates viva questions based on experiment content and student performance
- **System Prompt:** "Academic laboratory viva examiner" with 15 rules
- **Temperature:** 0.7
- **Max Tokens:** 500
- **Output:** JSON `{ question, topic, difficulty, type }`
- **Context:** Experiment text (3000 chars), topics covered, weak/strong areas, difficulty level, previous questions, evaluation scores

#### 2. AI Evaluator (`src/lib/ai/evaluator.ts`)
- **Purpose:** Evaluates student answers and provides detailed feedback
- **System Prompt:** "Academic answer evaluator" with 6 rules
- **Temperature:** 0.3
- **Max Tokens:** 600
- **Output:** JSON `{ score, maxScore, correctness, conceptualUnderstanding, completeness, strengths, weaknesses, missingConcepts, recommendedDifficulty }`
- **Context:** Experiment text (2000 chars), question details, student answer

#### 3. AI Report Generator (`src/lib/ai/report.ts`)
- **Purpose:** Generates comprehensive final assessment report
- **System Prompt:** "Academic assessment report generator" with 5 rules
- **Temperature:** 0.3
- **Max Tokens:** 800
- **Output:** JSON `{ overallScore, maxScore, percentage, status, categoryPerformance, strongAreas, weakAreas, recommendedRevision, summary }`
- **Context:** All per-question evaluations with strengths/weaknesses/missing concepts

#### 4. JSON Utilities (`src/lib/ai/json-utils.ts`)
- **Purpose:** Robust JSON extraction from LLM responses
- **Features:** Strips markdown code fences, control characters, invalid escape sequences before JSON.parse

### Adaptive Questioning Loop

```
Generate Question (AI Examiner)
    ↓
Display to Student
    ↓
Student Submits Answer
    ↓
Evaluate Answer (AI Evaluator)
    ↓
Update Difficulty & Topics
    ↓
Generate Next Question (AI Examiner)
    ↓
... repeat until all questions answered ...
    ↓
Generate Final Report (AI Report Generator)
```

---

## API Endpoints

### Auth Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET/POST` | `/api/auth/[...nextauth]` | No | NextAuth.js handler |
| `POST` | `/api/auth/register` | No | Register new teacher (`@tcetmumbai.in` required) |
| `GET` | `/api/auth/me` | Yes | Current user info |
| `GET` | `/api/auth/clear-cookies` | No | Clear auth cookies, redirect to login |

### Viva Management (Teacher)

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/vivas` | Yes | List teacher's vivas with experiment + session summaries |
| `POST` | `/api/vivas` | Yes | Create viva (generates session code) |
| `GET` | `/api/vivas/[id]` | Yes | Full viva detail (ownership required) |
| `DELETE` | `/api/vivas/[id]` | Yes | Delete viva + all dependents (ownership required) |
| `GET` | `/api/vivas/[id]/results` | Yes | All student results with Q&A detail (ownership required) |
| `POST` | `/api/vivas/[id]/upload` | Yes | Replace/update experiment PDF (ownership required) |

### Student Session

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sessions/start` | No | Join viva by session code + student name |
| `GET` | `/api/sessions/[id]` | No | Get full session state |
| `POST` | `/api/sessions/[id]/next-question` | No | Generate next AI question |
| `POST` | `/api/sessions/[id]/answer` | No | Submit answer + AI evaluation |
| `GET/POST` | `/api/sessions/[id]/report` | No | Generate final AI assessment report |

### Experiment Upload

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/experiments/upload` | Yes | Upload experiment PDF, extract text |

### Admin

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/teachers` | ADMIN | List pending teacher registrations |
| `PATCH` | `/api/admin/teachers` | ADMIN | Approve or reject teacher account |

### Utility

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/seed` | No | Seed demo experiment |
| `GET` | `/api/ai/health` | No | AI gateway connectivity check |

---

## Frontend Architecture

### Rendering Model

All components are **client components** (`"use client"`). No server components are used for data fetching. All data fetching happens client-side via `fetch()` in `useEffect` or event handlers.

### State Management

- **No external state library** (no Redux, Zustand, Jotai)
- Each component manages state locally via `useState` + `useEffect`
- Session management via `next-auth/react` `SessionProvider`
- Student session ID persisted in `localStorage`

### Component Inventory

| Component | File | Purpose |
|---|---|---|
| `Providers` | `src/components/Providers.tsx` | NextAuth SessionProvider wrapper |
| `Sidebar` | `src/components/layout/Sidebar.tsx` | Fixed dashboard sidebar navigation |

### Key Architectural Notes

1. All pages are client-side rendered despite Next.js App Router capabilities
2. No component reuse — similar patterns (tables, cards, loading) are reimplemented per page
3. Icons are inline SVG paths, not from an icon library
4. No error boundaries or loading skeletons
5. No toast/notification system — errors shown inline
6. No custom modals — uses native `confirm()` and `alert()`

---

## UI/UX Design System

### Theme: Dark Mode Only

No light mode or theme toggle. Single dark color palette.

### Color Palette

| Token | Hex Value | Usage |
|---|---|---|
| `bg` | `#0B0D10` | Base background |
| `bg-secondary` | `#111419` | Card/sidebar background |
| `bg-elevated` | `#161A20` | Elevated surfaces |
| `bg-hover` | `#1C2028` | Hover states |
| `text` | `#F2F4F7` | Primary text |
| `text-secondary` | `#9CA3AF` | Secondary text |
| `text-muted` | `#6B7280` | Muted/disabled text |
| `border` | `#252A32` | Default border |
| `accent` | `#4F7DF3` | Primary accent (blue) |
| `success` | `#22C55E` | Success states |
| `warning` | `#F59E0B` | Warning states |
| `error` | `#EF4444` | Error states |

### Typography

- **Primary Font:** Inter (sans-serif)
- **Monospace Font:** JetBrains Mono
- **Base Font Size:** 14px
- **Custom Size:** `text-2xs` = 11px/16px
- **Anti-aliasing:** `-webkit-font-smoothing: antialiased`

### Component Classes (globals.css)

#### Buttons
- `.btn-primary` — Blue accent button
- `.btn-secondary` — Bordered background-elevated
- `.btn-ghost` — Transparent text-only
- `.btn-danger` — Red-tinted destructive

#### Inputs
- `.input` — Dark background input with focus ring
- `.input-lg` — Larger variant
- `textarea.input` — Resizable textarea

#### Cards
- `.card` — Base card with border
- `.card-elevated` — Higher elevation
- `.card-interactive` — Clickable with hover effect

#### Badges
- `.badge-accent` — Blue accent
- `.badge-success` — Green success
- `.badge-warning` — Amber warning
- `.badge-error` — Red error
- `.badge-neutral` — Neutral gray

#### Utilities
- `.label` — Form field label
- `.progress-bar` / `.progress-fill` — Progress bar
- `.divider` — Horizontal rule
- `.animate-pulse-subtle` — Subtle pulse animation (opacity 1→0.5 over 2s)
- `.focus-ring` — Accessibility focus ring

### Responsive Breakpoints

- `sm`, `md`, `lg` (default Tailwind breakpoints)
- Dashboard sidebar: fixed 240px, no mobile collapse
- Landing page: stacked on mobile, side-by-side on desktop

### Animations

- No animation libraries (no Framer Motion, GSAP)
- Only CSS transitions (`transition-colors duration-150`) and custom `animate-pulse-subtle`
- Exam page uses phase-based state transitions

---

## Pages & Routing

### Public Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing page | Marketing page with features, demo, CTA |
| `/login` | Login | Teacher credential authentication |
| `/register` | Register | Teacher account creation |
| `/viva` | Join Viva | Student enters session code + name |
| `/viva/exam/[id]` | Live Exam | Interactive Q&A examination interface |
| `/viva/report/[id]` | Assessment Report | Post-viva score, breakdown, recommendations |

### Protected Routes (Dashboard)

| Route | Page | Description |
|---|---|---|
| `/dashboard` | Overview | Stats cards, recent sessions table |
| `/dashboard/create` | Create Viva | PDF upload + examination configuration |
| `/dashboard/vivas` | My Vivas | List all vivas with session codes |
| `/dashboard/vivas/[id]` | Viva Detail | Session drill-down with Q&A review |
| `/dashboard/results` | Results | All completed session scores |
| `/dashboard/settings` | Settings | AI gateway health + system info |
| `/dashboard/admin` | Admin | Teacher approval (ADMIN role only) |

### Page Descriptions

#### Landing Page (`/`)
- Sticky navbar with backdrop blur
- Hero section with headline + viva interface mockup
- "How it works" — 3-step flow (Upload, Answer, Review)
- Subject strip — 5 CS subjects with hover effects
- Follow-up demo — realistic examiner/student conversation
- CTA section + footer

#### Login (`/login`)
- Centered card layout
- Email + password with show/hide toggle
- Auto-redirect to dashboard on success
- Links to register and student join

#### Register (`/register`)
- Same centered card layout as login
- Name + email + password with show/hide toggle
- Auto-signs in after registration
- Min 6 character password validation

#### Dashboard Overview (`/dashboard`)
- 4 stat cards: total vivas, students assessed, completed vivas, average score
- Recent sessions table (last 5)
- Empty state with "Create first viva" link

#### Create Viva (`/dashboard/create`)
- Experiment name input
- PDF drag-and-drop upload with status progression
- "Load demo" button for quick setup
- Configuration grid: question count, difficulty, passing score, adaptive mode
- Question type multi-select (8 pill toggles)

#### My Vivas (`/dashboard/vivas`)
- Card list of all vivas
- Shows: title, experiment, question count, difficulty, session code, completion ratio
- Actions: student view link, delete button

#### Viva Detail (`/dashboard/vivas/[id]`)
- Session code display
- Stats: questions, completed, difficulty
- Session list (clickable) + selected session Q&A detail
- Answer cards with strengths/weaknesses

#### Results (`/dashboard/results`)
- Table: student, experiment, score %, status badge, date, report link
- Pass threshold at 50%

#### Settings (`/dashboard/settings`)
- AI gateway health card (connection status, URL, model)
- System info card (MySQL, Next.js, Prisma, PDF processing)

#### Admin (`/dashboard/admin`)
- Teacher registration table
- Approve/reject buttons for PENDING accounts

#### Join Viva (`/viva`)
- Session code input (auto-uppercase, monospace)
- Student name input
- Navigates to exam on success

#### Live Exam (`/viva/exam/[id]`)
- State machine: loading → question → submitting → next → loading
- Top bar: logo, student name, question counter
- Animated progress bar
- Question display with type badge, difficulty, number
- Resizable textarea for answer
- Keyboard shortcut: Cmd+Enter to submit
- Auto-advance: 1.2s delay between questions
- Auto-redirect to report when complete

#### Assessment Report (`/viva/report/[id]`)
- Score card: percentage, raw score, PASSED/FAILED badge
- Category performance bars
- Strong/weak areas columns
- Recommended revision topics
- Summary paragraph
- Accordion question breakdown

---

## Core Features

### 1. Teacher Management
- Account registration with domain restriction (`@tcetmumbai.in`)
- Admin approval workflow for new teachers
- Role-based dashboard access

### 2. Experiment Upload
- PDF upload with drag-and-drop support
- Automatic text extraction via pdf2json
- Text validation (minimum length check)
- Section parsing (objective, theory, procedure, etc.)
- Demo experiment seeding

### 3. Viva Configuration
- Custom title per viva
- Question count selection (5/10/15/20)
- Difficulty levels (easy/medium/hard/adaptive)
- Passing score threshold
- Adaptive mode toggle
- Question type selection (8 types: conceptual, definition, procedure, comparison, application, analysis, numerical, troubleshooting)
- Unique session code generation (8 chars)

### 4. AI-Powered Question Generation
- Context-aware questions based on experiment content
- Adaptive difficulty adjustment based on performance
- Topic tracking (weak/strong areas)
- Multiple question types support
- Performance history integration

### 5. AI Answer Evaluation
- Score (0–10 scale)
- Correctness assessment
- Conceptual understanding depth
- Completeness evaluation
- Strengths identification
- Weaknesses identification
- Missing concepts detection
- Recommended difficulty adjustment

### 6. Adaptive Difficulty System
- Tracks topics covered, weak topics, strong topics
- Adjusts difficulty based on evaluation scores
- Per-evaluation difficulty snapshots
- Real-time performance feedback loop

### 7. AI Report Generation
- Overall score and percentage
- Pass/fail determination
- Category-wise performance breakdown
- Strong areas identification
- Weak areas identification
- Recommended revision topics
- Comprehensive summary

### 8. Student Session Management
- Session code-based join (no account needed)
- Session persistence in localStorage
- Real-time question/answer flow
- Automatic completion detection
- Session status tracking (ACTIVE/COMPLETED/ABANDONED)

### 9. Results & Analytics
- Teacher dashboard with aggregate stats
- Per-viva results with full Q&A detail
- Session-level score tracking
- Pass/fail status with configurable threshold

### 10. Admin Panel
- Pending teacher registration list
- Approve/reject teacher accounts
- Full admin access to system

### 11. AI Gateway Health Monitoring
- Connection status check
- Available models listing
- Gateway URL and model display

---

## User Flows

### Teacher Flow

```
Register (email + password)
    ↓
Wait for Admin Approval
    ↓
Login → Dashboard
    ↓
Create Viva → Upload PDF → Configure Settings
    ↓
Copy Session Code → Share with Students
    ↓
Monitor Results → Review Individual Sessions
    ↓
View Detailed Q&A Breakdown
```

### Student Flow

```
Receive Session Code from Teacher
    ↓
Navigate to /viva
    ↓
Enter Session Code + Name → Start Session
    ↓
Read Question → Type Answer → Submit
    ↓
Wait for Next Question → Repeat
    ↓
View Final Report (score, breakdown, recommendations)
```

### Admin Flow

```
Login → Dashboard
    ↓
Navigate to /dashboard/admin
    ↓
Review Pending Registrations
    ↓
Approve or Reject Teacher Accounts
```

---

## Configuration & Environment

### Environment Variables

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | `mysql://root:password@localhost:3306/ai_viva_examiner` |
| `AUTH_SECRET` | NextAuth session secret | `openssl rand -hex 32` |
| `AI_KEY` | TCET AI gateway API key | Your gateway key |
| `NEXTAUTH_URL` | Base URL for NextAuth | `http://localhost:3000` |

### Hardcoded Values

| Value | Location | Purpose |
|---|---|---|
| `https://ai.tcetcercd.in/v1` | `src/lib/ai/client.ts` | AI gateway URL |
| `qwen3.6` | `src/lib/ai/client.ts` | AI model name |
| `@tcetmumbai.in` | `src/lib/constants.ts` | Teacher email domain |
| `50%` | `src/app/dashboard/results/page.tsx` | Pass threshold |
| `admin@tcetmumbai.in` | `prisma/seed.js` | Default admin email |
| `159753` | `prisma/seed.js` | Default admin password |

### Key Config Files

| File | Purpose |
|---|---|
| `next.config.mjs` | Next.js configuration (default) |
| `tsconfig.json` | TypeScript: strict mode, `@/*` → `./src/*` |
| `tailwind.config.ts` | Custom dark theme, Inter/JetBrains Mono fonts |
| `postcss.config.mjs` | Tailwind PostCSS plugin |
| `.eslintrc.json` | ESLint: `next/core-web-vitals` + `next/typescript` |
| `prisma/schema.prisma` | Database schema definition |

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma db seed` | Seed database (admin user) |
| `npx prisma migrate dev` | Run migrations |
| `npx prisma studio` | Open Prisma Studio (database GUI) |

---

## Security Considerations

1. **Password Hashing** — bcryptjs with 12 rounds
2. **JWT Sessions** — Encrypted with AUTH_SECRET
3. **Domain Restriction** — Teacher emails validated to `@tcetmumbai.in`
4. **Admin Approval** — Teachers require explicit approval before access
5. **Ownership Checks** — Teachers can only access their own vivas
6. **Role-Based Access** — Admin endpoints verify ADMIN role
7. **PDF Validation** — File type and size limits (< 10MB)
8. **Client-Side Auth Gate** — Dashboard checks session via API call (no server-side middleware enforcement)

---

## Dependencies Summary

**Production (14):** @prisma/client, bcryptjs, clsx, mysql2, next, next-auth, openai, pdf2json, pdfkit, react, react-dom, tailwind-merge, uuid

**Dev (10):** @types/bcryptjs, @types/node, @types/react, @types/react-dom, @types/uuid, eslint, eslint-config-next, postcss, prisma, tailwindcss, typescript

---

*Generated for the VivaAI project — AI-Powered Adaptive Laboratory Viva Examination Platform*
