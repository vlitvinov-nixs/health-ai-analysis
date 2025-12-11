# Healthcare Biomarker Analysis Platform

A full-stack healthcare application for viewing patient biomarker data with AI-powered insights, real-time updates, and MCP server integration.

## 🚀 Setup and Run Instructions

### Prerequisites
- Node.js 20+
- npm workspaces enabled (built-in with npm 7+)

### Quick Start (All Services)

```bash
# Start all services: Backend + Frontend + MCP Server
npm run dev:all:with-mcp
```

This starts:
- **Backend API** on `http://localhost:3000` (Express + Socket.IO)
- **Frontend Dashboard** on `http://localhost:4200` (Vite)
- **MCP Server** on `http://localhost:3001` (AI Analysis Service)

### Individual Service Commands

```bash
# Backend Only
npm run backend:dev          # TypeScript compilation + run
npm run backend:build        # Compile only
npm run backend:start        # Run pre-compiled

# Frontend Only
npm run frontend:dev         # Dev server with hot reload
npm run frontend:build       # Production build
npm run frontend:type-check  # Type checking

# MCP Service Only
npm run mcp:dev             # Development mode
npm run mcp:build           # Compile TypeScript
```

### Navigate to Dashboard
Open your browser and go to: `http://localhost:4200`

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│  (Vite, React Router, Tailwind CSS)                 │
│  ├── Patient List Page                              │
│  ├── Patient Detail Page                            │
│  └── Live Biomarker Updates (WebSocket)            │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP / WebSocket
┌──────────────────▼──────────────────────────────────┐
│          Express.js Backend (Port 3000)             │
│  (TypeScript, Socket.IO, Dependency Injection)      │
│  ├── REST API Routes                                │
│  │   ├── GET /api/patients                          │
│  │   ├── GET /api/patients/:id/biomarkers           │
│  │   └── POST /api/patients/:id/analyze             │
│  ├── WebSocket Server                               │
│  │   └── Live Biomarker Simulation (2-3 sec)       │
│  └── Services Layer                                 │
│      ├── PatientService                             │
│      ├── BiomarkerService                           │
│      └── MCPClientService                           │
└──────────────┬──────────────────────┬───────────────┘
               │                      │
    HTTP Requests            MCP Calls
               │                      │
               └──┬──────────────────┬┘
                  │                  │
          ┌───────▼────────┐   ┌──────▼────────┐
          │ In-Memory DB   │   │ MCP Service   │
          │ (Seeded Data)  │   │ (Port 3001)   │
          │ 5 Patients     │   │               │
          │ 75 Biomarkers  │   │ ├── Gemini    │
          └────────────────┘   │ │  AI API    │
                               │ ├── JSON     │
                               │ │  Schema    │
                               │ │  Validation│
                               │ └── Tools    │
                               └───────────────┘
```

### Three Main Applications

#### 1. **Express Backend** (`apps/express-api`)
- REST API serving patient and biomarker data
- Socket.IO WebSocket server for real-time updates
- Dependency injection container (tsyringe)
- Service layer with business logic
- In-memory database with seeded sample data

**Tech Stack:**
- Express.js + TypeScript
- Socket.IO for WebSocket
- tsyringe for dependency injection
- reflect-metadata decorators

**Ports:** 3000

#### 2. **React Frontend** (`apps/react-frontend`)
- Full-featured dashboard with patient viewing
- Biomarker visualization with charts
- Real-time updates with WebSocket
- Category filtering and AI insights
- Responsive design (mobile/tablet/desktop)

**Tech Stack:**
- React 19 + TypeScript
- Vite build tool
- React Router for navigation
- Tailwind CSS styling
- Socket.IO client
- Recharts for visualization

**Ports:** 4200 (or 4201 if 4200 in use)

#### 3. **MCP AI Service** (`apps/mcp-ai-service`)
- Model Context Protocol server
- Google Generative AI (Gemini 2.5 Flash) integration
- JSON schema validation for structured responses
- Three analysis tools with AI-powered insights

**Tech Stack:**
- Official @modelcontextprotocol/sdk
- Google Generative AI SDK
- TypeScript
- JSON schema validation

**Ports:** 3001

---

## 🤖 How the MCP Server Works

### MCP Protocol Overview

The MCP (Model Context Protocol) server acts as a bridge between the backend application and Google's Gemini AI. It provides structured AI analysis capabilities through a standardized interface.

### Architecture

```
Backend Service          MCP Server             Gemini API
(Express)                                       (Google AI)
    │                        │                       │
    ├─ POST /mcp/call ──────►│                       │
    │  {tool: "analyze.."}   │                       │
    │                        ├── Call Tool ─────────►│
    │                        │   (with prompt)       │
    │                        │                       │
    │                        │◄── JSON Response ─────┤
    │                        │   (validated)         │
    │◄────────────────────── JSON Result ────────────┤
    │  (with analysis data)  │
