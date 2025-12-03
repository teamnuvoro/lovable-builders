# 💜 Riya AI - Your Relationship Companion

<div align="center">

![Riya AI](https://img.shields.io/badge/Riya%20AI-Relationship%20Guidance-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)
![Vapi.ai](https://img.shields.io/badge/Vapi.ai-Voice%20AI-green?style=for-the-badge)

**An AI-powered mobile app designed for men seeking relationship guidance and companionship**

[📱 Features](#-features) • [🚀 Quick Start](#-quick-start) • [🎨 Design](#-design) • [📖 Documentation](#-documentation)

</div>

---

## 🌟 Overview

Riya AI is a mobile-first application that helps men understand their relationship preferences through AI-powered conversations in Hinglish. The app features real voice calling, personality analysis, and multiple AI assistants with unique personalities.

## ✨ Features

### 🎯 Core Functionality
- **Welcome Screen** - Full-screen Figma asset with Hinglish messaging
- **User Registration** - Clean form for name, email, and phone
- **AI Assistant Selection** - Netflix-style carousel with 4 unique personalities:
  - 🌸 **Riya** - Empathetic & Caring
  - 💪 **Priya** - Confident & Motivating
  - 👑 **Ananya** - Elegant & Wise
  - 🎉 **Maya** - Fun & Adventurous

### 💬 Chat Interface
- **WhatsApp-style bubbles** - Familiar chat experience
- **Hinglish support** - Better relatability for Indian users
- **Real-time messaging** - Instant text communication
- **Voice recording** - Send voice messages
- **Audio calls** - Real AI voice conversations (Vapi.ai)
- **Video calls** - Visual connection (UI ready)

### 📊 Relationship Analysis
- **"Analyze My Type"** - Detailed relationship breakdown
- **Personality Scores** - Visual charts with percentages
- **Problem Identification** - Key issues highlighted
- **Actionable Solutions** - Practical relationship advice
- **Emotional Insights** - Deep understanding of patterns

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/teamnuvoro/project1.git
cd project1

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## 🔧 Configuration

### Vapi.ai Voice Calling Setup

1. **Sign up** at [vapi.ai/signup](https://vapi.ai/signup)
2. **Get your Public Key** from the dashboard
3. **Update config** in `/config/vapi-config.ts`:

```typescript
export const VAPI_CONFIG = {
  publicKey: "YOUR_VAPI_PUBLIC_KEY_HERE", // Replace this
  assistantId: "auto-generated-per-call"
};
```

4. **Read detailed guide**: `/START_HERE.md`

### Environment (Optional)
Create `.env` file for additional configurations:
```env
VITE_VAPI_PUBLIC_KEY=your_key_here
```

## 🎨 Design

### Color Palette
- **Primary Gradient**: Purple → Pink → Rose
- **Background**: `from-pink-100 via-purple-100 to-orange-100`
- **CTA Buttons**: `from-purple-600 to-pink-500`
- **Chat Bubbles**: Purple (AI) / Gray (User)

### Mobile-First
- Optimized for **430px width** (iPhone 14 Pro Max)
- Responsive design principles
- Touch-friendly interactions
- Smooth animations and transitions

### Typography
- Hinglish messaging for relatability
- Clear hierarchy with custom font sizes
- Readable text over gradient backgrounds

## 📖 Documentation

| Document | Description |
|----------|-------------|
| `/DEPLOYMENT_GUIDE.md` | Complete deployment instructions |
| `/START_HERE.md` | Quick start for Vapi.ai integration |
| `/WHAT_TO_EXPECT.md` | Expected voice calling behavior |
| `/VAPI_API_INTEGRATION_GUIDE.md` | Detailed API integration guide |
| `/VAPI_TROUBLESHOOTING.md` | Audio troubleshooting steps |

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS 4.0 | Styling |
| Vapi.ai | AI voice calling |
| Vite | Build tool |
| Lucide React | Icons |
| React Slick | Carousel |
| Recharts | Analytics charts |
| Sonner | Toast notifications |

## 📁 Project Structure

```
/
├── App.tsx                          # Main entry point
├── config/
│   └── vapi-config.ts              # Vapi.ai configuration
├── components/
│   ├── AICarousel.tsx              # Assistant selection
│   ├── ChatScreen.tsx              # Chat interface
│   ├── AnalysisScreen.tsx          # Relationship analysis
│   ├── ProfileCreatedScreen.tsx    # Success screen
│   ├── SetupBanner.tsx             # Setup instructions
│   └── ui/                         # Reusable UI components
├── imports/                         # Figma assets
├── styles/
│   └── globals.css                 # Global styles
└── [Documentation Files]           # Guides and docs
```

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Or via dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Import repository
3. Deploy ✅

### Netlify
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repo
3. Deploy ✅

## 🎯 User Flow

1. **Welcome Screen** → See full-screen welcome image
2. **Registration** → Enter name, email, phone
3. **Success Screen** → Profile created confirmation
4. **AI Selection** → Swipe through carousel, select personality
5. **Chat Screen** → Start conversation in Hinglish
6. **Voice Calls** → Real AI audio conversations
7. **Analysis** → Get relationship insights and personality scores

## 🐛 Known Issues & Solutions

### Audio Not Working
- Check microphone permissions in browser
- Verify Vapi.ai API key is configured
- See `/VAPI_TROUBLESHOOTING.md`

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 🔒 Privacy & Security

- ⚠️ **Not for PII**: This app is not designed for collecting sensitive personal information
- 🔐 **API Keys**: Keep your Vapi.ai keys secure (use environment variables in production)
- 📱 **Client-Side**: All processing happens client-side for demo purposes

## 📈 Future Enhancements

- [ ] Backend integration (Supabase/Firebase)
- [ ] User authentication & profiles
- [ ] Chat history persistence
- [ ] Video calling functionality
- [ ] More AI personalities
- [ ] Regional language support
- [ ] Dating tips library
- [ ] Community features

## 👥 Team

**Team Nuvoro** - Building relationship tech for India

## 📄 License

Private - All rights reserved

## 🙏 Acknowledgments

- **Vapi.ai** - Voice AI infrastructure
- **Unsplash** - AI assistant photos
- **Lucide** - Beautiful icons
- **Tailwind** - Styling framework

---

<div align="center">

**Built with ❤️ for Indian men seeking meaningful relationships**

[⬆ Back to Top](#-riya-ai---your-relationship-companion)

</div>
