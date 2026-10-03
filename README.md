# LLM Gateway — Frontend

A **Next.js 16 / React 19** frontend for an AI platform that does two things in one UI: a multi-turn **AI Chat** backed by an LLM Gateway API, and a **PDF / RAG Chat** backed by a separate document-intelligence service. Users can switch between both modes without leaving the page.

---

## What this is

This is the browser-facing layer of a larger system made up of three services:

| Layer | Role |
|---|---|
| **This repo** | Next.js SPA — auth, chat UI, PDF upload/query UI |
| **LLM Gateway backend** | REST API at `NEXT_PUBLIC_API_BASE_URL` — handles auth, conversation storage, LLM routing |
| **PDF / RAG backend** | Accessed internally *through* the LLM Gateway — handles PDF ingestion, chunking, vector search, and answer synthesis |

The frontend never calls the PDF backend directly. Every request goes to the LLM Gateway, which proxies the document endpoints (`/api/chatpdf/upload`, `/api/chatpdf/chat`) to the RAG service internally.

---

## Tech stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Auth**: JWT — decoded client-side without any library, expiry checked on every session restore
- **State**: React Context + hooks (`AuthContext`, `ChatContext`, `PdfChatContext`, `NavigationContext`)
- **HTTP**: A thin custom `fetch` wrapper (`src/lib/api.ts`) — handles auth headers, 204 responses, and readable error messages from `message`, `detail`, or `error` fields
- **File upload**: `XMLHttpRequest` with `upload.onprogress` for real-time upload progress tracking
- **Persistence**: `localStorage` used as a write-through cache for conversations, messages, PDF documents, and query history — the app degrades gracefully when the backend is unreachable

---

## Features

### AI Chat (mode: `chat`)
- Create, rename, delete, and search conversation threads
- Threads are grouped in the sidebar by Today / Yesterday / Previous 7 Days / Older
- Keyboard shortcut `Ctrl+K` / `Cmd+K` to start a new conversation
- Optimistic UI — the user message appears immediately; a three-dot animation runs while the backend responds
- Last message in the thread auto-sets the conversation title if it was still "New Chat"
- Assistant messages support a hand-rolled markdown renderer: fenced code blocks (with a language label and one-click copy), `**bold**`, `*italic*`, `` `inline code` ``, bullet/ordered lists, and paragraphs
- Retry button on the last assistant message; error messages surface inline rather than as toasts
- Real-time estimated token count shown in the input bar (`≈ chars / 4`)
- Cross-tab logout sync via the `storage` event

### PDF / RAG Chat (mode: `pdf`)
- Drag-and-drop or file-browser PDF upload; MIME + extension validation before upload starts
- Upload progress bar driven by `XHR` upload events
- Three-step processing panel (Upload → Extract → Index) with indeterminate progress while the backend processes the document
- Once a document is `ready`, the user can ask questions; answers come back from the RAG backend with optional source citations (chunk content, page number, similarity score)
- Source citations are shown in a collapsible accordion; the top match score is displayed on the toggle button
- Latency (ms) and tokens used are displayed in a monospaced badge on each answer card
- Query history persisted in `localStorage` per `documentId`; queries can be retried
- Thumbs up / thumbs down feedback UI on each answer (local state only)
- Multiple uploaded PDFs tracked in the sidebar; switching between them restores the respective query history

### Auth
- Register → auto-login flow: registration calls `/api/auth/register`, then immediately calls `/api/auth/login` and stores the JWT
- JWT is decoded with a zero-dependency base64 parser to read `userId` and `exp`; expired tokens trigger automatic logout
- Demo mode skips the backend entirely with a mock token — useful for local UI development when no backend is running
- Form validation with field-level errors and a 401 / network-error / generic error hierarchy