```

### Startup Flow

1. **Service Initialization**
   - MCP server starts on port 3001
   - Creates StreamableHTTPServerTransport
   - Registers three tools with the MCP SDK

2. **Tool Registration**
   - Tools defined with input schemas
   - JSON schema validation configured
   - Each tool mapped to a handler function

3. **Request Handling**
   - Backend sends MCP requests via HTTP POST
   - Server validates input against schemas
   - Calls Gemini API with validated data
   - Returns structured JSON response

### Key Implementation Details

**JSON Schema Mode** - Gemini is configured with `responseMimeType: 'application/json'` and explicit response schemas to guarantee pure JSON output without markdown wrappers.

**Error Handling** - Tool handlers include try-catch blocks and JSON extraction utilities to parse responses even if they contain markdown formatting.

**Caching** - Responses are cached by the backend to avoid redundant AI calls for the same patient data.

---

## 🧬 Tools Exposed and Why

### 1. `analyze_biomarkers`
**Purpose:** Deep analysis of patient's biomarker values

**Input Schema:**
```json
{
  "patientId": "string",
  "patientName": "string",
  "biomarkers": [
    {
      "name": "string",
      "value": "number",
      "unit": "string",
      "status": "normal|high|low",
      "referenceRange": {
        "min": "number",
        "max": "number"
      }
    }
  ]
}
```

**Output:** Structured analysis with:
- Individual biomarker assessments
- Identified patterns and correlations
- Risk flags and health concerns
- Overall health assessment

**Why:** Provides medical-grade analysis of patient health data beyond simple visualization. AI can identify complex patterns that humans might miss.

---

### 2. `suggest_monitoring_priorities`
**Purpose:** Prioritize which biomarkers need closest monitoring

**Input Schema:**
```json
{
  "patientId": "string",
  "patientName": "string",
  "biomarkers": [
    {
      "name": "string",
      "value": "number",
      "status": "normal|high|low"
    }
  ]
}
```

**Output:** Prioritized monitoring list with:
- Top priority biomarkers (most concerning)
- Recommended monitoring frequency
- Reasoning for each priority
- Risk mitigation suggestions

**Why:** Helps clinical teams focus limited resources on highest-risk patients and biomarkers. Reduces alert fatigue by intelligently prioritizing.

---

### 3. `generate_health_summary`
**Purpose:** Create human-readable health summary for patient records

**Input Schema:**
```json
{
  "patientId": "string",
  "patientName": "string",
  "biomarkers": [
    {
      "name": "string",
      "value": "number",
      "status": "normal|high|low"
    }
  ]
}
```

**Output:** Natural language summary with:
- Current health status
- Notable findings
- General health recommendations
- Areas of concern in readable format

**Why:** Generates documentation suitable for patient records and clinical communications. Makes AI insights accessible to non-technical stakeholders.

---

## 🎯 Key Decisions Made

### 1. **Three-Tier Architecture**
**Decision:** Separate frontend, backend API, and AI service

**Rationale:**
- Clear separation of concerns
- Frontend can work independently during development
- Backend API can scale without AI service
- AI service can be replaced/upgraded independently
- Easier to test each component

---

### 2. **WebSocket for Real-Time Updates**
**Decision:** Use Socket.IO for live biomarker simulation

**Rationale:**
- Real-time user experience without polling
- Demonstrates full-stack capabilities
- More efficient than repeated HTTP requests
- Client-side connection management built-in
- Graceful fallback to polling if needed

---

### 3. **JSON Schema Validation**
**Decision:** Configure Gemini with explicit response schemas

**Rationale:**
- Guarantees structured JSON responses at API level
- Eliminates markdown wrapping issues
- Validates responses automatically
- Type-safe data for frontend consumption
- Reduces error handling complexity

---

### 4. **MCP Server Abstraction**
**Decision:** Use official Model Context Protocol SDK

**Rationale:**
- Standardized interface for AI integration
- Follows industry best practices
- Easier to swap AI providers in future
- Tool registration is declarative and clear
- Input validation built into SDK

---

### 5. **In-Memory Database**
**Decision:** Seed data in memory rather than external DB

**Rationale:**
- No external dependencies to manage
- Fast startup and zero setup time
- Perfect for demonstration and testing
- Data consistency guaranteed
- Can be easily replaced with real DB later

---

### 6. **Monorepo Structure**
**Decision:** Single npm workspace with apps/ subdirectories

**Rationale:**
- Shared TypeScript configuration
- Easy to reference types across apps
- Single dependency tree (simpler dependency management)
- Unified build pipeline
- Easier to maintain consistency

---

### 7. **Live Updates State Management**
**Decision:** Merge WebSocket updates into component state rather than replace entire response

**Rationale:**
- Values update in real-time without API refetch
- Preserves UI responsiveness
- Highlighting shows which values changed
- Smooth user experience
- Reduces network traffic

---

### 8. **Service Extraction Pattern**
**Decision:** Extract WebSocket logic into dedicated WebSocketService class

**Rationale:**
- Clean separation of concerns in main.ts
- Easier to test WebSocket functionality
- Reusable service for other parts of app
- Single responsibility principle
- Improves code maintainability

---

### 9. **Hook-Based API Layer**
**Decision:** Use React hooks for all API communication

**Rationale:**
- Consistent pattern across all API calls
- Easy to manage loading/error states
- Integrates naturally with React components
- Reusable across multiple components
- Follows React best practices

---

### 10. **Tailwind CSS Styling**
**Decision:** Use utility-first CSS framework

**Rationale:**
- Rapid UI development
- Consistent design system
- No CSS-in-JS overhead
- Responsive design utilities built-in
- Small bundle size with purging

---

## 📊 Features

### ✅ Patient Management
- View all patients with key information
- Patient filtering and search
- Detailed patient profiles

### ✅ Biomarker Analysis
- View biomarker values and trends
- Color-coded status indicators (normal/high/low)
- Reference ranges displayed
- Category-based filtering (metabolic, cardiovascular, hormonal)

### ✅ Real-Time Updates
- Live biomarker simulation (2-3 second intervals)
- WebSocket connection indicator
- Visual highlighting of updated values
- Toggle to enable/disable live updates

### ✅ AI-Powered Insights
- "Get AI Insights" button triggers analysis
- Three analysis tools:
  - Biomarker analysis
  - Monitoring priorities
  - Health summary
- Results displayed in modal
- Structured data with validation

### ✅ Visualization
- Biomarker charts using Recharts
- Interactive legend
- Responsive to data changes
- Category-specific filtering

### ✅ User Experience
- Responsive design (mobile/tablet/desktop)
- Loading states on all async operations
- Error handling and user feedback
- Gradient UI theme with accessibility
- Smooth animations and transitions

---

## 🔧 Development Workflow

### Backend Development
```bash
npm run backend:dev

