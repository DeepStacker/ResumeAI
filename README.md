# ResumeAI — ATS-Optimized Professional Resumes

![ResumeAI Builder](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

ResumeAI is a modern, full-stack Next.js application designed to help users craft highly professional, ATS-optimized resumes in seconds. The application utilizes deep-context AI to ensure that generated resumes, cover letters, and bullet points perfectly align with target job descriptions.

## 🚀 Key Features

*   **Deep Context-Aware AI Generation:** AI bullet rewriting, summary generation, and tech-stack auto-fill tools intelligently parse your active *Target Role* and *Job Description* to output high-value, ATS-friendly keywords.
*   **Real-time ATS Analytics:** Built-in ATS tracker evaluates your resume against job descriptions, calculating match scores and identifying missing keywords.
*   **Intuitive Drag-and-Drop Builder:** Easily reorder work experience, education, and projects on the fly without breaking external configurations. 
*   **Debounced Auto-Save:** Never lose your work. The builder silently synchronizes your drafts with the database automatically after 3.5 seconds of inactivity.
*   **Automated Cover Letters:** 1-click generation of tailored Cover Letters based exclusively on your finalized resume layout and target company.
*   **Sleek, High-Contrast UI:** Built on a custom Shadcn "London" aesthetic with full Dark/Light mode support, integrated Sonner slide-in notifications, and dynamic typography.
*   **Print-Perfect PDF Exports:** The custom rendering engine correctly maps modern CSS variables into PDFs without stripping formatting or colors.
*   **Secure & Auth-Ready:** User authentication, encrypted profiles, and secure public sharing links (`/r/[id]`).

## 🛠️ Tech Stack

*   **Framework:** [Next.js (App Router)](https://nextjs.org/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **Database:** PostgreSQL (Aiven)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **Generative AI:** OpenAI / Gemini SDKs (`ai-sdk`)
*   **Payments:** [Stripe](https://stripe.com/)
*   **UI Components:** Lucide React, Sonner (Toasts), Radix UI

## ⚙️ Local Development Setup

### 1. Prerequisites
*   Node.js 18+  
*   npm or pnpm  
*   A PostgreSQL Database instance  

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/resume-builder.git
cd resume-builder
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/defaultdb"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secure_random_string"

# AI Integration
OPENAI_API_KEY="your_openai_api_key"
# Google Gemini Alternative
# GEMINI_API_KEY="your_gemini_api_key"

# Stripe (Optional for local dev)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 5. Database Setup
Push the strict Prisma schema to your remote database to synchronize tables:
```bash
npm run setup
npx prisma db push
npx prisma generate
```

### 6. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

## 📁 Repository Structure

```text
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── scripts/                # Database and environment initialization scripts
├── src/
│   ├── app/                # Next.js App Router (Pages, API Routes)
│   │   ├── api/            # Backend endpoints (AI, Auth, Stripe, ATS)
│   │   └── builder/        # Main Resume Builder interface
│   ├── components/         # React Components (UI, Form Cards, Widgets)
│   ├── lib/                # Utility functions, validations, Stripe logic
│   ├── store/              # Zustand global state management
│   └── types/              # Global TypeScript interfaces
├── .env                    # Environment configurations
├── Tailwind.config.js      # Utility class generations
└── package.json            # Dependencies and npm scripts
```

## 🤝 Contributing

Contributions are completely welcome! Please feel free to submit a Pull Request.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
