# VoiceFinance - Voice-Assisted Financial Manager

A modern, AI-powered financial management application that allows users to track transactions and manage finances using voice commands.

![VoiceFinance Login](./docs/login-preview.png)

## 🎯 Overview

VoiceFinance is a cross-platform application designed to revolutionize personal finance management through voice interactions. Built with privacy-first principles, all processing happens locally using open-source technologies.

## ✨ Features

### Current Implementation (Frontend + Backend)

- 🎨 **Beautiful Login Interface**: Modern, responsive design with Tailwind CSS
- 🔐 **Email Authentication**: Complete registration and login system
- ✅ **Email Verification**: 6-digit verification codes with expiration
- 🎙️ **Voice Mode Toggle**: Ready for Whisper integration
- 📱 **Responsive Design**: Mobile-first approach with desktop optimization
- 🔒 **Privacy Indicators**: Clear security and privacy messaging
- ⚡ **Fast Performance**: Built with Vite for optimal development experience
- 🔄 **Backend Integration**: FastAPI server with JWT authentication
- 🛡️ **Security Features**: Password hashing, token expiration, CORS protection

### Planned Features

- 🎙️ **Voice-to-Text**: OpenAI Whisper integration
- 🤖 **Natural Language Processing**: Mistral/LLaMA via Ollama
- 📊 **Smart Categorization**: AI-powered expense categorization
- 📈 **Financial Analytics**: Comprehensive spending insights
- 💾 **Local Data Storage**: PostgreSQL with privacy focus
- 🌐 **Cross-Platform**: React Native mobile app

## 🛠️ Tech Stack

### Frontend

- **React.js 19** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icons
- **JWT Authentication** - Secure token-based auth

### Backend (Implemented)

- **FastAPI** (Python) - High-performance API
- **JWT Authentication** - Secure token-based authentication
- **Bcrypt** - Password hashing and verification
- **Email Verification** - 6-digit verification codes
- **CORS Support** - Cross-origin resource sharing
- **Pydantic** - Data validation and serialization

### Planned Backend Features

- **PostgreSQL** - Reliable database
- **OpenAI Whisper** - Voice-to-text processing
- **Ollama** - Local LLM hosting (Mistral/LLaMA)

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- Python 3.8+ (for backend)
- npm or yarn

> **Note**: If you encounter `crypto.hash is not a function` error with newer Vite versions, the project uses Vite 5.4.0 for compatibility with Node.js 20.11.1+.

### Frontend Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd voice-assisted-financial-manager
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Start frontend development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Backend Installation

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv

   # On Windows
   venv\Scripts\activate

   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install backend dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the backend directory:

   ```env
   SECRET_KEY=your-super-secret-key-here
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

5. **Start backend server**

   ```bash
   python run.py
   ```

6. **Access API documentation**
   ```
   http://localhost:8000/docs
   ```

### Demo Credentials

- **Email**: `demo@voicefinance.com`
- **Password**: `demo123`

## 🎨 UI Components

### LoginPage

- Responsive split-layout design
- Feature showcase panel
- Voice mode toggle
- Form validation ready
- Privacy assurance section
- Error handling and loading states

### SignUpPage

- Multi-step registration process
- Email verification with 6-digit codes
- Password strength validation
- Resend verification code functionality
- Success confirmation screen

### Dashboard (Preview)

- Voice recording interface
- Transaction management
- Financial statistics
- Category insights
- Quick actions panel

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Troubleshooting

#### Vite Server Issues

If you encounter `crypto.hash is not a function` error:

```bash
npm install vite@^5.4.0 --save-dev
```

This ensures compatibility with Node.js versions 20.11.1+.

#### CSS Import Issues

If Tailwind CSS doesn't load properly, ensure:

1. Tailwind directives are in `src/index.css`
2. Content paths are configured in `tailwind.config.js`
3. PostCSS is properly configured

### Project Structure

```
src/
├── components/
│   ├── LoginPage.jsx
│   ├── Dashboard.jsx
│   └── LoadingSpinner.jsx
├── assets/
├── App.jsx
├── main.jsx
└── index.css
```

## 🎨 Design System

### Colors

- **Primary**: Blue gradient (500-800)
- **Success**: Green (500-600)
- **Accent**: Various contextual colors
- **Neutral**: Gray scale (50-900)

### Typography

- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components

- Rounded corners (lg, xl, 2xl)
- Subtle shadows and borders
- Smooth transitions and animations
- Focus rings for accessibility

## 🔒 Privacy & Security

- **Local Processing**: All data processed on user's device
- **No Third-Party APIs**: Avoids external data sharing
- **Open Source**: Transparent and auditable
- **User Control**: Complete data ownership

## 🗺️ Roadmap

### Phase 1: Frontend (Current) ✅

- [x] Login page design
- [x] Dashboard layout
- [x] Responsive design
- [x] Component structure

### Phase 2: Backend Integration ✅

- [x] FastAPI server setup
- [x] JWT authentication system
- [x] Email verification system
- [x] API endpoints
- [x] Password hashing and security
- [x] CORS configuration

### Phase 3: Database Integration

- [ ] PostgreSQL database setup
- [ ] User data persistence
- [ ] Transaction storage
- [ ] Data migration system

### Phase 4: Voice Features

- [ ] Whisper integration
- [ ] Voice command processing
- [ ] LLM integration (Ollama)
- [ ] Natural language understanding

### Phase 5: Advanced Features

- [ ] Data visualization
- [ ] Export functionality
- [ ] Mobile app (React Native)
- [ ] Offline capabilities

## 🤝 Contributing

This project is currently in active development. Once the core features are complete, contribution guidelines will be added.

## 🚀 Deployment

### Vercel Deployment (Recommended)

This project is optimized for Vercel deployment with automatic builds and environment variable management.

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/voice-assisted-financial-manager&project-name=voicefinance&repository-name=voicefinance)

#### Manual Deployment

1. **Push to GitHub/GitLab/Bitbucket**
2. **Import project in Vercel dashboard**
3. **Set environment variables:**
   - `VITE_GROQ_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_DB_PASSWORD`
4. **Deploy automatically**

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

### Local Development

```bash
npm install
npm run dev
```

## 📄 License

This project will be released under an open-source license (TBD).

## 👨‍💻 Developer

Developed as part of a collaborative project focusing on modern financial management solutions.

---

**Note**: This project now includes a complete authentication system with email verification, voice-to-text capabilities, and is ready for production deployment on Vercel.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
