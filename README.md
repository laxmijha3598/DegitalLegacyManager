# Digital Legacy Manager (MERN)

This repository contains:

- `backend/`: Node.js + Express.js API with MongoDB (Mongoose)
- `frontend/`: React.js web app (Vite)
- `REPORT.md`: college submission report (edit your name/roll no.)

## Quick start (Windows / bash)

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed:admin
npm run dev
```

Backend runs on `http://localhost:4000`.

### 2) Frontend

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Notes

- File uploads are stored locally in `backend/uploads/` (for college demo).
- “AI Reminder system” is implemented as a **smart reminder simulation**: scheduled checks + templated messages + notification log.

