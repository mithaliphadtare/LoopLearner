# LearnLoop

> **"Don't just get the answer. Master it."**  
> Turn your study material into an interactive learning experience.

LearnLoop is an adaptive AI tutor for students.

---

## Current Phase: Foundation & Study Material Analysis

1. **Brand & Landing Page**: Introduces LearnLoop's proposition and the four-stage learning loop.
2. **Material Upload**: Focused drag-and-drop workspace supporting PNG, JPG, JPEG, and WEBP.
3. **Study Material Preview**: Clean two-column desktop layout with clear actions before triggering AI analysis.
4. **AI Material Understanding**: Communicates with the server-side Gemma model via `@google/genai`.
5. **Structured Concepts Overview**: Formatted curriculum breakdown with key concepts, topic, description, difficulty badge, and technical terms.
6. **Reusable Progress Header**: Displays four stages (`Material` → `Understand` → `Practice` → `Master`).

---

## Prerequisites & Configuration

Create a `.env` file in the root folder (referenced in `.gitignore`):

```bash
GEMINI_API_KEY="your_api_key_here"
MODEL_NAME="your_gemma_model_name"
```

*Note: The API key is strictly maintained on the server-side and never exposed to the client.*

---

## Running the Application

### Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Run:
```bash
npm run build
npm start
```

---

## AI Connection Test (Developer Only)

While the development server is running, visit:
```
http://localhost:3000/api/dev/test-ai
```
This endpoint checks your `.env` configuration and tests model communication without revealing your API key.

---

## Architecture Overview

```
app/
├── layout.tsx                    # Root layout with Inter font and metadata
├── page.tsx                      # Landing page with hero, visual loop, and how-it-works
├── globals.css                   # Design tokens, color system, and layout styling
├── learn/
│   └── page.tsx                  # Core study material workflow (/learn)
└── api/
    ├── analyze/
    │   └── route.ts              # Validated AI study material analysis endpoint
    └── dev/
        └── test-ai/
            └── route.ts          # Safe developer connection check

components/
├── shared/
│   ├── Logo.tsx                  # Brand mark
│   ├── ProgressHeader.tsx        # Four-stage learning progress component
│   └── ErrorMessage.tsx          # Friendly error banner with retry
├── landing/
│   ├── Header.tsx                # Landing header with minimal navigation
│   ├── Hero.tsx                  # Product statement and CTA
│   ├── LoopVisual.tsx            # The 4-step loop visual preview
│   └── HowItWorks.tsx            # 3-step walk-through
├── upload/
│   ├── UploadDropzone.tsx        # Drag-and-drop file upload with format validation
│   └── ImagePreview.tsx          # 2-column image preview & action panel
└── analysis/
    ├── AnalyzingIndicator.tsx    # Animated understanding state
    └── AnalysisResultView.tsx    # Topic, curriculum breakdown, and Phase 2 CTA

lib/
├── ai/
│   └── gemma.ts                  # Server-side Google GenAI service
├── schemas/
│   └── analysis.ts               # Zod analysis validation schema
├── types.ts                      # Session state and stage definitions
└── utils.ts                      # Base64 parsing, file validation, and class utilities
```