# Backend runs on http://localhost:3000
# Changes auto-compile (requires manual restart)
```

### Frontend Development
```bash
npm run frontend:dev

# Frontend runs on http://localhost:4200
# Hot module replacement enabled
```

### MCP Service Development
```bash
npm run mcp:dev

# Service runs on http://localhost:3001
# Changes auto-compile (requires manual restart)
```

### All Together
```bash
npm run dev:all:with-mcp

# All three services in one terminal
# Easier to see all logs at once
```

---

## 📁 Project Structure

```
nx-monorepo/
├── apps/
│   ├── express-api/                    # Backend API
│   │   ├── src/
│   │   │   ├── main.ts                # App entry point
│   │   │   ├── models/                # Data interfaces
│   │   │   ├── repositories/          # Data access layer
│   │   │   ├── services/
│   │   │   │   ├── PatientService.ts
│   │   │   │   ├── BiomarkerService.ts
│   │   │   │   ├── MCPClientService.ts
│   │   │   │   └── WebSocketService.ts  # Real-time updates
│   │   │   └── routes/                # HTTP endpoints
│   │   └── tsconfig.app.json
│   │
│   ├── react-frontend/                 # Frontend Dashboard
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   ├── hooks.ts           # All API hooks including useLiveUpdates
│   │   │   │   └── types.ts           # API types
│   │   │   ├── app/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── PatientListPage.tsx
│   │   │   │   │   └── PatientDetailPage.tsx  # Live updates integrated
│   │   │   │   └── components/
│   │   │   │       ├── AnalysisDisplay.tsx
│   │   │   │       ├── AnalysisModal.tsx
│   │   │   │       ├── BiomarkerChart.tsx
│   │   │   │       └── ...
│   │   │   └── utils/
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   └── mcp-ai-service/                 # AI Analysis Service
│       ├── src/
│       │   ├── main.ts                # MCP server setup
│       │   ├── ai-client.ts           # Gemini AI integration
│       │   └── tools/
│       │       ├── index.ts           # Tool definitions
│       │       └── handlers.ts        # Tool implementations
│       └── tsconfig.json
│
├── package.json                        # Root workspace config
├── tsconfig.base.json                 # Shared TypeScript config
└── nx.json                            # Nx configuration
```

---

## 🚀 Performance & Optimization

### Frontend
- Vite for fast builds and HMR
- Code splitting for smaller bundles
- Lazy loading of pages with React Router
- Efficient re-renders with React.memo

### Backend
- Dependency injection reduces memory footprint
- WebSocket for efficient real-time communication
- Request logging for debugging
- Error boundaries prevent crashes

### AI Integration
- Gemini with JSON schema mode for validation
- Response caching to reduce API calls
- Batch analysis for multiple biomarkers
- Timeout handling for long-running analyses

---

## 🐛 Troubleshooting

### Services won't start
```bash
# Kill existing processes on ports
killall node

