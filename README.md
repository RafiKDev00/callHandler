# CallHandler - AI-Powered Clinic Phone Assistant

A mobile-first web application that analyzes phone call transcripts to extract structured patient information, identify urgency levels, and detect concerning patterns based on call history.

![Powered by ScribeMD](https://static.scribemd.ai/assets/prod/logo-b2c84ae1eb5833070341ede85b5c1f9bf2d8f5ca345b105d914f43a9a279242b.svg)

---

## How I Approached the Problem

### Step 1: Core Requirements
Started with the basic requirements from the prompt:
- Accept a phone call transcript (text input)
- Identify caller intent (appointment, prescription, billing, urgent issue)
- Extract structured data (name, DOB, phone, reason)
- Output clean JSON
- Flag urgency appropriately

### Step 2: Tech Stack Selection
Chose a modern, lightweight stack:
- **Frontend**: React + Vite (fast dev experience, mobile-first CSS)
- **Backend**: Express.js (simple API layer)
- **Database**: SQLite (zero config, persists call history)
- **AI**: OpenAI GPT-4o-mini (cost-effective, fast, reliable JSON output)

### Step 3: Beyond the Basics
After the core was working, I added features that would matter in a real clinic:

1. **Backend API** - Moved OpenAI calls server-side so API keys are never exposed to the browser
2. **Call History** - Persisted all analyzed calls in SQLite for future reference
3. **Patient Search** - Added a search tab with autocomplete to find patients by name or phone
4. **Pattern Detection** - The real value-add. The system now automatically flags:
   - Repeat callers (same person calling multiple times in 72 hours)
   - Escalating symptoms (previous calls were low urgency, now high)
   - Recurring issues (calling about the same problem repeatedly)
   - Rapid callbacks (3+ calls in 24 hours = something's wrong)

### Step 4: UX Polish
- Clean blue/white medical aesthetic
- Mobile-first responsive design
- Tabbed interface (Analyze / Search)
- Test transcript dropdown for easy demo
- Formatted view + raw JSON toggle

---

## AI Tools Used

### Claude Code (Anthropic) - Development Assistant
Used Claude Code CLI throughout the entire development process:
- **Project scaffolding**: Generated the initial Vite + React structure
- **Component creation**: Wrote all React components (Header, ResultsDisplay, PatternFlags, CallHistory, SearchPatients)
- **Backend logic**: Created Express server, SQLite database schema, and API routes
- **Pattern detection algorithm**: Designed and implemented the logic for flagging concerning call patterns
- **CSS styling**: Mobile-first responsive styles
- **README writing**: This document

Claude Code was particularly valuable for:
- Rapid iteration (edit → test → refine cycle)
- Maintaining consistency across files
- Catching edge cases in the pattern detection logic

### OpenAI GPT-4o-mini - Production AI
Powers the actual transcript analysis in the app:
- **Intent classification**: Categorizes calls into 10 intent types
- **Entity extraction**: Pulls out name, DOB, phone number
- **Summarization**: Creates a brief summary of the call reason
- **Urgency assessment**: Classifies as high/medium/low based on medical guidelines

Configuration:
- `temperature: 0.1` for consistent, deterministic outputs
- `response_format: { type: 'json_object' }` for reliable JSON
- Detailed system prompt with urgency classification guidelines

---

## What I Would Improve With More Time

### High Priority
1. **Authentication** - Add clinic staff login (OAuth or simple JWT)
2. **Search Filters** - Filter history by date range, urgency level, intent type
3. **Real-time Audio** - Integrate Whisper API for live call transcription instead of pasting text
4. **Confidence Scores** - Have the AI return confidence levels for each extracted field

### Medium Priority
5. **EHR Integration** - Connect to Epic/Cerner to auto-link patients by DOB/name
6. **Multi-language** - Spanish support (critical for many US clinics)
7. **Batch Processing** - Upload a CSV of transcripts for bulk analysis
8. **Webhooks** - Notify external systems when high-urgency calls come in

### Nice to Have
9. **Analytics Dashboard** - Call volume trends, common intents, peak hours
10. **Unit/E2E Tests** - Jest + Playwright for reliability
11. **Docker** - Containerize for easy deployment
12. **Rate Limiting** - Protect the API from abuse

---

## Demo

### Example Input
```
"Hi, this is Sarah Cohen, born 03/12/1988. I need to book an appointment
because I've had chest pain for two days. Please call me back at 310-555-2211."
```

### Example Output
```json
{
  "id": 1,
  "intent": "urgent_medical_issue",
  "name": "Sarah Cohen",
  "dob": "1988-03-12",
  "phone": "310-555-2211",
  "summary": "Chest pain for two days",
  "urgency": "high",
  "patterns": {
    "flags": [],
    "hasHighPriorityFlags": false,
    "previousCallCount": 0
  }
}
```

If Sarah calls again, the system flags it:
```json
{
  "patterns": {
    "flags": [
      {
        "type": "repeat_caller",
        "severity": "medium",
        "message": "Caller has made 1 call(s) in the last 72 hours"
      },
      {
        "type": "repeat_urgent",
        "severity": "high",
        "message": "Multiple urgent calls from this caller (2 total)"
      }
    ],
    "hasHighPriorityFlags": true,
    "previousCallCount": 1
  }
}
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd callhandler

# Install dependencies
npm install

# Create .env file with your API key
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start both server and frontend
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Usage
1. **Analyze Tab**: Select a test transcript or paste your own, click "Analyze"
2. **Search Tab**: Search patients by name or phone number with autocomplete
3. View results with urgency badges and pattern alerts
4. Check call history at the bottom of the Analyze tab

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│  ┌──────────┐ ┌──────────────┐ ┌────────────────┐          │
│  │  Header  │ │ PatternFlags │ │ SearchPatients │          │
│  └──────────┘ └──────────────┘ └────────────────┘          │
│                        │                                    │
│              ┌─────────▼─────────┐                         │
│              │   api.js client   │                         │
│              └─────────┬─────────┘                         │
└────────────────────────┼────────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────────────┐
│                   Express Backend                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  analyzer.js │ │  patterns.js │ │    db.js     │        │
│  │  (OpenAI)    │ │  (detection) │ │  (SQLite)    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Pattern Detection Logic

| Pattern | Trigger | Severity |
|---------|---------|----------|
| Repeat Caller | Same phone/name in 72h | Medium (1-2), High (3+) |
| Repeat Urgent | Multiple high-urgency calls | High |
| Recurring Issue | Same intent 2+ times | Medium (2x), High (3x+) |
| Rapid Callbacks | 3+ calls in 24h | High |
| Escalating Symptoms | Low/medium → high urgency | High |

---

## Project Structure

```
callhandler/
├── server/
│   ├── index.js          # Express server & API routes
│   ├── db.js             # SQLite database setup & queries
│   ├── analyzer.js       # OpenAI transcript analysis
│   └── patterns.js       # Pattern detection algorithm
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Blue header with cross logo
│   │   ├── PatternFlags.jsx    # Alert banners for detected patterns
│   │   ├── ResultsDisplay.jsx  # Formatted/JSON results view
│   │   ├── CallHistory.jsx     # Historical calls list
│   │   └── SearchPatients.jsx  # Patient search with autocomplete
│   ├── data/
│   │   └── testTranscripts.js  # 12 test cases
│   ├── services/
│   │   └── api.js              # Backend API client
│   ├── App.jsx                 # Main app with tab navigation
│   ├── App.css                 # Component styles
│   └── index.css               # Global styles & variables
├── .env                  # API keys (git-ignored)
├── .env.example          # Template for .env
└── package.json
```

---

## API Endpoints

### POST /api/analyze
Analyze a transcript and save to history.

### GET /api/calls
Get call history. Query: `?limit=50`

### GET /api/search
Search by name or phone. Query: `?q=sarah`

---

## License

MIT
