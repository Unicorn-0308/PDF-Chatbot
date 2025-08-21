# ThinkAI - Advanced RAG AI Chat Application

A production-ready AI chat application with Retrieval-Augmented Generation (RAG) capabilities, PDF document analysis, real-time streaming responses, and comprehensive admin dashboard. Built with Next.js 14, OpenAI, Pinecone, MongoDB, and modern UI components.

## Features

### For Users
- 🤖 AI-powered chat interface with streaming responses
- 📄 PDF source citations with page references
- 🎤 Voice input support
- 👍 Like/Dislike feedback system
- 🔊 Text-to-speech functionality
- 📤 Share and copy responses
- 🌓 Light/Dark theme support

### For Admins
- 📊 Analytics dashboard with real-time statistics
- 🧠 AI model management (GPT-4, GPT-3.5, Claude, etc.)
- 📁 PDF document upload and management
- 👥 User management and monitoring
- ⚙️ System configuration and settings
- 📈 Usage analytics and insights

## Tech Stack

### Frontend
- **Framework**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **Charts**: Recharts for data visualization
- **PDF Rendering**: React-PDF for document display
- **State Management**: Zustand, React Query

### Backend & AI
- **AI Models**: OpenAI GPT-4/GPT-3.5 Turbo
- **Vector Database**: Pinecone for embeddings storage
- **RAG Framework**: LangChain for document processing
- **Database**: MongoDB for user data and analytics
- **Authentication**: JWT-based authentication
- **Streaming**: Server-Sent Events (SSE) for real-time responses

### AI Features
- **PDF Processing**: Automatic text extraction and chunking
- **Embeddings**: OpenAI text-embedding-3-small
- **Semantic Search**: Vector similarity search with Pinecone
- **Context Retrieval**: Top-K relevant document chunks
- **Streaming Responses**: Real-time token streaming

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- OpenAI API key
- Pinecone account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd think-ai
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/thinkai
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thinkai

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=ThinkAI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication

### Sign Up
New users can create an account through the sign-up page (`/signup`) with:
- Full name (minimum 2 characters)
- Valid email address
- Strong password (minimum 6 characters, must contain uppercase, lowercase, and numbers)

### Demo Credentials

For testing purposes, you can use these demo credentials:

**User Account:**
- Email: `user@thinkai.com`
- Password: `demo123`

**Admin Account:**
- Email: `admin@thinkai.com`
- Password: `demo123`

## Project Structure

```
think-ai/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/             # API routes
│   │   ├── admin/           # Admin dashboard
│   │   ├── chat/            # User chat interface
│   │   ├── login/           # Login page
│   │   ├── signup/          # Sign-up page
│   │   └── page.tsx         # Landing page
│   ├── components/          # React components
│   │   ├── ui/             # UI components (Button, Card, etc.)
│   │   └── providers/      # Context providers
│   ├── contexts/           # React contexts
│   ├── lib/                # Utility functions
│   │   ├── auth.ts         # Authentication utilities
│   │   ├── mongodb.ts      # MongoDB connection
│   │   └── utils.ts        # Helper functions
│   └── middleware.ts       # Next.js middleware for auth
├── public/                 # Static assets
├── .env.local             # Environment variables (create this)
├── package.json           # Dependencies
└── README.md             # This file
```

## Authentication Flow

1. **Landing Page** (`/`): Introduction with Sign In and Create Account buttons
2. **Sign Up Page** (`/signup`): Registration form with validation
   - Name validation (minimum 2 characters)
   - Email validation (valid format, unique)
   - Password strength requirements
   - Real-time password strength indicator
3. **Login Page** (`/login`): Authentication form
4. **Role-based Routing**:
   - Admin users → `/admin` dashboard
   - Regular users → `/chat` interface
5. **Protected Routes**: Middleware ensures authentication

## MongoDB Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: "user" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

### Future Collections
- `documents`: PDF metadata and embeddings
- `conversations`: Chat history
- `analytics`: Usage statistics

## API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user

### Chat & AI
- `POST /api/chat` - Send message and get AI response (SSE streaming)
- `POST /api/chat/feedback` - Submit feedback for responses

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PATCH /api/admin/users/[userId]/role` - Update user role (admin only)
- `POST /api/admin/documents/upload` - Upload PDF documents (admin only)
- `GET /api/admin/analytics` - Get analytics data (admin only)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
# Dockerfile example (to be created)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@thinkai.com or open an issue in the repository.

## Roadmap

- [ ] Implement real OpenAI API integration
- [ ] Add PDF processing with LangChain
- [ ] Implement vector database for embeddings
- [ ] Add real-time WebSocket support
- [ ] Create mobile responsive improvements
- [ ] Add multi-language support
- [ ] Implement user registration
- [ ] Add email notifications
- [ ] Create API documentation
- [ ] Add testing suite

## Acknowledgments

- Next.js team for the amazing framework
- Radix UI for accessible components
- Tailwind CSS for utility-first styling
- OpenAI for AI capabilities