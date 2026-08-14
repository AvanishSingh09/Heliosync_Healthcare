# Heliosync Healthcare Platform

> **A three-sided healthcare management system with patient-controlled medical record access and consent governance.**

---

## 📖 Overview

**Heliosync Healthcare Platform** bridges Patients, Medical Practitioners, and Hospital Administrators into a synchronized clinical network. 

The platform’s core differentiator is **Patient-Governed Access Control**: patients retain complete sovereignty over their medical history. When booking an appointment or consulting a specialist, the patient selects granular data-sharing scopes (`Consultation Notes`, `Biomarkers & Vitals`, `Prescription History`, `Lab Reports & Scans`). The system enforces these scopes at the database and API layer, allowing doctors to view only authorized records while documenting new encounters and issuing digital prescriptions that feed back into the patient’s longitudinal medical timeline.

---

## ✨ Key Features

### 👤 Patient Portal
* **Doctor Discovery & Booking**: Search practitioners by specialty, hospital, or consultation fee.
* **Granular Consent Configuration**: Select which record types a doctor can access (`canViewHistory`, `canViewVitals`, `canViewPrescriptions`, `canViewReports`).
* **Longitudinal Medical Timeline**: Chronological, aggregated ledger of clinical encounters, vitals, prescriptions, and lab tests.
* **Real-time Consent Management**: Instant single-click access revocation.
* **Biomarker Logs**: Historical trends for Blood Pressure, Heart Rate, SpO2, Temperature, and Weight.
* **Document Locker**: Upload and view diagnostic test reports (PDFs, scans, imaging).

### 🩺 Doctor Workspace
* **OPD Consultation Queue**: Daily consultation schedule and real-time waiting patient queue.
* **Consent-Gated Patient Records**: Secure access viewer that visually flags authorized vs. restricted medical scopes.
* **Clinical Consultation Workspace**: Structured clinical documentation (Chief Complaint, Symptoms, Diagnosis, Examination Notes, Treatment Plan).
* **Vitals Recording**: Rapid entry of vital parameters during encounters.
* **Interactive Prescription Builder**: Multi-item medication ordering with dosages, frequencies, durations, and instructions.

### 🏥 Hospital Administration
* **OPD Token Queue**: Real-time patient token generation, receptionist check-in, and status flow (`Confirmed` → `In Queue` → `Completed`).
* **Hospital Analytics**: Operational metrics tracking active doctors, waiting patients, completed consultations, and estimated OPD revenue.
* **Medical Staff Roster**: Consultant credentials, registration IDs, and department fees.
* **Patient Registry**: Master database of registered patients, demographics, and visit counts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, React Router v6, Axios |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, JWT, bcryptjs, Multer |
| **Database** | MongoDB (Native collections & replica set transaction support) |
| **Styling** | Vanilla Tailwind CSS (Custom theme tokens, glassmorphism, responsive design) |

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js**: v18 or higher (v20+ recommended)
* **npm**: v9+
* **MongoDB**: Local MongoDB instance or MongoDB Atlas connection string

### 1. Clone & Configure Environment

```bash
# Clone the repository
git clone https://github.com/your-username/hospital_management_project.git
cd hospital_management_project
```

#### Backend Environment (`backend/.env`):
```env
DATABASE_URL="mongodb://127.0.0.1:27018/heliosync?replicaSet=rs0&directConnection=true"
JWT_SECRET="your-super-secret-jwt-key-2026"
PORT=5000
UPLOAD_DIR="./uploads"
```

#### Frontend Environment (`frontend/.env`):
```env
VITE_API_URL="http://localhost:5000/api"
```

---

### 2. Install & Run Database

```bash
# Navigate to backend
cd backend
npm install

# Push database schema to MongoDB
npx prisma db push

# Seed realistic healthcare data (Doctors, Hospital, Patients, Timeline)
npm run seed

# Start backend server
npm run dev
```
*Backend API will run at `http://localhost:5000`*

---

### 3. Start Frontend

```bash
# Open a new terminal and navigate to frontend
cd frontend
npm install
npm run dev
```
*Frontend Web Application will open at `http://localhost:3000`*

---

### ⚡ One-Click Startup (Windows)
Double-click **`start-all.bat`** in the root directory to automatically launch MongoDB, the Backend API, and the Frontend application together.

---

## 🔑 Demo Credentials

Password for all preloaded demo accounts: **`password123`**

| Role | Email | Name / Details |
| :--- | :--- | :--- |
| **Patient** | `patient@heliosync.demo` | **Rahul Kumar** (Preloaded with 3 consultations, 5 vitals, 2 prescriptions, 2 reports) |
| **Doctor** | `doctor@heliosync.demo` | **Dr. Ankit Sharma** (Cardiology Consultant, ABC Hospital) |
| **Hospital Admin** | `hospital@heliosync.demo` | **Rajesh Malhotra** (ABC Multispeciality Hospital) |

> 💡 *The login page includes 1-click demo role switcher buttons to test each portal effortlessly.*

---

## 🌐 Production Deployment Guide

### Option 1: Deploy Backend on Render / Railway / Fly.io

1. **Database (MongoDB Atlas)**:
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Obtain your connection URI: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/heliosync?retryWrites=true&w=majority`.

2. **Deploy Backend Service**:
   - Set **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `node dist/server.js`
   - **Environment Variables**:
     - `DATABASE_URL`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random secret string
     - `PORT`: `5000` (or leave default for platform)

---

### Option 2: Deploy Frontend on Vercel / Netlify

1. **Deploy Web App**:
   - Set **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL`: `https://your-backend-api-url.onrender.com/api`

---

## 📂 Project Structure

```text
hospital_management_project/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models with MongoDB ObjectID mappings
│   │   └── seed.ts             # Demo dataset seeder
│   ├── src/
│   │   ├── config/             # Environment & Prisma client setup
│   │   ├── controllers/        # Auth, Patient, Doctor, Encounter, Consent, Hospital
│   │   ├── middleware/         # JWT auth, role validation, error handlers
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Consent governance engine & Audit service
│   │   ├── app.ts              # Express configuration
│   │   └── server.ts           # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Header with Live Search & Notifications, Sidebar
│   │   │   ├── consent/        # ConsentConfigModal, ConsentStatusCard
│   │   │   ├── medical/        # ConsultationWorkspace, Timeline, PrescriptionCard
│   │   │   ├── appointments/   # DoctorCard, BookingModal
│   │   │   └── ui/             # Card, Badge, Button, Input, Modal, Tabs
│   │   ├── context/            # AuthContext with session persistence
│   │   ├── layouts/            # PatientLayout, DoctorLayout, HospitalLayout
│   │   ├── pages/              # Role-specific dashboard and feature pages
│   │   ├── services/           # Typed Axios API clients
│   │   ├── types/              # Frontend TypeScript definitions
│   │   ├── App.tsx             # Route declarations
│   │   └── main.tsx            # React application root
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── start-all.bat               # Windows all-in-one launcher
├── README.md                   # Project documentation
└── .gitignore                  # Git ignore rules
```

---

## 🔒 Security & Privacy Notes

* **Consent Enforcement**: Scoped access checks are evaluated at the database query layer prior to returning confidential data.
* **Cryptographic Hashing**: All passwords are salted and hashed with `bcryptjs`.
* **Immutable Audit Trail**: Every sensitive record access and consent update produces an `AuditLog` entry.

---

## 📄 License
This project is licensed under the MIT License.
