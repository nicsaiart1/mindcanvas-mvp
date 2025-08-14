# MindCanvas MVP 🎯

**AI-powered canvas workspace where users spawn "Intentions" through voice/touch that generate autonomous AI tasks.**

## 🚀 Current Status: Phase 1 Complete

✅ **Core Canvas & Voice Input** - Fully implemented and functional!

### Features Implemented

#### 🎨 Interactive Canvas
- **Click-to-create**: Click anywhere on the canvas to spawn a new intention
- **Infinite canvas**: Zoom and pan controls with smooth animations
- **Drag & drop**: Move intentions and tasks around the canvas freely
- **Visual feedback**: Real-time status indicators and smooth transitions

#### 🎤 Voice Recognition
- **Web Speech API**: Native browser voice recognition support
- **Real-time transcription**: Live voice-to-text with visual feedback
- **Audio visualization**: Animated microphone and wave indicators
- **Cross-browser support**: Works in Chrome, Edge, and Safari

#### 🎯 Intention Management
- **Smart status flow**: listening → processing → active → fulfilled
- **Visual status system**: Color-coded borders and animated icons
- **Progress tracking**: AI processing progress bars and task counters
- **Expandable cards**: Clean, minimal interface with expand/collapse

#### ⚡ Task Generation Ready
- **Task cards**: Pre-built components for AI-generated tasks
- **Hierarchical layout**: Tasks appear connected to parent intentions
- **Status management**: spawning → executing → completed workflow
- **Action buttons**: Interactive controls for task progression

#### 🛠 Technical Foundation
- **TypeScript**: Full type safety with comprehensive interfaces
- **Zustand**: Lightweight state management for canvas and intentions
- **Framer Motion**: Smooth animations and gesture handling
- **Tailwind CSS**: Modern, responsive design system

## 🏃‍♂️ Quick Start

```bash
# Clone the repository
git clone https://github.com/nicsaiart1/mindcanvas-mvp.git
cd mindcanvas-mvp

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 🔧 Prerequisites
- **Node.js** 16+ 
- **Modern browser** with Web Speech API support (Chrome, Edge, Safari)
- **Microphone access** for voice input functionality

## 🎮 How to Use

1. **Open the app** - You'll see an empty canvas with a gradient background
2. **Click anywhere** - This creates a new "intention" card
3. **Speak your intention** - The microphone activates automatically
4. **Watch the magic** - Your voice is converted to text in real-time
5. **AI processing** - (Ready for Phase 2 integration)

## 📁 Project Structure

```
src/
├── components/
│   ├── canvas/
│   │   ├── Canvas.tsx           # Main canvas component
│   │   ├── IntentionCard.tsx    # Draggable intention cards
│   │   ├── TaskCard.tsx         # AI-generated task cards
│   │   └── CanvasToolbar.tsx    # Zoom controls & stats
│   └── ui/
│       └── VoiceInput.tsx       # Voice recognition interface
├── hooks/
│   └── useVoiceRecognition.ts   # Web Speech API hook
├── stores/
│   └── canvasStore.ts           # Zustand state management
├── types/
│   ├── canvas.ts                # Core data models
│   ├── ai.ts                    # AI-related interfaces
│   └── global.d.ts              # Web Speech API types
└── utils/                       # Utility functions (coming soon)
```

## 🎯 Next Phase: AI Integration

**Coming next** - Phase 2 will add:
- OpenAI GPT-4 integration for intention analysis
- Automatic task generation from voice input
- AI reasoning and progress tracking
- File upload and content processing

## 🛡 Browser Compatibility

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Canvas | ✅ | ✅ | ✅ | ✅ |
| Voice Input | ✅ | ✅ | ✅ | ❌ |
| Animations | ✅ | ✅ | ✅ | ✅ |
| Drag & Drop | ✅ | ✅ | ✅ | ✅ |

## 📖 Technical Specifications

Built following the comprehensive [MindCanvas MVP Technical Build Instructions](./technical-specs.md) with:

- **React 18+** with TypeScript
- **Vite** for fast development and building  
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **Web Speech API** for voice recognition

## 🤝 Contributing

This is an MVP in active development. The next major milestone is AI integration for automatic task generation.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Ready to transform how you capture and execute your intentions!** 🚀