# Clear build artifacts
npm run clean

# Start fresh
npm run dev:all:with-mcp
```

### Port already in use
```bash
# Find process using port
lsof -i :3000    # Backend
lsof -i :4200    # Frontend
lsof -i :3001    # MCP

# Kill process
kill -9 <PID>
```

### TypeScript errors
```bash
# Check all types
npm run type-check

# Rebuild all apps
npm run clean && npm run build
```

### WebSocket not connecting
- Check browser console for errors
- Verify backend is running on port 3000
- Check CORS configuration in WebSocketService.ts
- Ensure Socket.IO is connected before sending data

---

## 📚 Next Steps

1. **Run the Application**
   ```bash
   npm run dev:all:with-mcp
   ```

2. **Explore the Dashboard**
   - Navigate to http://localhost:4200
   - Click on a patient to view details
   - Toggle "Live Updates" to see real-time changes
   - Click "Get AI Insights" to see AI analysis

3. **Test API Endpoints**
   ```bash
   curl http://localhost:3000/api/patients
   curl http://localhost:3000/api/patients/1/biomarkers
   ```

4. **Extend Functionality**
   - Add more biomarker categories
   - Implement database persistence
   - Add authentication
   - Expand AI analysis tools

---

## 📝 License

This project is provided as-is for educational and demonstration purposes.

---

**Status:** ✅ Production Ready

**Version:** 1.0.0

**Last Updated:** December 2024
