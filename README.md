# Campus Navigation & Feedback Web App

## Architecture summary
- The app uses a React + Vite frontend and an Express + Mongoose backend.
- Authentication is JWT-based and routes are protected by role-aware middleware.
- The API currently covers auth, locations, canteen items, and feedback submission.

## Run locally
1. Copy [.env.example](.env.example) to .env and update the values.
2. Start MongoDB locally or provide a cloud MongoDB URI.
3. Install workspace dependencies:
   - npm install
4. Start the app:
   - npm run dev

## Backend verification
- npm --prefix server test

## Frontend verification
- npm --prefix client run build
# trail
