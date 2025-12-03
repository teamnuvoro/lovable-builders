# 🚀 Riya AI - Deployment Guide

## 📁 Repository Structure
This repository contains the complete Riya AI mobile app with all UI/UX components and dependencies.

## 📦 What's Included

### Core Files
- `/App.tsx` - Main application entry point with welcome screen
- `/styles/globals.css` - Global styles and Tailwind configuration
- `/index.html` - HTML entry point

### Components (`/components/`)
- `AICarousel.tsx` - Netflix-style AI assistant selection carousel
- `ChatScreen.tsx` - WhatsApp-style chat interface with Hinglish support
- `AnalysisScreen.tsx` - Relationship analysis with personality scores
- `ProfileCreatedScreen.tsx` - Success screen after registration
- `SetupBanner.tsx` - Vapi.ai setup instructions banner
- `ui/` - Reusable UI components (Button, Input, Label, etc.)

### Configuration (`/config/`)
- `vapi-config.ts` - Vapi.ai voice calling configuration

### Documentation
- `START_HERE.md` - Quick start guide for Vapi.ai integration
- `WHAT_TO_EXPECT.md` - Expected behavior with real voice calling
- `VAPI_API_INTEGRATION_GUIDE.md` - Detailed API integration guide
- `VAPI_TROUBLESHOOTING.md` - Audio troubleshooting guide

### Assets (`/imports/`)
- Figma imported SVGs and images
- Welcome screen background image

## 🛠️ Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Vapi.ai** - Real AI voice calling
- **Lucide React** - Icons
- **React Slick** - Carousel
- **Sonner** - Toast notifications
- **Recharts** - Analytics charts

## 📥 Installation

```bash
# Clone the repository
git clone https://github.com/teamnuvoro/project1.git
cd project1

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔑 Configuration Required

### 1. Vapi.ai Setup (for voice calling)
1. Sign up at [vapi.ai](https://vapi.ai/signup)
2. Get your Public Key from dashboard
3. Update `/config/vapi-config.ts`:
   ```typescript
   export const VAPI_CONFIG = {
     publicKey: "YOUR_VAPI_PUBLIC_KEY_HERE"
   };
   ```
4. Read `/START_HERE.md` for detailed steps

## 🚀 Deployment

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts
```

Or use the Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Click Deploy

### Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Click Deploy

## 🌐 Live URL
Once deployed, your app will be available at:
- Vercel: `https://project1.vercel.app`
- Netlify: `https://project1.netlify.app`
- Custom domain: Configure in platform settings

## 📱 Features

✅ Mobile-first design (430px optimized)
✅ Vibrant gradient backgrounds (purple, pink, rose)
✅ Full-screen welcome with Figma asset
✅ User registration flow
✅ Netflix-style AI assistant carousel
✅ WhatsApp-style chat interface
✅ Hinglish conversation support
✅ Real AI voice calling (Vapi.ai)
✅ Video call, audio call, voice recording
✅ "Analyze My Type" relationship insights
✅ Personality scores and problem identification
✅ Responsive design

## 🐛 Troubleshooting

### Voice Calling Issues
- See `/VAPI_TROUBLESHOOTING.md`
- Check browser microphone permissions
- Verify Vapi.ai API key is configured

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues or questions:
- Check documentation files in `/` directory
- Review Vapi.ai docs: [docs.vapi.ai](https://docs.vapi.ai)
- Contact: teamnuvoro

## 📄 License

Private - Team Nuvoro

---

**Built with ❤️ for Indian men seeking relationship guidance**
