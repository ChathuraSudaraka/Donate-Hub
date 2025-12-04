# DonateHub 🎁

A platform for donating and requesting school supplies (books, pencils, and other school items) built with React, Vite, Tailwind CSS, and Supabase.

## Features

- **Home Page**: Landing page with information about the donation platform
- **Items Page**: Browse available donation items by category (books, pencils, school supplies)
- **Contact Page**: Contact form for inquiries
- **Request Item**: Authenticated users can request items they need
- **Admin Panel**: Admins can view/manage requests and add new items to inventory

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **Build Tool**: Vite
- **Backend**: Supabase (Auth, Database, Storage)
- **Notifications**: react-hot-toast
- **Routing**: react-router-dom

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Set up the database:**
   - Go to your Supabase project's SQL Editor
   - Run the contents of `supabase-schema.sql` to create tables and sample data

5. **Start the development server:**
   ```bash
   npm run dev
   ```

### Creating an Admin User

1. Sign up for an account through the app
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE user_profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

## Project Structure

```
src/
├── components/
│   ├── Footer.tsx
│   ├── Layout.tsx
│   └── Navbar.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── supabase.ts
├── pages/
│   ├── AdminPanel.tsx
│   ├── Contact.tsx
│   ├── Home.tsx
│   ├── Items.tsx
│   ├── Login.tsx
│   ├── RequestItem.tsx
│   └── SignUp.tsx
├── types/
│   └── database.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Database Schema

- **user_profiles**: User accounts with roles (user/admin)
- **donation_items**: Available items for donation
- **item_requests**: User requests for items

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
