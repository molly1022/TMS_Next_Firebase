# Task Management Application

## A modern task management application built with Next.js, Firebase, and Tailwind CSS.

[Preview](https://todo-kohl-pi-23.vercel.app/landing)

### Features
- 📝 Create and manage task lists
- ✅ Track task completion
- 🎯 Set due dates and deadlines
- 🌓 Light/Dark mode support
- 👤 User authentication
- 🔄 Real-time updates

### Tech Stack
- **Frontend:** Next.js 14
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Context
- **Date Handling:** Moment.js
- **Icons:** Lucide Icons

---

## Getting Started

### Install dependencies:
```bash
npm install
```

### Set up environment variables:
Create a `.env.local` file with the following Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Run development server:
```bash
npm run dev
```

---

## Project Structure
- **app**: Next.js app router pages
- **components**: Reusable React components
- **context**: React context providers
- **lib**: Utility functions
- **public**: Static assets

---

## Key Features

### Authentication
- User registration with email and password
- Login functionality
- Protected routes

### Task Management
- Create new task lists
- Add tasks with titles and due dates
- Mark tasks as complete
- Delete task lists
- Real-time updates for task status

### UI/UX Features
- Responsive design
- Theme switching (light/dark mode)
- Toast notifications
- Loading states
- Emoji picker for task lists

---

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

---

## Dependencies

Key packages used:
- `@radix-ui/*` - Accessible UI primitives
- `firebase` - Backend and authentication
- `moment` - Date manipulation
- `next-themes` - Theme management
- `sonner` - Toast notifications
- `uuid` - Unique ID generation

---

## License

Private project - All rights reserved

---

## TODO
- Add login functionality