---

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Root — renders landing page or chat depending on auth
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx            # Wraps everything in Auth + Navigation + PdfChat providers
├── components/
│   ├── auth/                 # AuthLayout, LoginForm, RegisterForm
│   ├── chat/                 # ChatInterface, ChatSidebar, ChatHeader, ChatInput, MessageItem, EmptyChatState
│   ├── pdf/                  # PdfChatInterface, PdfUploadDropzone, PdfDocumentCard, PdfQueryItem, PdfSidebarContent
│   ├── home/                 # HomeContent (landing page + authenticated root)
│   └── icons.tsx             # All SVG icons as typed React components
├── context/
│   ├── AuthContext.tsx        # JWT session, login/register/demoLogin/logout
│   ├── ChatContext.tsx        # Conversations, messages, send/delete/rename, sidebar toggle
│   ├── PdfChatContext.tsx     # Document upload, query lifecycle, retry, document selection
│   └── NavigationContext.tsx  # Active mode ("chat" | "pdf"), persisted to localStorage
├── services/
│   ├── authService.ts         # Auth API calls + localStorage session management
│   ├── chatService.ts         # Conversation + message API calls with localStorage fallback
│   └── pdfService.ts          # PDF upload (XHR), question requests, localStorage caching
├── lib/
│   └── api.ts                 # Base fetch wrapper + XHR multipart helper + URL builder
└── types/
    ├── auth.ts
    ├── chat.ts
    └── pdfChat.ts             # PdfDocument, PdfQuery, PdfSourceCitation, API response shapes
```

---

## Backend API contracts

The frontend expects the following endpoints on the LLM Gateway:

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register; returns `{ message, user: { id, email, createdAt } }` |
| `POST` | `/api/auth/login` | Login; returns `{ message, token }` (JWT) |
| `GET` | `/api/conversations` | List conversations; accepts array or `{ conversations: [] }` |
| `POST` | `/api/conversations` | Create; returns `{ message, conversation }` |
| `GET` | `/api/conversations/:id/messages` | Messages; accepts array or `{ messages: [] }` |
| `POST` | `/api/chat` | Send message; returns `{ reply, messageId, assistantMessageId }` |
| `DELETE` | `/api/conversations/:id` | Delete (soft — ignored if not implemented) |
| `POST` | `/api/chatpdf/upload` | Multipart PDF upload; returns document ID |
| `POST` | `/api/chatpdf/chat` | Query a document; returns answer, optional sources, latency, tokens |

The PDF chat response parser handles multiple nesting shapes (`res.data.data`, `res.data`, `res.answer`, `res.reply`, `res.message`) to stay compatible with both the LLM Gateway's wrapper and raw responses from the RAG backend.

---

## Getting started

### Prerequisites

- Node.js 18+
- The LLM Gateway backend running locally (default: `http://localhost:8000`)

### Setup

```bash
# Install dependencies
npm install

# Copy and configure env
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL to your LLM Gateway URL

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the LLM Gateway REST API | `http://localhost:8000/api` |

### Without a backend

Click **"Try Demo Mode"** on the login page. This creates a local mock session (`mockAuthenticate`) and uses `localStorage` to store and retrieve conversations. No backend calls are made for auth; the chat and PDF features will show error messages when they can't reach the gateway.

---

## Architecture notes

**Why one sidebar for both modes?**  
`ChatSidebar` doubles as the PDF document list when the user is in `pdf` mode. The `NavigationContext` (`activeMode: "chat" | "pdf"`) controls which panel content is rendered inside it and which main area (`ChatInterface` vs `PdfChatInterface`) fills the rest of the screen. The mode is persisted to `localStorage` so it survives a page refresh.

**Why XHR for PDF upload and not `fetch`?**  
`fetch` doesn't expose upload progress through the Streams API in a way that's broadly supported. `XHR.upload.onprogress` is the pragmatic choice here — the `requestFormData` helper in `api.ts` wraps it in a `Promise` so the call site stays async/await.

**Offline-resilience by design**  
`chatService` and `pdfService` both write to `localStorage` on every successful API response. If the backend is unavailable, reads fall back to local state silently. Conversations created offline get a `local_` prefix on their ID; they merge with backend data if the backend later returns them.

**JWT decoded without a library**  
`authService.parseJwt` does a manual base64url decode of the payload segment. This avoids pulling in `jwt-decode` for what is purely a client-side claim inspection (no signature verification is done — that happens on the backend with every protected request).

---

## Scripts

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```
