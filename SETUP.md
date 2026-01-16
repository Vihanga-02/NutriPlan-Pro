# NutriPlan Pro - Setup Guide

This guide will help you set up and run the NutriPlan Pro application with Firebase Authentication and PostgreSQL database.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher) with pgAdmin
- Firebase project with Authentication and Storage enabled
- Google Cloud account (for Gemini AI - optional)

## Database Setup

1. Open pgAdmin and create a new database named `restaurant`
2. Execute the SQL schema file located at `client/database/schema.sql`
   - This will create all necessary tables, indexes, triggers, and sample data
3. The database connection URL format is: `postgres://username:password@host:port/database`

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google Sign-in provider
4. Enable Storage:
   - Go to Storage > Get Started
   - Set up security rules (use default for development)
5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Copy your web app configuration
6. Generate Service Account Key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

## Environment Variables

### Server (.env file in `server/` folder)

Create a `.env` file in the `server/` directory:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL Database
DATABASE_URL=postgres://postgres:12345@localhost:5432/restaurant

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Gemini AI (Optional)
GEMINI_API_KEY=your-gemini-api-key
```

**Important:** For `FIREBASE_PRIVATE_KEY`, copy the entire private key from your service account JSON file, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines. Keep the `\n` characters as they are.

### Client (.env file in `client/` folder)

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api

VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Installation

### Server Setup

```bash
cd server
npm install
```

### Client Setup

```bash
cd client
npm install
```

## Running the Application

### Start the Server

```bash
cd server
npm run dev
```

The server will run on `http://localhost:5000`

### Start the Client

```bash
cd client
npm run dev
```

The client will run on `http://localhost:5173`

## Features Implemented

✅ Firebase Authentication (Email/Password & Google Sign-in)
✅ PostgreSQL Database Integration
✅ Firebase Storage for Image Uploads
✅ AI Chatbot (Gemini AI integration)
✅ Meal Plan Generation
✅ Health Profile Management
✅ Food Management (Admin)
✅ Order Management
✅ Real-time API Integration

## Default Accounts

After running the schema, you can use these test accounts (if you set them up in Firebase):

- **Admin:** admin@nutriplan.com
- **User:** user@nutriplan.com

Note: These are database entries. Actual authentication is handled by Firebase, so you'll need to create these users in Firebase Authentication console or use Google Sign-in.

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format in `.env` (should be: postgres://user:password@host:port/database)
- Ensure database `restaurant` exists

### Firebase Authentication Issues
- Verify Firebase configuration in client `.env`
- Check Firebase Authentication is enabled in Firebase Console
- Ensure service account key is correctly formatted in server `.env`

### Image Upload Issues
- Verify Firebase Storage is enabled
- Check Storage security rules allow uploads
- Ensure Firebase Storage bucket name matches in client `.env`

### API Connection Issues
- Verify server is running on port 3001
- Check CORS settings in server
- Verify `VITE_API_URL` in client `.env` matches server URL

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── admin/         # Admin components
│   │   ├── components/    # Shared components
│   │   ├── config/         # Firebase config
│   │   ├── context/        # React context (Auth)
│   │   ├── lib/            # API client
│   │   └── pages/          # Page components
│   └── database/           # SQL schema
│
└── server/                 # Express backend
    ├── config/             # Database, Firebase Admin, Gemini
    ├── controllers/        # Route controllers
    ├── middleware/         # Auth middleware
    ├── models/             # Database models
    ├── routes/             # API routes
    └── services/            # AI services
```

## Next Steps

1. Set up your Firebase project
2. Configure environment variables
3. Run database schema
4. Install dependencies
5. Start both server and client
6. Test authentication and features

For questions or issues, check the code comments or review the implementation details in each file.

