# LearnLoop

> **"Don't just get the answer. Master it."**  
> Turn your study material into an adaptive, concept-by-concept learning loop.

LearnLoop is an adaptive AI tutor for students that moves beyond generic chatbots. Instead of generating one-size-fits-all answers or static summaries, LearnLoop analyzes uploaded study material, evaluates what the student already understands, isolates specific knowledge gaps and misconceptions, and delivers personalized, targeted teaching until mastery is achieved.

---

## Problem Statement

Students frequently study with textbook pages, lecture slides, and handwritten notes, but standard self-study has fundamental limitations:

- **Invisible knowledge gaps**: Students often don't know what they actually understand versus what they have merely memorized or recognized.
- **Hidden misconceptions**: When students make mistakes, traditional tools rarely explain *why* the confusion happened or identify the flawed mental model behind it.
- **Wasted revision time**: Learners routinely spend hours rereading material they have already mastered while completely overlooking the subtle concepts where their understanding breaks down.
- **Static study aids**: Conventional tools offer static quizzes, passive summaries, and generic explanations that fail to adapt continuously to individual student performance.

---

## Solution: The Adaptive Learning Loop

LearnLoop bridges this gap by acting as an intelligent, responsive personal tutor. Rather than just summarizing or answering questions about uploaded material, it guides the student through an iterative, adaptive learning loop:

```
Study Material (PDF / Image)
          ↓
     AI Analysis (Gemma)
          ↓
  Diagnostic Assessment
          ↓
  Concept-Level Evaluation
          ↓
  Weak Concept Detection
          ↓
 Misconception Identification
          ↓
   Targeted Teaching
          ↓
 Check Understanding (Adaptive Retest)
          ↓
Remediation / Concept Mastery
```

LearnLoop does not treat learning as a linear reading exercise. Every subsequent explanation and check question directly adapts to the student's actual responses.

---

## Why LearnLoop (Beyond Generic AI Chatbots)

The fundamental difference between LearnLoop and a standard conversational AI chatbot lies in structured pedagogical intent:

| Generic AI Chatbot | LearnLoop Adaptive Tutor |
| :--- | :--- |
| **Prompt-dependent**: Waits for the student to ask questions ("Explain Newton's Laws"). | **Diagnostic-driven**: Proactively evaluates what the student knows before explaining. |
| **Exhaustive & redundant**: Dumps textbook-length explanations covering everything from scratch. | **Targeted & personalized**: *"You already understand inertia and the First Law. Let's focus specifically on connecting force, mass, and acceleration."* |
| **Passive reading**: Assumes the student understood because an answer was generated. | **Active verification**: Tests comprehension with focused check questions and identifies misconceptions. |
| **No state tracking**: Loses context of concept-level strengths, weaknesses, and remediation attempts. | **Structured learning state**: Tracks mastered concepts, current remediation mode, and learning queues. |

---

## Key Features

LearnLoop includes the following implemented features:

- **Multimodal Material Upload**: Supports both documents and images—PDF, PNG, JPG, JPEG, and WEBP (up to 20 MB).
- **Document & Image Preview**: Visual inspection card displaying file details (name, format, size) before analysis, with replace/remove capability.
- **AI Material Understanding**: Extracts topic, pedagogical description, difficulty level, structured key concepts, and technical terminology.
- **Material-Grounded Diagnostics**: Generates a 5-question multi-choice diagnostic assessment tied directly to the analyzed concepts (testing recognition, conceptual understanding, and application).
- **Concept-Level Performance Tracking**: Evaluates student responses per concept, classifying each as `Strong` or `Needs practice`.
- **Automated Weak-Concept Prioritization**: Detects struggling concepts and queues them for targeted remediation.
- **Misconception Detection**: Analyzes erroneous choices to pinpoint why the student erred and surfaces encouraging hints.
- **Targeted Adaptive Lessons**: Generates bite-sized explanations focused on the specific gap, linking to what the student already knows, providing formulas, concrete examples, and punchy takeaways.
- **Adaptive Check Questions**: Immediate single-question checks after each lesson to confirm comprehension.
- **Second-Pass Remediation (Simpler Analogies)**: When a check question is missed, the system switches to remediation mode, generating an intuitive everyday analogy and a fresh follow-up question.
- **Mastery Completion Screen**: Celebrates full mastery once all weak concepts in the queue have been successfully learned and checked.
- **Safe Resilient AI Pipeline**: Server-side client with exponential backoff retry to handle upstream transient errors smoothly.

---

## How It Works

The complete user journey consists of eight progressive steps:

1. **Upload**: The student uploads a textbook page, study note, diagram, or PDF document.
2. **Understand**: Gemma analyzes the material to construct a curriculum breakdown with core concepts and important terms.
3. **Diagnose**: LearnLoop generates a targeted 5-question diagnostic assessment based on the extracted concepts.
4. **Identify Gaps**: As the student answers, the system measures performance concept by concept.
5. **Target**: LearnLoop identifies the specific concepts requiring practice and highlights what the student already understands well.
6. **Teach**: The student receives a personalized, focused lesson tailored to their specific gap rather than a generic lecture.
7. **Check**: A targeted question tests whether the explanation resolved the misunderstanding.
8. **Adapt**: If answered correctly, the student advances toward mastery. If missed, LearnLoop adapts immediately with a simpler everyday analogy and a new check question until the concept clicks.

---

## Role of Gemma 4 and AI Architecture

LearnLoop uses Google's open-weight Gemma model (such as `gemma-4-26b-a4b-it`) accessed through the Google GenAI SDK (`@google/genai`):

- **Multimodal Content Understanding**: Gemma parses raw image pixels or PDF document streams directly via inline base64 data to extract structured curricular metadata.
- **Assessment Generation**: Generates multiple-choice diagnostic questions grounded strictly in the identified concepts.
- **Misconception Analysis & Pedagogical Feedback**: Infers the underlying confusion from incorrect answers and crafts empathetic, non-judgmental explanations.
- **Adaptive Remediation**: Generates alternative analogies and fresh validation questions on demand.

> **Architectural Separation**: Gemma provides the AI intelligence and reasoning. The application logic, session state machine, Zod schema validation, progress orchestration, retry policies, and user experience are managed by LearnLoop.

---

## Tech Stack

The technologies used in LearnLoop:

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15.1 (App Router) | Full-stack React framework with server routes and fast Turbopack bundling |
| **Language** | TypeScript 5.7 | Strict type safety across client states, schemas, and API handlers |
| **AI Integration** | Google GenAI SDK (`@google/genai`) | Server-side integration with configurable Gemma models |
| **Validation** | Zod 3.24 | Runtime validation of AI outputs, diagnostic formats, and lesson schemas |
| **UI & Styling** | Tailwind CSS 4 | Modern utility-first styling with design token CSS variables |
| **Animations** | Framer Motion 11.15 | Smooth stage transitions, progress bars, and feedback animations |
| **Icons** | Lucide React | Consistent, accessible iconography throughout the interface |

---

## Prerequisites & Configuration

Create a `.env` file in the root folder (referenced in `.gitignore`):

```bash
GEMINI_API_KEY="your_api_key_here"
MODEL_NAME="gemma-4-26b-a4b-it"
```

> **Security Note**: The API key is strictly maintained on the server-side in API route handlers and is never exposed to the client or browser logs.

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

## How to Test LearnLoop

You can test the entire adaptive learning loop using study materials such as physics or biology notes:

