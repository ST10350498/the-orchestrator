# 🎼 The Orchestrator

Your personal academic orchestration system. Track projects, deadlines, AI scores, and progress. Get weekly coaching reports. Never drift.

## Features

- **📊 Dashboard** – See all your projects, progress, and today's schedule at a glance
- **📋 Projects** – Track assignments, exams, and personal projects with deadlines
- **🤖 AI Guard** – Test your writing for AI detection with instant humanization
- **📅 Schedule** – Auto-generated daily plan based on your available hours
- **📝 Portfolio** – Auto-generated CV bullets from completed work
- **📬 Coaching** – Weekly reports with personalized feedback
- **⚙️ Settings** – Customize your hours and preferences

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: JWT

## Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/ST10350498/the-orchestrator.git
cd the-orchestrator

# Start with Docker (recommended)
docker-compose up -d

# Or run locally
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev