## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Node.js Installation

This project requires **Node.js version 18.17 or higher**. Here's how to install it:

#### Option 1: Download from Official Website (Recommended)

1. Visit [nodejs.org](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** version for your operating system
3. Run the installer and follow the setup wizard
4. Restart your terminal/command prompt after installation

### Verify Installation

After installation, verify that Node.js and npm are properly installed:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version
```

You should see output similar to:

```
v18.17.0
9.6.7
```

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone <your-repository-url>
   cd headstart
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up your environment variables:**

   - Create a `.env.local` file in the root directory
   - Add your Clerk and Convex credentials (see Environment Setup section below)

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Backend
CLERK_JWT_ISSUER_DOMAIN
NEXT_PUBLIC_CLERK_FRONTEND_API_URL
```

**Note**: Replace the placeholder values with your actual Clerk and Convex credentials. You can obtain these from your respective dashboard accounts.

## Project Structure

```
src/
├── app/
│   ├── signup/          # User onboarding page
│   ├── layout.tsx       # Root layout with auth
│   └── page.tsx         # Main dashboard
├── components/
│   ├── ui/              # UI components
│   ├── AuthGuard.tsx    # Authentication guards
│   ├── UserSync.tsx     # User data synchronization
│   └── LandingPage.tsx  # Landing page for visitors
└── middleware.ts         # Clerk middleware
```

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript
- **Authentication**: Clerk
- **Backend**: Convex
- **Styling**: Tailwind CSS
- **Database**: Convex (built on top of PostgreSQL)