1. **Navigate to Learn**: Click **Start Learning** on the landing page or visit `/learn`.
2. **Upload Study Material**: Drop in a PDF or image file (e.g. *Newton's Laws of Motion*, *Cell Biology*, or *Calculus Limits*).
3. **Verify Material Analysis**: Review the extracted topic, difficulty level, key concepts list, and important terms.
4. **Take the Diagnostic**: Click **Start Diagnostic →** and answer the 5 multiple-choice questions. To observe adaptive behavior, intentionally answer at least one question incorrectly.
5. **Inspect Performance**: Review the score breakdown showing which concepts are `Strong` and which `Need practice`.
6. **Engage with Targeted Guidance**: Click **Start Learning →** to enter the targeted lesson for your weak concept. Observe how the lesson references what you already know while zeroing in on the gap.
7. **Test Adaptive Remediation**:
   - Answer the check question incorrectly to see the misconception feedback and the **Simpler Explanation** analogy.
   - Answer the remediation question correctly to see the concept mastered and proceed through the queue to the **Mastery Screen**.

---

## Architecture Overview

```
app/
├── layout.tsx                    # Root layout with Inter font and metadata
├── page.tsx                      # Landing page with hero, visual loop, and how-it-works
├── globals.css                   # Design tokens, color system, and layout styling
├── learn/
│   └── page.tsx                  # Core learning loop state orchestrator (/learn)
└── api/
    ├── analyze/
    │   └── route.ts              # Validated AI study material analysis (PDF & image)
    ├── diagnostic/
    │   └── route.ts              # Diagnostic question generation & answer evaluation
    ├── teaching/
    │   └── route.ts              # Targeted lessons, check questions & simpler analogies
    └── dev/
        └── test-ai/
            └── route.ts          # Safe developer connection check

components/
├── shared/
│   ├── Logo.tsx                  # Brand mark
│   ├── ProgressHeader.tsx        # Four-stage learning progress indicator
│   └── ErrorMessage.tsx          # Friendly error banner with retry
├── landing/
│   ├── Header.tsx                # Landing header with minimal navigation
│   ├── Hero.tsx                  # Product proposition and primary CTA
│   ├── LoopVisual.tsx            # Visual summary of the 4-step loop
│   ├── HowItWorks.tsx            # Three-step walk-through
│   └── Footer.tsx                # Clean footer with tagline
├── upload/
│   ├── UploadDropzone.tsx        # Drag-and-drop file upload with format validation
│   └── ImagePreview.tsx          # Dual preview for PDF documents and images
├── analysis/
│   ├── AnalyzingIndicator.tsx    # Animated understanding state
│   └── AnalysisResultView.tsx    # Topic, curriculum breakdown, and diagnostic CTA
├── diagnostic/
│   ├── DiagnosticLoadingIndicator.tsx # Diagnostic preparation indicator
│   ├── DiagnosticQuestionCard.tsx     # Step-by-step diagnostic question interface
│   └── DiagnosticResultsView.tsx      # Concept-level performance & weak-concept summary
└── teaching/
    ├── GuidanceOverview.tsx      # Overview queue of strong vs focus concepts
    ├── TeachingLoadingIndicator.tsx   # Targeted lesson loading state
    ├── TargetedLessonView.tsx    # Focused concept lesson with primary check question
    ├── SimplerLessonView.tsx     # Second-pass analogy and remediation question
    └── MasteryCompleteView.tsx   # Final celebration screen after mastering all concepts

lib/
├── ai/
│   └── gemma.ts                  # Google GenAI service with retry backoff logic
├── schemas/
│   ├── analysis.ts               # Zod schema for material analysis output
│   ├── diagnostic.ts             # Zod schemas for diagnostic questions & evaluation
│   └── teaching.ts               # Zod schemas for targeted lessons & simpler explanations
├── types.ts                      # Application session state and stage definitions
└── utils.ts                      # Base64 parsing, file validation, and class utilities
```

---

## Hackathon Value & Differentiator

- **Multimodal Learning Experience**: Takes unformatted student materials (handwritten notes, diagrams, slide decks, PDFs) and converts them into structured pedagogy.
- **Open-Weight Gemma Integration**: Demonstrates how Gemma models can power active educational workflows beyond static chat interfaces.
- **Misconception-Aware Pedagogical Flow**: Detects flawed logic rather than just marking answers wrong, offering actionable mental models and everyday analogies.
- **Real-World Student Utility**: Directly addresses study fatigue and passive rereading by prioritizing only the concepts where the student needs guidance.

---

## Future Scope

Planned future enhancements for LearnLoop:

- **Long-Term Learner Profiles**: Persistent student memory across study sessions to track retention over time.
- **Spaced Repetition Scheduling**: Automated re-testing of previously weak concepts after days or weeks to ensure durable mastery.
- **Richer Visual Explanations**: Dynamic diagramming and step-by-step visual models for math and science derivations.
- **Multi-Document Notebooks**: Uploading entire chapters or lecture series into a unified learning graph.
- **Teacher & Mentor Insights**: Exportable diagnostic reports highlighting class-wide misconceptions for educators.
