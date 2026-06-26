# MVPMMSHOP

Game Top Up Platform built with:
- **Backend**: NestJS, Prisma ORM, PostgreSQL
- **Frontend**: Next.js, React
- **Mobile App**: React Native (Android & iOS)

## Project Structure
```
MVPMMSHOP/
├── backend/      - NestJS API Server
├── frontend/     - Next.js Web App (Website & Admin Dashboard)
├── mobile/       - React Native Mobile App
└── shared/       - Shared code/types
```

## Getting Started

### 1. Install Dependencies
```bash
# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../mobile && npm install
```

### 2. Database Setup
- Create PostgreSQL database named `mvpmms`
- Update backend/.env with your DATABASE_URL
- Run Prisma migrations: `cd backend && npx prisma migrate dev`

### 3. Run the Apps

#### Backend API
```bash
cd backend && npm run start:dev
```
Runs at http://localhost:3001

#### Frontend Web App
```bash
cd frontend && npm run dev
```
Runs at http://localhost:3000

#### Mobile App
```bash
cd mobile && npm start
```
Then run on Android/iOS
