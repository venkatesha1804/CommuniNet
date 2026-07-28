# CommuNet Platform

![CommuNet Banner](public/logo.png) <!-- Will fallback gracefully if no logo exists -->

A comprehensive, secure, and modern community platform designed to connect members, promote global businesses, effortlessly manage events, and provide career & mentorship opportunities within the CommuNet ecosystem.

## 🌟 Key Features

### 🤝 Community & Social
- **Global Social Feed**: Share updates, events, and business news. Interact via likes, comments, and sharing.
- **Member Directory**: Find and connect with verified community members locally and globally.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.

### 🏢 Business & Events
- **Business Directory**: Promote and discover community-owned businesses with advanced filtering by category and location.
- **Event Management**: Create, browse, and RSVP to community gatherings, webinars, and local meetups.

### 🎓 Career & Growth
- **Job Board**: Post and apply to job openings and internships within the community network.
- **Mentorship Program**: Connect experienced professionals with members seeking guidance in various industries.
- **Scholarships**: Discover and apply for educational grants funded by community trusts.

### 🛡️ Admin & Moderation Hub
- **Unified Command Center**: A secure admin portal to manage users, approve business/job listings, and oversee platform activity.
- **Content Moderation & Reporting**: robust system for members to report inappropriate content, allowing admins to soft-delete or dismiss reports.
- **Financial Tracking**: Track community donations and generate transparency reports.

---

## 💻 Technology Stack

This project is built with a modern, scalable web architecture:

- **Frontend Core**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom utility design systems
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/), Tailwind Variants
- **Database**: [PostgreSQL](https://www.postgresql.org/) managed via [Neon.tech](https://neon.tech/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (Email/Password & Google OAuth)
- **Media Storage**: [Cloudinary](https://cloudinary.com/) (Profile pictures) & [Firebase Storage](https://firebase.google.com/docs/storage) (General media attachments)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

Ensure you have the following installed on your local machine:
- Node.js (v18 or higher)
- npm, yarn, or pnpm
- A PostgreSQL database instance (Neon, Supabase, or local)
- A Firebase Project (with Auth & Storage enabled)
- A Cloudinary Account

### 1. Clone & Install

```bash
git clone https://github.com/your-org/CommuNet.git
cd CommuNet/web
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the `/web` directory. Use the following template and fill in your specific credentials:

```env
# Database
DATABASE_URL="postgres://user:password@hostname/dbname?sslmode=require"

# Firebase Client Configuration (Found in Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"

# Firebase Admin Configuration (For Backend Verification)
FIREBASE_PROJECT_ID="your_project_id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your_project_id.iam.gserviceaccount.com"
# Important: Format the private key correctly. If setting inside a UI like Render, just paste the raw key.
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 3. Database Setup

Push the Prisma schema to your database to create the necessary tables:

```bash
npx prisma db push
```

Generate the Prisma client:

```bash
npx prisma generate
```

(Optional) Seed the database with initial dummy data and an admin user. **Warning**: You must have a Firebase user with `admin@communet.com` / `password123` manually created in your Firebase console first for the dummy admin to be fully usable.

```bash
npm run prisma db seed
# Or
npx tsx scripts/seed-admin.ts
```

### 4. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

- `/src/app`: Next.js App Router pages and API routes (`/api`).
- `/src/components`: Reusable React components UI components, forms, layout elements.
- `/src/lib`: Core utilities (Auth context, Firebase config, Cloudinary config, Prisma client).
- `/prisma`: Database schema and seed scripts.
- `/public`: Static assets (images, fonts).
- `/docs`: Additional technical and testing documentation.

## 🤝 Contribution

Contributions are welcome! Please ensure you create a feature branch, adhere to the existing code style, and thoroughly test responsive layouts before submitting a Pull Request.

## 📄 License

© 2026 CommuNet Platform. All rights reserved. Not for commercial use.
