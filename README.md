# Horizon - Developer Portfolio

A full-stack developer portfolio application with skill management, testing, and personalized badge recommendations.

## Features

- **Profile Management**: Create and manage your developer profile 
- **Skill Testing**: Test your skills and earn verification badges
- **Badge System**: Earn badges based on your verified skills
- **CV Generation**: Generate and download a professional CV
- **Profile Sharing**: Share your developer profile with others
- **Animated Background**: Dynamic mesh gradient background with interactive elements

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, MongoDB
- **ML Service**: Flask, scikit-learn, pandas

## Installation

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MongoDB

### Quick Install

Run a single command to install all dependencies:

```bash
npm run install-all
```

This will install:
- Root project dependencies
- Backend dependencies
- Frontend dependencies
- ML component dependencies (Python packages)

### Manual Installation

If you prefer to install components separately:

1. **Install root dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Install backend dependencies**:
   ```bash
   cd server
   npm install --legacy-peer-deps
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

4. **Install ML dependencies**:
   ```bash
   cd ml
   pip install -r requirements.txt
   ```

## Running the Application

Start all services:

```bash
npm run run-all
```

This launches:
- Frontend on http://localhost:5173
- Backend on http://localhost:8080
- ML service on http://localhost:5000

You can also start services individually:

```bash
# Start backend only
npm run run-backend

# Start frontend only
npm run run-frontend

# Start ML service only
npm run run-ml
```

## Environment Variables

Create `.env` files for each component:

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/horizon
PORT=8080
JWT_SECRET=your-jwt-secret
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## Design Features

### Animated Background
The application features a dynamic animated background with:
- Mesh gradient elements that animate slowly
- Subtle grid pattern overlay
- Animated blobs with varying colors and delays
- Responsive design that adapts to all screen sizes

## License

This project is licensed under the ISC License. 