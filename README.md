# 🌱 Recycle Hub Viva - Sustainable Marketplace

A modern React-based marketplace application for buying and selling second-hand items, promoting sustainability and environmental consciousness. Built with Vite, Supabase, and integrated AI chat support.

## 🚀 Features

### Core Functionality
- **Marketplace**: Buy and sell second-hand items across multiple categories
- **User Authentication**: Complete auth system with Google OAuth and email/password
- **Product Management**: Add, edit, and manage product listings
- **Category-based Browsing**: Organized categories including plastic items, glass, electronics, furniture, and more
- **User Profiles**: User profiles with ratings, verification, and credit system
- **Search & Filter**: Advanced product search and filtering capabilities

### Smart Features
- **AI Chat Assistant**: Integrated AI-powered chat for customer support and product recommendations
- **Donation System**: Allow users to donate items instead of selling
- **Location Services**: Find recycling centers and nearby services
- **Email Notifications**: Automated email system for transactions and updates
- **Payment Integration**: PayPal integration for secure transactions
- **Admin Dashboard**: Administrative tools for platform management

### Technical Features
- **Dark/Light Theme**: Toggle between themes with persistent settings
- **Responsive Design**: Mobile-first responsive design
- **Real-time Updates**: Live notifications and updates
- **Image Upload**: Supabase storage integration for product images
- **Protected Routes**: Role-based access control
- **Progressive Web App**: PWA capabilities for mobile installation

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern features
- **Vite** - Lightning-fast build tool and development server
- **React Router DOM 7** - Client-side routing
- **Bootstrap Icons** - Icon library
- **React Hot Toast** - Elegant notifications

### Backend & Database
- **Supabase** - Backend-as-a-Service (Database, Auth, Storage, Real-time)
- **Node.js/Express** - Email server for contact forms
- **Nodemailer** - Email sending functionality

### AI & Integrations
- **Google Generative AI** - AI chat assistant powered by Gemini
- **PayPal SDK** - Payment processing
- **Google OAuth** - Social authentication

### Development Tools
- **ESLint** - Code linting
- **Concurrently** - Run multiple processes
- **Axios** - HTTP client
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
recycle-hub-viva/
├── public/                     # Static assets
│   ├── image/                 # Product and UI images
│   ├── email-templates/       # HTML email templates
│   └── manifest.json          # PWA manifest
├── server/                    # Express email server
│   └── emailServer.cjs        # Email service
├── src/
│   ├── auth/                  # Authentication components
│   │   ├── login/             # Login functionality
│   │   ├── register/          # User registration
│   │   ├── forgot-password/   # Password recovery
│   │   └── reset-password/    # Password reset
│   ├── components/            # Reusable components
│   │   ├── AIChat.js          # AI chat assistant
│   │   ├── Dashboard.js       # User dashboard
│   │   ├── PayPalPayment.js   # Payment integration
│   │   ├── Layout.js          # App layout wrapper
│   │   ├── Footer.js          # Site footer
│   │   └── ThemeToggle.js     # Dark/light mode toggle
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.js     # Authentication state
│   │   └── ThemeContext.js    # Theme management
│   ├── hooks/                 # Custom React hooks
│   │   └── useNotifications.js # Notification system
│   ├── lib/                   # Utility libraries
│   │   ├── supabase.js        # Supabase client
│   │   ├── productQueries.js  # Product database queries
│   │   ├── donationQueries.js # Donation system queries
│   │   └── storageHelpers.js  # File upload helpers
│   ├── styles/                # Global styles
│   │   └── themes.css         # Theme variables
│   └── [pages]/               # Page components
├── supabase-schema.sql        # Database schema
├── storage-policies.sql       # Storage bucket policies
├── admin.sql                  # Admin user setup
└── vercel.json               # Vercel deployment config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Email service credentials (Gmail/SMTP)
- Google AI API key (for AI chat)
- PayPal developer account (optional, for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/recycle-hub-viva.git
   cd recycle-hub-viva
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI Chat Configuration
   VITE_GEMINI_API_KEY=your_google_ai_api_key
   
   # Email Server Configuration
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=noreply@recyclehub.com
   
   # PayPal Configuration (Optional)
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
   ```

4. **Database Setup**
   - Run the SQL scripts in your Supabase SQL editor:
     ```bash
     # Execute in order:
     1. supabase-schema.sql    # Creates all tables and functions
     2. storage-policies.sql   # Sets up file storage policies
     3. admin.sql             # Creates admin user (optional)
     ```

5. **Storage Configuration**
   - Create a storage bucket named `product-images` in Supabase
   - Apply the storage policies from `storage-policies.sql`

### Development

1. **Start the development server**
   ```bash
   npm run dev
   ```
   This starts the Vite development server on `http://localhost:3000`

2. **Start with email server** (recommended)
   ```bash
   npm run dev-with-email
   ```
   This starts both the React app and the email server concurrently

3. **Email server only**
   ```bash
   npm run email-server
   ```
   Starts only the Express email server on port 8080

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Copy your project URL and anon key to `.env`
3. Execute the SQL scripts to set up the database schema
4. Configure authentication providers (Google OAuth, etc.)
5. Set up storage buckets and policies

### AI Chat Setup
1. Get a Google AI API key from Google AI Studio
2. Add the key to your `.env` file as `VITE_GEMINI_API_KEY`
3. The AI chat will be available in the bottom-right corner

### Email Service Setup
1. Use Gmail with an App Password or configure SMTP
2. Update the email credentials in `.env`
3. The email server handles contact forms and notifications

## 📱 Features in Detail

### User Authentication
- Email/password registration and login
- Google OAuth integration
- Password reset functionality
- Protected routes and role-based access

### Product Management
- Create, read, update, delete product listings
- Image upload with automatic optimization
- Category-based organization
- Advanced search and filtering

### AI Chat Assistant
- Product recommendations
- Customer support
- Platform guidance
- Real-time responses powered by Google's Gemini AI

### Payment System
- PayPal integration for secure transactions
- Credit-based system for transactions
- Manual payment verification for admin

### Responsive Design
- Mobile-first approach
- Dark/light theme toggle
- Bootstrap-based responsive grid
- Optimized for all device sizes

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Set up environment variables on your hosting platform

## 🔐 Security Features

- Row Level Security (RLS) enabled on all database tables
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Secure file upload with type validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Verify your Supabase URL and anon key
   - Check if RLS policies are properly configured

2. **AI Chat Not Working**
   - Ensure your Google AI API key is valid
   - Check the API quota and usage limits

3. **Email Server Issues**
   - Verify email credentials
   - Check firewall settings for port 8080

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for missing environment variables

### Getting Help

- Check the [Issues](https://github.com/yourusername/recycle-hub-viva/issues) page
- Create a new issue with detailed description
- Contact the maintainers

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social features and user reviews
- [ ] Enhanced AI recommendations
- [ ] Blockchain integration for transparency

---

**Built with ❤️ for a sustainable future** 🌱
